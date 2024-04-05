const dev = require('../../../utils/dev.js');
const dbHandler = require("./dbHandler");
const DBHandler = require("../dbHandler");
let ObjectID = require('mongodb').ObjectID;
let helpers = require("../../../utils/helpers.js"); // for date function.
let functionMapper = new Map([
    ['00C.C.1', newCourse],
    ['00C.C.2', filter],
    ['00C.C.3', addLecture],
    ['00C.C.4', Course],


    ['00C.C.5', editCourse],
    ['00C.C.6', editLecture],
    ['00C.C.7', deleteLecture],

    ['00C.C.8', studentCourses],
    ['00C.C.9', insertVideoCurrentTime],
    ['00C.C.10', lecture],
    ['00C.C.11', videoCurrentTime],
    ['00C.C.12', lastLecture],
    ['00C.C.13', userCoursesStatus],
    ['00C.C.14', userCoursesStatus],
    ['00C.C.15', userCoursesStatus],
    ['00C.C.16', userCoursesStatus],
    ['00C.C.17', studentWishtList],
    ['00C.C.18', studentCart],
    ['00C.C.19', courseLastState],
    ['00C.C.20', userCoursesStatus],
    ['00C.C.21', courseStudents],

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
        //console.log(envelope);
        let possiblePromise = functionMapper.get(envelope.serviceID)(
            envelope.data,
            attachedData,
            serviceNext,
            pusher,
            envelope.serviceID
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
function isAdmin(user) {
    if (user == 'ADMIN') {
        return true
    }
    return false
}

function isInstructor(user) {
    if (user == 'INSTRUCTOR') {
        return true
    }
    return false
}

function newCourse(data, attachedData, next) {

    function failed(msg) {
        next({
            status: "FAILED",
            data: msg
        });
    }
    // VALIDATION
    let missing = helpers.missingProperties(['name', 'faculty', "university", 'term', 'year', 'subject', 'instructor'], data);
    if (missing != false) {
        failed("Missing Properties: " + JSON.stringify(missing));
        return;
    }

    data.by = String(attachedData.requester)
    data.hidden = 0;

    data.time = attachedData.timeStamp
    data.lectures = []
    dbHandler.insertNewCourse(
        data,
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

/**
 * [CoursesFilter 00C.C.2]
 * @param  {[type]}   data         [description]
 * @param  {[type]}   attachedData [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
function filter(data, attachedData, next) {

    console.log(attachedData.requester);
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
    DBHandler.accessUser(
        attachedData.requester,
        result => {
      
            if(!isInstructor(result.type) && !isAdmin(result.type) ){
                next({
                    status: 'FAILED',
                    data: 'user  has no access'
                })
            }

            else if(isInstructor(result.type)){
                console.log("DB : instructor")
                var id=result._id;
                dbHandler.filter(data , id).then(r=>{
                    next({
                        status: 'SUCCESS',
                        data: r
                    })
                })
            }

           else if (isAdmin(result.type)) {
            console.log("DB: admin")
              var id=0;
                 dbHandler.filter(data , id).then(r=>{
                    next({
                        status: 'SUCCESS',
                        data: r
                    })
                })
            }
        })

}

/**
 * [courseStudents 00C.C.21]
 * @param  {[type]}   data         [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
 function courseStudents(data, next) {

    console.log("eh dh: "+ JSON.stringify(data));
    dbHandler.courseStudents(data,
    (result) => {
        console.log("yrabbb: " + JSON.stringify(result));
    
        },
        (err) => {
          console.log(err)  ;
        } 
        
        )

}



/**
 * [addLecture 00C.C.3]
 * @param  {[type]}   data         [description]
 * @param  {[type]}   attachedData [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
function addLecture(data, attachedData, next) {
    function failed(msg) {
        next({
            status: "FAILED",
            data: msg
        });
    }
    // VALIDATION
    let missing = helpers.missingProperties(['courseID', 'title', 'video', 'number'], data);
    if (missing != false) {
        failed("Missing Properties: " + JSON.stringify(missing));
        return;
    };

    //console.log(data);
    let courseID = data.courseID;
    let courseName = data.courseName
    function preparedData(data) {
        delete data.courseID;
        data.by = String(attachedData.requester);
        data.time = attachedData.timeStamp;
        data._id = new ObjectID()
        data.materials = data.materials.map(r => {
            return {
                _id: new ObjectID(),
                name: r.name,
                file: r.file
            }
        })
        return data
    }
    //console.log(preparedData(data));
    dbHandler.insertNewLectureForCourse(
        courseID,
        preparedData(data),
        courseName,
        attachedData,
        (result) => { // success
            next({
                status: "SUCCESS",
                data: result
            });
        },
        (err) => {
            failed(err);
        });
}

function Course(data, attachedData, next) {
    // validation
    let missing = helpers.missingProperties(["courseID"], data);
    if (missing != false) {
        next({
            status: "FAILED",
            data: "missing properties: " + JSON.stringify(missing)
        });
        return;
    }

    //preparation
    let courseData = {
        '_id': ObjectID(String(data.courseID))
    }
    return dbHandler.Course(
        courseData,
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

function lecture(data, attachedData, next) {
    // validation
    let missing = helpers.missingProperties(["courseID", "lectureID"], data);
    if (missing != false) {
        next({
            status: "FAILED",
            data: "missing properties: " + JSON.stringify(missing)
        });
        return;
    }

    //preparation
    let courseData = {
        _id: ObjectID(String(data.courseID)),
        'lectures._id': ObjectID(String(data.lectureID))
    }
    return dbHandler.Lecture(courseData).then(result => {
        let filterLectures = result.lectures.filter(lec => {
            return lec._id == data.lectureID
        })[0]

        return filterLectures
    })

};

function editCourse(data, attachedData, next) {
    let courseID = data.courseID;
    delete data.courseID;

    return dbHandler.editCourse(courseID, data);
}

function editLecture(data, attachedData, next) {
    let courseID = data.courseID;
    delete data.courseID;

    return dbHandler.editLecture(courseID, data);
}

function studentCourses(data, attachedData, next) {
    //console.log(data)
    //console.log(attachedData.requester)
    dbHandler.studentCourses(
        attachedData.requester,
        attachedData.timeStamp,
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
}

function deleteLecture(data, attachedData, next) {

    return dbHandler.deleteLecture(data);
}

function insertVideoCurrentTime(data, attachedData, next) {

    return dbHandler.insertVideoCurrentTime(data, attachedData.timeStamp, attachedData.requester);
}

function videoCurrentTime(data, attachedData, next) {
    // validation
    let missing = helpers.missingProperties(["lectureID"], data);
    if (missing != false) {
        next({
            status: "FAILED",
            data: "missing properties: " + JSON.stringify(missing)
        });
        return;
    }

    //preparation
    let preparedData = {
        'lectureID': data.lectureID
    }
    return dbHandler.videoCurrentTime(preparedData).then(result => {
        if (result == null) {
            result = []
            return result
        } else {
            let filter = result.currentTime.filter(currentTime => {
                return currentTime.user == attachedData.requester
            })
            let lastItem = filter[filter.length - 1]
            delete lastItem.user
            delete lastItem.time
            //console.log(lastItem);
            return lastItem
        }
    })
};

function lastLecture(data, attachedData, next) {
    // validation
    let missing = helpers.missingProperties(["courseID"], data);
    if (missing != false) {
        next({
            status: "FAILED",
            data: "missing properties: " + JSON.stringify(missing)
        });
        return;
    }

    function filterArrayForUser(arr) {
        let filter = arr.filter(result => {
            return result.user == attachedData.requester
        })
        let lastItemInArray = filter[filter.length - 1]
        return { array: filter, lastItemInArray: lastItemInArray }
    }
    return dbHandler.lastLecture(data).then(result => {
        //console.log(result);
        if (result.length == 0) {
            return {}
        } else {

            let arr = [];
            for (let i of result) {

                arr.push({ courseID: i.courseID, lectureID: i.lectureID, currentTime: filterArrayForUser(i.currentTime).lastItemInArray })
                //console.log(arr);
            }

            let lastTime = Math.max.apply(Math, arr.map(function (o, y, z) {

                return o.currentTime.time;
            }))
            let lastLectureID = arr.filter(lec => {
                return lec.currentTime.time == lastTime
            })[0].lectureID
            //console.log(lastTime);
            //console.log(lastLectureID);
            return { lectureID: lastLectureID }
        }
    })
};

function userCoursesStatus(data, attachedData, next, { }, serviceID) {
    //console.log(data);
    // validation
    let missing = helpers.missingProperties(["courseID"], data);
    if (missing != false) {
        next({
            status: "FAILED",
            data: "missing properties: " + JSON.stringify(missing)
        });
        return;
    }
    let updateEvent = {}
    let userID = attachedData.requester
    //console.log(userID);
    //console.log('serviceID',serviceID);
    //console.log(data);
    if (serviceID == '00C.C.13') {
        updateEvent = {
            uri: 'cart',
            l: 1,
            historyEvent: {
                b: attachedData.requester,
                t: attachedData.timeStamp,
                v: 1
            }
        }
    } else if (serviceID == '00C.C.14') {
        updateEvent = {
            uri: 'wishList',
            l: 1,
            historyEvent: {
                b: attachedData.requester,
                t: attachedData.timeStamp,
                v: 1
            }
        }
    } else if (serviceID == '00C.C.15') {
        updateEvent = {
            uri: 'cart',
            l: 0,
            historyEvent: {
                b: attachedData.requester,
                t: attachedData.timeStamp,
                v: 0
            }
        }
    } else if (serviceID == '00C.C.16') {
        updateEvent = {
            uri: 'wishList',
            l: 0,
            historyEvent: {
                b: attachedData.requester,
                t: attachedData.timeStamp,
                v: 0
            }
        }
    } else if (serviceID == '00C.C.20') {
        userID = data.studentID
        updateEvent = {
            uri: 'purchase',
            l: 1,
            historyEvent: {
                b: attachedData.requester,
                t: attachedData.timeStamp,
                v: 1
            }
        }
    }
    //console.log('newww');
    //console.log(serviceID, updateEvent);
    //console.log('newwww');
    return dbHandler.userCoursesStatus(data, userID, updateEvent)
};

function studentWishtList(data, attachedData, next) {
    return dbHandler.studentWishtList(attachedData.requester,
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

function studentCart(data, attachedData, next) {
    let userID = attachedData.requester
    if (data.hasOwnProperty('userID') && data.userID !== undefined) {
        userID = data.userID
    }
    return dbHandler.studentCart(userID,
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

function courseLastState(data, attachedData, next) {
    return dbHandler.courseLastState(data.courseID, attachedData.requester)
        .then(result => {
            //console.log(result,"dddd");

            if (result == null) {
                return { wishList: 0, cart: 0 }
            } else {
                let cart = (result.hasOwnProperty('purchase') && result.purchase.l == 1) ? 'purchase' : (result.hasOwnProperty('cart')) ? result.cart.l : 0
                let wishList = (result.hasOwnProperty('cart') && result.cart.l == 1) ? 0 : (result.hasOwnProperty('wishList')) ? result.wishList.l : 0;
                //console.log('cart state',{ cart: cart , wishList: wishList});
                return { cart: cart, wishList: wishList }
            }

        })
}

/* db.courses.find({ 
    _id: {
        $in: [ObjectId("616ac4aab068b83b206907d9"), ObjectId("616b3f519b3a3214c817e493")]
    }
}) */