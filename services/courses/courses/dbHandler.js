let connector = require("../../db/connector");
let ObjectID = require('mongodb').ObjectID;
const databaseName = "ERP";
const collection = {
    notifications: 'notifications',
    instructors:'instructors',
    courses: 'courses',
    students: 'students',
    videos: "courses.videos.currentTime",
    user_courses: "courses.users.courses.status"
}
let helpers = require("./../../../utils/helpers"); // for date function.

const SCRIPT_NAME = "\nDB HANDLER Instructor SERVICE";

let database;

connector.connectDB(
    databaseName,
    (db) => {
        database = db;
    },
    (errMsg) => {
        database = undefined;
        console.log(SCRIPT_NAME + ": couldn't retrieve db: " + errMsg);
    }
)


connector.getDB(
    databaseName,
    (recievedDB) => { // success callback
        database = recievedDB;
    },
    (errMsg) => {
        //console.log(SCRIPT_NAME + ": couldn't retrieve db: " + errMsg);
        database = undefined;
    }
);

exports.insertNewCourse = (courseData, success, fail) => {

    if (database == undefined) {
        fail("Database undefined");
        console.log(SCRIPT_NAME + ".insertNewCourse: undefined db");
    } else {

        database.collection(collection.courses).insertOne(
            courseData, {},
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                if (result['insertedCount'] !== 1) {
                    fail("inserting new instructor document doc failed: insertedCount=0, : " + JSON.stringify(result));
                    return;
                }
                success();
            }
        )
    }
};

exports.Course = (data, user, success, fail) => {

    return database.collection(collection.courses)
        .findOne(data)
}

exports.insertNewLectureForCourse = (courseID, data, courseName, attachedData, success, fail) => {
    let filter = {
        _id: ObjectID(String(courseID))
    };
    let update = {
        $push: { 'lectures': data }
    }

    function updateNotification() {
        let notifData = {
            msg: 'new lecture inserted in ' + courseName + ' course',
            time: attachedData.timeStamp,
            by: attachedData.requester,
            submittedAt: attachedData.timeStamp,
            status: 0,
            target: {
                internal: {
                    targetScreen: "courseView",
                    data: { courseID: String(courseID) }
                }
            },
            fullDelete:0,
            users:data.students.map(student=>{
                return {
                    userID:student,
                    delivered:0,
                    read:0,
                    deleteStatus:0,
                    deleted:0
                }
            })
        }
        function pushNotificationForStudents(notification) {
            //console.log('dddfffasdas',notification);
            let courseFilter = (data.demo == true) ? {} : { 'courses.courseID': courseID }
            database.collection(collection.students)
                .updateMany(courseFilter, { $push: { notification: notification } },
                    (err, result) => {
                        if (err) {
                            fail(err.message);
                            return;
                        }
                        database.collection(collection.courses)
                            .findOne(filter).then(course => {
                                let preparedNotifi = {
                                    message: notification.msg,
                                    dateTime: notification.time,
                                    _id: notification._id,
                                    status: notification.status,
                                    image: notification.image,
                                    target: notification.target
                                }
                                preparedNotifi.target.internal.data = course
                                return success(preparedNotifi)
                            })
                    })
        }

        database.collection(collection.notifications).insertOne(
            notifData, {},
            (err, resultNotifi) => {
                //console.log('insert notification', resultNotifi);
                if (err) {
                    fail(err.message);
                    return;
                }
                if (resultNotifi['insertedCount'] !== 1) {
                    fail("inserting new notification document doc failed: insertedCount=0, : " + JSON.stringify(resultNotifi));
                    return;
                }
                pushNotificationForStudents(resultNotifi.ops[0])
            }
        )
    }


   return database.collection(collection.courses)
        .findOneAndUpdate(filter, update,
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                console.log('here update',result.value.lectures, JSON.stringify(result.value.lectures));
                //updateNotification()
                 success()
            }
        )
};

