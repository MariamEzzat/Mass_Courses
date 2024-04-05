//const Cote = require('cote');
const dev = require('./../utils/dev');
const servicesMapper = require("./ServicesMapper");
const { performance } = require('perf_hooks');
var Users = require("./users/Users");
const SCRIPT_NAME = "\nServicesMarshal";
/*
	SERVICES MARSHAL
	RESPONSABLE FOR PROVIDING SERVICES CALLS
	THE PORTAL TO EACH SERVICE

	RECIEVES REQUEST FROM FRONT MARSHAL INCLUDING THE 
		REQUEST FROM FRONT END WITH A LIST OF SERVICES REQUESTS
	DISTRIBUTE CALLS TO EACH DESIRED SERVICE THEN COMPINE RESPONDS
		TO GIVE BACK TO FRONT MARSHAL

	RECIEVE REQUEST FROM ANY SERVICE THAT REQUESTS ACTION OR DATA FROM ANOTHER SERVICE/S

	CONTAINS VOTING SYSTEM
	CONTAINS ASYNCHRONOUS REQUEST FLOW ARF

	* MUST * RECIEVE A LIST CONTAINS SERVICES IDs AND DATA CORROSPONDING



	RECIEVED ENVELOPE: 

	services: [ // MUST BE envelope OWN PROPERTY
		{
			serviceID: "00000",
			data: {}
		}, ..
	]
	

	RESPONDING ENVELOPE:
		RECIEVED ENVELOPE WILL CONTAIN servicesResponds AS OWN PROPERTY, 
		WHILE REMOVING SENT services PROPERTY.

	servicesResponds: [
		{
			serviceID: "00000",
			data: {}
		}, ..
	]

*/




/**
 *  
 * @function isValidEnvelope - 
 * @param {*} envelope 
 */
function isValidEnvelope(envelope) {
    if (!envelope.hasOwnProperty("services")) {
        return false;
    } else if (!Array.isArray(envelope.services)) {
        return false;
    }
    return true;
}



// requires services list to be a first layer object in envelope
// 		services list item contains serviceID & data
/*
	recieved envelope: 
		Same as sent by front end with EP attachedData
		{attachedData{}, services[]}

	roll in (services calls:
	sending services list's item to it's service.
	(dataSent, attachedData, next): dataSent: {servcieID, data}, next: (respond: {data}), data: {serviceID, status, data}), attachedData: backendData

	roll back: 
	envelope: { servicesResponds: [ {serviceID, status, data},.. ] }

*/
/*let servicesMap = new Map([
	[
		"00T", Tasks.reciever
	],
	[
		"00U", Users.reciever
	]
]);

servicesMap.set("00T", Tasks.reciever);
servicesMap.set("00U", Users.reciever);

function getServiceReciever (serviceID) {
	if (serviceID == "00T") return Tasks.reciever;
	if (serviceID == "00U") return Users.reciever;
}*/
/*
exports.reciever = (envelope, next) => {
    // validating envelope
    if (!isValidEnvelope(envelope)) {
        envelope["err"] = "SERVICES MARSHAL: not valid envelope";
        next(envelope);
        return;
    }



    let servicesResponds = [];
    //AU	let affectedUsers = [];

    // voting system, goal is the min number of responds before next().
    let GOAL = envelope.services.length;
    let votes = 0;



    // TODO: COMPLETE SERVICES MARSHAL VOTING SYSTEM CONSIDERING RESPONDS INTEGRATION.

    let startTime = performance.now();
    try {
        for (let serviceData of envelope.services) {
            // retireve reciever function for this service and call it
            //service = servicesMapper.getServiceReciever(serviceData.serviceID);
            servicesMapper.getServiceReciever(serviceData.serviceID.substring(0, 3))(
                serviceData, // data sent to the service
                envelope.attachedData,
                postServiceResponse // next called by the service
            );

        }
    } catch (err) { // TODO: ** CHECK AND IMPLEMENT THE VALID RESPOND IF SOMETHING WENT WRONG LIKE SERVICE ID IS NOT DEFINED
        console.log(SCRIPT_NAME + " ERROR INVALID SERVICES OBJECT: " + JSON.stringify(envelope))
        next({
            status: 'FAILED',
            data: "Error, services object is not valid"
        })
    }



    function postServiceResponse(respond) {
        // append respond.
        servicesResponds.push({
            serviceID: respond.serviceID,
            status: respond.status,
            data: respond.data
        });

/*        AU
        		// affected users // INCOMPLETE.
        		if (respond.status == "SUCCESS") {
        			if (respond.hasOwnProperty ("affectedUsers")) {
        				affectedUsers.push (...respond.affectedUsers);
        				delete respond.affectedUsers;
        			}
        		}
        * /


        // voting system.
        if (++votes >= GOAL) {

            delete envelope.services;

            envelope["servicesResponds"] = servicesResponds; // responds

            /*AU
            			if (affectedUsers.length != 0) {
            				envelope["affectedUsers"] = affectedUsers; // affected users
            			}
            
            // time taken for all the services to respond  voting time in milliSeconds
            envelope["Monitor"] = { sm_vt: (performance.now() - startTime).toFixed(2) + "ms" }; // monitor

            /*			console.log (SCRIPT_NAME + ": final envelope after voting: " + JSON.stringify(envelope));
             * /
            next(envelope);

        }

    }

}

*/

