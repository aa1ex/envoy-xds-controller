package protoutil

import "google.golang.org/protobuf/encoding/protojson"

var (
	Unmarshaler = protojson.UnmarshalOptions{
		AllowPartial: false,
	}
	Marshaler = protojson.MarshalOptions{
		AllowPartial: false,
	}
)
