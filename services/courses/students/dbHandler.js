let connector = require("../../db/connector.js");
let ObjectID = require('mongodb').ObjectID;
const databaseName = "ERP";
const collection = {
    students: 'students',
    users: 'users',
    blockMsgs: 'block.messages'
}
let helpers = require("../../../utils/helpers"); // for date function.

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

/*if (database != undefined) {return;}
 */
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
exports.studentMIDExists = mID => {
    let filter = {
        'mID': String(mID)
    }

    let options = {
        projection: {
            mID: 1,
            _id: 0
        }
    }

    return database.collection(collection.students)
        .findOne(filter, options)
}
exports.insertNewStudent = (studentData, success, fail) => {
    if (database == undefined) {
        fail("Database undefined");
        console.log(SCRIPT_NAME + ".insertNewStudent: undefined db");
    } else {
        let vote = 2
        studentData.delete = 0
        studentData._id = new ObjectID()
        database.collection(collection.students).insertOne(
            studentData, {},
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                if (result['insertedCount'] !== 1) {
                    fail("inserting new student document doc failed: insertedCount=0, : " + JSON.stringify(result));
                    return;
                }
                if (--vote <= 0) {
                    success();
                }
            }
        )
        database.collection(collection.users).insertOne({
            "_id": studentData._id,
            "username": studentData.name,
            "email": studentData.primaryMobile,
            "password": studentData.password,
            "visualName": studentData.name,
            "mID": studentData.mID,
            "active": 1.0,
            "type": "STUDENT"
        }, {},
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                if (result['insertedCount'] !== 1) {
                    fail("inserting new user document doc failed: insertedCount=0, : " + JSON.stringify(result));
                    return;
                }
                if (--vote <= 0) {
                    success();
                }
            }
        )
    }
};

exports.filter = (filterObject) => {
    let filter = {
        delete: 0
    }
    let sort = { _id: -1 }
    let skip = (filterObject.pageNumber - 1) * filterObject.pageSize; // -1 to make page 1 be 0
    let limit = filterObject.pageSize;
    // PROJECTION
    let options = {
        //projection: {}
    }
    if (filterObject.filterOptions.length > 0 ) {
        filter.$and = []
        // filter query creation
        for (let filterOption of filterObject.filterOptions) {
            let field = filterOption.fieldID;
            // SELECT
            if (filterOption.hasOwnProperty('select')) {
                if (filterOption.select.items.length > 0) {
                    let temp = {};
                    if (filterOption.select.exception == 1) {
                        temp[field] = {
                            $nin: filterOption.select.items
                        }
                    } else {
                        temp[field] = {
                            $in: filterOption.select.items
                        }
                    }

                    filter.$and.push(temp)
                }
            }

            // SORT
            console.log('filterOption.hasOwnProperty("sort")',filterOption.hasOwnProperty('sort'));
            if (filterOption.hasOwnProperty('sort')) {
                sort={}
                
                if (filterOption.sort.order != undefined) {
                    sort[field] = filterOption.sort.order
                    options[field] = filterOption.sort.order    
                 /*    options._id = 0    */             
                }
            }

            // SEARCH 
            if (filterOption.hasOwnProperty('search')) {
                if (filterOption.search.input !== '' || filterOption.search.input.length > 0) {
                    let temp = {};
                    if (filterOption.search.exception == 1) {

                        if (typeof filterOption.search.input == 'number') {
                            temp[field] = {
                                $not: {
                                    $eq: filterOption.search.input,
                                }
                            }
                        } else {
                            temp[field] = {
                                $not: {
                                    $regex: filterOption.search.input,
                                    $options: 'i' // to disable case sensitive search
                                }
                            }
                        }
                    } else {
                        if (typeof filterOption.search.input == 'number') {
                            temp[field] = {
                                $eq: filterOption.search.input,
                            }
                        } else {
                            temp[field] = {
                                $regex: filterOption.search.input,
                                $options: 'i' // to disable case sensitive search
                            }
                        }
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
                    if (filterOption.range.from.exception == 1) {
                        temp[field] = {
                            $not: {
                                $gte: filterOption.range.from
                            }
                        }
                    } else {
                        temp[field] = {
                            $gte: filterOption.range.from
                        }
                    }
                    filter.$and.push(temp);
                }
                if (filterOption.range.to != undefined && filterOption.range.to != '') {
                    let temp = {};
                    if (filterOption.range.to.exception == 1) {
                        temp[field] = {
                            $not: {
                                $lte: filterOption.range.to
                            }
                        }
                    } else {
                        temp[field] = {
                            $lte: filterOption.range.to
                        }
                    }
                    filter.$and.push(temp);
                }
            }
        }

        (filter.$and.length == 0)?delete filter.$and : ''
    }

    
    // TODO: accessibilities
    // accessibility (if use can access only tasks he is included in or all)
 
    // TODO: fix bad triple return (style)
    if (filterObject.hasOwnProperty('exceptionAll')) {
        console.log('exceptionaaa');
        return database.collection(collection.students)
            .find(filter, options)
            .toArray()
            .then(resultF => {
                //console.log(JSON.stringify(result));
                let IDsOfStudentExcluded = resultF.map(r => {
                    return ObjectID(r._id)
                })
                //console.log(IDsOfStudentExcluded);
                return database.collection(collection.students)
                    .countDocuments({_id:{$nin:IDsOfStudentExcluded}})
                    .then(documentsCount => {
                        //console.log('documentsCount exce', documentsCount);
                        return database.collection(collection.students)
                            .find({ '_id': { $nin: IDsOfStudentExcluded } }, options)
                            .sort(sort)
                            .skip(skip)
                            .limit(limit)
                            .toArray()
                            .then(result => {
                                //console.log(result);
                                return {
                                    pages: Math.ceil(documentsCount / filterObject.pageSize),
                                    numberOfResults: documentsCount,
                                    result: result
                                }
                            })
                    })
            })
    } else {
        //console.log(options ,sort);
        return database.collection(collection.students)
            .countDocuments(filter)
            .then(documentsCount => {
                //console.log('documentsCount', documentsCount);
                return database.collection(collection.students)
                    .find(filter, options)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .toArray()
                    .then(result => {
                        //console.log ('275',JSON.stringify(result));
                        return {
                            pages: Math.ceil(documentsCount / filterObject.pageSize),
                            numberOfResults: documentsCount,
                            result: result
                        }
                    })
            })
    }

}

exports.AddCoursesForStudent = (courses, user, success, fail) => {

    let courseRecord = courses.courses.map(course => {
        return {
            courseID: course.courseID,
            by: String(user),
            from: course.from,
            to: course.to,
            subscribeToZoom: course.subscribeToZoom,
            replay: course.replay,
            unlimited: course.unlimited,
            notes: course.notes
        }
    })

    let filter = {
        _id: ObjectID(String(courses.studentID))
    }

    let update = {
        $addToSet: {
            "courses": { $each: courseRecord }
        }
    }

    database.collection(collection.students).updateOne(
        filter,
        update, {},
        (err, result) => {
            if (err) {
                fail(err.message);
                return;
            }
            success(result);
        }
    )
};

exports.RemoveCoursesForStudent = (data, success, fail) => {

    let filter = {
        _id: ObjectID(String(data.studentID))
    }

    let update = {
        $pull: {
            "courses": { courseID: data.courseID }
        }
    }

    database.collection(collection.students).updateOne(
        filter,
        update, {},
        (err, result) => {
            if (err) {
                fail(err.message);
                return;
            }
            success(result);
        }
    )
};

exports.DeleteStudent = (data, success, fail) => {
    if (database == undefined) {
        fail("Database undefined");
        console.log(SCRIPT_NAME + ".deleteStudent: undefined db");
    } else {
        let vote = 1;
        let filter = {
            'mID': data.studentMID
        }
        database.collection(collection.students).updateOne(filter, { $set: { delete: 1, deactivate: true } },
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                success(result);
            }
        )
    }
}

