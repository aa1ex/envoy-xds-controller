// xds-snap: Fetch, convert and print Envoy xDS snapshots per node ID.
// Single-file Cobra CLI for quick bootstrap.

package main

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"crypto/sha256"
	"crypto/tls"
	"crypto/x509"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	_ "github.com/kaasops/envoy-xds-controller/internal/xds/cache"
	"github.com/kaasops/envoy-xds-controller/internal/xds/redisstore"
	"github.com/spf13/cobra"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/reflect/protoregistry"

	corev3 "github.com/envoyproxy/go-control-plane/envoy/config/core/v3"
	discoveryv3 "github.com/envoyproxy/go-control-plane/envoy/service/discovery/v3"
	"github.com/envoyproxy/go-control-plane/pkg/cache/types"
	cachev3 "github.com/envoyproxy/go-control-plane/pkg/cache/v3"
	"github.com/envoyproxy/go-control-plane/pkg/resource/v3"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
)

var version = "0.1.3"

func main() {
	root := &cobra.Command{
		Use:   "xds-snap",
		Short: "Fetch, convert and print Envoy xDS snapshots per node ID",
	}
	root.AddCommand(newFetchCmd())
	root.AddCommand(newConvertCmd())
	root.AddCommand(newPrintCmd())
	root.AddCommand(newDiffCmd())
	root.AddCommand(newVersionCmd())
	root.AddCommand(newLoadRedisCmd())
	if err := root.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

// ------------------------- fetch -------------------------

type fetchFlags struct {
	Addr     string
	NodeID   string
	Out      string
	Format   string // proto|json
	Types    []string
	Timeout  time.Duration
	Insecure bool
	CACert   string
	CertFile string
	KeyFile  string
	SNI      string
}

func newFetchCmd() *cobra.Command {
	ff := &fetchFlags{}
	cmd := &cobra.Command{
		Use:   "fetch",
		Short: "Connect to xDS ADS, fetch resources for node, archive them",
		RunE:  func(cmd *cobra.Command, args []string) error { return runFetch(ff) },
	}
	cmd.Flags().StringVar(&ff.Addr, "xds-addr", "", "xDS management server address host:port (required)")
	cmd.Flags().StringVar(&ff.NodeID, "node-id", "", "Node ID to request (required)")
	cmd.Flags().StringVar(&ff.Out, "out", "snapshot.tgz", "Output archive path (.tgz)")
	cmd.Flags().StringVar(&ff.Format, "format", "proto", "File format inside archive: proto|json")
	cmd.Flags().StringSliceVar(&ff.Types, "types", []string{"cds", "lds", "rds", "eds"}, "Resource types to fetch: cds,lds,rds,eds[,sds,runtimes]")
	cmd.Flags().DurationVar(&ff.Timeout, "timeout", 15*time.Second, "Overall fetch timeout")
	cmd.Flags().BoolVar(&ff.Insecure, "insecure", true, "Use plaintext without TLS")
	cmd.Flags().StringVar(&ff.CACert, "cacert", "", "Path to CA cert (PEM) for TLS")
	cmd.Flags().StringVar(&ff.CertFile, "cert", "", "Client certificate (PEM)")
	cmd.Flags().StringVar(&ff.KeyFile, "key", "", "Client private key (PEM)")
	cmd.Flags().StringVar(&ff.SNI, "sni", "", "TLS server name / SNI override")
	_ = cmd.MarkFlagRequired("xds-addr")
	_ = cmd.MarkFlagRequired("node-id")
	return cmd
}

func runFetch(ff *fetchFlags) error {
	if ff.Format != "proto" && ff.Format != "json" {
		return fmt.Errorf("unsupported format: %s", ff.Format)
	}
	ctx, cancel := context.WithTimeout(context.Background(), ff.Timeout)
	defer cancel()

	conn, err := dialXDS(ctx, ff)
	if err != nil {
		return err
	}
	defer conn.Close()
	client := discoveryv3.NewAggregatedDiscoveryServiceClient(conn)

	typeMap := map[string]string{
		"cds":      resource.ClusterType,
		"lds":      resource.ListenerType,
		"rds":      resource.RouteType,
		"eds":      resource.EndpointType,
		"sds":      resource.SecretType,
		"runtimes": resource.RuntimeType,
	}

	resolved := make([]resFile, 0, len(ff.Types))
	for _, alias := range ff.Types {
		url, ok := typeMap[strings.ToLower(strings.TrimSpace(alias))]
		if !ok {
			return fmt.Errorf("unknown type alias: %s", alias)
		}
		fileBase := strings.ToLower(alias)
		resolved = append(resolved, resFile{TypeURL: url, Base: fileBase})
	}

	responses := make(map[string]*discoveryv3.DiscoveryResponse)
	for _, rf := range resolved {
		resp, err := fetchOne(ctx, client, ff.NodeID, rf.TypeURL)
		if err != nil {
			return fmt.Errorf("fetch %s: %w", rf.Base, err)
		}
		responses[rf.Base] = resp
	}

	meta := metadata{
		NodeID:    ff.NodeID,
		Addr:      ff.Addr,
		FetchedAt: time.Now().UTC().Format(time.RFC3339Nano),
		Types:     keys(responses),
		Format:    ff.Format,
	}

	return writeArchive(ff.Out, responses, meta, ff.Format)
}

func dialXDS(ctx context.Context, ff *fetchFlags) (*grpc.ClientConn, error) {
	var opts []grpc.DialOption
	if ff.Insecure {
		opts = append(opts, grpc.WithTransportCredentials(insecure.NewCredentials()))
	} else {
		creds, err := buildTLSCreds(ff)
		if err != nil {
			return nil, err
		}
		opts = append(opts, grpc.WithTransportCredentials(creds))
	}
	dialer := &net.Dialer{Timeout: ff.Timeout}
	opts = append(opts, grpc.WithContextDialer(func(ctx context.Context, addr string) (net.Conn, error) {
		return dialer.DialContext(ctx, "tcp", addr)
	}))
	return grpc.DialContext(ctx, ff.Addr, opts...)
}

func buildTLSCreds(ff *fetchFlags) (credentials.TransportCredentials, error) {
	var cp *x509.CertPool
	if ff.CACert != "" {
		pem, err := os.ReadFile(ff.CACert)
		if err != nil {
			return nil, err
		}
		cp = x509.NewCertPool()
		if !cp.AppendCertsFromPEM(pem) {
			return nil, errors.New("failed to load CA cert")
		}
	}
	var certs []tls.Certificate
	if ff.CertFile != "" && ff.KeyFile != "" {
		crt, err := tls.LoadX509KeyPair(ff.CertFile, ff.KeyFile)
		if err != nil {
			return nil, err
		}
		certs = []tls.Certificate{crt}
	}
	cfg := &tls.Config{MinVersion: tls.VersionTLS12, Certificates: certs, RootCAs: cp}
	if ff.SNI != "" {
		cfg.ServerName = ff.SNI
	}
	return credentials.NewTLS(cfg), nil
}

func fetchOne(ctx context.Context, client discoveryv3.AggregatedDiscoveryServiceClient, nodeID, typeURL string) (*discoveryv3.DiscoveryResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	stream, err := client.StreamAggregatedResources(ctx)
	if err != nil {
		return nil, err
	}
	req := &discoveryv3.DiscoveryRequest{
		Node:    &corev3.Node{Id: nodeID},
		TypeUrl: typeURL,
	}
	if err := stream.Send(req); err != nil {
		return nil, err
	}
	resp, err := stream.Recv()
	if err != nil {
		return nil, err
	}
	_ = stream.Send(&discoveryv3.DiscoveryRequest{
		Node:          &corev3.Node{Id: nodeID},
		TypeUrl:       typeURL,
		ResponseNonce: resp.Nonce,
		VersionInfo:   resp.VersionInfo,
	})
	_ = stream.CloseSend()
	return resp, nil
}

// ------------------------- archive I/O -------------------------

type resFile struct {
	TypeURL string
	Base    string
}

type metadata struct {
	NodeID    string   `json:"node_id"`
	Addr      string   `json:"xds_addr"`
	FetchedAt string   `json:"fetched_at"`
	Types     []string `json:"types"`
	Format    string   `json:"format"`
}

func writeArchive(path string, files map[string]*discoveryv3.DiscoveryResponse, meta metadata, format string) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	gz := gzip.NewWriter(f)
	defer gz.Close()
	tarw := tar.NewWriter(gz)
	defer tarw.Close()

	if err := writeTarJSON(tarw, "metadata.json", meta); err != nil {
		return err
	}

	for base, dr := range files {
		name := fmt.Sprintf("%s.%s", base, ext(format))
		var data []byte
		if format == "proto" {
			data, err = proto.Marshal(dr)
			if err != nil {
				return fmt.Errorf("marshal %s: %w", base, err)
			}
		} else {
			mo := protojson.MarshalOptions{UseProtoNames: true, EmitUnpopulated: true, Indent: "  ", Resolver: protoregistry.GlobalTypes}
			data, err = mo.Marshal(dr)
			if err != nil {
				return fmt.Errorf("marshal json %s: %w", base, err)
			}
		}
		if err := writeTarBytes(tarw, name, data); err != nil {
			return err
		}
	}
	return nil
}

