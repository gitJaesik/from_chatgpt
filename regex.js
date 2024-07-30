const regex = /^(?:s3:\/\/)([^\/]+)\/(.*?\/)*([^\/]+)\.([^\/]+)$/;

const s3Url = "s3://bucketname/prefix1/prefix2/filename.extension";
const match = s3Url.match(regex);

if (match) {
    const bucketName = match[1];
    const prefix = match[2] || "";
    const fileName = match[3];
    const extension = match[4];

    console.log(`Bucket Name: ${bucketName}`);
    console.log(`Prefix: ${prefix}`);
    console.log(`File Name: ${fileName}`);
    console.log(`Extension: ${extension}`);
} else {
    console.log("No match found");
}
