OpenTelemetry에서 특정 userID는 무조건 샘플링하도록 하고, 그 외의 경우에는 확률적으로 샘플링하려면 Custom Sampler를 만들어야 합니다.

✅ Custom Sampler를 사용한 샘플링 방식

```go
package main

import (
	"context"
	"fmt"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
)

// 특정 userID만 무조건 샘플링하는 CustomSampler
type CustomSampler struct {
	ratioSampler trace.Sampler
	forcedUserID string
}

func (cs CustomSampler) ShouldSample(params trace.SamplingParameters) trace.SamplingResult {
	// 특정 userID가 있으면 무조건 RecordAndSample
	for _, attr := range params.Attributes {
		if attr.Key == "userID" && attr.Value.AsString() == cs.forcedUserID {
			return trace.SamplingResult{Decision: trace.RecordAndSample}
		}
	}
	// 나머지는 기존 확률 샘플링 적용
	return cs.ratioSampler.ShouldSample(params)
}

func (cs CustomSampler) Description() string {
	return fmt.Sprintf("CustomSampler with forced userID: %s", cs.forcedUserID)
}

func main() {
	// 기본 1% 확률 샘플링 + 특정 userID는 100% 샘플링
	sampler := CustomSampler{
		ratioSampler: trace.ParentBased(trace.TraceIDRatioBased(0.01)),
		forcedUserID: "12345", // 이 userID는 무조건 샘플링
	}

	tp := trace.NewTracerProvider(trace.WithSampler(sampler))
	otel.SetTracerProvider(tp)

	// 트레이서 생성
	tracer := tp.Tracer("example-tracer")

	// 특정 userID를 포함한 Span 생성
	ctx := context.Background()
	_, span := tracer.Start(ctx, "sample-operation",
		trace.WithAttributes(trace.String("userID", "12345")), // 이 userID는 무조건 샘플링
	)
	defer span.End()

	fmt.Println("Tracing started with custom sampler")
}
```


⸻

✅ 동작 방식
	1.	CustomSampler를 만들어 특정 userID(예: "12345")가 포함되면 무조건 샘플링.
	2.	그 외의 경우에는 기존 TraceIDRatioBased(0.01) 샘플링을 적용.
	3.	trace.WithAttributes(trace.String("userID", "12345")) 속성을 설정하면, 이 userID는 항상 샘플링됨.

이제 특정 userID는 항상 샘플링되면서, 나머지는 확률적으로 샘플링됩니다. 🚀
