package cache

import (
	"sync"
	"time"
)

// Entry represents a cached value with expiration and negative marker.
// If Negative is true, the value represents a cached miss.
// For positive entries, Value should be a string (plane id or cohort), but we keep it generic.

type Entry[T any] struct {
	Value    T
	Expires  time.Time
	Negative bool
}

type TTLCache[T any] struct {
	mu       sync.RWMutex
	data     map[string]Entry[T]
	ttl      time.Duration
	negTTL   time.Duration
}

func NewTTLCache[T any](ttl, negativeTTL time.Duration) *TTLCache[T] {
	return &TTLCache[T]{
		data:   make(map[string]Entry[T]),
		ttl:    ttl,
		negTTL: negativeTTL,
	}
}

func (c *TTLCache[T]) Get(key string) (val T, ok bool, negative bool) {
	c.mu.RLock()
	e, exists := c.data[key]
	c.mu.RUnlock()
	if !exists {
		var zero T
		return zero, false, false
	}
	if time.Now().After(e.Expires) {
		c.mu.Lock()
		delete(c.data, key)
		c.mu.Unlock()
		var zero T
		return zero, false, false
	}
	return e.Value, true, e.Negative
}

func (c *TTLCache[T]) Set(key string, val T) {
	c.mu.Lock()
	c.data[key] = Entry[T]{Value: val, Expires: time.Now().Add(c.ttl)}
	c.mu.Unlock()
}

func (c *TTLCache[T]) SetNegative(key string) {
	c.mu.Lock()
	var zero T
	c.data[key] = Entry[T]{Value: zero, Expires: time.Now().Add(c.negTTL), Negative: true}
	c.mu.Unlock()
}

func (c *TTLCache[T]) Delete(key string) {
	c.mu.Lock()
	delete(c.data, key)
	c.mu.Unlock()
}

func (c *TTLCache[T]) Clear() {
	c.mu.Lock()
	c.data = make(map[string]Entry[T])
	c.mu.Unlock()
}
