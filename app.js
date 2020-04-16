
var ejs = require('ejs').__express;

var fs = require('fs');



// May want to add cluster processes later to handle some multi-threading properties

//AWS required functions 

var AWS = require('aws-sdk');

var express = require('express');

var bodyParser = require('body-parser');





AWS.config.region = process.env.region;



//setting up the AWS Dynamo DB and AWS Simple Notification System

var sns = new AWS.SNS();

var ddb = new AWS.DynamoDB();



var ddbTable = process.env.PASSWORD_TABLE;

var snsTopic = process.env.NEW_PASSWORD_TOPIC;

var app = express();





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





app.post('/process_post', urlencodedParser, (req,res) => {

	//Prepare output in JSON format

	var post = {

		'Domain':{'S' : req.body.Domain},

		'Password':{ 'S' : req.body.Password}

	};

// May not need this to insert data

	// console.log(response);

	

	// // write/update response in the "database"

	// var data = JSON.stringify(response);



	// fs.writeFileSync(__dirname + "/private/passwords/" + req.body.Domain + ".json", data);



	// res.end("Domain and password recieved by server");

//For correctly putting the user input Domain and Password into the DB, checks for blamk space and incorrect input

// While posting a completion message if it was a success



	ddb.putItem({

	'TableName' : ddbTable,

	'Item' : post,

	'Expected': { Domain: { Exists: false } }        

        }, function(err, data) {

            if (err) {

                var returnStatus = 500;



                if (err.code === 'ConditionalCheckFailedException') {

                    returnStatus = 409;

                }



                res.status(returnStatus).end();

                console.log('DDB Error: ' + err);

            } else {

            	sns.publish({

            		'Message': 'Domain:' + req.body.Domain + "\r\nPassword: " + req.body.Password,

            		'Subject': 'New Password added!!!',

            		'TopicArn': snsTopic

            	}, function(err, data) {

                    if (err) {

                        res.status(500).end();

                        console.log('SNS Error: ' + err);

                    } else {

                        res.status(201).end();

                    }

                });            

            }

})

})





ddb.getItem(post, (err, data) {

	if (err) {

		console.log("password not found in the table" , err);

	} else {

		sns.publish({

			'Message': 'Domain:' + req.body.Domain + "\r\nPassword: " + req.body.Password,

            'Subject': 'password retrieved for' + req.body.Domain,

            'TopicArn': snsTopic

		})

});



// app.get('/process_get', (req,res) => {

// 	//want to search in the "database" for correct value

// 	fs.readdir(__dirname + "/private/passwords/", (err, files) => {

// 		files.forEach(file => {

// 			if (file === (req.query.Domain + ".json"))

// 			{

// 				var rawdata = fs.readFileSync(__dirname + "/private/passwords/" + file);

// 				var domainPasswordObject = JSON.parse(rawdata);

// 				console.log(domainPasswordObject);



// 				res.end(JSON.stringify(domainPasswordObject));

// 			}

// 		})

// 		// if password not found, return this message

// 		res.end("Password not found for specified domain");

// 		}

// 	)

// })



var server = app.listen(9001, () => {

	var host = server.address().address

	var port = server.address().port



	console.log("Application is listening at http://%s:%s", host, port)

})