func writeTarJSON(tw *tar.Writer, name string, v any) error {
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	return writeTarBytes(tw, name, b)
}

func writeTarBytes(tw *tar.Writer, name string, b []byte) error {
	hdr := &tar.Header{Name: filepath.ToSlash(name), Mode: 0644, Size: int64(len(b))}
	if err := tw.WriteHeader(hdr); err != nil {
		return err
	}
	_, err := tw.Write(b)
	return err
}

func ext(format string) string {
	if format == "proto" {
		return "pb"
	}
	return "json"
}

// ------------------------- convert -------------------------

type convertFlags struct {
	In  string
	Out string
	To  string
}

func newConvertCmd() *cobra.Command {
	cf := &convertFlags{}
	cmd := &cobra.Command{
		Use:   "convert",
		Short: "Convert an existing snapshot archive between proto and json",
		RunE:  func(cmd *cobra.Command, args []string) error { return runConvert(cf) },
	}
	cmd.Flags().StringVar(&cf.In, "in", "", "Input archive (.tgz) (required)")
	cmd.Flags().StringVar(&cf.Out, "out", "", "Output archive (.tgz) (required)")
	cmd.Flags().StringVar(&cf.To, "to", "json", "Target format: proto|json")
	_ = cmd.MarkFlagRequired("in")
	_ = cmd.MarkFlagRequired("out")
	return cmd
}

