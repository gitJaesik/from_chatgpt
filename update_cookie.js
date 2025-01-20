exports.handler = async (event) => {
  // 기존 headers
  const headers = {
    'set-cookie': [
      'SOMEKEY=SOMEVALUE;Version=1',
      'SOME_COOKIE_KEY=SOME_COOKIE_VALUE;Max-Age=86400;Secure;SameSite=Lax',
    ],
  };

  // 헤더 수정 함수
  const modifySetCookie = (cookies) => {
    return cookies.map((cookie) => {
      // 각 쿠키를 세미콜론(;)으로 분리
      const parts = cookie.split(';').map((part) => part.trim());
      
      // Secure 속성을 제거하고 SameSite를 None으로 변경
      const filteredParts = parts.filter((part) => !/^Secure$/i.test(part));
      const modifiedParts = filteredParts.map((part) =>
        /^SameSite=/i.test(part) ? 'SameSite=None' : part
      );

      // 수정된 쿠키 조합
      return modifiedParts.join('; ');
    });
  };

  // Set-Cookie 헤더 수정
  headers['set-cookie'] = modifySetCookie(headers['set-cookie']);

  // Lambda 응답
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Set-Cookie headers modified',
      updatedHeaders: headers['set-cookie'],
    }),
  };
};
