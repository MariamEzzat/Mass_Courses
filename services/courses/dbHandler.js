let connector = require("./../db/connector");
let ObjectID = require('mongodb').ObjectID;
const databaseName = "ERP";
const collection = {
    universities: 'universities',
    faculties: 'faculties',
    departments: 'departments',
    sections: 'sections',
    years: 'years',
    course: 'course',
    years: 'years',
    terms: 'terms',
    subjects: 'subjects',
    groups: 'groups',
    accessibility: 'accessibility',
    users: 'users',
    courses: 'courses',
    students: 'students',
    appVersion: 'app.versions'
}

const mainTaskAccessName = "tasks";
let helpers = require("./../../utils/helpers"); // for date function.

const SCRIPT_NAME = "\nDB HANDLER TASKS SERVICE";


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




exports.universities = () => {
    let filter = {
        $or: [
            { deleted: { $exists: false } },
            { deleted: 0 }
        ]
    }
    return database.collection(collection.universities)
        .find(filter)
        .toArray()
}
exports.universitiesForStudents = () => {
    let filter = {
        $and: [
            { hidden: 0 },
            {
                $or: [
                    { deleted: { $exists: false } },
                    { deleted: 0 }
                ]
            }
        ]
    }

    return database.collection(collection.universities)
        .find(filter)
        .toArray();
}

exports.newUniversity = (university, next) => {

    return database.collection(collection.universities)
        .insertOne(university)
        .then(result => {
            next(result)
        })
}
exports.editUniversity = (universityID, updates) => {
    let filter = {
        _id: ObjectID(String(universityID))
    }

    let update = {
        $set: {}
    }
    for (let key in updates) {
        update.$set[key] = updates[key]
    }

    return database.collection(collection.universities)
        .updateOne(filter, update)

};

//---------------------------------------------------------------------------
exports.faculties = (universityID) => {
    let filter = {
        $and: [
            { universityID: String(universityID) },
            {
                $or: [
                    { deleted: { $exists: false } },
                    { deleted: 0 }
                ]
            }
        ]

    }
    return database.collection(collection.faculties)
        .find(filter)
        .toArray()
};
//.................................
exports.newFaculty = (preparedData, next) => {
    database.collection(collection.faculties)
        .insertOne(preparedData)
        .then(result => {
            next(result)
        })
}

exports.editFaculty = (facultyID, updates) => {
    let filter = {
        _id: ObjectID(String(facultyID))
    }

    let update = {
        $set: {}
    }
    for (let key in updates) {
        update.$set[key] = updates[key]
    }

    return database.collection(collection.faculties)
        .updateOne(filter, update)

};
//---------------------------------------------------------------------------


exports.departments = (facultyID) => {
    let filter = {
        $and: [
            { facultyID: String(facultyID) },
            {
                $or: [
                    { deleted: { $exists: false } },
                    { deleted: 0 }
                ]
            }
        ]

    }
    return database.collection(collection.departments)
        .find(filter)
        .toArray()
};
//.................................
exports.newDepartment = (preparedData, next) => {
    return database.collection(collection.departments)
        .insertOne(preparedData)
        .then(result => {
            next(result);
        })
}
exports.editDepartment = (departmentID, updates) => {
    let filter = {
        _id: ObjectID(String(departmentID))
    }

    let update = {
        $set: {}
    }
    for (let key in updates) {
        update.$set[key] = updates[key]
    }

    return database.collection(collection.departments)
        .updateOne(filter, update)

};


//---------------------------------------------------------------------------


exports.sections = (departmentID) => {
    let filter = {
        $and: [
            { departmentID: String(departmentID) },
            {
                $or: [
                    { deleted: { $exists: false } },
                    { deleted: 0 }
                ]
            }
        ]

    }

    return database.collection(collection.sections)
        .find(filter)
        .toArray()
};

//.................................
exports.newSection = (preparedData, next) => {
    return database.collection(collection.sections)
        .insertOne(preparedData)
        .then(result => {
            next(result);
        })
}
exports.editSection = (sectionID, updates) => {
    let filter = {
        _id: ObjectID(String(sectionID))
    }

    let update = {
        $set: {}
    }
    for (let key in updates) {
        update.$set[key] = updates[key]
    }

    return database.collection(collection.sections)
        .updateOne(filter, update)

};


//---------------------------------------------------------------------------
exports.universityData = (universityID, next) => {
    let filter = {
        _id: ObjectID(universityID)
    }
    database.collection(collection.universities)
        .findOne(filter)
        .then(result => {
            next(result);
        })
        .catch(e => {
            console.log(e)
        })
};
exports.departmentData = (departmentID, next) => {
    let filter = {
        _id: ObjectID(departmentID)
    }
    database.collection(collection.departments)
        .findOne(filter)
        .then(result => {
            next(result);
        })
        .catch(e => {
            console.log(e)
        })
};

