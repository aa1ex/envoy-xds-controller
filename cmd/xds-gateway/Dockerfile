# Multi-stage build for xds-gateway
FROM golang:1.23 AS builder
ARG TARGETOS
ARG TARGETARCH
ARG VERSION=dev
ARG COMMIT_HASH=unknown
ARG BUILD_DATE=unknown

WORKDIR /workspace
# Copy Go module files and download deps first (better cache)
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build static binary
RUN CGO_ENABLED=0 GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH} go build -a \
    -ldflags "-X github.com/kaasops/envoy-xds-controller/internal/buildinfo.Version=${VERSION} \
    -X github.com/kaasops/envoy-xds-controller/internal/buildinfo.CommitHash=${COMMIT_HASH} \
    -X github.com/kaasops/envoy-xds-controller/internal/buildinfo.BuildDate=${BUILD_DATE}" \
    -o /xds-gateway ./cmd/xds-gateway

# Final minimal image
FROM gcr.io/distroless/static:nonroot
WORKDIR /
COPY --from=builder /xds-gateway /xds-gateway
USER 65532:65532
ENTRYPOINT ["/xds-gateway"]
