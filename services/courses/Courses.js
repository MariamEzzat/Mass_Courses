let Student = require('./students/main.js');
let Instructor = require('./instructors/main.js');
let Course = require('./courses/main.js');
let helpers = require("../../utils/helpers.js"); // for date function.
let dbHandler = require('./dbHandler.js')
let functionMapper = new Map([
    ["00C.I", instructorSubService],
    ["00C.S", studentSubService],
    ["00C.C", courseSubService],



    /*
    HOSSAM FUNCTIONS
     */
    ['0CR01', universities],
    ['0CR02', newUniversity],
    ['0CR03', faculties],
    ['0CR04', newFaculty],

    ['0CR14', departments],
    ['0CR15', newDepartment],

    ['0CR16', sections],
    ['0CR17', newSection],

    ['0CR05', years],
    ['0CR06', newYear],
    ['0CR07', terms],
    ['0CR08', newTerm],
    ['0CR09', subjects],
    ['0CR10', newSubject],

    ['0CR11', newGroup],
    ['0CR12', groups],
    ['0CR13', editGroups],

    // 0CR17 <-- IS THE LAST ID 

    ['0CR18', editUniversity],
    ['0CR19', editFaculty],
    ['0CR20', editDepartment],
    ['0CR21', editSection],
    ['0CR22', editYear],
    ['0CR23', editTerm],
    ['0CR24', editSubject],
    ['0CR25', AllCourseTrees],
    /* END */

    ['00C1', NewAppVersion], 
    ['00C2', AppVersions], 
    ['00C4', LastValidVersions], 
    ['00C5', AddValidVersions],
    ['00C6', removeValidVersion],
    ['00C7', removeVersion],
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

function instructorSubService(data, attachedData, next, pusher) {
    Instructor.reciever(
        data,
        attachedData,
        next,
        pusher
    );
}

function studentSubService(data, attachedData, next, pusher) {
    Student.reciever(
        data,
        attachedData,
        next,
        pusher
    );
}

function courseSubService(data, attachedData, next, pusher) {
    Course.reciever(
        data,
        attachedData,
        next,
        pusher
    );
}




// to check if userID exists in array 
function hasUserID(arr, id) {
    for (x of arr) {
        if (x.id == id && x.new == 1) {
            return true
        }
    }
    return false
}

function isAdmin(user) {
    if (user == 'ADMIN') {
        return true
    }
    return false
}

//************************************************************************************************* */
function universities(data, attachedData, next) {
    if (attachedData.hasOwnProperty('isStudent') && attachedData.isStudent == 1) {
        return dbHandler.universitiesForStudents()
    }
    return dbHandler.universities();

}
//............................................................
function newUniversity(data, attachedData, next) {
    //console.log(data, '0000');
    let missing = helpers.missingProperties(['name'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }

    dbHandler.accessUser(
        attachedData.requester,
        result => {
            if (!isAdmin(result.type)) {
                next({
                    status: 'FAILED',
                    data: 'user has no access'
                })
            }
            if (isAdmin(result.type)) {
                let preparedData = {
                    name: String(data.name),
                    logoURL: data.logoURL,
                    hidden: data.hasOwnProperty('hidden') ? data.hidden : 0,
                }
                dbHandler.newUniversity(preparedData, result => {
                    next({
                        status: 'SUCCESS',
                        data: 'added new'
                    })
                })
            }
        })
}

function editUniversity(data, attachedData, next) {
    console.log('edit university: ', data)
    // TODO: CHECK IF THIS USER IS ADMIN 
    let universityID = data.universityID;
    delete data.universityID;

    return dbHandler.editUniversity(universityID, data);
}

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------

function faculties(data, attachedData, next) {

    let missing = helpers.missingProperties(['universityID'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }

    return dbHandler.faculties(data.universityID);
}
//........................................................................
function newFaculty(data, attachedData, next) {
    //console.log(data, 'asdfasdf')
    let missing = helpers.missingProperties(['name', 'universityID'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }
    //console.log(data, 'sdsd');
    dbHandler.accessUser(
        attachedData.requester,
        result => {
            if (!isAdmin(result.type)) {
                next({
                    status: 'FAILED',
                    data: 'user has no access'
                })
            }
            if (isAdmin(result.type)) {
                dbHandler.universityData(
                    data.universityID,
                    result => {
                        if (result == null) {
                            next({
                                status: 'FAILED',
                                data: 'result is null'
                            })
                        }
                        if (result != null) {
                            let preparedData = {
                                name: String(data.name),
                                universityID: String(data.universityID),
                                logoURL: data.logoURL,
                                hidden: data.hasOwnProperty('hidden') ? data.hidden : 0,

                            }
                            dbHandler.newFaculty(
                                preparedData,
                                result => {
                                    next({
                                        status: 'SUCCESS',
                                        data: 'added new'
                                    })
                                }
                            )
                        }
                    }
                )
            }
        })



}

function editFaculty(data, attachedData, next) {
    console.log('edit faculty: ', data)
    // TODO: CHECK IF THIS USER IS ADMIN 
    let facultyID = data.facultyID;
    delete data.facultyID;

    return dbHandler.editFaculty(facultyID, data);
}


//........................................................................
/**
 *     
    ['0CR14', departments],
    ['0CR15', newDepartment],

    ['0CR16', sections],
    ['0CR17', newSection], 

*/

function departments(data, attachedData, next) {
    let missing = helpers.missingProperties(['facultyID'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }
    return dbHandler.departments(data.facultyID);
}

function newDepartment(data, attachedData, next) {
    console.log(data, 'newDepartment')
    let missing = helpers.missingProperties(['name', 'facultyID'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }
    dbHandler.accessUser(
        attachedData.requester,
        result => {
            if (!isAdmin(result.type)) {
                next({
                    status: 'FAILED',
                    data: 'user has no access'
                })
            }
            if (isAdmin(result.type)) {
                dbHandler.facultyData(
                    data.facultyID,
                    result => {
                        if (result == null) {
                            next({
                                status: 'FAILED',
                                data: 'result is null'
                            })
                        }
                        if (result != null) {
                            let preparedData = {
                                name: String(data.name),
                                facultyID: String(data.facultyID),
                                logoURL: data.logoURL,
                                hidden: data.hasOwnProperty('hidden') ? data.hidden : 0,
                            }
                            dbHandler.newDepartment(
                                preparedData,
                                result => {
                                    next({
                                        status: 'SUCCESS',
                                        data: 'result is ok'
                                    })
                                }
                            )
                        }
                    }
                )
            }
        })
}

function editDepartment(data, attachedData, next) {
    console.log('edit department: ', data)
    // TODO: CHECK IF THIS USER IS ADMIN 
    let departmentID = data.departmentID;
    delete data.departmentID;

    return dbHandler.editDepartment(departmentID, data);
}

function sections(data, attachedData, next) {
    let missing = helpers.missingProperties(['departmentID'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }
    return dbHandler.sections(data.departmentID);
}

function newSection(data, attachedData, next) {
    console.log(data, 'newDepartment')
    let missing = helpers.missingProperties(['name', 'departmentID'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }
    dbHandler.accessUser(
        attachedData.requester,
        result => {
            if (!isAdmin(result.type)) {
                next({
                    status: 'FAILED',
                    data: 'user has no access'
                })
            }
            if (isAdmin(result.type)) {
                dbHandler.departmentData(
                    data.departmentID,
                    result => {
                        if (result == null) {
                            next({
                                status: 'FAILED',
                                data: 'result is null'
                            })
                        }
                        if (result != null) {
                            let preparedData = {
                                name: String(data.name),
                                departmentID: String(data.departmentID),
                                logoURL: data.logoURL,
                                hidden: data.hasOwnProperty('hidden') ? data.hidden : 0,
                            }
                            dbHandler.newSection(
                                preparedData,
                                result => {
                                    next({
                                        status: 'SUCCESS',
                                        data: 'result is ok'
                                    })
                                }
                            )
                        }
                    }
                )
            }
        })
}

function editSection(data, attachedData, next) {
    console.log('edit section: ', data)
    // TODO: CHECK IF THIS USER IS ADMIN 
    let sectionID = data.sectionID;
    delete data.sectionID;

    return dbHandler.editSection(sectionID, data);
}

//----------------------------------------------------------------------------
function years(data, attachedData, next) {
    let missing = helpers.missingProperties(['sectionID'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }
    return dbHandler.years(data.sectionID);
}
//..............................................................................
function newYear(data, attachedData, next) {
    console.log(data, 'asdfasdf')
    let missing = helpers.missingProperties(['name', 'sectionID'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }
    dbHandler.accessUser(
        attachedData.requester,
        result => {
            if (!isAdmin(result.type)) {
                next({
                    status: 'FAILED',
                    data: 'user has no access'
                })
            }
            if (isAdmin(result.type)) {
                dbHandler.sectionData(
                    data.sectionID,
                    result => {
                        if (result == null) {
                            next({
                                status: 'FAILED',
                                data: 'result is null'
                            })
                        }
                        if (result != null) {
                            let preparedData = {
                                name: String(data.name),
                                sectionID: String(data.sectionID),
                                hidden: data.hasOwnProperty('hidden') ? data.hidden : 0,

                            }
                            dbHandler.newYear(
                                preparedData,
                                result => {
                                    next({
                                        status: 'SUCCESS',
                                        data: 'result is ok'
                                    })
                                }
                            )
                        }
                    }
                )
            }
        })

}

function editYear(data, attachedData, next) {
    console.log('edit year: ', data)
    // TODO: CHECK IF THIS USER IS ADMIN 
    let yearID = data.yearID;
    delete data.yearID;

    return dbHandler.editYear(yearID, data);
}

//----------------------------------------------------------------------------------
function terms(data, attachedData, next) {
    let missing = helpers.missingProperties(['yearID'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }
    return dbHandler.terms(data.yearID);
}
//....................................................................................
function newTerm(data, attachedData, next) {
    let missing = helpers.missingProperties(['name', 'yearID'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }
    dbHandler.accessUser(
        attachedData.requester,
        result => {
            if (!isAdmin(result.type)) {
                next({
                    status: 'FAILED',
                    data: 'user has no access'
                })
            }
            if (isAdmin(result.type)) {
                dbHandler.yearsData(
                    data.yearID,
                    result => {
                        if (result == null) {
                            next({
                                status: 'FAILED',
                                data: 'result is null'
                            })
                        }
                        if (result != null) {
                            let preparedData = {
                                name: String(data.name),
                                yearID: String(data.yearID),
                                hidden: data.hasOwnProperty('hidden') ? data.hidden : 0,

                            }
                            dbHandler.newTerm(
                                preparedData,
                                result => {
                                    next({
                                        status: 'SUCCESS',
                                        data: 'result is ok'
                                    })
                                }
                            )
                        }
                    }
                )

            }
        })



}

function editTerm(data, attachedData, next) {
    console.log('edit term: ', data)
    // TODO: CHECK IF THIS USER IS ADMIN 
    let termID = data.termID;
    delete data.termID;

    return dbHandler.editTerm(termID, data);
}

//--------------------------------------------------------------------------------------
function subjects(data, attachedData, next) {
    console.log(data);
    let missing = helpers.missingProperties(['termID'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field termID'
        })
        return;
    }
    return dbHandler.subjects(data.termID);
}
//..................................................................................
function newSubject(data, attachedData, next) {
    let missing = helpers.missingProperties(['name', 'termID'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field termID or name'
        })
        return;
    }
    dbHandler.accessUser(
        attachedData.requester,
        result => {
            if (!isAdmin(result.type)) {
                next({
                    status: 'FAILED',
                    data: 'user has no access'
                })
            }
            if (isAdmin(result.type)) {
                dbHandler.termData(
                    data.termID,
                    result => {
                        if (result == null) {
                            next({
                                status: 'FAILED',
                                data: 'result is null'
                            })
                        }
                        if (result != null) {
                            let preparedData = {
                                name: String(data.name),
                                termID: String(data.termID),
                                logoURL: data.logoURL,
                                hidden: data.hasOwnProperty('hidden') ? data.hidden : 0,
                            }
                            dbHandler.newSubject(
                                preparedData,
                                result => {
                                    next({
                                        status: 'SUCCESS',
                                        data: 'result is ok'
                                    })
                                }
                            )
                        }
                    }
                )
            }
        })



}

function editSubject(data, attachedData, next) {
    console.log('edit subject: ', data)
    // TODO: CHECK IF THIS USER IS ADMIN 
    let subjectID = data.subjectID;
    delete data.subjectID;

    return dbHandler.editSubject(subjectID, data);
}

//*************************************************************************** */

// IDENTIFIERS.COURSES.COURSES.GROUPS

function newGroup(data, attachedData, next) {
    let missing = helpers.missingProperties(['name'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }
    dbHandler.accessUser(
        attachedData.requester,
        result => {
            if (!isAdmin(result.type)) {
                next({
                    status: 'FAILED',
                    data: 'user has no access'
                })
            }
            if (isAdmin(result.type)) {
                let preparedData = {
                    name: String(data.name),
                    deleted: data.hasOwnProperty('delete') ? data.deleted : 0,
                }
                dbHandler.newGroup(preparedData, result => {
                    next({
                        status: 'SUCCESS',
                        data: 'added new'
                    })
                })
            }
        })


}
//...................................................
function groups(data, attachedData, next) {
    console.log(data, '0000');
    return dbHandler.groups();
}
//....................................................
function editGroups(data, attachedData, next) {
    console.log(data);
    // let missing = helpers.missingProperties([ 'groupID'], data)
    // if (missing != false) {
    //     next({
    //         status: 'FAILED',
    //         data: 'Missing field name'
    //     })
    //     return;
    // }
    let groupID = data.groupID;
    delete data.groupID;
    // dbHandler.accessUser(
    //     attachedData.requester,
    //     result => {
    //         if (!isAdmin(result.type)) {
    //             next({
    //                 status: 'FAILED',
    //                 data: 'user has no access'
    //             })
    //         }
    //         if (isAdmin(result.type)) {
    //             let preparedData = {
    //                 name: String(data.name)
    //             }
    //             dbHandler.editGroups(String(data.newName), String(data.groupID), result => {
    //                 next({
    //                     status: 'SUCCESS',
    //                     data: 'added new'
    //                 })
    //             })
    //         }
    //     })
    return dbHandler.editGroups( String(groupID),data)

}

function AllCourseTrees(data, attachedData, next) {
   
    return dbHandler.AllCourseTrees((result) => {
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
/*function newCourse(data, attachedData, next) {
    let missing = helpers.missingProperties(['name', 'subjectID', 'description'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }
    let preparedData = {
        name: String(data.name),
        subjectsID: String(data.termsID),
        description: String(data.description),
        instructorID: data.instructorID == undefined ? '' : String(data.instructorID)
    }
    return dbHandler.newCourse(preparedData);
}

function filterCourse(data, attachedData, next) {
    let preparedData = {
        instructorID: data.instructorID == undefined ? '' : String(data.instructorID),
        yearID: data.yearID == undefined ? '' : String(data.yearID),
        facultyID: data.facultyID == undefined ? '' : String(data.facultyID),
        termID: data.termID == undefined ? '' : String(data.termID),
        subjectID: data.subjectID == undefined ? '' : String(data.subjectID)


        // ########################################
    }
    return dbHandler.filterCourse(preparedData);
}

function course(data, attachedData, next) {
    let missing = helpers.missingProperties(['courseID'], data)
    if (missing != false) {
        next({
            status: 'FAILED',
            data: 'Missing field name'
        })
        return;
    }
    return dbHandler.course(data.courseID);
}*/

/*
,
        result => {
            next({
                status: 'SUCCESS',
                data: 'updated'
            })
        }
        */

/* END HV1 */

function NewAppVersion(data, attachedData, next) {

    function failed(msg) {
        next({
            status: "FAILED",
            data: msg
        });
    }
    // VALIDATION
    // let missing = helpers.missingProperties(['name', 'faculty', "university", 'term', 'year', 'subject', 'instructor'], data);
    // if (missing != false) {
    //     failed("Missing Properties: " + JSON.stringify(missing));
    //     return;
    // }

    data.by = String(attachedData.requester)
    data.time = attachedData.timeStamp

    dbHandler.NewAppVersion(
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

function AppVersions(data, attachedData) {
    return dbHandler.appVersions().then(result=>{
        return {android:result.android.versions, ios:result.ios.versions}
    })
}

function LastValidVersions(data, attachedData) {
    return dbHandler.appVersions().then(result=>{
        //console.log(result);
        return {android:result.android.lastValidVersion, ios:result.ios.lastValidVersion}
    })
}
function AddValidVersions(data, attachedData, next) {
    //console.log(data);
    dbHandler.AddValidVersions(
        data,
        (result) => { // success
            next({
                status: "SUCCESS",
                data: "inserted"
            });
        },
        (err) => {
            next({
                status: "FAILED",
                data: err
            });
        });
};

function removeValidVersion(data, attachedData,next) {
    //console.log(data);
    return dbHandler.removeValidVersion(data,
        (result) => { // success
            next({
                status: "SUCCESS",
                data: "removed"
            });
        },
        (err) => {
            failed(err);
        })
}

function removeVersion(data, attachedData,next) {
    console.log(data);
    return dbHandler.removeVersion(data,
        (result) => { // success
            next({
                status: "SUCCESS",
                data: "removed"
            });
        },
        (err) => {
            failed(err);
        })
}