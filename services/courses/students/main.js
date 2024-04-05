const dev = require('../../../utils/dev.js');
const dbHandler = require("./dbHandler");
let helpers = require("../../../utils/helpers.js"); // for date function.

let functionMapper = new Map([
    ['00C.S.1', newStudents],
    ['00C.S.2', filter],
    ['00C.S.3', AddCoursesForStudent],
    ['00C.S.4', deleteStudent],
    ['00C.S.5', student],
    ['00C.S.6', editStudent],
    ['00C.S.7', DeactivateStudent],
    ['00C.S.8', RemoveCoursesForStudent],
    ['00C.S.9', StudentBlockList],

]);
/**
 * 
 * @function reciever
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

function newStudents(data, attachedData, next) {
    function failed(msg) {
        next({
            status: "FAILED",
            data: msg
        });
    }
    // VALIDATION
    let missing = helpers.missingProperties(['name', 'mID', 'primaryMobile', 'password'], data);
    if (missing != false) {
        failed("Missing Properties: " + JSON.stringify(missing));
        return;
    }

    function addNewStudent() {
        let newStudent = {
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
            university: data.university,
            faculty: data.faculty,
            department: data.department,
            section: data.section,
            year: data.year,
            term: data.term,
            group: data.group,
            courses: [],
            deactivate: false
        };
        return dbHandler.insertNewStudent(
            newStudent,
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

    dbHandler.studentMIDExists(String(data.mID))
        .then(result => {
            if (result != null) throw 'mID exists'
            return addNewStudent();
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
 * [AddCoursesForStudent 00C.S.3]
 * @param  {[type]}   data         [description]
 * @param  {[type]}   attachedData [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
function AddCoursesForStudent(data, attachedData, next) {
    // helpers
    function failed(errMsg) {
        next({
            status: "FAILED",
            data: errMsg
        });
    }
    /*     data.time = attachedData.timeStamp */
    dbHandler.AddCoursesForStudent(
        data,
        attachedData.requester,
        (result) => { // success 
            next({
                status: "SUCCESS",
                data: result
            });
        },
        (err) => { // fail (including no modification)
            failed(err);
        }
    );

}

/**
 * [RemoveCoursesForStudent 00C.S.8]
 * @param  {[type]}   data         [description]
 * @param  {[type]}   attachedData [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
function RemoveCoursesForStudent(data, attachedData, next) {
    // helpers
    function failed(errMsg) {
        next({
            status: "FAILED",
            data: errMsg
        });
    }
    /*     data.time = attachedData.timeStamp */
    dbHandler.RemoveCoursesForStudent(
        data,
        (result) => { // success 
            next({
                status: "SUCCESS",
                data: result
            });
        },
        (err) => { // fail (including no modification)
            failed(err);
        }
    );

}

/**
 * [deleteStudent description]
 * @param  {[type]}   data         require: {studentMID}
 * @param  {[type]}   attachedData [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
function deleteStudent(data, attachedData, next) {
    // validation
    let missing = helpers.missingProperties(["studentMID"], data);
    if (missing != false) {
        next({
            status: "FAILED",
            data: "missing properties: " + JSON.stringify(missing)
        });
        return;
    }

    return dbHandler.DeleteStudent(
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
            })
};

/**
 * [student description]
 * @param  {[type]}   data         require: {studentMID}
 * @param  {[type]}   attachedData [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
function student(data, attachedData, next) {
    // validation
    let missing = helpers.missingProperties(["studentMID"], data);
    if (missing != false) {
        next({
            status: "FAILED",
            data: "missing properties: " + JSON.stringify(missing)
        });
        return;
    }

    //preparation
    let studentData = {
        'mID': data.studentMID,
    }
    return dbHandler.Student(
        studentData,
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
 * [editStudent description]
 * @param  {[type]}   data         require: {studentMID}
 * @param  {[type]}   attachedData [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
function editStudent(data, attachedData, next) {

    data.editData.updateTime = attachedData.timeStamp;
    data.editData.updatedByUser = attachedData.requester;
    return dbHandler.EditStudent(data.studentID, data,
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


function filter(data, attachedData, next) {

    //console.log(data);
    // TODO: CHECK IF JSON IS SENT CLEARLY
    // TODO: VALIDATE JSON ACCORDING TO EACH FIELD
    //          IN THE FIELDS TEMPLATE
    // TODO: DENY OR ALLOW ACCESS

    // assign full name for each field.

    /*for (let field of data.filterOptions) {
        field.fieldID = backTrackFieldsIDs(field.fieldID, 'ss-e-np');
    }
    for (let ind = 0; ind < data.projections.length; ind++) {
        data.projections[ind] = backTrackFieldsIDs(data.projections[ind], 'ss-e-np');
    }*/


    return dbHandler.filter(data);

}

function DeactivateStudent(data, attachedData, next) {
    console.log(data);
    console.log(attachedData);
    dbHandler.DeactivateStudent(attachedData, data,
        (result) => {
            next({
                status: "SUCCESS",
                data: result
            })
        })
}

function StudentBlockList(data, attachedData, next) {
    //console.log(data);
    return dbHandler.StudentBlockList(data)
};
