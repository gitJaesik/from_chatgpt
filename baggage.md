네! Golang 서버에서 HTTP 요청을 받을 때 Baggage가 있는지 확인하고, 없으면 추가하는 코드를 작성할 수 있습니다.

OpenTelemetry에서 baggage는 컨텍스트(Context)와 함께 전파되므로 HTTP 요청이 들어오면 먼저 baggage를 추출하고, 값이 없으면 추가해야 합니다.

✅ 1. Golang 서버에서 HTTP 요청을 받을 때 Baggage 확인 및 추가하는 방법

```go
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/baggage"
	"go.opentelemetry.io/otel/propagation"
)

func middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// OpenTelemetry Propagator 사용하여 Baggage 추출
		ctx := otel.GetTextMapPropagator().Extract(r.Context(), propagation.HeaderCarrier(r.Header))

		// 현재 요청에 Baggage가 있는지 확인
		bag := baggage.FromContext(ctx)
		if bag.Len() == 0 {
			fmt.Println("🚀 No baggage found, adding default baggage...")

			// Baggage가 없으면 추가
			member, _ := baggage.NewMember("user.id", "guest")
			newBag, _ := baggage.New(member)

			// 새로운 Baggage를 Context에 추가
			ctx = baggage.ContextWithBaggage(ctx, newBag)
		} else {
			fmt.Println("✅ Baggage found:", bag)
		}

		// 다음 핸들러 호출 (Baggage가 있는 Context 전달)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func handler(w http.ResponseWriter, r *http.Request) {
	// 현재 Context에서 Baggage 추출
	bag := baggage.FromContext(r.Context())

	// "user.id" Baggage 값 가져오기
	userID := bag.Member("user.id").Value()
	fmt.Fprintf(w, "Hello, User ID: %s", userID)
}

func main() {
	mux := http.NewServeMux()
	mux.Handle("/", middleware(http.HandlerFunc(handler)))

	fmt.Println("Server is running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
```

✅ 2. 코드 설명

📌 1) 미들웨어에서 Baggage 확인 및 추가
	•	otel.GetTextMapPropagator().Extract() 를 사용하여 HTTP 요청 헤더에서 Baggage를 추출.
	•	baggage.FromContext(ctx) 를 사용하여 Baggage가 있는지 확인.
	•	만약 Baggage가 없다면, "user.id=guest" 값을 가진 새로운 Baggage를 추가.
	•	baggage.ContextWithBaggage(ctx, newBag) 를 사용하여 새로운 Baggage를 Context에 추가.
	•	next.ServeHTTP(w, r.WithContext(ctx)) 로 다음 핸들러에 Context를 전달.

📌 2) 요청 핸들러에서 Baggage 읽기
	•	baggage.FromContext(r.Context()) 를 사용하여 Baggage를 가져옴.
	•	"user.id" 값을 추출하여 응답으로 반환.

✅ 3. 실행 예시

1️⃣ Baggage 없는 요청

```bash
$ curl -v http://localhost:8080/
```

💡 출력 (Baggage가 없어서 기본 값 추가)

🚀 No baggage found, adding default baggage...
Hello, User ID: guest

2️⃣ Baggage가 있는 요청

```bash
$ curl -v http://localhost:8080/ -H "baggage: user.id=12345"
```

💡 출력 (Baggage가 유지됨)

✅ Baggage found: user.id=12345
Hello, User ID: 12345

✅ 4. 정리
	1.	OpenTelemetry Propagator를 사용해 Baggage를 추출 (otel.GetTextMapPropagator().Extract())
	2.	Baggage가 없으면 기본 값 추가 (baggage.NewMember("user.id", "guest"))
	3.	미들웨어를 통해 다음 핸들러로 Context 전달
	4.	핸들러에서 Baggage 값을 읽어 사용

이제 OpenTelemetry 기반의 Golang 서버에서 Baggage를 자동으로 확인하고 없으면 추가하는 기능을 쉽게 구현할 수 있습니다! 🚀
추가 질문 있으시면 언제든지 물어보세요! 😊
