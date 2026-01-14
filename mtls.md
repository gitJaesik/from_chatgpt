AWS 환경에서 Kong Gateway, Load Balancer, ECS Fargate를 사용하여 **mTLS (Mutual TLS)**를 구현하는 아키텍처는 주로 **Network Load Balancer (NLB)**를 사용하여 TCP 트래픽을 Kong으로 바로 전달(Pass-through)하는 방식이 가장 일반적이고 권장됩니다.
이 방식은 Kong이 직접 클라이언트 인증서(Client Certificate)를 검증하고, 인증서 정보를 바탕으로 라우팅이나 플러그인 제어를 할 수 있게 해줍니다.
🏗️ mTLS 아키텍처 다이어그램 (NLB Pass-through 방식)
이 아키텍처의 핵심은 Load Balancer에서 TLS를 종료(Termination)하지 않고, Kong Gateway까지 암호화된 트래픽을 그대로 전달하여 Kong이 mTLS 핸드셰이크를 수행하는 것입니다.
flowchart LR
    Client([Client Device]) -- "HTTPS (mTLS Handshake)\nClient Cert 포함" --> NLB[AWS Network Load Balancer\n(TCP Mode)]
    
    subgraph AWS VPC
        NLB -- "TCP Pass-through\n(암호화 유지)" --> KongService[Kong Gateway Service\n(ECS Fargate)]
        
        subgraph ECS Cluster
            KongService -- "HTTP/HTTPS\n(Upstream)" --> Backend[Backend Services\n(ECS Fargate / Internal)]
        end
    end

    style Client fill:#f9f,stroke:#333,stroke-width:2px
    style NLB fill:#ff9,stroke:#f66,stroke-width:2px
    style KongService fill:#9f9,stroke:#333,stroke-width:2px

🏛️ 아키텍처 상세 구성 요소
1. Client (클라이언트)
 * 서버(Kong)가 신뢰하는 CA(Certificate Authority)로부터 발급받은 **클라이언트 인증서(Client Certificate)**와 개인 키(Private Key)를 보유합니다.
 * 요청 시 이 인증서를 함께 전송하여 자신을 증명합니다.
2. AWS Network Load Balancer (NLB)
 * 역할: 트래픽 진입점 (L4 Load Balancer)
 * 설정: **TCP 리스너 (Port 443)**를 사용합니다.
 * 중요 포인트: 여기서 TLS Termination(복호화)을 수행하면 안 됩니다. 만약 여기서 복호화를 해버리면 클라이언트 인증서 정보가 사라지거나 헤더로 변환해서 넘겨야 하는데, Kong의 mTLS 기능을 온전히 사용하려면 TCP Pass-through 모드로 설정하여 패킷을 그대로 Kong에게 전달해야 합니다.
3. Kong Gateway (on ECS Fargate)
 * 역할: 실질적인 TLS Termination 및 mTLS 검증 수행
 * 구성:
   * ECS Fargate의 Service로 실행됩니다.
   * NLB의 Target Group에 등록되어 트래픽을 받습니다.
 * mTLS 처리 과정:
   * 클라이언트와의 TLS 핸드셰이크 과정에서 클라이언트에게 인증서를 요구합니다.
   * 클라이언트가 제출한 인증서가 Kong에 등록된 **CA(Trusted CA)**에 의해 서명된 것인지 검증합니다.
   * 검증이 성공하면 요청을 허용하고, 실패하면 400 Bad Request (No required SSL certificate was sent) 등의 에러를 리턴합니다.
   * 인증서의 CN(Common Name)이나 SAN 필드를 추출하여 특정 Consumer로 매핑(Mapping)할 수 있습니다.
4. Backend Services (ECS Fargate)
 * 역할: 비즈니스 로직 처리
 * Kong이 검증을 마친 안전한 요청만 전달받습니다.
 * Kong과 백엔드 사이는 HTTP(평문)를 사용할 수도 있고, 보안 강화를 위해 내부적으로 다시 HTTPS를 사용할 수도 있습니다.
⚙️ Kong Gateway 설정 핵심 포인트
이 아키텍처를 구현하기 위해 Kong 쪽에서 필요한 주요 설정입니다.
 * CA 인증서 업로드: 클라이언트 인증서를 발급해준 Root CA (또는 Intermediate CA) 인증서를 Kong에 등록해야 합니다.
   * POST /ca_certificates { "cert": "..." }
 * Service/Route에 mTLS 강제: 특정 서비스나 라우트에 대해 mTLS 플러그인을 활성화하거나 프로토콜 설정을 통해 HTTPS만 허용합니다.
 * mtls-auth 플러그인 사용 (선택 사항):
   * 단순히 "유효한 인증서인가?"를 넘어, "누구의 인증서인가?"를 식별하고 싶을 때 사용합니다.
   * 인증서의 Common Name을 Kong의 Consumer username과 매핑하여, 사용자별로 Rate Limiting이나 ACL(접근 제어)을 다르게 적용할 수 있습니다.
💡 요약: 왜 이 아키텍처인가? (NLB vs ALB)
| 비교 항목 | NLB (추천) | ALB (Application Load Balancer) |
|---|---|---|
| 모드 | TCP Pass-through | HTTP/HTTPS |
| TLS 종료 위치 | Kong Gateway (컨테이너) | ALB |
| mTLS 처리 | Kong이 직접 수행 | ALB가 수행 후 헤더로 전달 (x-amzn-mtls-clientcert) |
| 장점 | Kong의 강력한 mTLS 플러그인 기능(Consumer 매핑 등)을 100% 활용 가능. | AWS Certificate Manager(ACM) 연동이 쉬움. Kong 설정이 단순해짐. |
| 단점 | Kong 컨테이너에서 인증서 관리를 직접 해야 함. | ALB에서 mTLS를 처리하므로 Kong은 단순히 헤더값만 신뢰해야 함. |
결론적으로, Kong의 기능을 최대한 활용하고 표준적인 mTLS 보안 모델을 따르려면 NLB + Kong(Fargate) 조합을 사용하는 것이 가장 적합합니다.
혹시 구체적인 테라폼(Terraform) 코드나 Kong 설정 파일 예시가 필요하시면 말씀해 주세요.
