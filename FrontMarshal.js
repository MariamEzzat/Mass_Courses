/*const Cote = require('cote');
 */
const dev = require("./utils/dev");

const ServicesMarshal = require("./services/ServicesMarshal");
const Logger = require("./Logger");

/*
	FRONT MARSHAL 
		MIDDLE WARE BETWEEN IO(ENTRY POINT) AND THE SERVICES MARSHAL
	RESPONSIBLITIES:
		RECIEVES MSG FROM IO (ENTRY POINT)
		SEND & RECIEVE IT TO ENCRYPTION.JS TO DYCREPT
		SEND IT TO GATEWAY LOGGER TO LOG RAW REQUEST OR DYCREPTION FAIL
		THEN DIRECT IF DYCREPTION SUCCESS TO THE SERVICE MARSHAL


	AFTER REMOVING COTEJS:
		THIS MODULE CONTAINS reciever FUNCTION
		FRONT MARSHAL ROUTES THE DATA TO DIFFERET MODULES,
			FOR NOW: LOGGER & SERVICES MARSHAL
		ROUTING IS BY CALLING OTHER MODULES WITHOUT COTE
		ASYNCROUNES REQUEST FLOW INTRODUCED
			BY CALLING MODULES ASYNCROUNESLY
		VOTING SYSTEM INTRODUCED
			FRONT MARSHAL WILL RESPOND TO THE GIVEN CALLBACK
			IFF ALL CALLS RESPONDED

		
*/

/*
console.log("hi I'm front marshal I've been called by myself");

const FrontResponder = new Cote.Responder({ name: 'Front Marshal', key:'FrontMarshal' });

const EncryptionRequester = new Cote.Requester({ name: 'Encryption', key:'Encryption' });

const LoggerRequester = new Cote.Requester({name: 'Logger', key:'Logger'});

const ServicesMarshalRequester = new Cote.Requester( {name: 'Services Marshal', key: 'Services Marshal'});


FrontResponder.on ('actionRouting', (recievedEnvylop, EntryPointCallback) => {

	var data = recievedEnvylop.data;

	dev.logTrace(data, 'Front Marshal recieved actionRouting');

	startRouting (data, EntryPointCallback);

});
*/

/*
	RECIEVES ENVELOPE: 
		attachedUserID,
		serviceID,
		requestID,
		user: {username, token},
		data <- raw request 
*/

/**
 * - TODO: IMPLEMENT VOTING SYSTEM.
 *    VOTING SYSTEM IS DECIDING THE POINT TO CALL NEXT.
 *    VOTING: CALLING FUNCTIONS ASYNCROUNESLY THEN AFTER ALL RESPONED CALL NEXT
 * - WHEN ADDING MORE CALLS: CHECK CALLS RECIEVED DATA INTEGRATION
 * @function reciever - ./
 * @param {*} recievedEnvelope 
 * @param {*} next 
 * @param {callback} pusher - for notifications
 */
exports.reciever = (recievedEnvelope, next, pusher) => {
    // TODO: IMPLEMENT VOTING SYSTEM.
    //			VOTING SYSTEM IS DECIDING THE POINT TO CALL NEXT.
    //			VOTING: CALLING FUNCTIONS ASYNCROUNESLY THEN AFTER ALL RESPONED CALL NEXT

    let GOAL = 2;
    let votes = 0;
    let envelope = {};

    function checkVote() {
        if (++votes >= GOAL) { // check if all calls responded
            next(envelope);
        }
    }

    /*	to calculate time taken by the reciever.

    	servicesMarshalT0 = performance.now();
    	servicesMarshalT = performance.now();
    	servicesMarshalTimeTaken = servicesMarshalT - servicesMarshalT0;
    */

    // SERVICES MARSHAL
    ServicesMarshal.reciever(
        recievedEnvelope,
        (recievedEnvelope) => {
            envelope = recievedEnvelope;
            checkVote();
        },
        pusher
    );

    // LOGGER
    Logger.reciever(
        JSON.parse(JSON.stringify(recievedEnvelope)), // to give a copy, to avoid data referenced
        (recievedEnvelope) => {
            checkVote();
        }
    );


    // WHEN ADDING MORE CALLS: CHECK CALLS RECIEVED DATA INTEGRATION 
};

