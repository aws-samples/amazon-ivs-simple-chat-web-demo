# Deployment instructions for the demo backend and Amazon IVS channel

Deploy the simple chat backend, create a new Amazon IVS channel using AWS CloudFormation, and retrieve everything you need to configure the demo.

## Prerequisites 

* Access to AWS Account with permission to create IAM role, and Lambda.
* [AWS CLI Version 2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
* [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)

## Deploy from your local machine

Before you start, run the following command to make sure you're in the correct AWS account (or configure as needed):
```
aws configure
```
For additional help on configuring, please see https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html

### 1. Create an S3 bucket

* Replace `<my-bucket-name>` with your bucket name.
* Replace `<my-region>` with your region name.

```
aws s3api create-bucket --bucket <my-bucket-name> --region <my-region> \
--create-bucket-configuration LocationConstraint=<my-region>
```

### 2. Pack template with SAM

```
sam package \
--template-file template.yaml \
--output-template-file packaged.yaml \
--s3-bucket <my-bucket-name>
```
DO NOT run the output from above command, proceed to next step.

### 3. Deploy Cloudformation with SAM

Replace `<my-stack-name>` with your stack name.

```
sam deploy \
--template-file packaged.yaml \
--stack-name <my-stack-name> \
--capabilities CAPABILITY_IAM
```

On completion, save the following values:
1. `WebSocketURI`, used in the demo configuration file (`config.js`), to send/receive chat messages
2. `ChannelIngestEndpoint`, to be used in your broadcasting software (ex. OBS)
3. `StreamKey`, to be used in your broadcasting software (ex. OBS)
4. `ChannelPlaybackUrl`, used in the demo configuration file (`config.js`), to load your Amazon IVS stream in the video player


If needed, to retrieve Cloudformation stack outputs again, run below command:
```
aws cloudformation describe-stacks --stack-name <my-stack-name> 

aws cloudformation describe-stacks \
--stack-name <my-stack-name> --query 'Stacks[].Outputs'
```

### 4. (optional) Testing the chat API

To test the WebSocket API, you can use [wscat](https://github.com/websockets/wscat), an open-source command line tool.

1. [Install NPM](https://www.npmjs.com/get-npm).
2. Install wscat:
``` bash
$ npm install -g wscat
```
3. On the console, connect to your published API endpoint by executing the following command:

Replace `<WebSocketURI>` with your WebSocketServer URL created when deploying with cloudformation.

``` bash
$ wscat -c <WebSocketURI>
```
4. To test the sendMessage function, send a JSON message like the following example. The Lambda function sends it back using the callback URL: 

Replace `<WebSocketURI>` with your WebSocketServer URL created when deploying with cloudformation.

``` bash
$ wscat -c <WebSocketURI>
connected (press CTRL+C to quit)
> {"action":"sendmessage", "data":"hello world"}
< hello world
```

### 5. Configure the Simple Chat demo frontend

Follow the [detailed instructions](../web-ui) on how to get the frontend up and running.

### 6. (optional) Clean Up

1. Delete Cloudformation stack:
```
aws cloudformation delete-stack --stack-name <my-stack-name>
```

3. Remove files in S3 bucket
```
aws s3 rm s3://<my-bucket-name> --recursive
```

2. Delete S3 bucket
```
aws s3api delete-bucket --bucket <my-bucket-name> --region <my-region>
```