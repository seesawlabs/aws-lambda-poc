var aws = require('aws-sdk');
var s3 = new aws.S3({ apiVersion: '2006-03-01' });
var db = new aws.DynamoDB({ 
  apiVersion: '2012-08-10',
  region: 'us-east-1'
});

db.region = 'us-east-1';

var md5 = require('crypto').createHash('md5');

exports.handler = function(event, context) {
  // Get the object from the event and show its content type
  var s3obj = event.Records[0].s3;
  var params = {
      Bucket: s3obj.bucket.name,
      Key: s3obj.object.key
  };

  s3.getObject(params, function(errorS3, data) {
    if (errorS3) {
      return context.fail(errorS3);
    }

    var contents = data.Body.toString();

    db.putItem({
      TableName: 'lambda_poc',
      Item: {
        DocumentID: {
          S: md5.update(s3obj.object.key + contents).digest('hex')
        },
        text: {
          S: contents
        }
      }
    }, function(errorDb, result) {
      if (errorDb) {
        return context.fail(errorDb);
      }
      context.succeed("All Done!");
    });
  });
};