/*
async function startRouting(data, finalCallback) {
	//NOTE: THIS FUNCTION IS EXPECTED TO MANAGE ROUTING DATA TO SERVICES
	//		IT SHOULD HANDLE BIDIRECTIONAL ORDERED-CALLBACKS FROM&TO SERVICES
	// 		TRYING PROMISES DIRECTIONS
	console.log("FRONT MARSHAL.");
	//TODO: SEND TO DECRYPT
	//		SEND TO LOG ACTION
	//		SEND TO SERVICES MARSHAL INCASE OF SUCCESS OF PREVIOUS
	//		SEND TO ENCRYPT
	//		SEND TO LOG REPOND
	//	 	GIVE RETURN CALLBACKS (SEND BACK TO ENTRY POINT)


	function postDecryption (recievedEnvylop) {
		//NOTE: 2 STATUS F OR S, 
		//		(F: SEND TO LOG -> BACK TO FINAL CALLBACK)
		//		(S: SEND TO LOG -> SEND TO FROMT MARSHAL)

		if (recievedEnvylop.status == 'SUCCESS') {
			// SEND TO LOG -> TO SERVICES MARSHAL

			dev.logTrace(recievedEnvylop.data, 'Front Marshal recieved decrypt +');


			dev.logTrace(recievedEnvylop.data, 'Front Marshal sending to log');
			var envylop = {type:'request log', data: recievedEnvylop.data};
			LoggerRequester.send(envylop, postLoggingRequest);// TO LOG

		} 
		else if (recievedEnvylop == 'FAILED') {
			// SEND TO LOG -> FINAL CALLBACK
			// ASSUME DECRYPTION ALWAYS SUCCESS
		}

	}

	function postLoggingRequest (recievedEnvylop) {

		if (recievedEnvylop.status == 'SUCCESS') {
			//SEND

			dev.logTrace(recievedEnvylop.data, 'Front Marshal recieved logging on request');

			dev.logTrace(recievedEnvylop.data, 'Front Marshal sending to Services Marshal');
			var envylop = {type:'request service', data: recievedEnvylop.data};
			ServicesMarshalRequester.send(envylop, postServicesMarshal);// TO SERVICES MARSHAL
		}
		else if (recievedEnvylop.status == 'FAILED') {
			//ASSUME LOG ALWAYS SUCCESS

		}

	}

	function postServicesMarshal (recievedEnvylop) {
		//TODO: SEND TO LOG RESPOND -> ENCRYPT -> FINAL

		if (recievedEnvylop.status == 'SUCCESS') {

			dev.logTrace (recievedEnvylop.data, 'Front Marshal recieved Services Marshal +');

			dev.logTrace (recievedEnvylop.data, 'Front Marshal sending to log');
			var envylop = {type:'respond log', data: recievedEnvylop.data}
			LoggerRequester.send(envylop, postLoggingRespond); // TO LOG
		}
		else if (recievedEnvylop.status == 'FAILED') {

		}


	}

	// NOTICE: LOGGING RESPOND IS WHEN THE DATA IS READY TO BE SENT BACK TO FRONT END
	function postLoggingRespond (recievedEnvylop) {

		if (recievedEnvylop.status == 'SUCCESS') {
			// SEND TO ENCRYPT -> FINAL
			dev.logTrace (recievedEnvylop.data, 'Front Marshal recieved logging respond +');

			dev.logTrace (recievedEnvylop.data, 'Front Marshal sending to decrypt');
			var envylop = {type: 'encrypt', data: recievedEnvylop.data}
			EncryptionRequester.send(envylop, postEncryption);// TO ENCRYPT
		}
		else if (recievedEnvylop == 'FAILED') {
			// ASSUME NO LOG FAILED
		}

	}

	// NOTICE: ENCRYPTING PLAIN DATA TO BE SENT BACK TO FRONT END CYPHERED
	function postEncryption (recievedEnvylop) {

		if (recievedEnvylop.status == 'SUCCESS') {
			dev.logTrace (recievedEnvylop.data, 'Front Marshal recieved encryption n');

			dev.logTrace (recievedEnvylop.data, 'Front Marshal sending to Entry Point');
			finalCallback(recievedEnvylop);
		}
		else if (recievedEnvylop.status == 'FAILED') {
			// ASSUME NO ENCRYPTION FAILED
		}
		
	}



//  ** STARTING POINT ** 

	dev.logTrace(data, 'Front Marshal sending to decrypt');
	//NOTE: PREPARE DATA TO SEND TO ENCRYPTION TO DECRYPT
	//		THIS IS THE FIRST STAGE 			
	var envylop = {type: 'decrypt', data: data};
	EncryptionRequester.send(envylop, postDecryption);// TO DECRYPT

}










async function sendForDecryption (data, successCallback, failedCallback) {

//*devtrace
	if (dev.DEV_TRACE_ENABLED) {
		data.servicesRoutes.push('FrontMarshal sending to decrypt');
	}

	var envylop = {type:'decrypt', data: data};

	


	function postDecryptSuccess (recievedEnvylop) {
		if (recievedEnvylop == undefined) console.log('FRONTMARSHAL recieved envylop undefined'); 
		if (dev.DEV_TRACE_ENABLED) {
			recievedEnvylop.data.servicesRoutes.push('FrontMarshal recieved dycrept +');
		}
		// RETURN TO CALLER
		successCallback (recievedEnvylop.data);
	}

	function postDecryptFailed (recievedEnvylop) {
		if (recievedEnvylop == undefined) console.log('FRONTMARSHAL recieved envylop undefined'); 
		if (dev.DEV_TRACE_ENABLED) {
			recievedEnvylop.data.servicesRoutes.push('FrontMarshal recieved dycrept -');
		}
		// RETURN TO CALLER
		failedCallback (recievedEnvylop.data);
	}

// NOTE: HERE ENCRYPTION SENT BACK ENVYLOP WITH STATUS EITHER SUCCESS OR FAIL
//		 ACCORDING TO THE STATUS WE CALL FIAL OR SUCCESS CALLBACKS 
	EncryptionRequester.send(
		envylop,
		// returns RE function routes to success and failed
		dev.combineForCoteCB(postDecryptSuccess, postDecryptFailed) 
	);
	

}
*/