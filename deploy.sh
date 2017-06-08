#!/bin/bash


echo "Deploying to S3"
ENV=$1
BUCKET_URL=$2
AWS_ACCESS_KEY_ID=$(eval "echo \$${ENV}_AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY=$(eval "echo \$${ENV}_AWS_SECRET_ACCESS_KEY")

# aws s3 sync dist s3://${BUCKET_URL} --acl public-read --delete
AWS_BUCKET=$BUCKET_URL AWS_KEY=$AWS_ACCESS_KEY_ID AWS_SECRET=$AWS_SECRET_ACCESS_KEY ./node_modules/.bin/gulp publish
