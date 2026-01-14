네, OpenSSL을 사용하여 서버용 인증서와 mTLS 클라이언트용 인증서를 각각 생성하는 과정을 보여드리고, 가장 중요한 차이점을 짚어드리겠습니다.
먼저, 두 인증서를 발급해 줄 **최상위 인증 기관(Root CA)**이 있다고 가정하고 시작합니다.
(테스트를 위해 Root CA 키와 인증서가 없다면 아래 명령어로 먼저 생성하세요)
# 0. Root CA (발급자) 생성
openssl req -x509 -newkey rsa:2048 -nodes -keyout ca.key -out ca.crt -days 3650 -subj "/CN=My Root CA"

1. 서버 인증서 만들기 (Server Certificate)
서버가 "나는 이 도메인의 주인입니다"라고 증명하는 용도입니다.
단계:
 * 비공개키(server.key) 생성
 * 인증 요청서(server.csr) 생성 (CN에 도메인 입력)
 * [중요] CA가 서명하여 인증서(server.crt) 발급 (서버용 속성 추가)
<!-- end list -->
# 1. 서버 개인키 생성
openssl genrsa -out server.key 2048

# 2. 서버 CSR 생성 (CN에 도메인 주소 입력 중요)
openssl req -new -key server.key -out server.csr -subj "/CN=myserver.com"

# 3. [핵심] 서버 인증서 발급 (serverAuth 속성 추가)
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out server.crt -days 365 \
  -addext "subjectAltName = DNS:myserver.com,IP:127.0.0.1" \
  -addext "extendedKeyUsage = serverAuth"

2. mTLS 클라이언트 인증서 만들기 (Client Certificate)
클라이언트가 "나는 허가받은 사용자입니다"라고 증명하는 용도입니다.
단계:
 * 비공개키(client.key) 생성
 * 인증 요청서(client.csr) 생성 (CN에 사용자 ID나 식별자 입력)
 * [중요] CA가 서명하여 인증서(client.crt) 발급 (클라이언트용 속성 추가)
<!-- end list -->
# 1. 클라이언트 개인키 생성
openssl genrsa -out client.key 2048

# 2. 클라이언트 CSR 생성 (CN에 사용자 ID나 식별자 입력)
openssl req -new -key client.key -out client.csr -subj "/CN=client-user-01"

# 3. [핵심] 클라이언트 인증서 발급 (clientAuth 속성 추가)
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key \
  -out client.crt -days 365 \
  -addext "extendedKeyUsage = clientAuth"

🔍 차이점 하이라이트 (비교 분석)
가장 큰 차이는 마지막 openssl x509 (서명 및 발급) 단계에서의 옵션입니다.
| 구분 | 서버 인증서 (Server Cert) | 클라이언트 인증서 (Client Cert) |
|---|---|---|
| 1. 용도 지정
(Extended Key Usage) | -addext "extendedKeyUsage = serverAuth"
👉 "이건 서버 신분증입니다"라고 명시 | -addext "extendedKeyUsage = clientAuth"
👉 "이건 클라이언트 신분증입니다"라고 명시 |
| 2. 식별 정보
(Subject Alt Name) | 필수 (subjectAltName = DNS:도메인)
👉 요즘 브라우저/클라이언트는 이거 없으면 접속 차단함 | 보통 생략
👉 클라이언트는 도메인이 없으므로 IP나 도메인 확인 과정이 불필요함 |
| 3. 이름(CN)
(Common Name) | 도메인 주소 (예: myserver.com)
접속 주소와 일치해야 함 | 사용자 식별자 (예: user-id, service-a)
서버가 로그에 남기거나 권한 줄 때 식별하는 이름 |
💡 Sean님을 위한 팁
 * 만약 둘 다 되는 인증서를 만들고 싶다면?
   extendedKeyUsage = serverAuth, clientAuth 처럼 콤마로 구분해서 둘 다 넣으면 됩니다. (개발 환경에서는 편하지만, 보안상 운영 환경에서는 용도를 분리하는 것이 정석입니다.)
 * 실제 동작:
   mTLS가 설정된 Nginx나 애플리케이션 서버는 들어오는 요청의 인증서를 까보고, 그 안에 clientAuth 마크가 있는지, 그리고 내가 아는 CA가 서명했는지를 확인한 뒤 접속을 허가합니다.
이제 이 명령어들로 직접 키 파일들을 생성해서 테스트해 보실 수 있습니다. 추가로 궁금한 점 있으신가요?