func runConvert(cf *convertFlags) error {
	if cf.To != "proto" && cf.To != "json" {
		return fmt.Errorf("unsupported target format: %s", cf.To)
	}
	entries, meta, err := readArchive(cf.In)
	if err != nil {
		return err
	}
	out := make(map[string]*discoveryv3.DiscoveryResponse)
	for base, dr := range entries {
		out[base] = dr
	}
	meta.Format = cf.To
	return writeArchive(cf.Out, out, meta, cf.To)
}

func readArchive(path string) (map[string]*discoveryv3.DiscoveryResponse, metadata, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, metadata{}, err
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		return nil, metadata{}, err
	}
	defer gz.Close()
	tr := tar.NewReader(gz)

	entries := map[string]*discoveryv3.DiscoveryResponse{}
	var meta metadata
	for {
		hdr, err := tr.Next()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			return nil, metadata{}, err
		}
		name := filepath.Base(hdr.Name)
		b, err := io.ReadAll(tr)
		if err != nil {
			return nil, metadata{}, err
		}
		if name == "metadata.json" {
			_ = json.Unmarshal(b, &meta)
			continue
		}
		base := strings.TrimSuffix(strings.TrimSuffix(name, ".pb"), ".json")
		if base == name {
			continue
		}
		dr := &discoveryv3.DiscoveryResponse{}
		if strings.HasSuffix(name, ".pb") {
			if err := proto.Unmarshal(b, dr); err != nil {
				return nil, metadata{}, fmt.Errorf("unmarshal %s: %w", name, err)
			}
		} else {
			uo := protojson.UnmarshalOptions{DiscardUnknown: true, Resolver: protoregistry.GlobalTypes}
			if err := uo.Unmarshal(b, dr); err != nil {
				return nil, metadata{}, fmt.Errorf("unmarshal json %s: %w", name, err)
			}
		}
		entries[base] = dr
	}
	return entries, meta, nil
}

// ------------------------- print -------------------------

type printFlags struct {
	In   string
	Type string
}

func newPrintCmd() *cobra.Command {
	pf := &printFlags{}
	cmd := &cobra.Command{
		Use:   "print",
		Short: "Print contents of a snapshot archive (full JSON listing)",
		RunE:  func(cmd *cobra.Command, args []string) error { return runPrint(pf) },
	}
	cmd.Flags().StringVar(&pf.In, "in", "", "Input archive (.tgz) (required)")
	cmd.Flags().StringVar(&pf.Type, "type", "", "Resource type alias to print: cds, lds, rds, eds, sds, runtimes")
	_ = cmd.MarkFlagRequired("in")
	return cmd
}

