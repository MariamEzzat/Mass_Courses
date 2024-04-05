const flatted = require("flatted"); // for cyclic json objects 
var MongoClient = require ('mongodb').MongoClient;
const url = "mongodb://localhost:27017";

var client;


MongoClient.connect(
	url,
	{useNewUrlParser: true,useUnifiedTopology: true},
	(err, clnt) => {
		//console.log("Login.js-MongoClient creating connection called");
		if (err) {
			//console.log("ERROR DB couldn't create connection to ERP db error: " + JSON.stringify(err));
			throw err;
		} else {
			client = clnt;
		}
	}	
);

exports.getDB = (dbName, successCB, failCB) => {

	if (client == undefined) {
		if (successCB == undefined) {
			return Promise.reject ("Retrieving db: connection client is undefined");
		}
		failCB ("Retrieving db: connection client is undefined");
	} else {
		if (successCB == undefined) {
			return Promise.resolve (client.db(dbName));
		}
		successCB (client.db(dbName));
	}
}
