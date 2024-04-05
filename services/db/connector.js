//const flatted = require("flatted"); // for cyclic json objects 

//You can use an instance of MongoClient to connect to a cluster, access the database, and close the connection.
var MongoClient = require ('mongodb').MongoClient;

//You have to declare a variable for the string given by MongoDB. 
const url = "mongodb://localhost:27017";

var erpDB;
var client = undefined;


exports.getDB = (dbName, successCB, failCB) => {
	//console.log("ServicesConnector getDB called...\n");
	if (client == undefined) {
		failCB ("Retrieving db: connection client is undefined");
		console.log("Retrieving db: connection client is undefined")
	} else {
		successCB (client.db(dbName));
		console.log("Success db")
	}
}

exports.connectDB = (dbName, successCB, failCB) => {
	if (client == undefined) {
		MongoClient.connect(
			url,
			{useNewUrlParser: true,useUnifiedTopology: true},
			(err, clnt) => {
				//console.log("ServicesConnector-MongoClient creating connection called");
				if (err) {
					console.log("ServicesConnector: ERROR DB couldn't create connection to ERP db error: " + JSON.stringify(err));
					failCB(err);
					throw err;
				} else {
					client = clnt;
					successCB(client.db(dbName));
				}
			}	
		);
		
	}

	
};
