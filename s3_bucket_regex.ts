function getBucketFromS3Uri(uri: string): string | null {
    // S3 URI 패턴: s3://bucket-name, s3://bucket-name/prefix, s3://bucket-name/prefix/key
    const s3UriPattern = /^s3:\/\/([a-zA-Z0-9.-]+)(\/.*)?$/;

    const match = uri.match(s3UriPattern);
    if (match && match[1]) {
        return match[1]; // 버킷 이름 반환
    }
    return null; // 매칭되지 않으면 null 반환
}

// 테스트 예제
const uri1 = "s3://my-bucket-name/";
const uri2 = "s3://my-bucket-name/prefix";
const uri3 = "s3://my-bucket-name/prefix/key";
const invalidUri = "https://example.com/some/path";

console.log(getBucketFromS3Uri(uri1));  // "my-bucket-name"
console.log(getBucketFromS3Uri(uri2));  // "my-bucket-name"
console.log(getBucketFromS3Uri(uri3));  // "my-bucket-name"
console.log(getBucketFromS3Uri(invalidUri)); // null