/**
 * A simplified reciever that only handles one service 
 * @param  {[type]}   serviceID    [description]
 * @param  {[type]}   data         [description]
 * @param  {[type]}   attachedData [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
exports.directReciever = (serviceID, data, attachedData, next) => {

    servicesMapper.getServiceReciever(serviceID.substring(0, 3))(
                {serviceID: serviceID, data: data},
                attachedData,
                postServiceResponse, // next called by the service
                
            );
    function postServiceResponse (respond) {
        next(respond.data);
    }
}

/**
 * @function reciever - services/
 * @param {*} envelope 
 * @param {*} next 
 */
exports.reciever = (envelope, next, pusher) => {
    // validating envelope
    if (!isValidEnvelope(envelope)) {
        envelope["err"] = "SERVICES MARSHAL: not valid envelope";
        next(envelope);
        return;
    }

    let servicesResponds = [];
    //AU	let affectedUsers = [];

    // voting system, goal is the min number of responds before next().
    let GOAL = envelope.services.length;
    let votes = 0;

    // TODO: COMPLETE SERVICES MARSHAL VOTING SYSTEM CONSIDERING RESPONDS INTEGRATION.
    /**
     * TODO: COMPLETE SERVICES MARSHAL VOTING SYSTEM CONSIDERING RESPONDS INTEGRATION.
     * @callback
     */
    let startTime = performance.now();
    try {
        for (let serviceData of envelope.services) {
            // retrieve reciever function for this service and call it

            servicesMapper.getServiceReciever(serviceData.serviceID.substring(0, 3))(
                serviceData, // data sent to the service
                envelope.attachedData,
                postServiceResponse, // next called by the service
                pusher
            );

        }
    } catch (err) { // TODO: ** CHECK AND IMPLEMENT THE VALID RESPOND IF SOMETHING WENT WRONG LIKE SERVICE ID IS NOT DEFINED
        console.log(SCRIPT_NAME + " ERROR INVALID SERVICES OBJECT: " + JSON.stringify(envelope));
        next({
            status: 'FAILED',
            data: "Error, services object is not valid"
        })
    }


    /**
     * @function postServiceResponse
     * @param {*} respond 
     */
    function postServiceResponse(respond) {
        // append respond.
        servicesResponds.push({
            serviceID: respond.serviceID,
            status: respond.status,
            data: respond.data
        });

        /*AU
        		// affected users // INCOMPLETE.
        		if (respond.status == "SUCCESS") {
        			if (respond.hasOwnProperty ("affectedUsers")) {
        				affectedUsers.push (...respond.affectedUsers);
        				delete respond.affectedUsers;
        			}
        		}
        */


        // voting system.
        if (++votes >= GOAL) {

            delete envelope.services;

            envelope["servicesResponds"] = servicesResponds; // responds

            /*AU
            			if (affectedUsers.length != 0) {
            				envelope["affectedUsers"] = affectedUsers; // affected users
            			}
            */
            // time taken for all the services to respond  voting time in milliSeconds
            envelope["Monitor"] = { sm_vt: (performance.now() - startTime).toFixed(2) + "ms" }; // monitor

            /*			console.log (SCRIPT_NAME + ": final envelope after voting: " + JSON.stringify(envelope));
             */
            next(envelope);

        }

    }

}