//--------------------------------------------------------------------------
exports.years = (sectionID) => {
    let filter = {
        $and: [
            { sectionID: String(sectionID) },
            {
                $or: [
                    { deleted: { $exists: false } },
                    { deleted: 0 }
                ]
            }
        ]

    }

    return database.collection(collection.years)
        .find(filter)
        .toArray()
};
//.................................
exports.newYear = (preparedData, next) => {
    return database.collection(collection.years)
        .insertOne(preparedData)
        .then(result => {
            next(result);
        })
};
exports.editYear = (yearID, updates) => {
    let filter = {
        _id: ObjectID(String(yearID))
    }

    let update = {
        $set: {}
    }
    for (let key in updates) {
        update.$set[key] = updates[key]
    }

    return database.collection(collection.years)
        .updateOne(filter, update)

};
//.................................
exports.facultyData = (facultyID, next) => {
    let filter = {
        _id: ObjectID(facultyID)
    }
    database.collection(collection.faculties)
        .findOne(filter)
        .then(result => {
            next(result);
        })
        .catch(e => {
            console.log(e)
        })
};
//-----------------------------------------------------------------------------
exports.terms = (yearID) => {
    let filter = {
        $and: [
            { yearID: String(yearID) },
            {
                $or: [
                    { deleted: { $exists: false } },
                    { deleted: 0 }
                ]
            }
        ]

    }
    return database.collection(collection.terms)
        .find(filter)
        .toArray()
};
//.................................
exports.newTerm = (preparedData, next) => {
    database.collection(collection.terms)
        .insertOne(preparedData)
        .then(result => {
            next(result)
        })
}
exports.editTerm = (termID, updates) => {
    let filter = {
        _id: ObjectID(String(termID))
    }

    let update = {
        $set: {}
    }
    for (let key in updates) {
        update.$set[key] = updates[key]
    }

    return database.collection(collection.terms)
        .updateOne(filter, update)

};
//...................................
exports.yearsData = (termsID, next) => {
    let filter = {
        _id: ObjectID(termsID)
    }
    database.collection(collection.years)
        .findOne(filter)
        .then(result => {
            next(result)
        })
        .catch(e => {
            console.log(e)
        })
};
//-----------------------------------------------------------------------------
exports.subjects = (termID) => {
    let filter = {
        $and: [
            { termID: String(termID) },
            {
                $or: [
                    { deleted: { $exists: false } },
                    { deleted: 0 }
                ]
            }
        ]

    }
    return database.collection(collection.subjects)
        .find(filter)
        .toArray()
};
//.................................
exports.newSubject = (preparedData, next) => {
    database.collection(collection.subjects)
        .insertOne(preparedData)
        .then(result => {
            next(result)
        })
};
exports.editSubject = (subjectID, updates) => {
    let filter = {
        _id: ObjectID(String(subjectID))
    }
    console.log(filter);
    let update = {
        $set: {}
    }
    for (let key in updates) {
        update.$set[key] = updates[key]
    }
    console.log(filter, update);
    return database.collection(collection.subjects)
        .updateOne(filter, update)

};
//.................................
exports.termData = (termsID, next) => {
    let filter = {
        _id: ObjectID(termsID)
    }
    database.collection(collection.terms)
        .findOne(filter)

        .then(result => {
            next(result)
        })
        .catch(e => {
            console.log(e)
        })

}

exports.sectionData = (sectionID, next) => {
    let filter = {
        _id: ObjectID(sectionID)
    }
    database.collection(collection.sections)
        .findOne(filter)
        .then(result => {
            next(result)
        })
        .catch(e => {
            console.log(e)
        });
    //---------------------------------------------------------------------------------
};

exports.newGroup = (group, next) => {
    return database.collection(collection.groups)
        .insertOne(group)
        .then(result => {
            next(result)
        })
};
//.............................................
exports.groups = () => {
    let filter = {
    
        $or: [
            { deleted: { $exists: false } },
            { deleted: 0 }
        ]
    
    }

    return database.collection(collection.groups)
        .find(filter)
        .toArray()
};
//..............................................
exports.editGroups = (groupID, updates) => {
    let filter = {
        _id: ObjectID(groupID)
    }
    // console.log(filter, newName, groupID)
    // return database.collection(collection.groups)
    //     .updateOne(filter, {
    //         $set: {
    //             name: String(newName)
    //         }
    //     })
    //     .then(result => {
    //         next(result)
    //     })
    //     .catch(e => {
    //         console.log(e)
    //     })
    // /*.then(result => {
    //     next(result)
    // })

    // */
    let update = {
        $set: {}
    }
    for (let key in updates) {
        update.$set[key] = updates[key]
    }

    return database.collection(collection.groups)
        .updateOne(filter, update)
};

exports.accessUser = (userID, next) => {
    let filter = {
        _id: ObjectID(userID)
    }
    database.collection(collection.users)
        .findOne(filter)

        .then(result => {
            next(result)
        })
        .catch(e => {
            console.log(e)
        })
};

