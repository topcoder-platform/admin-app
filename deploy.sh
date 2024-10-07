#!/bin/bash


echo "Deploying to S3"
#ENV=$1
BUCKET_URL=$1
#AWS_ACCESS_KEY_ID=$(eval "echo \$${ENV}_AWS_ACCESS_KEY_ID")
#AWS_SECRET_ACCESS_KEY=$(eval "echo \$${ENV}_AWS_SECRET_ACCESS_KEY")
aws s3 sync dist s3://${BUCKET_URL} --delete
# AWS_BUCKET=$BUCKET_URL ./node_modules/.bin/gulp publish
