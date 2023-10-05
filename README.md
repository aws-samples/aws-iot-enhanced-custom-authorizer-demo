# AWS IoT Enhanced Custom Authorizer Demo

This example demonstrates the necessary steps to use Enhanced Custom Authentication and Configurable Endpoints with AWS IoT Core. 

One major disclaimer at this time: This demo was built taking the path of least resistance; a production quality implementation is pending using a more suitable approach to token validation in the Custom Authorizer AWS Lambda function, and using token signing.

Another goal in building this demo was to illustrate the use of AWS Amplify to build browser based web applications to integrate with AWS IoT Core using new enhanced custom authorizers. Example code can be found under the [web](./web) directory of this repository.

## MQTT/TLS username/password auth

If you want to test the Custom Authorizer for MQTT/TLS connections using username and password authentication, please checkout the [mqtt-username-password](https://github.com/aws-samples/aws-iot-enhanced-custom-authorizer-demo/tree/mqtt-username-password) branch

## Prerequisites

* An AWS Account
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
* [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* [Amplify CLI](https://aws-amplify.github.io/docs/cli-toolchain/quickstart#installation)

## Deploy the Enhanced Custom Authorizer Lambda function

The SAM CLI requires an S3 Bucket for uploading the Enhanced Custom Authorizer Lambda function artifacts. Creation of the S3 bucket is assumed prior to executing the following commands:

```bash
DEPLOYMENT_BUCKET=mybucketname

# Package SAM template
sam package --template-file ./lambda/sam.yml \
  --s3-bucket $DEPLOYMENT_BUCKET \
  --output-template-file ./lambda/packaged.yml

# Deploy packaged SAM template
sam deploy --template-file ./lambda/packaged.yml \
  --stack-name iot-enhanced-custom-authorizer-lambda-stack \
  --capabilities CAPABILITY_IAM

# Get the ARN for the deployed Lambda function
aws cloudformation describe-stacks \
  --stack-name iot-enhanced-custom-authorizer-lambda-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`IoTEnhancedCustomAuthorizerArn`].OutputValue' \
  --output text
```

## Configure your custom authorizer with AWS IoT

1. We will register the Lambda function created above as an authorizer with AWS IoT Core:

```bash
aws iot create-authorizer \
  --authorizer-name "CustomAuthorizer" \
  --authorizer-function-arn "arn:aws:lambda:us-east-1:xxxxxxxxxxxx:function:iot-enhanced-custom-autho-xxxx" \
  --status ACTIVE \
  --signing-disabled
```

The output of the above command, if successful, will contain the ARN for your custom authorizer:

```javascript
  {
      "authorizerName": "CustomAuthorizer",
      "authorizerArn": "arn:aws:iot:us-east-1:xxxxxxxxxxxx:authorizer/CustomAuthorizer"
  }
```


2. Next, you need to grant the AWS IoT Core service principal access to invoke your custom authorizer Lambda function:

```bash
aws lambda add-permission \
  --function-name "arn:aws:lambda:us-east-1:xxxxxxxxxxxx:function:iot-enhanced-custom-autho-xxxx" \
  --principal iot.amazonaws.com \
  --source-arn "arn:aws:iot:us-east-1:xxxxxxxxxxxx:authorizer/CustomAuthorizer" \
  --statement-id Id-123 \
  --action "lambda:InvokeFunction"
```

Now you should test your custom authorizer using the aws cli:

```bash
aws iot test-invoke-authorizer \
  --authorizer-name CustomAuthorizer \
  --http-context '{"headers":{}, "queryString": "?token=allow"}'
```

3. Enhanced custom authorizers must be registered as part of configurable endpoints for AWS IoT Core. In this example, we will create a custom endpoint for an AWS-managed domain.

```bash
aws iot create-domain-configuration \
  --domain-configuration-name "customAuthorizerDomainConfiguration" \
  --service-type "DATA"

aws iot describe-domain-configuration \
  --domain-configuration-name "customAuthorizerDomainConfiguration"
```
The output of the `describe-domain-configuration` command above contains the Fully Qualified Domain Name (FQDN) you will need to use to connect your devices or applications to AWS IoT Core:

```javascript
{
    "domainConfigurationName": "customAuthorizerDomainConfiguration",
    "domainConfigurationArn": "arn:aws:iot:us-east-1:xxxxxxxxxxxx:domainconfiguration/testDomainConfiguration/abcd",
    "domainName": "xxxxxxxxxxxxxxxxxxxx-ats.iot.us-east-1.amazonaws.com",
    "serverCertificates": [],
    "authorizerConfig": {
        "defaultAuthorizerName": "CustomAuthorizer",
        "allowAuthorizerOverride": true
    },
    "domainConfigurationStatus": "ENABLED",
    "serviceType": "DATA",
    "domainType": "AWS_MANAGED"
}
```

4. Finally, you need to update your domain configuration to use your custom authorizer:

```bash
aws iot update-domain-configuration \
  --domain-configuration-name "customAuthorizerDomainConfiguration" \
  --authorizer-config '{"allowAuthorizerOverride": true,"defaultAuthorizerName": "CustomAuthorizer"}'
```



## Resources

* https://aws.amazon.com/blogs/security/how-to-use-your-own-identity-and-access-management-systems-to-control-access-to-aws-iot-resources/
* https://docs.aws.amazon.com/iot/latest/developerguide/enhanced-custom-authentication.html
* https://docs.aws.amazon.com/iot/latest/developerguide/enhanced-custom-auth-create.html
* https://docs.aws.amazon.com/iot/latest/developerguide/config-custom-auth.html
* https://docs.aws.amazon.com/iot/latest/apireference/API_CreateAuthorizer.html
* https://docs.aws.amazon.com/cli/latest/reference/iot/create-authorizer.html
* https://docs.aws.amazon.com/iot/latest/developerguide/iot-custom-endpoints-configurable-aws.html


## TODO

* Generate restrictive policies based on principal and grants in tokens
* Demo: Username / password based authentication example
* Demo: JWT based authorization example
* Demo: Query string authentication example using token signing
* Demo: vanilla javascript example

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