exports.AllCourseTrees = (next) => {
    let vote = 8;
    let object = {}
    database.collection(collection.universities)
        .find({})
        .toArray()
        .then(result => {
            object.universities = result;
            if (--vote <= 0) {
                next(object)
            }
        })
        .catch(e => {
            console.log(e)
        })
    database.collection(collection.faculties)
        .find({})
        .toArray()
        .then(result => {
            object.faculties = result;
            if (--vote <= 0) {
                next(object)
            }
        })
        .catch(e => {
            console.log(e)
        })
    database.collection(collection.departments)
        .find({})
        .toArray()
        .then(result => {
            object.departments = result;
            if (--vote <= 0) {
                next(object)
            }
        })
        .catch(e => {
            console.log(e)
        })
    database.collection(collection.sections)
        .find({})
        .toArray()
        .then(result => {
            object.sections = result;
            if (--vote <= 0) {
                next(object)
            }
        })
        .catch(e => {
            console.log(e)
        })
    database.collection(collection.years)
        .find({})
        .toArray()
        .then(result => {
            object.years = result;
            if (--vote <= 0) {
                next(object)
            }
        })
        .catch(e => {
            console.log(e)
        })
    database.collection(collection.terms)
        .find({})
        .toArray()
        .then(result => {
            object.terms = result;
            if (--vote <= 0) {
                next(object)
            }
        })
        .catch(e => {
            console.log(e)
        })
    database.collection(collection.subjects)
        .find({})
        .toArray()
        .then(result => {
            object.subjects = result;
            if (--vote <= 0) {
                next(object)
            }
        })
        .catch(e => {
            console.log(e)
        })
        database.collection(collection.groups)
        .find({})
        .toArray()
        .then(result => {
            object.groups = result;
            if (--vote <= 0) {
                next(object)
            }
        })
        .catch(e => {
            console.log(e)
        })
};

// .catch(e => { console.log(e) })
//.then(result => { console.log(result); return result })
// function to get one university data .findOne(universityID) _id: ObjectID('universityID')
// 
// 
// 
/* END HV1 */
// db.app.versions.update(
//     {_id:ObjectId("619d0d17a0c01a4d112647a9")}, 
//     { $push : { "android.versions": { $each: [ 1,2,3 ] },   "ios.versions": { $each: [ 1,2,3 ] } }}
//  )
exports.NewAppVersion = (data, success, fail) => {
    if (database == undefined) {
        fail("Database undefined");
        console.log(SCRIPT_NAME + ".insertNewCourse: undefined db");
    } else {

        let filter = {
            _id: ObjectID('619d0d17a0c01a4d112647a9')
        }
        let update = {
            $addToSet: {}
        }
        for (let i in data) {

            if (i == 'ios' || i == 'android') {
                update.$addToSet[`${i}.versions`] = data[i]
            } else {
                update.$addToSet[`${i}`] = data[i]
            }
        }
        //console.log(update);
        database.collection(collection.appVersion).update(
            filter, update,
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                success();
            }
        )
    }
};

exports.appVersions = () => {
    let filter = {
        _id: ObjectID('619d0d17a0c01a4d112647a9')
    }

    return database.collection(collection.appVersion)
        .findOne(filter)

};

exports.AddValidVersions = (data, success, fail) => {
    if (database == undefined) {
        fail("Database undefined");
        console.log(SCRIPT_NAME + ".insertNewCourse: undefined db");
    } else {

        let filter = {
            _id: ObjectID('619d0d17a0c01a4d112647a9')
        }
        let update = {
            $addToSet: {}
        }
        for (let i in data) {

            update.$addToSet[`${i}.lastValidVersion`] = { $each: data[i] }
        }
        //console.log(update);
        database.collection(collection.appVersion).updateOne(
            filter, update,
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                success();
            }
        )
    }
};

exports.removeValidVersion = (data, success, fail) => {
    let filter = {
        _id: ObjectID('619d0d17a0c01a4d112647a9')
    }

    let update = {
        $pull: {}
    }
    for (let i in data) {
        update.$pull[`${i}.lastValidVersion`] = data[i]
    }
    //console.log(update);
    return database.collection(collection.appVersion)
        .updateOne(filter, update, (err, result) => {
            if (err) {
                fail(err.message);
                return;
            }
            success();
        })
};

exports.removeVersion = (data, success, fail) => {
    let filter = {
        _id: ObjectID('619d0d17a0c01a4d112647a9')
    }

    let update = {
        $pull: {}
    }
    for (let i in data) {
        update.$pull[`${i}.versions`] = data[i]
    }
    console.log(update);
    return database.collection(collection.appVersion)
        .updateOne(filter, update, (err, result) => {
            if (err) {
                fail(err.message);
                return;
            }
            success();
        })

};
