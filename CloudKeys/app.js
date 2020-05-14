var express = require('express');
var ejs = require('ejs').__express;
var app = express();
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var KMS = new AWS.KMS();

//set credentials and region
AWS.config.update({region: 'us-east-1'});

var tableName = "domain-passwords";
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

//Create application/x-www-forn-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({extended: false})

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('.ejs', ejs);
app.use(express.static(__dirname + '/public'));

//render new ejs file
app.get('/', (req, res) => {
	res.render('index.ejs');
})
//If we need to encrypt data later for keys or instead of making keys
// function encrpyt(string data)
// {
// var key = new String(data);
// ByteBuffer plaintext = ByteBuffer.wrap(new byte[]{1,2,3,4,5,6,7,8,9,0});

// EncryptRequest req = new EncryptRequest().withKeyId(key).withPlaintext(plaintext);
// ByteBuffer ciphertext = kmsClient.encrypt(req).getCiphertextBlob();
// key = ciphertext.tostring();
// return key;
// }


app.post('/process_post', urlencodedParser, (req,res) => {
	//Prepare output in JSON format

//creating a CMK(customer master key)

// var params = {
//   BypassPolicyLockoutSafetyCheck: true || false,
//   CustomKeyStoreId: req.body.domain,
//   CustomerMasterKeySpec: SYMMETRIC_DEFAULT,
//   Description: 'The customer key to access their password for a domain',
//   KeyUsage:  ENCRYPT_DECRYPT,
//   Origin: AWS_KMS | EXTERNAL | AWS_CLOUDHSM,
//   Policy: ' ',
//   Tags: [
//     {
//       TagKey: req.body.domain, /* required */
//       TagValue: ' ' /* required */
//     },
//     /* more items */
//   ]
// };
// kms.createKey(params, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(data);           // successful response
// });

//generating a data key for CMK

// 	KeyId: 'Password', /* required */
//   EncryptionContext: {
//     'Password': '10103.0',
//     /* '<EncryptionContextKey>': ... */
//   },
//   Gr'1',
//     antTokens: [
//     /* more items */
//   ],
//   KeySpec: AES_256 | AES_128,
//   NumberOfBytes: '64'
// };
// kms.generateDataKey(params, function(err, data) {
//   if (err) 
//   	console.log(err, err.stack); // an error occurred
//   else     
//   	console.log(data);           // successful response
// });
//  res.end("key" + + "created!");


	var response = {
		"Domain":{S: req.body.Domain},
		"Password":{S: req.body.Password},
		"Key":{}
	};
	console.log(response);
	
	// write/update response in the "database"
	var params = {
		TableName: tableName,
		Item: response
	};
	ddb.putItem(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));

    }
}); 

	res.end("Domain and password recieved by database, your customer key to access this data is" + );
});

app.get('/process_get', (req,res) => {
	//want to search in the "database" for correct value
	
	var params = {
		TableName: tableName,
		Key: {
			"Domain": {"S": req.query.Domain}
		}
	};
	ddb.getItem(params, function(err, data) {
		if (err) res.end("Password not found for specified domain");
		else res.end(JSON.stringify(data));
	})
})

var server = app.listen(8080, () => {
	var host = server.address().address
	var port = 8080

	console.log("Application is listening at http://%s:%s", host, port)
})