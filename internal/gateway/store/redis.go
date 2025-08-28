package store

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/kaasops/envoy-xds-controller/internal/gateway"
	"github.com/redis/go-redis/v9"
)

const (
	Namespace           = "xds-gw:"
	KeyPlane            = Namespace + "plane:%s"            // plane_id
	KeyRouteClient      = Namespace + "route:client:%s"      // norm(client_key)
	KeyClientCohort     = Namespace + "client:cohort:%s"     // norm(client_key)
	KeyRouteCohort      = Namespace + "route:cohort:%s"      // norm(cohort)
	KeyRouteDefault     = Namespace + "route:default"
	ChannelEvents       = Namespace + "events"
	EventTypePlane      = "plane"
	EventTypeRoute      = "route"
	EventTypeCohort     = "cohort"
	EventTypeDefault    = "default"
)

type Store struct {
	rdb *redis.Client
}

type Options struct {
	Addr     string
	Password string
	DB       int
	Timeout  time.Duration
}

type Event struct {
	Type string `json:"type"`
	Key  string `json:"key"`
}

func New(opts Options) *Store {
	to := opts.Timeout
	if to <= 0 {
		to = 5 * time.Second
	}
	r := redis.NewClient(&redis.Options{Addr: opts.Addr, Password: opts.Password, DB: opts.DB})
	_ = to // currently unused for commands via Context
	return &Store{rdb: r}
}

func NormalizeKey(s string) string {
	if s == "" {
		return s
	}
	enc := base64.RawURLEncoding.EncodeToString([]byte(s))
	return enc
}

func (s *Store) publish(ctx context.Context, ev Event) {
	b, _ := json.Marshal(ev)
	_ = s.rdb.Publish(ctx, ChannelEvents, string(b)).Err()
}

// Planes

func (s *Store) PutPlane(ctx context.Context, planeID string, p gateway.Plane) error {
	b, err := json.Marshal(p)
	if err != nil {
		return err
	}
	if err := s.rdb.Set(ctx, fmt.Sprintf(KeyPlane, planeID), string(b), 0).Err(); err != nil {
		return err
	}
	s.publish(ctx, Event{Type: EventTypePlane, Key: planeID})
	return nil
}

func (s *Store) GetPlane(ctx context.Context, planeID string) (*gateway.Plane, error) {
	raw, err := s.rdb.Get(ctx, fmt.Sprintf(KeyPlane, planeID)).Result()
	if errors.Is(err, redis.Nil) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var p gateway.Plane
	if err := json.Unmarshal([]byte(raw), &p); err != nil {
		return nil, err
	}
	return &p, nil
}

func (s *Store) DeletePlane(ctx context.Context, planeID string) error {
	if err := s.rdb.Del(ctx, fmt.Sprintf(KeyPlane, planeID)).Err(); err != nil {
		return err
	}
	s.publish(ctx, Event{Type: EventTypePlane, Key: planeID})
	return nil
}

func (s *Store) ListPlanes(ctx context.Context) (map[string]gateway.Plane, error) {
	res := make(map[string]gateway.Plane)
	iter := s.rdb.Scan(ctx, 0, fmt.Sprintf(KeyPlane, "*"), 100).Iterator()
	for iter.Next(ctx) {
		key := iter.Val()
		planeID := strings.TrimPrefix(key, Namespace+"plane:")
		raw, err := s.rdb.Get(ctx, key).Result()
		if err != nil {
			return nil, err
		}
		var p gateway.Plane
		if err := json.Unmarshal([]byte(raw), &p); err != nil {
			return nil, err
		}
		res[planeID] = p
	}
	if err := iter.Err(); err != nil {
		return nil, err
	}
	return res, nil
}

// Client rules

func (s *Store) PutClientRoute(ctx context.Context, clientKey, planeID string) error {
	key := fmt.Sprintf(KeyRouteClient, NormalizeKey(clientKey))
	if err := s.rdb.Set(ctx, key, planeID, 0).Err(); err != nil {
		return err
	}
	s.publish(ctx, Event{Type: EventTypeRoute, Key: "client:" + clientKey})
	return nil
}

func (s *Store) GetClientRoute(ctx context.Context, clientKey string) (string, error) {
	key := fmt.Sprintf(KeyRouteClient, NormalizeKey(clientKey))
	v, err := s.rdb.Get(ctx, key).Result()
	if errors.Is(err, redis.Nil) {
		return "", nil
	}
	return v, err
}

func (s *Store) DeleteClientRoute(ctx context.Context, clientKey string) error {
	key := fmt.Sprintf(KeyRouteClient, NormalizeKey(clientKey))
	if err := s.rdb.Del(ctx, key).Err(); err != nil {
		return err
	}
	s.publish(ctx, Event{Type: EventTypeRoute, Key: "client:" + clientKey})
	return nil
}

// Clients

