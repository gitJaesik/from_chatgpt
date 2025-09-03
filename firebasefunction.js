// functions/listDbInstances.js
import { onRequest } from "firebase-functions/v2/https";
import fetch from "node-fetch"; // Node18+는 글로벌 fetch 지원, 필요 없으면 제거
import { GoogleAuth } from "google-auth-library";

// 메타데이터 서버에서 "프로젝트 번호" 가져오기 (중요: 이 API는 project *number*를 요구)
async function getProjectNumber() {
  const resp = await fetch(
    "http://metadata.google.internal/computeMetadata/v1/project/numeric-project-id",
    { headers: { "Metadata-Flavor": "Google" } }
  );
  if (!resp.ok) throw new Error(`Metadata error: ${resp.status}`);
  return resp.text();
}

export const listDbInstances = onRequest({ region: "asia-northeast3" }, async (req, res) => {
  try {
    // 1) 서비스 계정으로 액세스 토큰 발급 (필요 스코프)
    const auth = new GoogleAuth({
      scopes: [
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/firebase",
      ],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    // 2) 프로젝트 번호 조회
    const projectNumber = await getProjectNumber();

    // 3) Management API 호출 (모든 리전: locations/-)
    const url = `https://firebasedatabase.googleapis.com/v1beta/projects/${projectNumber}/locations/-/instances`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token.token || token}` },
    });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`API ${r.status}: ${text}`);
    }

    const data = await r.json();
    // data.instances[i] 안에 instance명, 지역, URL 등 포함
    res.status(200).json({ ok: true, count: (data.instances || []).length, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});
