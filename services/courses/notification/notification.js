let helpers = require("../../../utils/helpers.js"); // for date function.
let dbHandler = require('./dbHandler.js')
let functionMapper = new Map([
    //['0CR01', universities],
    ['00N.1', newNotification],
    ['00N.2', notificationsForStudetn],
    ['00N.3', NotificationDelivered],
    ['00N.4', NotificationRead],
    ['00N.5', NotificationDelete],
    ['00N.6', NotificationDeleteStatus],
    ['00N.7', allNotifications],
]);

/**
 * 
 * @function reciever
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

        let localServiceID;
        let dataEnvelope;

        if (envelope.serviceID.indexOf('.') == -1) { // local function without .
            localServiceID = envelope.serviceID;
            dataEnvelope = envelope.data;
        } else {
            localServiceID = envelope.serviceID.substr(0, envelope.serviceID.indexOf('.') + 2); // to get from 00E.C, ONLY FIRST LETTER OF THE SUBSERVICE (AFTER '.')
            dataEnvelope = envelope.serviceID.indexOf('.') == 3 ? envelope : envelope.data;
        }

        try { // to enable async await
            // statements
            let possiblePromise = functionMapper.get(localServiceID)(
                dataEnvelope,
                attachedData,
                serviceNext,
                pusher
            );

            if (possiblePromise instanceof Promise) {
                possiblePromise
                    .then(result => {
                        //console.log (result);
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
        } catch (e) {
            // statements
            console.log(e);
            serviceNext({
                status: 'FAILED',
                data: e
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
//db.students.update({}, {$unset: {notification:1}} , {multi: true});
function newNotification(data, attachedData, next) {
    //console.log(data);
    data = data.data
    function failed(msg) {
        next({
            status: "FAILED",
            data: msg
        });
    }
    // VALIDATION
    let missing = helpers.missingProperties(['message', 'dateTime'], data);
    if (missing != false) {
        failed("Missing Properties: " + JSON.stringify(missing));
        return;
    }

    let preparedData = {
        msg: data.message,
        time: data.dateTime,
        by: attachedData.requester,
        submittedAt: attachedData.timeStamp,
        users: data.students.map(student => {
            return {
                userID: student,
                delivered: {
                    v: 0,
                    t: ''
                },
                read: {
                    v: 0,
                    t: ''
                },
                deleteStatus: {
                    v: 0,
                    t: ''
                },
                deleted: {
                    v: 0,
                    t: ''
                }
            }
        })
    }
    if (data.hasOwnProperty('image')) {
        preparedData.image = data.image
    }
    if (data.hasOwnProperty('target')) {
        preparedData.target = data.target
    }
    console.log('preparedData', preparedData);
    return dbHandler.newNotification(attachedData.requester,
        preparedData,
        (result) => {
            console.log('result of insert new notification', result);
            next({
                status: "SUCCESS",
                data: result
            })
        },
        (err) => {
            next({
                status: "FAILED",
                data: err
            })
        })
};

function notificationsForStudetn(data, attachedData) {
    return dbHandler.notificationsForStudetn(attachedData.requester)
        .then(result => {
            let data = []
            if (result == null) {
                return data
            } else {
                data = result.map(notif => {
                    let notification = {
                        message: notif.msg,
                        dateTime: notif.time,
                        _id: notif._id,
                        status: notif.status,
                        image: notif.image,
                        target: notif.target,
                        status: notif.status,
                        fullDelete: notif.fullDelete,

                    };

                    let studentStatus = notif.users.find(userObj => { if (userObj.userID == attachedData.requester) { return userObj } });

                    for (let i in studentStatus) {
                        if (i !== 'userID') {
                            notification[i] = studentStatus[i]
                        }
                    };
                    return notification
                })
                console.log(data); 0
                return data
            }
        })
};

function NotificationDelivered(data, attachedData, next) {
    console.log(data);
    data = data.data
    function failed(msg) {
        next({
            status: "FAILED",
            data: msg
        });
    }
    // VALIDATION
    let missing = helpers.missingProperties(['delivered', 'notificationsIDs'], data);
    if (missing != false) {
        failed("Missing Properties: " + JSON.stringify(missing));
        return;
    }
    return dbHandler.NotificationDelivered(attachedData,
        data,
        (result) => {
            next({
                status: "SUCCESS",
                data: result
            })
        },
        (err) => {
            next({
                status: "FAILED",
                data: err
            })
        })
};

function NotificationRead(data, attachedData, next) {
    //console.log(data);
    data = data.data
    function failed(msg) {
        next({
            status: "FAILED",
            data: msg
        });
    }
    // VALIDATION
    let missing = helpers.missingProperties(['read', 'notificationID'], data);
    if (missing != false) {
        failed("Missing Properties: " + JSON.stringify(missing));
        return;
    }

    return dbHandler.NotificationRead(attachedData,
        data,
        (result) => {
            next({
                status: "SUCCESS",
                data: result
            })
        },
        (err) => {
            next({
                status: "FAILED",
                data: err
            })
        })
};

function allNotifications(data, attachedData, next) {
    return dbHandler.allNotifications(
        (result) => {
            next({
                status: "SUCCESS",
                data: result
            })
        },
        (err) => {
            next({
                status: "FAILED",
                data: err
            })
        })
};

function NotificationDelete(data, attachedData, next) {
    //console.log(data);
    data = data.data
    function failed(msg) {
        next({
            status: "FAILED",
            data: msg
        });
    }
    // VALIDATION
    let missing = helpers.missingProperties(['deleted', 'notificationID'], data);
    if (missing != false) {
        failed("Missing Properties: " + JSON.stringify(missing));
        return;
    }

    return dbHandler.NotificationDelete(attachedData,
        data,
        (result) => {
            next({
                status: "SUCCESS",
                data: result
            })
        },
        (err) => {
            next({
                status: "FAILED",
                data: err
            })
        })
};

function NotificationDeleteStatus(data, attachedData, next) {
    console.log(data);
    data = data.data
    function failed(msg) {
        next({
            status: "FAILED",
            data: msg
        });
    }
    // VALIDATION
    let missing = helpers.missingProperties([ 'notificationID'], data);
    if (missing != false) {
        failed("Missing Properties: " + JSON.stringify(missing));
        return;
    }
    return dbHandler.NotificationDeleteStatus(attachedData,
        data,
        (result) => {
            next({
                status: "SUCCESS",
                data: result
            })
        },
        (err) => {
            next({
                status: "FAILED",
                data: err
            })
        })
};