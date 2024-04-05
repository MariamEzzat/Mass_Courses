/*
	SERVICE ID: 00U00

	NOTE: THIS HANDLES:
			SERVE SIMPLE USERS IDENTIFIERS  (00U01)
				(ID, VISUAL NAME)


*/
/*const Cote = require ('cote');
 */
const dev = require('./../../utils/dev');
const dbHandler = require("./dbHandler");
let helpers = require("./../../utils/helpers"); // for date function.
const SCRIPT_NAME = "Users.js service";

let functionMapper = new Map([
    ["00U01", getUsers]
]);

/**
 * 
 * @function reciever - serv/Users.js
 * @param {*} envelope 
 * @param {*} attachedData 
 * @param {*} next 
 */
exports.reciever = (envelope, attachedData, next, pusher) => {
    /*AU
    	let affectedUsers = [];
    	if (envelope.hasOwnProperty("affectedUsers")) {
    		affectedUsers = envelope.affectedUsers;
    		delete envelope.affectedUsers;
    	}
    */
    try {
        function serviceNext(respond) {
            if (respond.status != "SUCCESS") {
                /*AU
                                // here to make it possible for future affected users on function.
                                if (respond.hasOwnProperty("affectedUsers")) {
                                    affectedUsers.push(...respond.affectedUsers);
                                }
                */
            }
            let finalEnvelope = {
                serviceID: envelope.serviceID,
                status: respond.status,
                data: respond.data
            }
            next(finalEnvelope);
        }
        let possiblePromise = functionMapper.get(envelope.serviceID)(
            envelope.data,
            attachedData,
            serviceNext,
            pusher
        );
        if (possiblePromise instanceof Promise) {
            possiblePromise
                .then(result => {
                    serviceNext({
                        status: 'SUCCESS',
                        data: result
                    })
                })
                .catch(errObj => {
                    serviceNext({
                        status: 'FAILED',
                        data: errObj
                    })
                })
        }

    } catch (err) {
        //throw err;
        next({
            serviceID: envelope.serviceID,
            status: "FAILED",
            data: err
        });
    }


}


function getUsers(data, attachedData, next) {
    //var data = recievedEnvylop.data;
    //dev.logTrace(data, "Users service recieved on a code 00U01");
    //TODO: VALIDATING->DATABASE->ID->ATTACHMENTS NAMES
    /*	TODO:
    	RETRIEVE USERS IDENTIFIERS FROM DB
    */
    dbHandler.getUsersIdentifiers(
        (users) => { // success cb
            let formattedUsers = [];
            for (let user of users) {
                let formattedUser = {
                    type: user.type,
                    userID: user._id,
                    visualName: user.visualName,
                    active: user.active,
                    imgURL: user.hasOwnProperty('imgURL') ? user.imgURL : ''
                }

                formattedUsers.push(formattedUser);
               // console.log("formatted Users: "+ JSON.stringify(formattedUser))
            }
            /*var envelope = {status: "SUCCESS", data: {
            	users: formattedUsers
            }};
            dev.logTrace(data, "USERS service sending back respond");*/

            next({
                status: "SUCCESS",
                data: { userID: attachedData.requester, data: formattedUsers }
            });
        },
        (errMsg) => { // failed cb
            /*var envelope = {status: "FAILED", data: {
            	error: errMsg
            }};
            dev.logTrace(data, "USERS service sending back respond");*/
            next({
                status: "FAILED",
                data: errMsg
            });
        }
    );
    /*
    	dev.logTrace(data, "USERS service sending back respond");
    	var envelope = {status: "SUCCESS", data: data};
    	next (envelope);
    */
};