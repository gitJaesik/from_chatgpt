여기 간단한 JSON Schema A → JSON Schema B import 예제를 보여드릴게요.
JSON Schema의 $ref 기능을 이용하면 다른 JSON Schema 파일을 참조할 수 있습니다.

⸻

📄 user.schema.json (B)

{
  "$id": "user.schema.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "User",
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    }
  },
  "required": ["id", "name"]
}


⸻

📄 post.schema.json (A → B 참조)

{
  "$id": "post.schema.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Post",
  "type": "object",
  "properties": {
    "postId": {
      "type": "integer"
    },
    "author": {
      "$ref": "user.schema.json"
    },
    "content": {
      "type": "string"
    }
  },
  "required": ["postId", "author", "content"]
}


⸻

💡 사용 방법
	•	두 파일이 같은 폴더에 있으면 $ref에 "user.schema.json"처럼 상대 경로로 참조 가능
	•	다른 경로일 경우 "./schemas/user.schema.json" 또는 URL(https://example.com/user.schema.json) 사용 가능
	•	$ref는 지정한 Schema를 해당 위치에 인라인 삽입한 것처럼 동작

⸻

✅ 검증 예시 (Node.js + Ajv)

import Ajv from "ajv";
import fs from "fs";

const ajv = new Ajv({ loadSchema: async (uri) => JSON.parse(fs.readFileSync(uri, "utf8")) });

const postSchema = JSON.parse(fs.readFileSync("post.schema.json", "utf8"));
const validate = await ajv.compileAsync(postSchema);

const data = {
  postId: 1,
  author: { id: 100, name: "Alice" },
  content: "Hello world"
};

console.log(validate(data)); // true


⸻

원하시면 제가 이걸 Golang용 JSON Schema validator 예제로도 변환해서 $ref import가 동작하는 코드를 만들어 드릴 수 있습니다.
그러면 실제로 로컬에서 schema 간 참조를 검증할 수 있어요.
해드릴까요?
