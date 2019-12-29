'use strict';

import { CloudFormation, StepFunctions } from 'aws-sdk';

const region = 'us-east-1';
const accountId = '000000000000';
const stackName = 'HelloNode-local'

class LocalStateMachine {

    async create(): Promise<void> {
        const template = await getCloudFormationTemplate('us-east-1', stackName)
        console.log(JSON.stringify(template));
        console.log(template.TemplateBody);
        
        let cloudFormationTemplate = JSON.parse(template.TemplateBody);
        const stateMachineResource = cloudFormationTemplate.Resources.HelloWorldStateMachine

        const stateMachineDefinitionString = <string> stateMachineResource.Properties.DefinitionString['Fn::Sub'][0]
        console.log();
        console.log('stateMachineDefinitionString: \n' + stateMachineDefinitionString);

        const lambdaResourcePlaceholders = stateMachineResource.Properties.DefinitionString['Fn::Sub'][1];
        console.log();
        console.log('lambdaResourcePlaceholders: \n' + JSON.stringify(lambdaResourcePlaceholders));

        let stateMachineDefinition = JSON.parse(stateMachineDefinitionString);
        stateMachineDefinition = this.replaceLambdaFunctionPlaceholderKeysWithArns(cloudFormationTemplate, stateMachineDefinition, lambdaResourcePlaceholders);
       
        console.log();
        console.log(JSON.stringify(stateMachineDefinition));

        const createStateMachineOutput = await this.createStateMachine(JSON.stringify(stateMachineDefinition));
        console.log();
        console.log(JSON.stringify(createStateMachineOutput));
        return;
    }

    async createStateMachine(stateMachineDefinition: string): Promise<StepFunctions.CreateStateMachineOutput> {
        const stepFunctions = new StepFunctions({
            region: region,
            endpoint: 'http://localhost:4585'
          });

        const params = {
            name: stackName,
            definition: stateMachineDefinition,
            roleArn: `arn:aws:iam::${accountId}:role/${stackName}-IamRoleStateMachineExecution-NI4KF9HIMDW4`
        };
        
        const createStateMachineOutput = await stepFunctions.createStateMachine(params).promise();
        return createStateMachineOutput;
    }

    replaceLambdaFunctionPlaceholderKeysWithArns(cloudFormationTemplate: any, stateMachineDefinition: any, lambdaResourcePlaceholders: any): any {
        const helloLambdaFunctionArn = this.getLambdaFunctionArn('Hello', cloudFormationTemplate, stateMachineDefinition, lambdaResourcePlaceholders);
        stateMachineDefinition.States['Hello'].Resource = helloLambdaFunctionArn;
        
        const checkoutLambdaFunctionArn = this.getLambdaFunctionArn('Checkout', cloudFormationTemplate, stateMachineDefinition, lambdaResourcePlaceholders);
        stateMachineDefinition.States['Checkout'].Resource = checkoutLambdaFunctionArn;

        return stateMachineDefinition;
    }

    getLambdaFunctionArn(lambdaStepName: string, cloudFormationTemplate: any, stateMachineDefinition: any, lambdaResourcePlaceholders: any): string {
        console.log();
        console.log('lambdaStepName: ' + lambdaStepName);
       
        const lambdaResourcePlaceholderKey = (<string> stateMachineDefinition.States[lambdaStepName].Resource).substr(2, 10);
        console.log('lambdaResourcePlaceholderKey: ' + lambdaResourcePlaceholderKey);

        const lambdaResourceName = lambdaResourcePlaceholders[lambdaResourcePlaceholderKey]['Fn::GetAtt'][0];
        console.log('lambdaResourceName: '+ lambdaResourceName);

        const lambdaFunctionName = cloudFormationTemplate.Resources[lambdaResourceName].Properties.FunctionName;
        const lambdaFunctionArn = `arn:aws:lambda:${region}:${accountId}:function:${lambdaFunctionName}`
        console.log('lambdaFunctionArn : ' + lambdaFunctionArn);
        
        return lambdaFunctionArn;
    }
}

async function getCloudFormationTemplate(
    region: string,
    stackName: string,
) {
    const cloudFormation = new CloudFormation({
        region: region,
        endpoint: 'http://localhost:4581'
      });

    const params = {
        StackName: stackName
    }

    const getTemplateOutput = cloudFormation.getTemplate(params).promise();

    return getTemplateOutput;
}

const stateMachine = new LocalStateMachine();
stateMachine.create();