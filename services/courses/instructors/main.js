const dev = require('../../../utils/dev.js');
const dbHandler = require("./dbHandler");
let helpers = require("../../../utils/helpers.js"); // for date function.

let functionMapper = new Map([
    ['00C.I.1', newInstructors],
    ['00C.I.2', InstructorsFilter],

    ['00C.I.3', instructor],
    ['00C.I.4', editInstructor],
    ['00C.I.5', deleteInstructor],
    ['00C.I.6', CoursesByInstructorsID],
]);
/**
 * 
 * @function rebciever
 * @param {*} envelope 
 * @param {*} attachedData 
 * @param {*} next 
 */
exports.reciever = (envelope, attachedData, next, pusher) => {

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
        };

        let possiblePromise = functionMapper.get(envelope.serviceID)(
            envelope.data,
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

    } catch (err) {
        console.log(err);
        //throw err;
        next({
            serviceID: envelope.serviceID,
            status: "FAILED",
            data: err
        });
    }
}

function newInstructors(data, attachedData, next) {

    function failed(msg) {
        next({
            status: "FAILED",
            data: msg
        });
    }
    // VALIDATION
    let missing = helpers.missingProperties(['name', 'primaryMobile', 'password'], data);
    if (missing != false) {
        failed("Missing Properties: " + JSON.stringify(missing));
        return;
    }

    function addNewInstructor() {
        let newInstructor = {
            by: String(attachedData.requester),
            time: attachedData.timeStamp,
            mID: data.mID,
            name: data.name,
            email: data.email,
            primaryMobile: data.primaryMobile,
            primaryWhatsapp: data.primaryWhatsapp,
            secondaryMobile: data.secondaryMobile,
            secondaryWhatsapp: data.secondaryWhatsapp,
            password: data.password,
            subjects: data.subjects,
            notes: data.notes,
            image: data.image,
        };
        dbHandler.insertNewInstructor(
            newInstructor,
            (result) => { // success
                next({
                    status: "SUCCESS",
                    data: "inserted"
                });
            },
            (err) => {
                failed(err);
            });
    };

    dbHandler.instructorMIDExists(String(data.mID))
        .then(result => {
            if (result != null) throw 'mID exists'
            return addNewInstructor();
        })
        .catch(err => {
            console.log(err);
            next({
                status: 'FAILED',
                data: err
            })
        })
};


/**
 * [InstructorsFilter 00C.I.2]
 * @param  {[type]}   data         [description]
 * @param  {[type]}   attachedData [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
function InstructorsFilter(data, attachedData, next) {
    return dbHandler.InstructorsFilter(data)
        .then(result => {
            return {
                userID: attachedData.requester,
                instructors: result
            }
        })
};


/**
 * [deleteInstructor description]
 * @param  {[type]}   data         require: {instructorMID}
 * @param  {[type]}   attachedData [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
function deleteInstructor(data, attachedData, next) {
    // validation
    let missing = helpers.missingProperties(["instructorMID"], data);
    if (missing != false) {
        next({
            status: "FAILED",
            data: "missing properties: " + JSON.stringify(missing)
        });
        return;
    }

    dbHandler.DeleteInstructor(
        data,
        attachedData.requester,
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
        }
    )

};

/**
 * [instructor description]
 * @param  {[type]}   data         require: {instructorMID}
 * @param  {[type]}   attachedData [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
function instructor(data, attachedData, next) {
    // validation
    let missing = helpers.missingProperties(["instructorMID"], data);
    if (missing != false) {
        next({
            status: "FAILED",
            data: "missing properties: " + JSON.stringify(missing)
        });
        return;
    }

    //preparation
    let instructorData = {
        'mID': data.instructorMID,
    }
    return dbHandler.Instructor(
        instructorData,
        attachedData.requester,
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
        }
    )

};




/**
 * [instructor description]
 * @param  {[type]}   data         require: {instructorID}
 * @param  {[type]}   attachedData [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
 function CoursesByInstructorsID(data, attachedData, next) {
    // validation
    let missing = helpers.missingProperties(["instructorMID"], data);
    if (missing != false) {
        next({
            status: "FAILED",
            data: "missing properties: " + JSON.stringify(missing)
        });
        return;
    }

    //preparation
    let instructorData = {
        'mID': data.instructorMID,
    }
    return dbHandler.getCoursesByInstructorID(
        instructorData,
        attachedData.requester,
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
        }
    )

};










/**
 * [editInstructor description]
 * @param  {[type]}   data         require: {instructorMID}
 * @param  {[type]}   attachedData [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
function editInstructor(data, attachedData, next) {
    data.editData.updateTime = attachedData.timeStamp;
    data.editData.updatedByUser = attachedData.requester;
    return dbHandler.EditInstructor(data.instructorID,
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

}