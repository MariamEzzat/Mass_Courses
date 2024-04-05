exports.log = 
(...arguments) => {
	let string = "\n ";
	for (let arg of arguments) {
		string = string + " " + arg;
	}
	console.log(string);
};

exports.play = () => {};

/*
exports.sendCote (sender, data, successCallback, failCallback) {
	sender.send(data, )
}
*/

// CONSTANTS: 
DEV_TRACE_ENABLED = false;


// NOTICE: 	THIS CONSTANT IS TO ENABLE TRACING TRANSACTION TO BE LOGGED
//			FALSE WILL PREVENT TRACING POINT TO LOG FOR DEPLOYMENT DEBUGGING
exports.DEV_TRACE_ENABLED = DEV_TRACE_ENABLED;


// NOTICE: 	COTE SENDING ONLY TAKES ONE CALLBACK FUNCTION
//			THIS TAKES 2 FUNCTIONS AND RETURNS CALLBACK THAT
//			CALLS THE RESPECTED FUNCTION FROM THE STATUS RETURNED 
//			INSIDE THE RECIEVED ENVYLOP, *RETURNS THE ENTIRE ENVYLOP
exports.combineForCoteCB = (successCallback, failedCallback) => {


	return (recievedEnvylop) => {
		if (recievedEnvylop == undefined) {console.log('in combineForCoteCB recievedEnvylop undefined')}
		if (recievedEnvylop.status === "SUCCESS") successCallback (recievedEnvylop);
		else failedCallback (recievedEnvylop);
	};
};




// NOTICE: 	THIS FUNCTION IS TO LOG TRACE OF THE DATA JOURNY 
//			FROM AND BACK TO ENTRY POINT
exports.logTrace = (data, msg) => {
	if (DEV_TRACE_ENABLED) {
		data.servicesRoutes.push(msg);
	}
}

/*
*/