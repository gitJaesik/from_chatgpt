package main

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
	"github.com/redis/go-redis/extra/redisotel/v9"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
)

// CustomTracingHook: 특정 명령어를 제외하는 Redis Hook
type CustomTracingHook struct {
	tracer trace.Tracer
}

func (h *CustomTracingHook) BeforeProcess(ctx context.Context, cmd redis.Cmder) (context.Context, error) {
	// 특정 명령어 제외 (예: PING, TTL, CLIENT LIST)
	excludedCommands := map[string]bool{
		"PING":        true,
		"TTL":         true,
		"CLIENT LIST": true,
	}

	if excludedCommands[cmd.Name()] {
		return ctx, nil // Span을 생성하지 않고 바로 실행
	}

	// 기본 Tracing Hook 적용
	return redisotel.BeforeProcess(ctx, cmd)
}

func (h *CustomTracingHook) AfterProcess(ctx context.Context, cmd redis.Cmder) error {
	excludedCommands := map[string]bool{
		"PING":        true,
		"TTL":         true,
		"CLIENT LIST": true,
	}

	if excludedCommands[cmd.Name()] {
		return nil // Span을 생성하지 않고 바로 종료
	}

	// 기본 Tracing Hook 적용
	return redisotel.AfterProcess(ctx, cmd)
}

func main() {
	// OpenTelemetry 트레이서 가져오기
	tp := otel.GetTracerProvider()

	// Redis 클라이언트 생성
	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	// InstrumentTracing() 적용 (기본 Tracing Hook 추가)
	redisotel.InstrumentTracing(rdb, redisotel.WithTracerProvider(tp))

	// 특정 명령어를 제외하는 CustomTracingHook 추가
	rdb.AddHook(&CustomTracingHook{})

	// 테스트 - PING은 트레이싱에 포함되지 않음
	ctx := context.Background()
	rdb.Ping(ctx)                  // 트레이싱 제외됨
	rdb.Set(ctx, "key", "value", 0) // 트레이싱됨
	rdb.Get(ctx, "key")             // 트레이싱됨

	fmt.Println("Redis commands executed")
}
