import boto3

def list_all_objects_in_folder(bucket_name, folder_name):
    s3_client = boto3.client('s3')
    paginator = s3_client.get_paginator('list_objects_v2')
    operation_parameters = {
        'Bucket': bucket_name,
        'Prefix': folder_name
    }
    page_iterator = paginator.paginate(**operation_parameters)

    all_objects = []
    for page in page_iterator:
        if "Contents" in page:
            for obj in page["Contents"]:
                all_objects.append(obj)
    
    return all_objects

# 사용 예제
if __name__ == "__main__":
    bucket_name = 'your-bucket-name'
    folder_name = 'your-folder-name/'  # 폴더 이름 끝에 슬래시를 포함해야 합니다.
    objects = list_all_objects_in_folder(bucket_name, folder_name)
    for obj in objects:
        print(obj['Key'])
