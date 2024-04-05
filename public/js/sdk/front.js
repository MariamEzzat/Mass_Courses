/*
 this script contains the implementation of get & post function 
 get(IDENTIFIER, dataObj, successCallback, failedCallback)
    role: 
        provide get and post functions 
        do required processing on the data like (validation, formatting, ..)
        pass the request to the server
        respond according to the status respond (success, failed)

    functions:
        external: get, post
        internal: editTaskSDK
        requestBackEnd:
            recieves every service, request the call on respond the success or failed sent for each service request
            after all services callback called , it calls an optional finalCallback function

*/
 

import { IDENTIFIERS, LABELS } from '../constants.js';
import { servicesRequests } from '../connection.js';
import { mongoIDToISOTime, missingProperties, hoursDifference } from './sdkUtils.js';



let functionMapper = new Map([
    [IDENTIFIERS.USERS.USERS, Users],


    [IDENTIFIERS.NOTIFICATIONS.NEW_NOTIFICATION, newNotification],
    [IDENTIFIERS.NOTIFICATIONS.NOTIFICATION_FOR_STUDENT, notificationsForStudent],
    [IDENTIFIERS.NOTIFICATIONS.ALL_NOTIFICATIONS, allNotifications],
    [IDENTIFIERS.NOTIFICATIONS.NOTIFICATION_DELETE, notificationDelete],
    [IDENTIFIERS.NOTIFICATIONS.NOTIFICATION_DELIVERED, notificationDelivered],


    [IDENTIFIERS.COURSES.INSTRUCTORS.NEW, newInstructor],
    [IDENTIFIERS.COURSES.INSTRUCTORS.FILTER, instructorsFilter],
    [IDENTIFIERS.COURSES.INSTRUCTORS.DELETE_INSTRUCTOR, deleteInstructor],
    [IDENTIFIERS.COURSES.INSTRUCTORS.INSTRUCTOR, instructor],
    [IDENTIFIERS.COURSES.INSTRUCTORS.EDIT_INSTRUCTOR, editInstructor],
    [IDENTIFIERS.COURSES.INSTRUCTORS.GET_COURSES_INSTRUCTORID, coursesByInstructorID],

    [IDENTIFIERS.COURSES.STUDENTS.NEW, newStudent],
    [IDENTIFIERS.COURSES.STUDENTS.FILTER, studentsFilter],
    [IDENTIFIERS.COURSES.STUDENTS.ADD_COURSE, addCoursesForStudent],
    [IDENTIFIERS.COURSES.STUDENTS.REMOVE_COURSE, removeCoursesForStudent],
    [IDENTIFIERS.COURSES.STUDENTS.DELETE_STUDENT, deleteStudent],
    [IDENTIFIERS.COURSES.STUDENTS.STUDENT, student],
    [IDENTIFIERS.COURSES.STUDENTS.EDIT_STUDENT, editStudent],
    [IDENTIFIERS.COURSES.STUDENTS.DEACTIVAE_STUDENT, DeactivateStudent],
    [IDENTIFIERS.COURSES.STUDENTS.STUDENT_BLOCK_LIST, StudentBlockList],

    [IDENTIFIERS.COURSES.COURSES.NEW, newCourse],
    [IDENTIFIERS.COURSES.COURSES.FILTER, coursesFilter],
    [IDENTIFIERS.COURSES.COURSES.ADD_LECTURE, addLecture],
    [IDENTIFIERS.COURSES.COURSES.DELETE_LECTURE, deleteLecture],
    [IDENTIFIERS.COURSES.COURSES.COURSE_STUDENTS, courseStudents],
    [IDENTIFIERS.COURSES.COURSES.LECTURE, Lecture],
    [IDENTIFIERS.COURSES.COURSES.COURSE, course],
    [IDENTIFIERS.COURSES.COURSES.EDIT, editCourseSDK],
    [IDENTIFIERS.COURSES.COURSES.INSERT_VIDEO_CURRENT_TIME, insertVideoCurrentTime],
    [IDENTIFIERS.COURSES.COURSES.VIDEO_CURRENT_TIME, videoCurrentTime],
    [IDENTIFIERS.COURSES.COURSES.LAST_LECTURE, lastLecture],


    [IDENTIFIERS.COURSES.COURSES.ADD_TO_CART, addToCart],
    [IDENTIFIERS.COURSES.COURSES.ADD_TO_WISHLIST, addToWishList],
    [IDENTIFIERS.COURSES.COURSES.REMOVE_FROM_CART, removeFromCart],
    [IDENTIFIERS.COURSES.COURSES.REMOVE_FROM_WISHLIST, removeFromWishList],
    [IDENTIFIERS.COURSES.COURSES.STUDENT_WISHLIST, studentWishList],
    [IDENTIFIERS.COURSES.COURSES.STUDENT_CART, studentCart],
    [IDENTIFIERS.COURSES.COURSES.COURSE_LAST_CART_STATE, courseCartState],
    [IDENTIFIERS.COURSES.COURSES.COURSE_LAST_STATE, courseLastState],
    [IDENTIFIERS.COURSES.COURSES.APPROVE_PURCHASE, approvePurchase],



    /* HOSSAM VERSION */
    //Courses
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.UNIVERSITIES, unversitiesSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_UNIVERSITY, newunversitiesSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_UNIVERSITY, editUniversitySDK],

    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.FACULTIES, facultiesSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_FACULTY, newFacultySDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_FACULTY, editFacultySDK],

    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.DEPARTMENTS, departmentsSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_DEPARTMENT, newDepartmentSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_DEPARTMENT, editDepartmentSDK],

    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.SECTIONS, sectionsSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_SECTION, newSectionSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_SECTION, editSectionSDK],

    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.YEARS, yearsSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_YEAR, newYearSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_YEAR, editYearSDK],

    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.TERMS, termsSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_TERM, newTermSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_TERM, editTermSDK],

    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.SUBJECTS, subjectsSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_SUBJECT, newSubjectSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_SUBJECT, editSubjectSDK],


    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.COURSE_TREES, AllCourseTrees],


    //CGroups
    [IDENTIFIERS.COURSES.GROUPS.NEW_GROUP, newGroupSDK],
    [IDENTIFIERS.COURSES.GROUPS.GROUPS, groupsSDK],
    [IDENTIFIERS.COURSES.GROUPS.EDIT_GROUP, editGroupsSDK],
    /* HOSSAM VERSION */

    // FOR STUDENT WEB VIEW (IOS)
    [IDENTIFIERS.COURSES.COURSES.STUDENT_MY_COURSES, studentMyCoursesSDK],
    [IDENTIFIERS.COURSES.COURSES.MOBILE.APP_VERSIONS, appVersions],
    [IDENTIFIERS.COURSES.COURSES.MOBILE.LAST_VALID_VERSIONS, lastValidVersions],
    [IDENTIFIERS.COURSES.COURSES.MOBILE.NEW_APP_VERSION, newAppVersion],
    [IDENTIFIERS.COURSES.COURSES.MOBILE.ADD_VALID_VERSIONS, addValidVersions],
    [IDENTIFIERS.COURSES.COURSES.MOBILE.REMOVE_VALID_VERSION, removeValidVersions],
    [IDENTIFIERS.COURSES.COURSES.MOBILE.REMOVE_VERSION, removeVersion],
]);