func runPrint(pf *printFlags) error {
	entries, meta, err := readArchive(pf.In)
	if err != nil {
		return err
	}
	fmt.Printf("Archive from node %s (addr %s) fetched at %s, format=%s\n", meta.NodeID, meta.Addr, meta.FetchedAt, meta.Format)

	if pf.Type != "" {
		alias := strings.ToLower(pf.Type)
		resp, ok := entries[alias]
		if !ok {
			return fmt.Errorf("type %s not found in archive", alias)
		}
		return printResponse(alias, resp)
	}
	for alias, resp := range entries {
		if err := printResponse(alias, resp); err != nil {
			return err
		}
	}
	return nil
}

func printResponse(alias string, dr *discoveryv3.DiscoveryResponse) error {
	fmt.Printf("\n=== %s (version=%s, %d resources) ===\n", strings.ToUpper(alias), dr.VersionInfo, len(dr.Resources))
	for i, a := range dr.Resources {
		msg, err := anypb.UnmarshalNew(a, proto.UnmarshalOptions{Resolver: protoregistry.GlobalTypes})
		if err != nil {
			fmt.Printf("[%d] <failed to unpack: %v>\n", i, err)
			continue
		}
		mo := protojson.MarshalOptions{UseProtoNames: true, EmitUnpopulated: true, Indent: "  ", Resolver: protoregistry.GlobalTypes}
		b, _ := mo.Marshal(msg)
		fmt.Printf("[%d] %s\n", i, string(b))
	}
	return nil
}

// ------------------------- diff -------------------------

type diffFlags struct {
	Left       string
	Right      string
	Type       string // optional alias filter: cds, lds, rds, eds, sds, runtimes
	FailOnDiff bool
}

func newDiffCmd() *cobra.Command {
	df := &diffFlags{}
	cmd := &cobra.Command{
		Use:   "diff",
		Short: "Compare two snapshot archives and show resource differences",
		RunE: func(cmd *cobra.Command, args []string) error {
			return runDiff(df)
		},
	}
	cmd.Flags().StringVar(&df.Left, "left", "", "Left archive (.tgz) (required)")
	cmd.Flags().StringVar(&df.Right, "right", "", "Right archive (.tgz) (required)")
	cmd.Flags().StringVar(&df.Type, "type", "", "Resource type alias to compare: cds, lds, rds, eds, sds, runtimes")
	cmd.Flags().BoolVar(&df.FailOnDiff, "fail-on-diff", false, "Return non-zero exit code if any differences found")
	_ = cmd.MarkFlagRequired("left")
	_ = cmd.MarkFlagRequired("right")
	return cmd
}

func runDiff(df *diffFlags) error {
	leftEntries, leftMeta, err := readArchive(df.Left)
	if err != nil {
		return fmt.Errorf("read left: %w", err)
	}
	rightEntries, rightMeta, err := readArchive(df.Right)
	if err != nil {
		return fmt.Errorf("read right: %w", err)
	}
	fmt.Printf("Comparing snapshots: LEFT node=%s addr=%s at=%s vs RIGHT node=%s addr=%s at=%s\n",
		leftMeta.NodeID, leftMeta.Addr, leftMeta.FetchedAt,
		rightMeta.NodeID, rightMeta.Addr, rightMeta.FetchedAt,
	)

	aliasesSet := map[string]struct{}{}
	for a := range leftEntries {
		aliasesSet[a] = struct{}{}
	}
	for a := range rightEntries {
		aliasesSet[a] = struct{}{}
	}

	aliases := make([]string, 0, len(aliasesSet))
	for a := range aliasesSet {
		aliases = append(aliases, a)
	}
	sort.Strings(aliases)
	if df.Type != "" {
		alias := strings.ToLower(df.Type)
		if _, ok := aliasesSet[alias]; ok {
			aliases = []string{alias}
		} else {
			// still allow running even if missing on one side; include anyway
			aliases = []string{alias}
		}
	}

	anyDiff := false
	for _, alias := range aliases {
		l := leftEntries[alias]
		r := rightEntries[alias]
		if l == nil && r == nil {
			continue
		}
		fmt.Printf("\n=== %s ===\n", strings.ToUpper(alias))
		lIdx, _ := buildIndex(l)
		rIdx, _ := buildIndex(r)

		added := make([]string, 0)
		removed := make([]string, 0)
		changed := make([]string, 0)

		for name, lhash := range lIdx {
			rhash, ok := rIdx[name]
			if !ok {
				removed = append(removed, name)
				continue
			}
			if lhash != rhash {
				changed = append(changed, name)
			}
		}
		for name := range rIdx {
			if _, ok := lIdx[name]; !ok {
				added = append(added, name)
			}
		}

		sort.Strings(added)
		sort.Strings(removed)
		sort.Strings(changed)

		if len(added)+len(removed)+len(changed) == 0 {
			fmt.Println("No differences")
			continue
		}
		anyDiff = true
		printList := func(hdr string, xs []string) {
			fmt.Printf("%s (%d)\n", hdr, len(xs))
			for _, n := range xs {
				fmt.Printf("  - %s\n", n)
			}
		}
		if len(added) > 0 {
			printList("Added", added)
		}
		if len(removed) > 0 {
			printList("Removed", removed)
		}
		if len(changed) > 0 {
			printList("Changed", changed)
		}
	}

	if anyDiff && df.FailOnDiff {
		return fmt.Errorf("differences found")
	}
	return nil
}