exports.Student = (data, user, success, fail) => {

    return database.collection(collection.students)
        .findOne(data)

}

exports.EditStudent = (studentID, data, success, fail) => {
    let filter = {
        '_id': ObjectID(String(studentID)),
    }

    return database.collection(collection.students)
        .updateOne(filter, { $set: data.editData },
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                success(result);
            }
        )
}

exports.DeactivateStudent = (attachedData, data, success) => {
    //console.log(attachedData);
    //console.log(data);
    let filter = {
        _id: ObjectID(String(attachedData.requester)),
    }
    let vote = 2;
    database.collection(collection.students)
        .updateOne(filter, { $set: { deactivate: true } },
            (result, err) => {
                if (--vote <= 0) {
                    success();
                }
            }
        )

    let filterBlock = {
        userID: ObjectID(String(attachedData.requester)),
    }
    let updateEvents = {}

    updateEvents = [{
        uri: 'by',
        l: attachedData.requester,
        historyEvent: {
            b: attachedData.requester,
            t: attachedData.timeStamp
        }
    }, {
        uri: 'reason',
        l: data.reason,
        historyEvent: {
            b: attachedData.requester,
            t: attachedData.timeStamp,
            v: data.reason
        }
    }]
    let update = {
        $set: {},
        $push: {}
    }
    for (let updateEvent of updateEvents) {
        update.$set[updateEvent.uri + '.l'] = updateEvent.l;
        update.$push[updateEvent.uri + '.h'] = updateEvent.historyEvent;
    }

    console.log(update);
    database.collection(collection.blockMsgs)
        .updateOne(filterBlock, update, { upsert: true },
            (result, err) => {
                if (--vote <= 0) {
                    success();
                }
            }
        )
}

exports.StudentBlockList = (data, success, fail) => {
    let filter = {
        userID: ObjectID(String(data.studentID))
    }

    return database.collection(collection.blockMsgs)
        .findOne(filter).then((result) => {
            //console.log(result);
            return {
                reasons: (result == null) ? [] : result.reason.h
            }
        })
};