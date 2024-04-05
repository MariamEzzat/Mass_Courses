let connector = require("../../db/connector");
let ObjectID = require('mongodb').ObjectID;
const databaseName = "ERP";
const collection = {
    instructors: 'instructors',
    users: 'users',
    courses: 'courses'
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
exports.instructorMIDExists = mID => {
    let filter = {
        'mID': String(mID)
    }

    let options = {
        projection: {
            mID: 1,
            _id: 0
        }
    }

    return database.collection(collection.instructors)
        .findOne(filter, options)
}
exports.insertNewInstructor = (instructorData, success, fail) => {
    if (database == undefined) {
        fail("Database undefined");
        console.log(SCRIPT_NAME + ".insertNewInstructor: undefined db");
    } else {
        let vote = 2
        instructorData.delete = 0
        database.collection(collection.instructors).insertOne(
            instructorData, {},
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                if (result['insertedCount'] !== 1) {
                    fail("inserting new instructor document doc failed: insertedCount=0, : " + JSON.stringify(result));
                    return;
                }
                if (--vote <= 0) {
                    success();
                }
            }
        )
        database.collection(collection.users).insertOne({
                "username": instructorData.name,
                "email": instructorData.email,
                "password": instructorData.password,
                "visualName": instructorData.name,
                "active": 1,
                "type": "INSTRUCTOR"
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

exports.InstructorsFilter = (filter) => {
    if (Object.keys(filter).length !== 0) {
        filter = {
            _id: ObjectID(String(filter._id)),
            delete: 0
        }
    } else {
        filter = {
            delete: 0
        }
    }

    return database.collection(collection.instructors)
        .find(filter)
        .toArray()
};

exports.DeleteInstructor = (data, user, success, fail) => {
    if (database == undefined) {
        fail("Database undefined");
        console.log(SCRIPT_NAME + ".deleteInstructor: undefined db");
    } else {
        let vote = 2;
        let filter = {
            'mID': data.instructorMID
        }
        database.collection(collection.instructors).updateOne(filter, { $set: { delete: 1 } },
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                if (--vote <= 0) {
                    success(result);
                }
            }
        )

        database.collection(collection.users).updateOne(filter, { $set: { active: 0 } },
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                if (--vote <= 0) {
                    success(result);
                }
            }
        )
    }
}

exports.Instructor = (data, user, success, fail) => {

    return database.collection(collection.instructors)
        .findOne(data)

}

exports.getCoursesByInstructorID =(data, user, success, fail) => {
    if (database == undefined) {
        fail("Database undefined");
        console.log(SCRIPT_NAME + ".getCoursesByInstructorID: undefined db");
    } else {
          
        return database.collection(collection.courses).find({
            instructor: [data]
        });


    }
}



exports.EditInstructor = (instructorID, data, success, fail) => {

    let filter = {
        '_id': ObjectID(String(instructorID)),
    }

    return database.collection(collection.instructors)
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



exports.filter = (filterObject) => {

/*    console.log ('tasks filter')
    console.log (filterObject);*/
    //userID = String(userID);

    let filter = {
        $and: [{
            preData: {$exists: false}
        }],
        //$or: []
    }
    let sort = {_id: -1}

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

                filter.$and.push (temp)
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
                        $options: 'i'// to disable case sensitive search
                    }

                filter.$and.push(temp)
                // to sort increasingly the matching search
                /*sort[field]*/
            }
        }

        // RANGE
        if (filterOption.hasOwnProperty('range')) {
            let from = '', to = '';
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



    if (filterObject.hasOwnProperty ('projections')) {
        options ['projection'] = {}
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
    return database.collection(collection.instructors)
            .countDocuments(filter)
            .then (documentsCount => {
                return database.collection(collection.instructors)
                        .find(filter, options)
                        .sort(sort)
                        .skip(skip)
                        .limit(limit)
                        .toArray()
                        .then (result => { 
                            //console.log (JSON.stringify(result));
                            return {
                                pages: Math.ceil(documentsCount / filterObject.pageSize),
                                result: result
                            }
                        })
            })

}