func buildIndex(dr *discoveryv3.DiscoveryResponse) (map[string]string, error) {
	idx := map[string]string{}
	if dr == nil {
		return idx, nil
	}
	for _, a := range dr.Resources {
		msg, err := anypb.UnmarshalNew(a, proto.UnmarshalOptions{Resolver: protoregistry.GlobalTypes})
		if err != nil {
			// skip problematic resource but keep going
			continue
		}
		name := getResourceName(msg)
		if name == "" {
			// fallback to short hash prefix for keying if no name exists
			h := hashProtoMessage(msg)
			if len(h) > 12 {
				name = "unknown-" + h[:12]
			} else {
				name = "unknown-" + h
			}
		}
		idx[name] = hashProtoMessage(msg)
	}
	return idx, nil
}

func getResourceName(msg proto.Message) string {
	m := msg.ProtoReflect()
	// prefer "name"
	if fd := m.Descriptor().Fields().ByName(protoreflect.Name("name")); fd != nil && m.Has(fd) {
		if fd.Kind() == protoreflect.StringKind {
			return string(m.Get(fd).String())
		}
	}
	// fallback to "cluster_name" (for EDS/ClusterLoadAssignment)
	if fd := m.Descriptor().Fields().ByName(protoreflect.Name("cluster_name")); fd != nil && m.Has(fd) {
		if fd.Kind() == protoreflect.StringKind {
			return string(m.Get(fd).String())
		}
	}
	return ""
}

func hashProtoMessage(msg proto.Message) string {
	mo := protojson.MarshalOptions{UseProtoNames: true, EmitUnpopulated: false, Resolver: protoregistry.GlobalTypes}
	b, _ := mo.Marshal(msg)
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])
}

// ------------------------- version -------------------------

func newVersionCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "version",
		Short: "Show version",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("xds-snap", version)
		},
	}
}

// ------------------------- load-redis -------------------------

type loadRedisFlags struct {
	In       string
	NodeID   string
	Addr     string
	Password string
	DB       int
	NS       string
	Timeout  time.Duration
}

func newLoadRedisCmd() *cobra.Command {
	lf := &loadRedisFlags{}
	cmd := &cobra.Command{
		Use:   "load-redis",
		Short: "Load a snapshot archive into Redis as controller snapshot",
		RunE:  func(cmd *cobra.Command, args []string) error { return runLoadRedis(lf) },
	}
	cmd.Flags().StringVar(&lf.In, "in", "", "Input archive (.tgz) (required)")
	cmd.Flags().StringVar(&lf.NodeID, "node-id", "", "Node ID to store under (defaults to archive metadata.node_id)")
	cmd.Flags().StringVar(&lf.Addr, "redis-addr", getenv("REDIS_ADDR", "127.0.0.1:6379"), "Redis address host:port")
	cmd.Flags().StringVar(&lf.Password, "redis-password", getenv("REDIS_PASSWORD", ""), "Redis password")
	cmd.Flags().IntVar(&lf.DB, "redis-db", getenvInt("REDIS_DB", 0), "Redis DB index")
	cmd.Flags().StringVar(&lf.NS, "redis-namespace", getenv("XDS_REDIS_NS", "xds"), "Redis key namespace")
	cmd.Flags().DurationVar(&lf.Timeout, "timeout", 3*time.Second, "Operation timeout")
	_ = cmd.MarkFlagRequired("in")
	return cmd
}

