/*
	SERVICE ID: 00C00

	NOTE: THIS HANDLES:
			NEW CONSTANT  ()
				()


/*
for inter-services communications

ServicesMarshal.RequestService(
                envelope,
                (serviceData) => { // {tagID}
                    proceedAddTag(serviceData.tagID)
                },
                (err) => {
                    next({
                        status: 'FAILED',
                        data: err
                    })
                }
            )

*/

const dev = require('./../../utils/dev');
const dbHandler = require("./dbHandler");
let helpers = require("./../../utils/helpers"); // for date function.
let { Field } = require("./../../utils/models/Definitions.js");
//const { service: RequestService, SERVICES } = require("./../ServicesMarshal");
const ServicesMarshal = require("./../ServicesMarshal");
const SCRIPT_NAME = "Constants.js service";

let functionMapper = new Map([
    ['00C01', costCategories],
    ['00C02', newCostCategory],
    ['00C03', newCostSubcategory],
    ['00C04', getListByName],

]);


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



function costCategories (data, attachedData, next) {
    dbHandler.costCategories ()
        .then (result => {
            next({
                status: 'SUCCESS',
                data: result
            })
        })
        .catch (err => {
            next({
                status: 'FAILED',
                data: err
            })
        })

}

function newCostCategory (data, attachedData, next) {
    let missing = helpers.missingProperties(['vID', 'name', 'description'], data)
    if (missing != false) {
        next({
            status: "FAILED",
            data: "Missing fields"
        });
        return;
    }


    function insertCategory () {
        let preparedData = {
            vID: String(data.vID),
            b: attachedData.requester,
            name: {
                last: String(data.name),
                history: [{
                    b: attachedData.requester,
                    t: attachedData.timeStamp,
                    v: String(data.name)
                }]
            },
            description: {
                last: String(data.description),
                history: [{
                    b: attachedData.requester,
                    t: attachedData.timeStamp,
                    v: String(data.description)
                }]
            }
        }
        return dbHandler.newCostCategory (preparedData)
    }

    dbHandler.costCategoryVIDExists (String(data.vID))
        .then (result => {
            if (result != null) throw 'vID exists'
            return insertCategory();
        })
        .then (result => {
            next({
                status: 'SUCCESS',
                data: result
            })
        })
        .catch (err => {
            console.log (err);
            next({
                status: 'FAILED',
                data: err
            })
        })

}


function newCostSubcategory (data, attachedData, next) {
    let missing = helpers.missingProperties(['categoryVID', 'vID', 'name', 'description'], data)
    if (missing != false) {
        next({
            status: "FAILED",
            data: "Missing fields"
        });
        return;
    }

    function insertSubcategory () {
        let preparedData = {
            _id:'',
            vID: String(data.vID),
            b: attachedData.requester,
            name: {
                last: String(data.name),
                history: [{
                    b: attachedData.requester,
                    t: attachedData.timeStamp,
                    v: String(data.name)
                }]
            },
            description: {
                last: String(data.description),
                history: [{
                    b: attachedData.requester,
                    t: attachedData.timeStamp,
                    v: String(data.description)
                }]
            }
        }
        return dbHandler.newCostSubcategory (String(data.categoryVID), preparedData)
    }

    dbHandler.costSubcategoryVIDExists (String(data.categoryVID), String(data.vID))
        .then (result => {
            if (result != null) throw 'vID exists'

            return insertSubcategory()
        })
        .then (result => {
            next({
                status: 'SUCCESS',
                data: result
            })
        })
        .catch(err => {
            next({
                status: 'FAILED',
                data: err
            })
        })
}


function getListByName (data, attachedData) {


    if (!data.hasOwnProperty('name'))
        throw 'Missing field'

    return dbHandler.getListByName (data.name);
}