func (s *Store) ListClientRoutes(ctx context.Context) (map[string]string, error) {
	res := make(map[string]string)
	iter := s.rdb.Scan(ctx, 0, fmt.Sprintf(KeyRouteClient, "*"), 100).Iterator()
	for iter.Next(ctx) {
		key := iter.Val()
		v, err := s.rdb.Get(ctx, key).Result()
		if err != nil {
			return nil, err
		}
		norm := strings.TrimPrefix(key, Namespace+"route:client:")
		nameBytes, err := base64.RawURLEncoding.DecodeString(norm)
		name := norm
		if err == nil {
			name = string(nameBytes)
		}
		res[name] = v
	}
	if err := iter.Err(); err != nil {
		return nil, err
	}
	return res, nil
}

// Cohorts

func (s *Store) ListCohortRoutes(ctx context.Context) (map[string]string, error) {
	res := make(map[string]string)
	iter := s.rdb.Scan(ctx, 0, fmt.Sprintf(KeyRouteCohort, "*"), 100).Iterator()
	for iter.Next(ctx) {
		key := iter.Val()
		// value is target plane id
		v, err := s.rdb.Get(ctx, key).Result()
		if err != nil {
			return nil, err
		}
		// decode cohort name from normalized suffix
		norm := strings.TrimPrefix(key, Namespace+"route:cohort:")
		nameBytes, err := base64.RawURLEncoding.DecodeString(norm)
		name := norm
		if err == nil {
			name = string(nameBytes)
		}
		res[name] = v
	}
	if err := iter.Err(); err != nil {
		return nil, err
	}
	return res, nil
}

func (s *Store) PutCohortRoute(ctx context.Context, cohort, planeID string) error {
	key := fmt.Sprintf(KeyRouteCohort, NormalizeKey(cohort))
	if err := s.rdb.Set(ctx, key, planeID, 0).Err(); err != nil {
		return err
	}
	s.publish(ctx, Event{Type: EventTypeCohort, Key: cohort})
	return nil
}

func (s *Store) GetCohortRoute(ctx context.Context, cohort string) (string, error) {
	key := fmt.Sprintf(KeyRouteCohort, NormalizeKey(cohort))
	v, err := s.rdb.Get(ctx, key).Result()
	if errors.Is(err, redis.Nil) {
		return "", nil
	}
	return v, err
}

func (s *Store) DeleteCohortRoute(ctx context.Context, cohort string) error {
	key := fmt.Sprintf(KeyRouteCohort, NormalizeKey(cohort))
	if err := s.rdb.Del(ctx, key).Err(); err != nil {
		return err
	}
	s.publish(ctx, Event{Type: EventTypeCohort, Key: cohort})
	return nil
}

func (s *Store) PutClientCohort(ctx context.Context, clientKey, cohort string) error {
	key := fmt.Sprintf(KeyClientCohort, NormalizeKey(clientKey))
	if cohort == "" {
		return s.rdb.Del(ctx, key).Err()
	}
	if err := s.rdb.Set(ctx, key, cohort, 0).Err(); err != nil {
		return err
	}
	s.publish(ctx, Event{Type: EventTypeCohort, Key: "client:" + clientKey})
	return nil
}

func (s *Store) GetClientCohort(ctx context.Context, clientKey string) (string, error) {
	key := fmt.Sprintf(KeyClientCohort, NormalizeKey(clientKey))
	v, err := s.rdb.Get(ctx, key).Result()
	if errors.Is(err, redis.Nil) {
		return "", nil
	}
	return v, err
}

func (s *Store) DeleteClientCohort(ctx context.Context, clientKey string) error {
	key := fmt.Sprintf(KeyClientCohort, NormalizeKey(clientKey))
	if err := s.rdb.Del(ctx, key).Err(); err != nil {
		return err
	}
	s.publish(ctx, Event{Type: EventTypeCohort, Key: "client:" + clientKey})
	return nil
}

// Default route

func (s *Store) SetDefaultRoute(ctx context.Context, planeID string) error {
	if err := s.rdb.Set(ctx, KeyRouteDefault, planeID, 0).Err(); err != nil {
		return err
	}
	s.publish(ctx, Event{Type: EventTypeDefault, Key: "default"})
	return nil
}

func (s *Store) GetDefaultRoute(ctx context.Context) (string, error) {
	v, err := s.rdb.Get(ctx, KeyRouteDefault).Result()
	if errors.Is(err, redis.Nil) {
		return "", nil
	}
	return v, err
}

// SubscribeEvents subscribes to the events channel and forwards messages to ch.
func (s *Store) SubscribeEvents(ctx context.Context, ch chan<- Event) error {
	pubsub := s.rdb.Subscribe(ctx, ChannelEvents)
	// Ensure subscription is active
	_, err := pubsub.Receive(ctx)
	if err != nil {
		return err
	}
	go func() {
		for msg := range pubsub.Channel() {
			var ev Event
			if err := json.Unmarshal([]byte(msg.Payload), &ev); err == nil {
				select {
				case ch <- ev:
				case <-ctx.Done():
					_ = pubsub.Close()
					return
				}
			}
		}
	}()
	return nil
}
