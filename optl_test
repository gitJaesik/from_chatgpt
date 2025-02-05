package main

import (
    "context"
    "fmt"
    "log"
    "time"

    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
    "go.opentelemetry.io/otel/sdk/resource"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    "go.opentelemetry.io/otel/trace"
    "google.golang.org/grpc"
)

func initTracer() (*sdktrace.TracerProvider, error) {
    // gRPC Exporter 설정 (Jaeger에 데이터 전송)
    ctx := context.Background()
    exporter, err := otlptracegrpc.New(ctx,
        otlptracegrpc.WithInsecure(),                          // 보안 설정 없이 사용 (로컬 Jaeger용)
        otlptracegrpc.WithEndpoint("localhost:4317"),         // Jaeger의 OTLP gRPC 엔드포인트
        otlptracegrpc.WithDialOption(grpc.WithBlock()),       // 연결 대기 설정
    )
    if err != nil {
        return nil, fmt.Errorf("failed to create exporter: %w", err)
    }

    // 리소스 정보 설정 (서비스 이름 등)
    res, err := resource.New(ctx,
        resource.WithAttributes(
            attribute.String("service.name", "golang-service"),
        ),
    )
    if err != nil {
        return nil, fmt.Errorf("failed to create resource: %w", err)
    }

    // Tracer Provider 설정
    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exporter), // 비동기 배치 처리
        sdktrace.WithResource(res),
    )

    // 전역 Tracer Provider 등록
    otel.SetTracerProvider(tp)

    return tp, nil
}

func main() {
    tp, err := initTracer()
    if err != nil {
        log.Fatalf("failed to initialize tracer: %v", err)
    }
    defer func() {
        // 애플리케이션 종료 시 트레이스 데이터 플러시
        if err := tp.Shutdown(context.Background()); err != nil {
            log.Fatalf("failed to shutdown tracer provider: %v", err)
        }
    }()

    tracer := otel.Tracer("golang-service-tracer")

    // 샘플 트레이싱
    ctx, span := tracer.Start(context.Background(), "MainOperation")
    span.SetAttributes(attribute.String("custom.attribute", "value"))
    simulateWork(ctx)
    span.End()

    log.Println("Tracing completed!")
}

func simulateWork(ctx context.Context) {
    tracer := otel.Tracer("golang-service-tracer")
    _, span := tracer.Start(ctx, "SimulateWork")
    defer span.End()

    // 가상 작업 처리
    time.Sleep(2 * time.Second)
    span.AddEvent("Work completed")
}

/*
go get go.opentelemetry.io/otel
go get go.opentelemetry.io/otel/sdk
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc
go get go.opentelemetry.io/otel/trace
go get google.golang.org/grpc

⚙️ 4️⃣ 주요 설명
	1.	Exporter 설정:
	•	otlptracegrpc.WithEndpoint("localhost:4317") → Jaeger OTLP gRPC 포트로 데이터 전송
	•	WithInsecure() → TLS 인증 없이 로컬에서 테스트용 사용
	2.	리소스 설정:
	•	service.name 속성으로 Jaeger UI에서 서비스 식별 가능
	3.	Tracer 사용:
	•	tracer.Start()로 스팬 시작 및 span.End()로 종료
	•	SetAttributes()로 커스텀 속성 추가 가능
	4.	데이터 플러시:
	•	tp.Shutdown() 호출로 애플리케이션 종료 시 트레이스 데이터 전송 완료 보장

🗒️ 추가 사항
	•	프로덕션 환경:
TLS 설정 필요 → otlptracegrpc.WithTLSCredentials(credentials) 사용
	•	성능 최적화:
WithBatcher 대신 WithSimpleSpanProcessor로 실시간 처리 가능 (성능 저하 위험)
	•	추적률 조정:
샘플링 전략 변경 → sdktrace.WithSampler(sdktrace.TraceIDRatioBased(0.5)) (50% 샘플링)

*/
