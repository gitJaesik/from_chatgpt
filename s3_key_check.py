import boto3
from botocore.exceptions import ClientError

def file_exists_in_s3(bucket, key):
    """
    Check if a file exists in an S3 bucket

    :param bucket: S3 bucket name
    :param key: File key in the S3 bucket
    :return: True if file exists, False otherwise
    """
    s3 = boto3.client('s3')
    try:
        # Attempt to retrieve the metadata of the specified object
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as e:
        # If a ClientError is thrown, check the error code to determine if the object does not exist
        if e.response['Error']['Code'] == '404':
            return False
        else:
            # Re-throw the exception if it wasn't a 404 error (object not found)
            raise

# Usage
bucket_name = 'your-bucket-name'  # Replace with your S3 bucket name
file_key = 'your-file-key'  # Replace with the key of the file you want to check

exists = file_exists_in_s3(bucket_name, file_key)
print(f"File exists: {exists}")
