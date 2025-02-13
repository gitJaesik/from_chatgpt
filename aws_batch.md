```
# Use the official lightweight Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy the script into the container
COPY log_job_id.py .

# Run the script when the container starts
CMD ["python", "./log_job_id.py"]
```


```py
import os

# Get the Job ID from the environment variable
job_id = os.getenv('AWS_BATCH_JOB_ID')

# Check if the job_id is available and log it
if job_id:
    print(f"AWS Batch Job ID: {job_id}")
else:
    print("AWS_BATCH_JOB_ID environment variable not set.")
```
