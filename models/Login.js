const flatted = require("flatted"); // for cyclic json objects 
let connector = require("./connector");
const databaseName = "ERP";
const collections = {
	students: 'students',
	appVersions:'app.versions',
	instructors: 'instructors'
}

// GETS USERNAME OR EMAIL AND CALLS postFetch CALLBACK AND GIVES THE RESULT OR FALSE IF NOT FOUND
//	USERDATA MUST CONTAIN ON FIRST LEVEL THE EMAIL AND/OR USERNAME
exports.getUser = (userData, postFetch) => {

	//TODO: HERE WE SHOULD VALIDATE BEFORE QUERY DB TO OPTIMIZE PERFORMANCE
	//		IF NOT VALID USERNAME OR EMAIL GIVE postFetch FALSE ARG.

	var query = {};
	if (userData.username == undefined) {
		query = { email: userData.email , type:"ADMIN"};
	} else if (userData.email == undefined) {
		query = { username: userData.username , type:"ADMIN"};
	}

	console.log("query"+ query.email);
	
	connector.getDB(

		databaseName,
		(db) => { // success callback

			db.collection("users").findOne(query, (err, result) => {
				
				if (err) {
					console.log("NOT FOUND: "+err)
					throw err;
					
				}
				console.log("FOUND")
				postFetch(result);
			});
		},
		(errMsg) => { // fail callback
			postFetch(errMsg);
		}
	);
}




exports.getInstructorUser = (userData, postFetch) => {

	//TODO: HERE WE SHOULD VALIDATE BEFORE QUERY DB TO OPTIMIZE PERFORMANCE
	//		IF NOT VALID USERNAME OR EMAIL GIVE postFetch FALSE ARG.

	var query = {};
	if (userData.username == undefined) {
		query = { email: userData.email  , type:"INSTRUCTOR"};
	} else if (userData.email == undefined) {
		query = { username: userData.username , type:"INSTRUCTOR"};
	}

	console.log("query"+ query.email);
	
	connector.getDB(

		databaseName,
		(db) => { // success callback

			db.collection("users").findOne(query, (err, result) => {
				
				if (err) {
					console.log("NOT FOUND: "+err)
					throw err;
					
				}
				console.log("FOUND")
				postFetch(result);
			});
		},
		(errMsg) => { // fail callback
			postFetch(errMsg);
		}
	);
}



/**
 * Authenticate mobile student login from ERP.students collections
 * 
 * @param  {[type]} mobile   [description]
 * @param  {[type]} password [description]
 * @return {Promise}          null if user not found with the given credentials,
 *                                user document if user found (correct mobile & password)
 */
exports.studentMobileAuth = (mobile, password) => {
	return connector.getDB(databaseName)
		.then(db => {
			let filter = {
				primaryMobile: String(mobile),
				/* password: String(password),
				deactivate:true */
			}
			return db.collection(collections.students)
				.findOne(filter).then(r=>{
					console.log("returned res: "+r);
					return r
				})
		})

}

exports.EnterDeviceForStudent=(mobile, password, deviceID) => {
	return connector.getDB(databaseName)
		.then(db => {
			let filter = {
				primaryMobile: String(mobile),
				password: String(password),
				deactivate: false
			}
			return db.collection(collections.students)
				.updateOne(filter,{$set:{deviceID:deviceID}})
				.then(result=>{
					return true
				})
		})
}

exports.appVersion= () => {
	return connector.getDB(databaseName)
		.then(db => {
			return db.collection(collections.appVersions)
				.find().toArray()
				.then(result=>{
					//console.log(result);
					result = result[0]
					return {
						android:result.android.lastValidVersion,
						ios:result.ios.lastValidVersion
					}
				})
		})

}