exports.filter = (filterObject , instructorID) => {


    if(instructorID==0){
        let filter = {
            $and: [{
                $or: [
                    { deleted: { $exists: false } },
                    { deleted: 0 }
                ]
            }],
            //$or: []
        }
        let sort = { _id: -1 }
    
        let skip = (filterObject.pageNumber - 1) * filterObject.pageSize; // -1 to make page 1 be 0
        let limit = filterObject.pageSize;
    
        // filter query creation
        for (let filterOption of filterObject.filterOptions) {
            let field = filterOption.fieldID;
            // SELECT
            if (filterOption.hasOwnProperty('select')) {
                if (filterOption.select.items.length > 0) {
                    let temp = {};
                    temp[field] = {
                        $in: filterOption.select.items
                    }
    
                    filter.$and.push(temp)
                }
            }
    
            // SORT
            if (filterOption.hasOwnProperty('sort')) {
                if (filterOption.sort.order != undefined) {
                    sort[field] = filterOption.sort.order
                }
            }
    
            // SEARCH 
            if (filterOption.hasOwnProperty('search')) {
                if (filterOption.search.input.length > 0) {
                    let temp = {};
                    temp[field] = {
                        $regex: `${filterOption.search.input}`,
                        $options: 'i' // to disable case sensitive search
                    }
    
                    filter.$and.push(temp)
                    // to sort increasingly the matching search
                    /*sort[field]*/
                }
            }
    
            // RANGE
            if (filterOption.hasOwnProperty('range')) {
                let from = '',
                    to = '';
                if (filterOption.range.from != undefined && filterOption.range.from != '') {
                    let temp = {};
                    temp[field] = {
                        $gte: filterOption.range.from
                    }
                    filter.$and.push(temp);
                }
                if (filterOption.range.to != undefined && filterOption.range.to != '') {
                    let temp = {};
                    temp[field] = {
                        $lte: filterOption.range.to
                    }
                    filter.$and.push(temp);
                }
            }
        }
    
        // PROJECTION
        let options = {
            //projection: {}
        }
    
    
    
        if (filterObject.hasOwnProperty('projections')) {
            options['projection'] = {}
            for (let field of filterObject.projections) {
                options.projection[field] = 1
            }
        }
    
    
        // TODO: accessibilities
    
        // accessibility (if use can access only tasks he is included in or all)
        /*    if (access == 0) {
                filter.$or = [];
                for (let accessBone of accessBones) {
                    let temp = {};
                    temp[fields.get(accessBone).uri] = String(userID);
    
                    filter.$or.push(temp)
                }
            }*/
    
      
    
    
        // TODO: fix bad triple return (style)
        return database.collection(collection.courses)
            .countDocuments(filter)
            .then(documentsCount => {
                return database.collection(collection.courses)
                    .find(filter, options)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .toArray()
                    .then(result => {
                        //console.log (JSON.stringify(result));
                        return {
                            pages: Math.ceil(documentsCount / filterObject.pageSize),
                            result: result
                        }
                    })
            })
    }
else{
    
    let filter = {
        $and: [{
            $or: [
                { deleted: { $exists: false } },
                { deleted: 0 }
            ]
        }],
        //$or: []
    }
    let sort = { _id: -1 }

    let skip = (filterObject.pageNumber - 1) * filterObject.pageSize; // -1 to make page 1 be 0
    let limit = filterObject.pageSize;

    // filter query creation
    for (let filterOption of filterObject.filterOptions) {
        let field = filterOption.fieldID;
        // SELECT
        if (filterOption.hasOwnProperty('select')) {
            if (filterOption.select.items.length > 0) {
                let temp = {};
                temp[field] = {
                    $in: filterOption.select.items
                }

                filter.$and.push(temp)
            }
        }

        // SORT
        if (filterOption.hasOwnProperty('sort')) {
            if (filterOption.sort.order != undefined) {
                sort[field] = filterOption.sort.order
            }
        }

        // SEARCH 
        if (filterOption.hasOwnProperty('search')) {
            if (filterOption.search.input.length > 0) {
                let temp = {};
                temp[field] = {
                    $regex: `${filterOption.search.input}`,
                    $options: 'i' // to disable case sensitive search
                }

                filter.$and.push(temp)
                // to sort increasingly the matching search
                /*sort[field]*/
            }
        }

        // RANGE
        if (filterOption.hasOwnProperty('range')) {
            let from = '',
                to = '';
            if (filterOption.range.from != undefined && filterOption.range.from != '') {
                let temp = {};
                temp[field] = {
                    $gte: filterOption.range.from
                }
                filter.$and.push(temp);
            }
            if (filterOption.range.to != undefined && filterOption.range.to != '') {
                let temp = {};
                temp[field] = {
                    $lte: filterOption.range.to
                }
                filter.$and.push(temp);
            }
        }
    }

    // PROJECTION
    let options = {
        //projection: {}
    }



    if (filterObject.hasOwnProperty('projections')) {
        options['projection'] = {}
        for (let field of filterObject.projections) {
            options.projection[field] = 1
        }
    }


    // TODO: fix bad triple return (style)
    return database.collection(collection.courses)
        .countDocuments(filter)
        .then(documentsCount => {
            return database.collection(collection.courses)
                .find({instructor:[`${instructorID}`]},filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .toArray()
                .then(result => {
                    console.log(JSON.stringify(result))
                    return {
                        pages: Math.ceil(documentsCount / filterObject.pageSize),
                        result: result
                    }
                })
        })
}
};

exports.editCourse = (courseID, updates) => {
    let filter = {
        _id: ObjectID(String(courseID))
    }

    let update = {
        $set: {}
    }
    for (let key in updates) {
        update.$set[key] = updates[key]
    }

    return database.collection(collection.courses)
        .updateOne(filter, update)
}

exports.editLecture = (courseID, updates) => {
    let filter = {
        _id: ObjectID(String(courseID))
    }

    let update = {
        $set: {}
    }


    // return database.collection(collection.courses)
    //     .updateOne(filter, update)
}




exports.courseStudents = (data ,next) => {
    console.log("the received ID: "+ data.courseID);

     database.collection(collection.students)
    .find({"courses.courseID":`${data.courseID}`})
    .project({_id:0,name: 1})
    .toArray()
    .then(result => {
        next({result})
    })
    .catch(e => {
        console.log(e)
    })

}


exports.deleteLecture = (data) => {
    let filter = {
        _id: ObjectID(String(data.courseID))
    }

    let update = {
        $pull: { lectures: { _id: ObjectID(String(data.lectureID)) } }
    }

    return database.collection(collection.courses)
        .updateOne(filter, update)
}


exports.getInstructorID = (data) => {
    let filter = {
        _id: ObjectID(String(data.courseID))
    }

    let update = {
        $pull: { lectures: { _id: ObjectID(String(data.lectureID)) } }
    }

    return database.collection(collection.courses)
        .updateOne(filter, update)
}




exports.Lecture = (filter) => {
    return database.collection(collection.courses)
        .findOne(filter)
}

exports.studentCourses = (studentID, timeStamp, next) => {
    let stCourses = []
    /* pass date like 2022-12-20 and merge to it time 23:59 as 24 hours then convert it to iso 
        *then return in last step dateTime iso as timeStamp to compare it with now timeStamp
        m,**/
    function DateTimeStamp(date) {
        //console.log('datestamp', date);
        if (date.trim() == '') {
            return timeStamp
        } else {
            var myDate = (date + ',23:59');
            var isoDate = (new Date(myDate)).toISOString();
            var newDate = new Date(isoDate);
            return newDate.getTime() / 1000
        }

    }
    let filter = ObjectID(String(studentID))
    //putting all student.courses IDs in stcourses array
    database.collection(collection.students)
        .findOne(filter)
        .then(result => {
            result.courses.map((el) => {
                //console.log('tf',DateTimeStamp(el.from));
                //console.log('ts',timeStamp);
                //console.log('tt',DateTimeStamp(el.to));
                if (DateTimeStamp(el.from) <= timeStamp && timeStamp <= DateTimeStamp(el.to)) {
                    stCourses.push(el.courseID)
                }
            })
            // console.log(stCourses)
        })
        //filtering courses whose Id matches with any courseID in
        // stCourse array (student courses)
        .then(async () => {
            let courses = [];
            try {
                for (let id of stCourses) {
                    let course = await database.collection(collection.courses)
                        .findOne({
                            _id: ObjectID(id)
                        })
                    courses.push(course);
                }
                next(courses);
            } catch (e) {
                next([]);
            }
        })
        .catch(err => {
            console.log('error: ', err)
            next([])
        })
};

/**
 * --- each 500 ms will new document inserted inside array of currentTime for same (courseID & lectureID) if no document found for (courseID & lectureID) then will insert new document---
 *@param data - contains lecture id and course id and stop point in video
 *@param currentTime - dateTime when record happend (automatically is got by system)
 *@param userID -current user id using system and watching video   */
exports.insertVideoCurrentTime = (data, cuurentTime, userID) => {
    let filter = {
        "lectureID": data.lectureID,
        "courseID": data.courseID
    }

    let update = {
        $push: { "currentTime": { user: userID, time: cuurentTime, stopPoint: data.currentTime } }
    }

    return database.collection(collection.videos)
        .updateOne(filter, update, { upsert: true })
};

/**
 * --- get current time's video for specific lecture---
 *@param filter - contain lectureID and courseID */
exports.videoCurrentTime = (filter) => {
    return database.collection(collection.videos)
        .findOne(filter)
};

exports.lastLecture = (courseID) => {

    return database.collection(collection.videos)
        .find(courseID).toArray()
};

exports.userCoursesStatus = (data, userID, updateEvent) => {
    let filter = {
        userID: userID,
        courseID: data.courseID
    };


    let update = {
        $set: {},
        $push: {}
    }

    update.$set[updateEvent.uri + '.l'] = updateEvent.l;
    update.$push[updateEvent.uri + '.h'] = updateEvent.historyEvent;

    return database.collection(collection.user_courses)
        .updateOne(filter, update, { upsert: true })
};

exports.studentWishtList = (userID, next) => {
    let filter = {
        "userID": userID,
    }
    let stCourses = []
    database.collection(collection.user_courses)
        .find(filter)
        .toArray()
        .then((result) => {
            result.map(course => {
                stCourses.push({
                    courseID: course.courseID,
                    wishList: (course.hasOwnProperty('cart') && course.cart.l == 1) ? 0 : (course.hasOwnProperty('wishList')) ? course.wishList.l : 0,
                    cart: (course.hasOwnProperty('purchase') && course.purchase.l == 1) ? 0 : (course.hasOwnProperty('cart')) ? course.cart.l : 0
                })
            });
            //console.log(result);
        }).then(async () => {
            let courses = [];
            //console.log(stCourses);
            try {
                for (let i of stCourses) {
                    let course = await database.collection(collection.courses)
                        .findOne({
                            _id: ObjectID(i.courseID)
                        })
                    course.wishList = i.wishList
                    course.cart = i.cart
                    if (course.wishList == 1) {
                        courses.push(course);
                    }
                }
                //console.log('courses');
                //console.log(courses);
                next(courses);
            } catch (e) {
                next([]);
            }
        })
        .catch(err => {
            console.log('error: ', err)
            next([])
        })

};

exports.studentCart = (userID, next) => {
    let filter = {
        "userID": userID,
        "cart": { $exists: true }
    };

    let stCourses = []
    database.collection(collection.user_courses)
        .find(filter)
        .toArray()
        .then((result) => {
            result.map(course => {
                stCourses.push({
                    courseID: course.courseID,
                    wishList: (course.hasOwnProperty('cart') && course.cart.l == 1) ? 0 : (course.hasOwnProperty('wishList')) ? course.wishList.l : 0,
                    cart: (course.hasOwnProperty('purchase') && course.purchase.l == 1) ? 0 : (course.hasOwnProperty('cart')) ? course.cart.l : 0
                })
            });
            //console.log(result);
        }).then(async () => {
            let courses = [];
            //console.log(stCourses);
            try {
                for (let i of stCourses) {
                    let course = await database.collection(collection.courses)
                        .findOne({
                            _id: ObjectID(i.courseID)
                        })
                    if (i.cart == 1) {
                        courses.push(course);
                    }
                }
                //console.log('courses');
                //console.log(courses);
                next(courses);
            } catch (e) {
                next([]);
            }
        })
        .catch(err => {
            console.log('error: ', err)
            next([])
        })

};

exports.courseCartState = (courseID, userID) => {
    let filter = {
        "userID": userID,
        "cart": { $exists: true },
        "courseID": courseID
    }
    return database.collection(collection.user_courses)
        .findOne(filter)

};

exports.courseLastState = (courseID, userID) => {
    let filter = {
        "userID": userID,
        "courseID": courseID
    }
    return database.collection(collection.user_courses)
        .findOne(filter)
};

//db.courses.update({"lectures._id":ObjectId("6179568e0d086604dccdec63")}, {$push:{"lectures.$.curr":3}});
// db.courses.find(
//     { 'lectures.video.id': { $regex: " " } }).forEach(function(user) {
//     let username = user.lectures.video.id.replace(/\s/g, "_");
//     db.courses.updateOne({ $set: { 'lectures.$.video.id': username } });
//   })
/* db.app.versions.update({_id:ObjectId("619d0d17a0c01a4d112647a9")},{ $push: { "android.versions": { $each: [ 1,2,3 ] } } }) */