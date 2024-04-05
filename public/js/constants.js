export const IDENTIFIERS = {
    TEST: {
        // for email & web push notification
        DELAYED_NOTIFICATION: "00N00",
    },
    ACCESSIBILITIES: {
        // NEW, VIEW: {ALL, CUSTOM}, EDIT: {ALL, CUSTOM}, DELETE: {ALL, CUSTOM}

    },

    CONSTANTS: {
        COST: {
            /**
             * IDENTIFIERS.CONSTANTS.COST.CATEGORIES
             * require: {},
             * gives: [{
             *     _id,
             *     vID,
             *     description: {
             *         last,
             *         history
             *     },
             *     name: {last, history},
             *     subcategories: [{
             *         _id,
             *         vID,
             *         description: {last, history},
             *         name: {last, history}
             *     }]
             * }]
             * @type {String}
             */
            CATEGORIES: '00C01',
            /**
             * IDENTIFIERS.CONSTANTS.COST.NEW_CATEGORY
             * requires: {
             *     vID,
             *     name,
             *     description
             * }
             *
             * fails if vID not unique
             * @type {String}
             */
            NEW_CATEGORY: '00C02',
            /**
             * IDENTIFIERS.CONSTANTS.COST.NEW_SUBCATEGORY
             * requires: {
             *     categoryVID,
             *     vID,
             *     name,
             *     description
             * }
             * @type {String}
             */
            NEW_SUBCATEGORY: '00C03',


        },

        STATICS: {
            /**
             * IDENTIFIERS.CONSTANTS.STATICS.LIST_BY_NAME
             * requires: {
             *     name: ''// collection name from template field list props.src
             * }
             *
             * gives: [{
             *     _id,
             *     en, // name in en
             *     ar, 
             *     .. other attributes according each list
             * }]
             * 
             */
            LIST_BY_NAME: '00C04',

        }
    },

    NOTIFICATIONS: { // 00N00
        /**
         * IDENTIFIERS.NOTIFICATIONS.NEW_NOTIFICATION
         * requires: {students, message, dateTime}
         * 
         * 
         * @type {String}
         */
        NEW_NOTIFICATION: '00N.1',

        /**
         * IDENTIFIERS.NOTIFICATIONS.NOTIFICATION_FOR_STUDENT
         * requires:{}
         * 
         * give:{message , dateTime}
         * 
         * @type {String}
         */
        NOTIFICATION_FOR_STUDENT: '00N.2',

        /**
         * IDENTIFIERS.NOTIFICATIONS.NOTIFICATION_DELIEVRED
         * 
         * 
         * requires:{delivered:0/1 , notificationsIDs}
         * 
         * @type {String}
         */
        NOTIFICATION_DELIVERED: '00N.3',

        /**
         * IDENTIFIERS.NOTIFICATIONS.NOTIFICATION_DELIVERED
         * 
         * 
         * require:{read:0/1 , notificationID}
         * 
         * @type {String}
         */
        NOTIFICATION_READ: '00N.4',
        NOTIFICATION_DELETE: '00N.5',
        NOTIFICATION_STATUS_DELETE: '00N.6',

        /**
         * IDENTIFIERS.NOTIFICATIONS.ALL_NOTIFICATIONS
         * requires:{}
         * 
         * 
         * 
         * @type {String}
         */
        ALL_NOTIFICATIONS: '00N.7',

    },

    USERS: {
        USERS: "00U01"
    },

    COURSES: {
        INSTRUCTORS: {
            /**
             * [NEW description]
             * requires: {
             *     name,
             *     mobile
             * }
             * optional: {
             *     name,
             *     mobile,
             *     email,
             *     password
             * }
             * @type {String}
             */
            NEW: '00C.I.1',

            /**
             * [FILTER description]
             * requires: {}
             * @type {String}
             */
            FILTER: '00C.I.2',


            /**
             * [instructor description]
             * delete instructor
             * requires: {
             * instructorMID,
             * 
             * }
             * 
             * @type {String}
             */
            INSTRUCTOR: '00C.I.3',

            /**
             * [edit_instructor description]
             * delete instructor
             * requires: {
             * instructorMID,
             * 
             * }
             * 
             * @type {String}
             */
            EDIT_INSTRUCTOR: '00C.I.4',
            /**
             * [DELETE_INSTRUCTOR description]
             * delete INSTRUCTOR
             * requires: {
             * instructorMID,
             * 
             * }
             * 
             * @type {String}
             */
            DELETE_INSTRUCTOR: '00C.I.5',

            /**
             * [ADD_COURSE description]
             * requires: {
             *     courseID,
             * }
             * @type {String}
             */
            ADD_COURSE: '',

            GET_COURSES_INSTRUCTORID: '00C.T.6'
        },
        GROUPS: {
            /**
             * for creating new group
             * requires: {
             *     name
             * }
             * @type {String}
             */
            NEW_GROUP: '0CR11',

            /**
             * go get groups list with id & name
             * gives: [{
             *     _id,
             *     name
             * }]
             * @type {String}
             */
            GROUPS: '0CR12',

            /**
             * requires: {
             *     groupID,
             *     name: '', // new name to be edited
             * }
             * @type {String}
             */
            EDIT_GROUP: '0CR13',

        },

        STUDENTS: {

            /**
             * [NEW description]
             * requires: {
             *     name,
             *     mobile,
             *     email,
             *     password
             * }
             * optional:{}
             * @type {String}
             */
            NEW: '00C.S.1',

            /**
             * [FILTER description]
             * list
             * // depending on the logged in user, the courses list will be shown,
             * 
             * requires: {
             *     pageNumber,
             *     pageSize,
             *     filterOptions: [{
             *         fieldID, // field NAME (key) SAME AS THE SCHEMA 
             *         sort: {
             *             order: 1/-1, // 1 for increasing sort, & -1 for decreasing sort(greater to smaller)
             *         },
             *         select: { // multi- select
             *            items: [''], // ex: select users in to field: ['userID1', 'userID2']
             *         },
             *         search: {
             *             input: '', // input user typed to search for
             *         },
             *         range: {
             *             from: '',
             *             to: ''
             *         }
             *     }],
             *     projections: ['fieldID']
             * }
             * gives: {
             *     pages: // total number of pages
             *     result: [{STUDENT data with _id}]
             * }
             * 
             * @type {String}
             */
            FILTER: '00C.S.2',

            /**
             * [ADD_COURSE description]
             * add course for specific student
             * requires: {
             * studentID,
             * courses:[{courseID, from, to, subscribeToZoom, replay, unlimited, notes}],
             * 
             * }
             * 
             * @type {String}
             */
            ADD_COURSE: '00C.S.3',

            /**
             * [DELETE_STUDENT description]
             * delete student
             * requires: {
             * studentMID,
             * 
             * }
             * 
             * @type {String}
             */
            DELETE_STUDENT: '00C.S.4',

            /**
             * [student description]
             * delete student
             * requires: {
             * studentMID,
             * }
             * 
             * give : {
             *  mID,
             *  name,
             *  primaryMobile,
             *  primaryWhatsapp:true / false,
             *  secondaryMobile,
             *  
             * }
             * @type {String}
             */
            STUDENT: '00C.S.5',

            /**
             * [edit_student description]
             * delete student
             * requires: {
             * studentMID,
             * 
             * }
             * 
             * @type {String}
             */
            EDIT_STUDENT: '00C.S.6',

            /**
             * [DEACTIVAE_STUDENT description]
             * delete student
             * requires: {reason:''}
             * 
             * @type {String}
             */
            DEACTIVAE_STUDENT: '00C.S.7',
            /**
             * [REMOVE_COURSE description]
             * add course for specific student
             * requires: {
             * studentID,
             * coursesID,
             * 
             * }
             * 
             * @type {String}
             */
             REMOVE_COURSE: '00C.S.8',

             /**
             * [STUDENT_BLOCK_LIST description]
             * add course for specific student
             * requires: {
             * studentID,
             * }
             * 
             * @type {String}
             */
              STUDENT_BLOCK_LIST: '00C.S.9',

        },

        COURSES: {
            MOBILE: {
                // should be in students

                /**
                * [APP_VERSION description]
                * 
                * update last valid versoin in mobile.android &/or ios
                * 
                * requires: {
                *     android: 'last app valid version number', // one to require update for all students with android access
                *     ios: 'last app valid version number'
                * } or{
                *     android: 'last app valid version number', // one to require update for all students with android access
                * }or {
                *     ios: 'last app valid version number'
                * }
                * @type {String}
                */
                NEW_APP_VERSION: '00C1',

                /**
                * [APP_VERSIONS description]

                * give: {
                *     android: [],
                *     ios: []
                * }
                * @type {String}
                */
                APP_VERSIONS: '00C2',

                DELETE_VERSION: '00C3',
                /**
                 * to give requester that mobile app requires update
                 * database: collection name: mobile, only one document has android & ios fields
                 *     mobile: {
                 *             android: {
                 *                 lastValidVersion: 'last app valid version number',
                 *             }
                 *             ios: {
                 *                 lastValidVersion: 'last app valid version number'
                 *             }
                 *         }
                 *     }
                 * 
                 * {
                 * 
                 * }
                 * require: {}
                 * gives: {
                 *     android: 'last app valid version number',
                 *     ios: 'last app valid version number'
                 * }
                 * 
                 * @type {String}
                 */
                LAST_VALID_VERSIONS: '00C4',

                /**
                 * [CHANGE_LAST_VALID_VERSION description]
                 * 
                 * update last valid versoin in mobile.android &/or ios
                 * 
                 * requires: {
                 *     android: 'last app valid version number', // one to require update for all students with android access
                 *     ios: 'last app valid version number'
                 * }
                 * @type {String}
                 */
                ADD_VALID_VERSIONS: '00C5',

                /**
                 * [REMOVE_VALID_VERSION description]
                 * 
                 * remove last valid versoin in mobile.android &/or ios
                 * 
                 * requires: {
                 *     ios/android:""
                 * }
                 * @type {String}
                 */
                REMOVE_VALID_VERSION: '00C6',
                /**
                 * [REMOVE_VERSION description]
                 * 
                 * remove last valid versoin in mobile.android &/or ios
                 * 
                 * requires: {
                 *     ios/android:""
                 * }
                 * @type {String}
                 */
                 REMOVE_VERSION: '00C7',
            },
            COURSES_TREE: {

                /**
                 * [COURSE_TREES description]\
                 * requires: {}
                 * gives: {
                 *    universities:{
                 *       _id,
                 *       name,
                 *       logoURL
                 *     },
                 *    faculties:{
                 *       _id,
                 *       name,
                 *       logoURL
                 *     },
                 *    departments:{
                 *       _id,
                 *       name,
                 *       logoURL
                 *     },
                 *    sections:{
                 *       _id,
                 *       name,
                 *       logoURL
                 *     },
                 *    years:{
                 *        _id,
                 *        name
                 *      },
                 *    terms:{
                 *        _id,
                 *        name
                 *      },
                 *    subjects:{
                 *        _id,
                 *        name,
                 *        logoURL
                 *      },
                 * }
                 * @type {String}
                 */
                COURSE_TREES: "0CR25",

                /**
                 * [UNIVERSITIES description]\
                 * requires: {}
                 * gives: [{
                 *     _id,
                 *     name,
                 *     logoURL
                 * }]
                 * @type {String}
                 */
                UNIVERSITIES: '0CR01',
                /**
                 * [NEW_UNIVERSITY description]
                 * requires: {
                 *     name,
                 * }
                 * optional: {
                 *     name,
                 *     hidden: 1/0 // to be created hidden from the beginning
                 * }
                 * @type {String}
                 */
                NEW_UNIVERSITY: '0CR02',

                /**
                 * [EDIT_UNIVERSITY description]
                 * requires: {
                 *     universityID,
                 * }
                 * optional: {
                 *     universityID,
                 *     name,
                 *     logoURL, // will remove last logo url
                 *     hidden: 1/0, // hide or view it from students
                 *     deleted: 1, // hide this university only without it's descendants
                 * }
                 * 
                 * @type {String}
                 */
                EDIT_UNIVERSITY: '0CR18',

                /**
                 * [FACULTIES description]
                 * requires: {
                 *     universityID
                 * }
                 * gives: [{
                 *     _id,
                 *     name,
                 *     logoURL
                 * }]
                 * @type {String}
                 */
                FACULTIES: '0CR03',
                /**
                 * [NEW_FACULTY description]
                 * requires: {
                 *     name,
                 *     universityID,
                 *     ****************************
                 * }
                 * @type {String}
                 */
                NEW_FACULTY: '0CR04',

                /**
                 * [EDIT_FACULTY description]
                 * requires: {
                 *     facultyID,
                 * }
                 * optional: {
                 *     facultyID,
                 *     name,
                 *     logoURL, // will remove last logo url
                 *     hidden: 1/0, // hide or view it from students
                 *     deleted: 1, // hide this faculty only without it's descendants
                 * }
                 * @type {String}
                 */
                EDIT_FACULTY: '0CR19',

                /**
                 * [DEPARTMENTS description]
                 * requires: {
                 *     facultyID
                 * }
                 * @type {String}
                 */
                DEPARTMENTS: '0CR14',
                /**
                 * [NEW_DEPARTMENT description]
                 * requires: {
                 *     facultyID,
                 *     name
                 * }
                 * @type {String}
                 */
                NEW_DEPARTMENT: '0CR15',
                /**
                 * [EDIT_DEPARTMENT description]
                 * requires: {
                 *     departmentID,
                 * }
                 * optional: {
                 *     departmentID,
                 *     name,
                 *     logoURL, // will remove last logo url
                 *     hidden: 1/0, // hide or view it from students
                 *     deleted: 1, // hide this department only without it's descendants
                 * }
                 * @type {String}
                 */
                EDIT_DEPARTMENT: '0CR20',


                /**
                 * [SECTIONS description]
                 * requires: {
                 *     departmentID
                 * }
                 * 
                 * @type {String}
                 */
                SECTIONS: '0CR16',
                /**
                 * [NEW_SECTION description]
                 * requires: {
                 *     departmentID,
                 *     name
                 * }
                 * @type {String}
                 */
                NEW_SECTION: '0CR17',
                /**
                 * [EDIT_SECTION description]
                 * requires: {
                 *     sectionID,
                 * }
                 * optional: {
                 *     sectionID,
                 *     name,
                 *     logoURL, // will remove last logo url
                 *     hidden: 1/0, // hide or view it from students
                 *     deleted: 1, // hide this section only without it's descendants
                 * }
                 * @type {String}
                 */
                EDIT_SECTION: '0CR21',


                /**
                 * [YEARS description]
                 * requires: {
                 *     sectionID
                 * }
                 * gives: [{
                 *     _id,
                 *     name,
                 *     
                 * }]
                 * @type {String}
                 */
                YEARS: '0CR05',
                /**
                 * [NEW_YEAR description]
                 * requires: {
                 *     sectionID,
                 *     name,
                 * }
                 * @type {String}
                 */
                NEW_YEAR: '0CR06',
                /**
                 * [EDIT_YEAR description]
                 * requires: {
                 *     yearID,
                 * }
                 * optional: {
                 *     yearID,
                 *     name,
                 *     logoURL, // will remove last logo url
                 *     hidden: 1/0, // hide or view it from students
                 *     deleted: 1, // hide this year only without it's descendants
                 * }
                 * @type {String}
                 */
                EDIT_YEAR: '0CR22',


                /**
                 * [TERMS description]
                 * requires: {
                 *     yearID,
                 *     
                 * }
                 * gives: [{
                 *     _id,
                 *     name,
                 * }]
                 * @type {String}
                 */
                TERMS: '0CR07',
                /**
                 * [NEW_TERM description]
                 * requires: {
                 *     yearID,
                 *     name
                 * }
                 * @type {String}
                 */
                NEW_TERM: '0CR08',

                /**
                 * [EDIT_TERM description]
                 * requires: {
                 *     termID,
                 * }
                 * optional: {
                 *     termID,
                 *     name,
                 *     logoURL, // will remove last logo url
                 *     hidden: 1/0, // hide or view it from students
                 *     deleted: 1, // hide this term only without it's descendants
                 * }
                 * @type {String}
                 */
                EDIT_TERM: '0CR23',

                /**
                 * [SUBJECTS description]
                 * requires: {
                 *     termID
                 * }
                 *
                 * gives: [{
                 *     _id,
                 *     name,
                 *     logoURL
                 * }]
                 * @type {String}
                 */
                SUBJECTS: '0CR09',
                /**
                 * [NEW_SUBJECT description]
                 * requires: {
                 *     termID,
                 *     name
                 * }
                 * @type {String}
                 */
                NEW_SUBJECT: '0CR10',
                /**
                 * [EDIT_SUBJECT description]
                 * requires: {
                 *     subjectID,
                 * }
                 * optional: {
                 *     subjectID,
                 *     name,
                 *     logoURL, // will remove last logo url
                 *     hidden: 1/0, // hide or view it from students
                 *     deleted: 1, // hide this subject only without it's descendants
                 * }
                 * @type {String}
                 */
                EDIT_SUBJECT: '0CR24',

                /**
                 * [DEPARTMENTS description]
                 * requires: {
                 *     facultyID
                 * }
                 * gives: [{
                 *     _id,
                 *     name,
                 *     logoURL
                 * }]
                 * @type {String}
                 */
                DEPARTMENTS: '0CR14',
                /**
                 * [DEPARTMENTS description]
                 * requires: {
                 *     facultyID
                 * }
                 * gives: [{
                 *     _id,
                 *     name,
                 *     
                 * }]
                 * @type {String}
                 */
                NEW_DEPARTMENT: '0CR15',
                /**
                 * [SECTIONS description]
                 * requires: {
                 *     departmentID
                 * }
                 * gives: [{
                 *     _id,
                 *     name,
                 * logoURL
                 *     
                 * }]
                 * @type {String}
                 */
                SECTIONS: '0CR16',
                /**
                 * [SECTIONS description]
                 * requires: {
                 *     departmentID
                 * }
                 * gives: [{
                 *     _id,
                 *     name,
                 *     
                 * }]
                 * @type {String}
                 */
                NEW_SECTION: '0CR17',

            },
            /**
             * [NEW description]
             * requires: {
             *     name,
             *     description,
             *     instructorID,
             *     year,
             *     university,
             *     faculty,
             *     term,
             *     subject,
             * }
             * @type {String}
             */
            NEW: '00C.C.1',
            /**
             * [FILTER description]
             * list
             * // depending on the logged in user, the courses list will be shown,
             * 
             * requires: {
             *     pageNumber,
             *     pageSize,
             *     filterOptions: [{
             *         fieldID, // field NAME (key) SAME AS THE SCHEMA 
             *         sort: {
             *             order: 1/-1, // 1 for increasing sort, & -1 for decreasing sort(greater to smaller)
             *         },
             *         select: { // multi- select
             *            items: [''], // ex: select users in to field: ['userID1', 'userID2']
             *         },
             *         search: {
             *             input: '', // input user typed to search for
             *         },
             *         range: {
             *             from: '',
             *             to: ''
             *         }
             *     }],
             *     projections: ['fieldID']
             * }
             * gives: {
             *     pages: // total number of pages
             *     result: [{}]
             * }
             * 
             * @type {String}
             */
            FILTER: '00C.C.2',

            /**
             * [STUDENTS_COURSES description]
             * Steps: 
             *     get student.courses from students collection by student id
             *     get courses that has these ids
             * requires: {}
             * gives: [{<COURSE DOCUMENT}]
             * @type {String}
             */
            STUDENTS_COURSES: '00C.C.8',

            /**
             * [EDIT description]
             * optional: {
             *     courseID,
             *     ..., // any field added will be updated, ex: if name: 'new name', 'new name' will be the last value
             *          // NOTE for uploads if user uploaded a file while edit, it will override its field 
             *     hidden: 1/0,
             *     delete: 1
             * }
             * @type {String}
             */
            EDIT: '00C.C.5',

            /**

             * [COURSE description]
             * course view
             * requires: {
             *      courseID,
             *      title
             *      number
             *      videos
             *      materials
             *      description
             *      demo
             * }
             *     
             * @type {String}
             */
            ADD_LECTURE: '00C.C.3',

            /**
                         * [EDIT_LECTURE description]
                         
                         * @type {String}
                         */
            EDIT_LECTURE: '00C.C.6',

            /**
             * [LECTURE description]
             *  require: {lectureID , courseID}
             * 
             * give:{
             * title,
             * demo:true/false,
             * description, //lecture description
             * number, //lecture number
             * videoName,
             * video:{name,
             *        id, // unique id will be used to get video from server by link "https://files.p56dki765gz8k.com/download/" + id,
             *        size
             *      }
             * materials:[
             *          { name,
             *             file:{ name, size, id // unique id will be used to get video from server by link "https://files.p56dki765gz8k.com/download/" + id}
             *           }
             *        ],
             * by, //user who added lecture
             * time // time when lecture was added
             * }
             * @type {String}
             */
            LECTURE: '00C.C.10',

            /**
             * [COURSE description]
             * course view
             * requires: {courseID}
             * gives: {
             *     _id,
             *     name,
             *     description,
             *     instructorID,
             *     year,
             *     university,
             *     faculty,
             *     term,
             *     subject,
             *     lectures: [{
             *          title,
             *          demo:true/false,
             *          description, //lecture description
             *          number, //lecture number
             *          videoName,
             *          video:{name,
             *                 id, // unique id will be used to get video from server by link "https://files.p56dki765gz8k.com/download/" + id,
             *                 size
             *               }
             *          materials:[
             *                   { name,
             *                      file:{ name, size, id // unique id will be used to get video from server by link "https://files.p56dki765gz8k.com/download/" + id}
             *                    }
             *                 ],
             *          by, //user who added lecture
             *          time // time when lecture was added
             *       }]
             *     
             * }
             * @type {String}
             */
            COURSE: '00C.C.4',

            /**
             * [EDIT description]
             * optional: {
             *     courseID,
             *     ..., // any field added will be updated, ex: if name: 'new name', 'new name' will be the last value
             *          // NOTE for uploads if user uploaded a file while edit, it will override its field 
             *     hidden: 1/0,
             *     delete: 1
             * }
             * @type {String}
             */
            EDIT: '00C.C.5',


            /**
             * [DELETE_LECTURE description]
             *  require:{
             *   courseID,
             *   lectureID
             *  }
             * @type {String}
             */
            DELETE_LECTURE: '00C.C.7',
            /**
             * [COURSE_STUDENTS description]
             * gives list of students enrolled to specific course
             * requires: {courseID}
             * gives: [{
             *     _id,
             *     name,
             *     mobile,
             *     email,
             * }]
             * @type {String}
             */
            COURSE_STUDENTS: '00C.C.21',

            /**
             * [COURSE_INSTRUCTORS description]
             *
             * requires: {courseID}
             *
             * gives: [{
             *     _id,
             *     name,
             *     mobile,
             *     email,
             * }]
             * 
             * @type {String}
             */
            COURSE_INSTRUCTORS: '',

            /**
             * [STUDENT_MY_COURSES description]
             * this constant must only work from student web view
             *
             * requires: {}
             * gives: [ {
             *     _id,
             *     name,
             *     description,
             *     instructorID,
             *     year,
             *     university,
             *     faculty,
             *     term,
             *     subject,
             *     lectures: [{
             *          title,
             *          demo:true/false,
             *          description, //lecture description
             *          number, //lecture number
             *          videoName,
             *          video:{name,
             *                 id, // unique id will be used to get video from server by link "https://files.p56dki765gz8k.com/download/" + id,
             *                 size
             *               }
             *          materials:[
             *                   { name,
             *                      file:{ name, size, id // unique id will be used to get video from server by link "https://files.p56dki765gz8k.com/download/" + id}
             *                    }
             *                 ],
             *          by, //user who added lecture
             *          time // time when lecture was added
             *       }]
             *     
             * },...]
             *
             * 
             * @type {String}
             */
            STUDENT_MY_COURSES: '00C.C.8',

            /**
             * [INSERT_VIDEO_CURRENT_TIME description]
             * requires: {courseID,lectureID,currenTime}
             * @type {String}
             */
            INSERT_VIDEO_CURRENT_TIME: '00C.C.9',

            /**
             * [VIDEO_CURRENT_TIME description]
             * requires: {lectureID,courseID}
             * 
             * give :{ stopPoint //type number }
             * @type {String}
             */
            VIDEO_CURRENT_TIME: '00C.C.11',

            /**
             * [LAST_LECTURE description]
             * requires: {lectureID,courseID}
             * 
             * give:{
             *          title,
             *          demo:true/false,
             *          description, //lecture description
             *          number, //lecture number
             *          videoName,
             *          video:{name,
             *                 id, // unique id will be used to get video from server by link "https://files.p56dki765gz8k.com/download/" + id,
             *                 size
             *               }
             *          materials:[
             *                   { name,
             *                      file:{ name, size, id // unique id will be used to get video from server by link "https://files.p56dki765gz8k.com/download/" + id}
             *                    }
             *                 ],
             *          by, //user who added lecture
             *          time // time when lecture was added
             *       }
             * @type {String}
             */
            LAST_LECTURE: '00C.C.12',

            /**
             * [ADD_TO_CART description]
             * requires: {courseID}
             * @type {String}
             */
            ADD_TO_CART: '00C.C.13',

            /**
             * [ADD_TO_WISHLIST description]
             * requires: {courseID}
             * @type {String}
             */
            ADD_TO_WISHLIST: '00C.C.14',
            /**
             * [REMOVE_FROM_CART description]
             * requires: {courseID}
             * @type {String}
             */
            REMOVE_FROM_CART: '00C.C.15',

            /**
             * [REMOVE_FROM_WISHLIST description]
             * requires: {courseID}
             * @type {String}
             */
            REMOVE_FROM_WISHLIST: '00C.C.16',

            /**
             * [STUDENT_WISHLIST description]
             * requires: {courseID}
             * 
             * gives: {
             *     _id,
             *     name,
             *     description,
             *     instructorID,
             *     year,
             *     university,
             *     faculty,
             *     term,
             *     subject,
             *     lectures: [{
             *          title,
             *          demo:true/false,
             *          description, //lecture description
             *          number, //lecture number
             *          videoName,
             *          video:{name,
             *                 id, // unique id will be used to get video from server by link "https://files.p56dki765gz8k.com/download/" + id,
             *                 size
             *               }
             *          materials:[
             *                   { name,
             *                      file:{ name, size, id // unique id will be used to get video from server by link "https://files.p56dki765gz8k.com/download/" + id}
             *                    }
             *                 ],
             *          by, //user who added lecture
             *          time // time when lecture was added
             *       }]
             *     
             * }
             * @type {String}
             */
            STUDENT_WISHLIST: '00C.C.17',

            /**
             * [STUDENT_WISHLIST description]
             * requires: {courseID}
             * 
             * gives: {
             *     _id,
             *     name,
             *     description,
             *     instructorID,
             *     year,
             *     university,
             *     faculty,
             *     term,
             *     subject,
             *     lectures: [{
             *          title,
             *          demo:true/false,
             *          description, //lecture description
             *          number, //lecture number
             *          videoName,
             *          video:{name,
             *                 id, // unique id will be used to get video from server by link "https://6dki765gz8k.com/download/" + id,
             *                 size
             *               }
             *          materials:[
             *                   { name,
             *                      file:{ name, size, id // unique id will be used to get video from server by link "https://files.p56dki765gz8k.com/download/" + id}
             *                    }
             *                 ],
             *          by, //user who added lecture
             *          time // time when lecture was added
             *       }]
             *     
             * }
             * @type {String}
             */
            STUDENT_CART: '00C.C.18',

            /**
             * [COURSE_LAST_STATE description]
             * requires: {courseID}
             * give: { wishList: 1/0/cart,cart: 1/0/purchase }
             * @type {String}
             */
            COURSE_LAST_STATE: '00C.C.19',

            /**
             * [APPROVE_PURCHASE description]
             * requires: {courseID,studentID}
             * @type {String}
             */
            APPROVE_PURCHASE: '00C.C.20',
        },
    }
}



/*
THIS FOR MESSAGES THAT WILL BE SHOWN TO THE USER, IT CAN BE TRANSLATED AFTER, ALL WILL CALL A FUNCTION AND GIVE THIS IDENTIFIER LABEL TO GET THE CURRENT LANGUAGE.
*/

export const LABELS = {
    INVALID_INPUTS: {
        INVALID_INPUTS_STATUS: "Invalid Inputs",
        INVALID_INPUTS_EDIT_TASK: "Invalid Edit Task",
        INVALID_INPUTS_TASK_FULL_DATA: "Invalid task full data",
    },
    USER_MESSAGE: {
        TASKS: {
            TASK_DATA: "Internal error: taskData, contact administrator",
            EDIT_NO_CHANGE: "No Change",
        }
    },
    SERVER: {
        SERVER_RESPOND: {
            ERROR: "Respond error", // incomplete
        }
    },
    SDK: {
        INTERNAL_ERROR: "Error while processing data",
    },
    FRONT_END: {
        INTERNAL_ERROR: "Data preparation error",
        LOADING: "Loading..",
        MISSING_INPUTS: "Missing Inputs"
    }

}