func runLoadRedis(lf *loadRedisFlags) error {
	entries, meta, err := readArchive(lf.In)
	if err != nil {
		return err
	}
	nodeID := lf.NodeID
	if nodeID == "" {
		nodeID = meta.NodeID
	}
	if nodeID == "" {
		return fmt.Errorf("node-id is required (flag or archive metadata)")
	}

	// Build resources map from archive
	res := map[resource.Type][]types.Resource{}
	pickVer := func(dr *discoveryv3.DiscoveryResponse) string {
		if dr == nil {
			return ""
		}
		return dr.GetVersionInfo()
	}
	versionCandidates := []string{
		pickVer(entries["cds"]),
		pickVer(entries["rds"]),
		pickVer(entries["lds"]),
		pickVer(entries["eds"]),
		pickVer(entries["sds"]),
	}
	chosenVersion := ""
	for _, v := range versionCandidates {
		if v != "" {
			chosenVersion = v
			break
		}
	}
	if chosenVersion == "" {
		chosenVersion = "1"
	}

	// helper to unpack Any -> proto.Message slice
	unpack := func(dr *discoveryv3.DiscoveryResponse) ([]types.Resource, error) {
		out := make([]types.Resource, 0, len(dr.GetResources()))
		for _, a := range dr.GetResources() {
			msg, err := anypb.UnmarshalNew(a, proto.UnmarshalOptions{Resolver: protoregistry.GlobalTypes})
			if err != nil {
				return nil, fmt.Errorf("unpack resource: %w", err)
			}
			if pm, ok := msg.(proto.Message); ok {
				out = append(out, pm)
			}
		}
		return out, nil
	}

	if dr := entries["cds"]; dr != nil {
		xs, err := unpack(dr)
		if err != nil {
			return fmt.Errorf("decode cds: %w", err)
		}
		res[resource.ClusterType] = xs
	}
	if dr := entries["rds"]; dr != nil {
		xs, err := unpack(dr)
		if err != nil {
			return fmt.Errorf("decode rds: %w", err)
		}
		res[resource.RouteType] = xs
	}
	if dr := entries["lds"]; dr != nil {
		xs, err := unpack(dr)
		if err != nil {
			return fmt.Errorf("decode lds: %w", err)
		}
		res[resource.ListenerType] = xs
	}
	if dr := entries["eds"]; dr != nil {
		xs, err := unpack(dr)
		if err != nil {
			return fmt.Errorf("decode eds: %w", err)
		}
		res[resource.EndpointType] = xs
	}
	if dr := entries["sds"]; dr != nil {
		xs, err := unpack(dr)
		if err != nil {
			return fmt.Errorf("decode sds: %w", err)
		}
		res[resource.SecretType] = xs
	}

	snap, err := cachev3.NewSnapshot(chosenVersion, res)
	if err != nil {
		return fmt.Errorf("build snapshot: %w", err)
	}

	client := redisstore.New(redisstore.Options{
		Addr:      lf.Addr,
		Password:  lf.Password,
		DB:        lf.DB,
		Namespace: lf.NS,
		Timeout:   lf.Timeout,
	})

	ctx, cancel := context.WithTimeout(context.Background(), lf.Timeout)
	defer cancel()
	metaMap := map[string]string{
		"loaded_by":         "xds-snap",
		"loaded_by_version": version,
	}
	if err := client.SaveSnapshotWithMetadata(ctx, nodeID, snap, metaMap); err != nil {
		return fmt.Errorf("save snapshot: %w", err)
	}
	fmt.Printf("Snapshot for node %q saved to Redis namespace %q (version %s)\n", nodeID, lf.NS, chosenVersion)
	return nil
}

// ------------------------- utils -------------------------

func keys(m map[string]*discoveryv3.DiscoveryResponse) []string {
	ks := make([]string, 0, len(m))
	for k := range m {
		ks = append(ks, k)
	}
	return ks
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getenvInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if iv, err := strconv.Atoi(v); err == nil {
			return iv
		}
	}
	return def
}
