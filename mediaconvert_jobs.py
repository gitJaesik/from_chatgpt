import boto3
from botocore.exceptions import ClientError

# Initialize a MediaConvert client
def initialize_mediaconvert_client(region):
    return boto3.client('mediaconvert', region_name=region)

# List MediaConvert jobs that are currently in progress
def list_progressing_jobs(client):
    try:
        # Empty list to hold jobs in progress
        progressing_jobs = []

        # Initial call to list_jobs
        response = client.list_jobs(Status='PROGRESSING')

        # Collect all progressing jobs
        progressing_jobs.extend(response['Jobs'])

        # Use pagination to collect all progressing jobs if more than one page of results exists
        while 'NextToken' in response:
            response = client.list_jobs(Status='PROGRESSING', NextToken=response['NextToken'])
            progressing_jobs.extend(response['Jobs'])

        return progressing_jobs

    except ClientError as e:
        print(f"An error occurred: {e}")
        return None

# Main function to use the above functions
def main():
    region = 'your-region'  # e.g., 'us-west-2'

    client = initialize_mediaconvert_client(region)
    jobs = list_progressing_jobs(client)

    if jobs:
        print("Jobs currently in progress:")
        for job in jobs:
            print(f"Job ID: {job['Id']}, Created At: {job['CreatedAt']}, Status: {job['Status']}")
    else:
        print("No jobs are currently in progress or failed to retrieve jobs.")

if __name__ == "__main__":
    main()