let SERVICES = {
    TAGS: {
        NEW_TAG: "0TG01", // users: [projects.addTag]
    },
    PROJECTS: {
        NEW_CATEGORY: '00P13', // users: [projects.addCategory]
    },
    LOCATIONS: {
        /**
         * 
         * SERVICES.LOCATIONS.NEW_LOCATIONS
         * require: [{name}],
         * gives: [id]
         * @type {String}
         */
        NEW_LOCATIONS: '00L01',

        /**
         * SERVICES.LOCATIONS.ALL_LOCATIONS
         * will fail if this user doesn't have all access
         * gives: [{_id, name}]
         * @type {String}
         */
        ALL_LOCATIONS: '00L02',

        /**
         * SERVICES.LOCATIONS.LOCATIONS
         * require: ['locationID']
         * gives: [{_id, name}]
         * access can not be checked yet, so caller has to verify if the user has access to these locations
         * ISI: 1
         * @type {String}
         */
        LOCATIONS: '00L03',


        /**
         * SERVICES.LOCATIONS.ABSTRACT_ACCESS
         * to give access due to existing in an entity, ex: participating in project
         * require: {locationID, userID, unit: {name, id}}
         * gives: {modified: 1/0, reason}
         * INTER-SERVICES ONLY isi:1
         * @type {String}
         */
        ABSTRACT_ACCESS: '',
        /**
         * SERVICES.LOCATIONS.REMOVE_ABSTRACT_ACCESS
         * will remove this user access if & only if no other unit gave him abstract access
         * require: {locationID, userID, unitID}
         * gives: 
         * INTER-SERVICES ONLY isi:1
         * @type {String}
         */
        REMOVE_ABSTRACT_ACCESS: '',

        /**
         * SERVICES.LOCATIONS.DIRECT_ACCESS
         * user has been given access directly
         * require: {locationID, userID, state: 1/0} // 1 for has access, 0 for no access
         * @type {String}
         */
        DIRECT_ACCESS: '',

        /**
         * SERVICES.LOCATIONS.DIRECT_ACCESS
         * require: {userID}
         * gives: {id, new, delete, edit, all}
         * @type {String}
         */
        USER_ACCESS: '00L08',


        /**
         * SERVICES.LOCATIONS.PUBLIC_LOCATIONS
         * gives: [{_id, name}]
         * @type {String}
         */
        PUBLIC_LOCATIONS: '00L10',



    }

}

exports.SERVICES = SERVICES;

// 
// one route request
/**
 * [description]
 * For inter-services communication.
 * Single service request.
 * @param  {[type]} envelope {
 *                           serviceID,
 *                           attachedData,
 *                           data, // service dependant object
 * }
 * @param  {[type]} success  {data}
 * @param  {[type]} fail     {data: 'error data' }
 * @return {[type]}          [description]
 */
exports.RequestService = (envelope, success, fail, pusher) => {
    try {
        servicesMapper.getServiceReciever(envelope.serviceID.substring(0, 3))(
            envelope,
            envelope.attachedData,
            recievedEnvelope => {
                if (recievedEnvelope.status == 'SUCCESS') {
                    success(recievedEnvelope.data);
                    return;
                }
                fail({
                    data: recievedEnvelope.data
                });
            },
            pusher
        );
    } catch (err) {
        console.log(SCRIPT_NAME + " ERROR INVALID SERVICE OBJECT: " + JSON.stringify(envelope));
        fail({
            data: err.message
        })
    }

}