export function get(IDENTIFIER, dataObj, success, fail) {
    functionMapper.get(IDENTIFIER)(dataObj, success, fail);
};

export function post(IDENTIFIER, dataObj, success, fail) {
    functionMapper.get(IDENTIFIER)(dataObj, success, fail);
};

/* ============================================== */
function requestBackEnd(servicesObjects, finalCallback) {

    let servicesArray = [];
    let servicesMap = new Map();

    for (let serviceObject of servicesObjects) {
        servicesArray.push({serviceID: serviceObject.serviceID, data: serviceObject.data });
        servicesMap.set(serviceObject.serviceID, serviceObject);
    }


    function postServicesRespond(recievedEnvelope) {
      
        for (let service of recievedEnvelope.servicesResponds) {
            let serviceObject = servicesMap.get(service.serviceID);
            
            if (service.status == "SUCCESS") {
                console.log(JSON.stringify(service.status));
                serviceObject.successCallback(service.data);
            } else {
                console.log("SDK: service responded failed, recieved object: \n" + JSON.stringify(service));
                serviceObject.failedCallback(service.data);
            }
        }
        if (finalCallback != undefined) {
            finalCallback();
        }
    }

    servicesRequests(servicesArray, postServicesRespond);
}


/* ============================================== */

/**
 * to submit new student IDENTIFIERS.COURSES.STUDENTS.NEW
 */
