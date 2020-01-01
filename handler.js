//import AWS from 'aws-sdk';
const AWS = require('aws-sdk');

module.exports.hello = async (event, context, callback) => {
  console.log('hello there');
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  console.log(`${process.env.LOCALSTACK_HOSTNAME}`)

  // Set the region we will be using
  AWS.config.update({ 
    //endpoint = 'http://localhost:4576', 
    region: 'us-east-1'
  });

  const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
  
 // Setup the sendMessage parameter object
  const params = {
    MessageBody: JSON.stringify({
      order_id: 1234,
      date: (new Date()).toISOString()
    }),
    QueueUrl: `http://${process.env.LOCALSTACK_HOSTNAME}:4576/queue/dev-donations-paymentnotification`
  };

  sqs.sendMessage(params, (err, data) => {
    if (err) {
      console.log("Error", err);
      throw err;
    } else {
      console.log("Successfully added message", data.MessageId);
    }
  });

  callback(null, event);
};

module.exports.checkout = async (event, context, callback) => {
  console.log('in checkout');
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  callback(null, event);
};

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
