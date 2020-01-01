#!/bin/bash

export AWS_DEFAULT_REGION=us-east-1
aws sqs --endpoint http://localhost:4576 create-queue --queue-name dev-donations-paymentnotification