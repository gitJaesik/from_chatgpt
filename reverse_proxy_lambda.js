const https = require("https");

exports.handler = async (event) => {
  try {
    const { httpMethod, queryStringParameters, body, headers, path } = event;
    const externalApiDomain = "https://external-api.com"; // 외부 API 도메인
    const apiPath = path || ""; // 경로 추가 (필요 시 사용)

    // 외부 API의 URL 생성
    const externalUrl =
      httpMethod === "GET" && queryStringParameters
        ? `${externalApiDomain}${apiPath}?${new URLSearchParams(queryStringParameters)}`
        : `${externalApiDomain}${apiPath}`;

    // 헤더 설정
    const customHeaders = {
      "Content-Type": headers["Content-Type"] || "application/json",
      ...(headers["Authorization"] && { Authorization: headers["Authorization"] }),
      ...(headers["X-Custom-Header"] && { "X-Custom-Header": headers["X-Custom-Header"] }),
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: null,
      };
    }

    // 외부 API 요청 보내기
    const response = await sendHttpRequest(externalUrl, httpMethod, customHeaders, body);

    // Lambda 응답
    return {
      statusCode: response.statusCode,
      body: response.body,
      headers: getCorsHeaders(),
    };
  } catch (error) {
    console.error(error);

    // 에러 처리
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error: error.message }),
      headers: getCorsHeaders(),
    };
  }
};

// 외부 API 요청을 처리하는 함수
const sendHttpRequest = (url, method, headers, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers,
    };

    const req = https.request(url, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          body: data,
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
};

// CORS 헤더 반환 함수
const getCorsHeaders = () => ({
  "Access-Control-Allow-Origin": "*", // 허용할 도메인 (필요에 따라 수정 가능)
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD", // 허용할 HTTP 메서드
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Custom-Header", // 허용할 요청 헤더
});
