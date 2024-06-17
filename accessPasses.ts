import * as forge from 'node-forge';
import jwt from 'jsonwebtoken';
import NodeRSA from 'node-rsa';

// Base64로 인코딩된 PKCS#8 Private Key 문자열 (예제)
const base64EncodedKey = "MIIBVQIBADANBgkqhkiG9w0BAQEFAASCATswggE3AgEAAkEAp..."; // 실제 키를 여기에 넣으세요

// Base64 디코딩
try {
  const decodedBytes = Buffer.from(base64EncodedKey, 'base64');

  // PKCS#8 Private Key 파싱
  const asn1 = forge.asn1.fromDer(forge.util.createBuffer(decodedBytes.toString('binary')));
  const privateKeyInfo = forge.pki.privateKeyFromAsn1(asn1);

  // RSA Private Key로 변환
  if (forge.pki.privateKeyToAsn1(privateKeyInfo).type === 'RSA') {
    const rsaKey = privateKeyInfo as forge.pki.rsa.PrivateKey;
    console.log(rsaKey);
  } else {
    console.error("Not an RSA private key");
  }
} catch (err) {
  console.error("Error decoding or parsing private key:", err);
}

interface IssueTo {
  IssueType: string;
  Value: string;
}

interface CustomClaims extends jwt.JwtPayload {
  Type: string;
  Issuer: string;
  IssueTo: IssueTo;
  Tokens: string[];
}

const retentionTime = 3600; // 예제 retentionTime, 초 단위

function GeneratedForService(role: string, issueTo: string, tokens: string[], rsaKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const issuedAt = now;
  const expiredAt = now + retentionTime;

  const claims: CustomClaims = {
    Type: 'SERVICE',
    Issuer: role,
    IssueTo: {
      IssueType: 'ROLE',
      Value: issueTo,
    },
    Tokens: tokens,
    iat: issuedAt,
    exp: expiredAt,
  };

  const token = jwt.sign(claims, rsaKey, { algorithm: 'RS256', header: { alg: 'RS256' } });

  return token;
}




// Base64로 인코딩된 PKCS#8 Private Key (예제 키)
const base64EncodedKey = `MIIBVQIBADANBgkqhkiG9w0BAQEFAASCATswggE3AgEAAkEAp...`; // 실제 키를 여기에 넣으세요

try {
  // Base64 디코딩
  const decodedBytes = Buffer.from(base64EncodedKey, 'base64');

  // PKCS#8 Private Key 파싱
  const key = new NodeRSA();
  key.importKey(decodedBytes, 'pkcs8-private-pem');

  // RSA Private Key인지 확인
  if (key.isPrivate()) {
    console.log(key.exportKey('private'));
  } else {
    console.error("Not an RSA private key");
  }
} catch (err) {
  console.error("Error decoding or parsing private key:", err);
}
