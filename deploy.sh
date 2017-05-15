#!/bin/bash


echo "Deploying to S3"
ENV=$1
BUCKET_URL=$2
export AWS_ACCESS_KEY_ID=$(eval "echo \$${ENV}_AWS_ACCESS_KEY_ID")
export AWS_SECRET_ACCESS_KEY=$(eval "echo \$${ENV}_AWS_SECRET_ACCESS_KEY")

aws s3 sync dist/** s3://${BUCKET_URL} --delete