function newStudent(data, success, fail) {
    // validation.
    let missing = missingProperties(['mID', 'name', 'primaryMobile', "password"], data);
    if (missing != false) {
        fail({
            err: "missing properties: " + JSON.stringify(missing),
            userMsg: LABELS.FRONT_END.INTERNAL_ERROR
        });
        return;
    }

    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.STUDENTS.NEW,
        data: data,
        successCallback: (result) => {
            success();
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    requestBackEnd(servicesObject);
};

function studentsFilter(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.STUDENTS.FILTER,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
};

function addCoursesForStudent(data, success, fail) {
    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.STUDENTS.ADD_COURSE,
        data: data,
        successCallback: (result) => {
            success();
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    requestBackEnd(servicesObject);
};

function removeCoursesForStudent(data, success, fail) {
    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.STUDENTS.REMOVE_COURSE,
        data: data,
        successCallback: (result) => {
            success();
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    requestBackEnd(servicesObject);
};

/**
 * to submit new course IDENTIFIERS.COURSES.COURSES.NEW
 */
function newCourse(data, success, fail) {
    // validation.
    // let missing = missingProperties(['name', 'faculty', "university", 'term', 'year', 'subject', 'instructor'], data);
    // console.log(missing);
    // if (missing != false) {
    //     fail({
    //         err: "missing properties: " + JSON.stringify(missing),
    //         userMsg: LABELS.FRONT_END.INTERNAL_ERROR
    //     });
    //     return;
    // }
    console.log(data);

    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.NEW,
        data: data,
        successCallback: (result) => {
            success();
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    requestBackEnd(servicesObject);
};

// REQUIRES FILTER OBJECT AS CONSTANTS
function coursesFilter(data, success, fail) {

    console.log(JSON.stringify(data));

    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.FILTER,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
};

/**
 * [student description]
 * IDENTIFIERS.COURSES.STUDENTS.DELETE_STUDENT
 * @param  {[type]} data    require: {studentMID}
 * @param  {[type]} success 
 * @param  {[type]} fail    [description]
 * @return {[type]}         [description]
 */
function deleteStudent(data, success, fail) {
    // HELPERS
    function invalidData(missing) {
        fail({
            err: "Missing properties in deleteSubtaskChecklist " + JSON.stringify(missing),
            userMsg: LABELS.FRONT_END.INTERNAL_ERROR
        })
    }
    // VALIDATION
    let missing = missingProperties(['studentMID'], data);
    if (missing != false) {
        invalidData(missing);
        return;
    }
    // backend
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.STUDENTS.DELETE_STUDENT,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            //console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
};

/**
 * [student description]
 * IDENTIFIERS.COURSES.STUDENTS.STUDENT
 * @param  {[type]} data    require: {studentMID}
 * @param  {[type]} success 
 * @param  {[type]} fail    [description]
 * @return {[type]}         [description]
 */
function student(data, success, fail) {
    // HELPERS
    function invalidData(missing) {
        fail({
            err: "Missing properties in deleteSubtaskChecklist " + JSON.stringify(missing),
            userMsg: LABELS.FRONT_END.INTERNAL_ERROR
        })
    }
    // VALIDATION
    let missing = missingProperties(['studentMID'], data);
    if (missing != false) {
        invalidData(missing);
        return;
    }
    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.STUDENTS.STUDENT,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    requestBackEnd(servicesObject);
};

/**
 * [edit student description]
 * IDENTIFIERS.COURSES.STUDENTS.STUDENT
 * @param  {[type]} data    require: {studentMID}
 * @param  {[type]} success 
 * @param  {[type]} fail    [description]
 * @return {[type]}         [description]
 */
function editStudent(data, success, fail) {
    /* // HELPERS
    function invalidData(missing) {
        fail({
            err: "Missing properties in deleteSubtaskChecklist " + JSON.stringify(missing),
            userMsg: LABELS.FRONT_END.INTERNAL_ERROR
        })
    }
    // VALIDATION
    let missing = missingProperties(['studentMID'], data);
    if (missing != false) {
        invalidData(missing);
        return;
    } */
    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.STUDENTS.EDIT_STUDENT,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    requestBackEnd(servicesObject);
};

function DeactivateStudent(data, success, fail) {
    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.STUDENTS.DEACTIVAE_STUDENT,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    requestBackEnd(servicesObject);
};


/**
 * to submit new instructor IDENTIFIERS.COURSES.INSTRUCTORS.NEW
 */
function newInstructor(data, success, fail) {
    // validation.
    // let missing = missingProperties(['name', 'primaryMobile', "password"], data);
    // if (missing != false) {
    //     fail({
    //         err: "missing properties: " + JSON.stringify(missing),
    //         userMsg: LABELS.FRONT_END.INTERNAL_ERROR
    //     });
    //     return;
    // }
    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.INSTRUCTORS.NEW,
        data: data,
        successCallback: (result) => {
            success();
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    console.log(servicesObject);
    requestBackEnd(servicesObject);
};

function instructorsFilter(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.INSTRUCTORS.FILTER,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
};

/**
 * [delete instructor description]
 * IDENTIFIERS.COURSES.INSTRUCTORS.DELETE_INSTRUCTOR
 * @param  {[type]} data    require: {instructorMID}
 * @param  {[type]} success 
 * @param  {[type]} fail    [description]
 * @return {[type]}         [description]
 */
function deleteInstructor(data, success, fail) {
    // HELPERS
    function invalidData(missing) {
        fail({
            err: "Missing properties in deleteInstructor " + JSON.stringify(missing),
            userMsg: LABELS.FRONT_END.INTERNAL_ERROR
        })
    }
    // VALIDATION
    let missing = missingProperties(['instructorMID'], data);
    if (missing != false) {
        invalidData(missing);
        return;
    }
    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.INSTRUCTORS.DELETE_INSTRUCTOR,
        data: data,
        successCallback: (result) => {
            success();
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    requestBackEnd(servicesObject);
};

/**
 * [instructor description]
 * IDENTIFIERS.COURSES.INSTRUCTORS.INSTRUCTOR
 * @param  {[type]} data    require: {instructorMID}
 * @param  {[type]} success 
 * @param  {[type]} fail    [description]
 * @return {[type]}         [description]
 */
function instructor(data, success, fail) {
    // HELPERS
    function invalidData(missing) {
        fail({
            err: "Missing properties in instructor " + JSON.stringify(missing),
            userMsg: LABELS.FRONT_END.INTERNAL_ERROR
        })
    }
    // VALIDATION
    let missing = missingProperties(['instructorMID'], data);
    if (missing != false) {
        invalidData(missing);
        return;
    }
    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.INSTRUCTORS.INSTRUCTOR,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    requestBackEnd(servicesObject);
};



/**
 * [instructor description]
 * IDENTIFIERS.COURSES.INSTRUCTORS.GET_COURSES_INSTRUCTORID
 * @param  {[type]} data    require: {instructorMID}
 * @param  {[type]} success 
 * @param  {[type]} fail    [description]
 * @return {[type]}         [description]
 */
 function coursesByInstructorID(data, success, fail) {
    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.INSTRUCTORS.GET_COURSES_INSTRUCTORID,
        data: data,
        successCallback: (result) => {
            console.log("Front.js testing the result" + JSON.stringify(result))
            success(result);
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    requestBackEnd(servicesObject);
};



    // // HELPERS
    // function invalidData(missing) {
    //     fail({
    //         err: "Missing properties in instructor " + JSON.stringify(missing),
    //         userMsg: LABELS.FRONT_END.INTERNAL_ERROR
    //     })
    // }
    // // VALIDATION
    // let missing = missingProperties(['instructorMID'], data);
    // if (missing != false) {
    //     invalidData(missing);
    //     return;
    // }

/**
 * [edit instructor description]
 * IDENTIFIERS.COURSES.INSTRUCTORS.EDIT_INSTRUCTOR
 * @param  {[type]} data    require: {instructorMID}
 * @param  {[type]} success 
 * @param  {[type]} fail    [description]
 * @return {[type]}         [description]
 */
function editInstructor(data, success, fail) {
    /* // HELPERS
    function invalidData(missing) {
        fail({
            err: "Missing properties in deleteSubtaskChecklist " + JSON.stringify(missing),
            userMsg: LABELS.FRONT_END.INTERNAL_ERROR
        })
    }
    // VALIDATION
    let missing = missingProperties(['studentMID'], data);
    if (missing != false) {
        invalidData(missing);
        return;
    } */
    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.INSTRUCTORS.EDIT_INSTRUCTOR,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    requestBackEnd(servicesObject);
};


function addLecture(data, success, fail) {
    // HELPERS
    function invalidData(missing) {
        fail({
            err: "Missing properties in addLectureToCourse " + JSON.stringify(missing),
            userMsg: LABELS.FRONT_END.INTERNAL_ERROR
        })
    };

    // VALIDATION
    let missing = missingProperties(['courseID', 'title', 'video', 'number'], data);
    if (missing != false) {
        invalidData(missing);
        return;
    };

    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.ADD_LECTURE,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    requestBackEnd(servicesObject);
};

/**
 * [course description]
 * IDENTIFIERS.COURSES.COURSES.COURSE
 * @param  {[type]} data    require: {studentMID}
 * @param  {[type]} success 
 * @param  {[type]} fail    [description]
 * @return {[type]}         [description]
 */
function course(data, success, fail) {
    // HELPERS
    function invalidData(missing) {
        fail({
            err: "Missing properties in deleteSubtaskChecklist " + JSON.stringify(missing),
            userMsg: LABELS.FRONT_END.INTERNAL_ERROR
        })
    }
    // VALIDATION
    let missing = missingProperties(['courseID'], data);
    if (missing != false) {
        invalidData(missing);
        return;
    }
    // backend
    let servicesObject = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSE,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            });
        }
    }]
    requestBackEnd(servicesObject);
};
/* HOSSAM V */

function unversitiesSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.UNIVERSITIES,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function newunversitiesSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_UNIVERSITY,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function facultiesSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.FACULTIES,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function newFacultySDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_FACULTY,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function yearsSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.YEARS,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function newYearSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_YEAR,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function termsSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.TERMS,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function newTermSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_TERM,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function subjectsSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.SUBJECTS,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function newSubjectSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_SUBJECT,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function newGroupSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.GROUPS.NEW_GROUP,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function groupsSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.GROUPS.GROUPS,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function editGroupsSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.GROUPS.EDIT_GROUP,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

/*
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.DEPARTMENTS, departmentsSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_DEPARTMENT, newDepartmentSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.SECTIONS, sectionsSDK],
    [IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_SECTION, newSectionSDK],
 */

function departmentsSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.DEPARTMENTS,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function newDepartmentSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_DEPARTMENT,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function sectionsSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.SECTIONS,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function newSectionSDK(data, success, fail) {
    // BACKEND
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_SECTION,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}
/* END HOSSAM V1*/

function editCourseSDk(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.EDIT_COURSE,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function editUniversitySDK(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_UNIVERSITY,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function editFacultySDK(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_FACULTY,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function editDepartmentSDK(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_DEPARTMENT,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function editSectionSDK(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_SECTION,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function editYearSDK(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_YEAR,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function editTermSDK(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_TERM,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function editSubjectSDK(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_SUBJECT,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function editCourseSDK(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.EDIT,
        data: data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function AllCourseTrees(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.COURSE_TREES,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function deleteLecture(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.DELETE_LECTURE,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}



function courseStudents(data, success, fail) {
    console.log("hereeeeeeee");
    console.log("data in front.js:" + JSON.stringify(data));
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSE_STUDENTS,
        data,
        successCallback: (result) => {
            console.log("in Front js : "+JSON.stringify(result));
            success(result);
        },
        failedCallback: (err) => {
            console.log("ACHTUNG!!!!: " +err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]


    requestBackEnd(servicesObjects);
}


function Lecture(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.LECTURE,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function studentMyCoursesSDK(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.STUDENT_MY_COURSES,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function Users(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.USERS.USERS,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function insertVideoCurrentTime(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.INSERT_VIDEO_CURRENT_TIME,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function videoCurrentTime(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.VIDEO_CURRENT_TIME,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function lastLecture(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.LAST_LECTURE,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function addToCart(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.ADD_TO_CART,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function addToWishList(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.ADD_TO_WISHLIST,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function removeFromCart(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.REMOVE_FROM_CART,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function removeFromWishList(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.REMOVE_FROM_WISHLIST,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function studentWishList(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.STUDENT_WISHLIST,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function studentCart(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.STUDENT_CART,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function courseCartState(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSE_LAST_CART_STATE,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function courseLastState(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.COURSE_LAST_STATE,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function approvePurchase(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.APPROVE_PURCHASE,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function newNotification(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.NOTIFICATIONS.NEW_NOTIFICATION,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            //console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function notificationsForStudent(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.NOTIFICATIONS.NOTIFICATION_FOR_STUDENT,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            //console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function allNotifications(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.NOTIFICATIONS.ALL_NOTIFICATIONS,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            //console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function notificationDelete(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.NOTIFICATIONS.NOTIFICATION_DELETE,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            //console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}
function notificationDelivered(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.NOTIFICATIONS.NOTIFICATION_DELIVERED,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            //console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}
function appVersions(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.MOBILE.APP_VERSIONS,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            //console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function lastValidVersions(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.MOBILE.LAST_VALID_VERSIONS,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            //console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function newAppVersion(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.MOBILE.NEW_APP_VERSION,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            //console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function addValidVersions(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.MOBILE.ADD_VALID_VERSIONS,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            //console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function removeValidVersions(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.MOBILE.REMOVE_VALID_VERSION,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            //console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function removeVersion(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.COURSES.MOBILE.REMOVE_VERSION,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            //console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}

function StudentBlockList(data, success, fail) {
    let servicesObjects = [{
        serviceID: IDENTIFIERS.COURSES.STUDENTS.STUDENT_BLOCK_LIST,
        data,
        successCallback: (result) => {
            success(result);
        },
        failedCallback: (err) => {
            //console.log(err);
            fail({
                err: err,
                userMsg: LABELS.SERVER.SERVER_RESPOND.ERROR
            })
        }
    }]
    requestBackEnd(servicesObjects);
}