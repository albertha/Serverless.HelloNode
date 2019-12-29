'use strict';

module.exports.hello = async (event, context, callback) => {
  console.log('hello there');
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

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
