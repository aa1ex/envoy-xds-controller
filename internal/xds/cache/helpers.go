package cache

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sort"

	"github.com/envoyproxy/go-control-plane/pkg/cache/v3"
)

func GetSnapshotHash(snapshot *cache.Snapshot) (string, error) {
	if snapshot == nil {
		return "", fmt.Errorf("snapshot is nil")
	}

	if snapshot.VersionMap == nil {
		if err := snapshot.ConstructVersionMap(); err != nil {
			return "", fmt.Errorf("failed to construct version map: %w", err)
		}
	}

	typeURLs := make([]string, 0, len(snapshot.VersionMap))
	for tu := range snapshot.VersionMap {
		typeURLs = append(typeURLs, tu)
	}
	sort.Strings(typeURLs)

	var b bytes.Buffer

	b.Grow(64 * len(typeURLs))

	for _, tu := range typeURLs {
		b.WriteString(tu)
		b.WriteByte('\n')

		m := snapshot.VersionMap[tu]
		if len(m) == 0 {
			continue
		}

		names := make([]string, 0, len(m))
		for name := range m {
			names = append(names, name)
		}
		sort.Strings(names)

		for _, name := range names {
			b.WriteString(name)
			b.WriteByte(':')
			b.WriteString(m[name])
			b.WriteByte('\n')
		}
	}

	sum := sha256.Sum256(b.Bytes())
	return hex.EncodeToString(sum[:]), nil
}
