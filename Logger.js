//const Cote = require ( 'cote' );
const dev = require ( './utils/dev' );
const fileSystem = require ( 'fs' );


//console.log("Hi I'm logger.js I've sent this messege from myself");


//const Responder = new Cote.Responder( { name: 'Logger', key: 'Logger'} );


// NOTICE: THIS SHOUDL LOG REQUEST AFTER DECRYPTING IT & BEFORE SENDING BACK TO SERVICES MARSHAL
/*Responder.on('request log', (recievedEnvylop, next) => {
	var data = recievedEnvylop.data;

	dev.logTrace (data, 'Logger recieved to post decrypt log');

	dev.logTrace (data, 'Logger sending back after log');

	var envylop = { status: 'SUCCESS', data: data };

	next (envylop);
});


// NOTICE: THIS SHOULD LOG DATA BEFORE ENCRYPTING & SENDING BACK TO FRONT END
Responder.on('respond log', (recievedEnvylop, next) => {
	var data = recievedEnvylop.data;

	dev.logTrace (data, 'Logger recieved to respond log');

	dev.logTrace (data, 'Logger sending back after log');

	var envylop = { status: 'SUCCESS', data: data };

	next (envylop);
})
*/
const LogFilePath = "./../Requests_Log";

exports.reciever = (envelope, next) => {
	let date = new Date()

	let dateHeader = "\n\n" + date.toLocaleDateString('zh-Hans-CN') + "/" + date.toLocaleTimeString();
	let appendString = dateHeader + "\n" + JSON.stringify(envelope);

	fileSystem.appendFile (LogFilePath, appendString, (err)=> {
		if (err) {
			console.log (dateHeader + " error while logging");
		}
	});

	next();
}