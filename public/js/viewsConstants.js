import { View, Router } from './frameworks/Router.js';
import { navBar, InfoIconModal } from './frontEnd/navBar.js';
import { ViewCourse, Student_ViewCourse } from './frontEnd/courseView.js';
import { NewInstructor } from './frontEnd/newInstructor.js';
import { Instructors } from './frontEnd/instructors.js';
import { Students, AddCourseForStudent, StudentsCoursesInfo, StudentsCartCourses, StudentsBlockList, Groups, StudentNotification } from './frontEnd/students.js';
import { Notifications, UsersNotifications } from './frontEnd/notifications.js';
import { NewStudent } from './frontEnd/newStudent.js';
import { NewCourse } from './frontEnd/newCourse.js';
import { AddLecturesForCourse } from './frontEnd/addLecture.js';
import { Modal_Add } from './frontEnd/modalAdd.js';
import { cartList } from './frontEnd/cart.js';
import { wishList } from './frontEnd/wishList.js';
import { FilterStudents } from './frontEnd/filterStudent.js';
import { Pagination } from './frontEnd/pagination.js';
import { AppVersions, LastValidVersions_AppVersions, Versions_AppVersions } from './frontEnd/appVersion.js';
import {
    Courses_Main,
    MODAL,
    ModalUniversitiesList,
    ModalFacultiesList,
    ModalCoursesList,
    ModalInstructorCoursesList,
    ModalTermsList,
    ModalYearsList,
    ModalSubjectsList,
    ModalDepartmentsList,
    ModalSectionsList,
    My_Courses
} from './frontEnd/courses.js';
export { router, sideBarInstanceID }

/**
 * [V contains views reference, forms, lists, or graphs, ex: tasklist table & taskview  ]
 * @type {Object}
 */



export const V = {
    BASE: {
        VIEW_ID: '0', // IGNORE THIS VIEW, ASSIGNED FOR SDK
        NAV_BAR: {
            VIEW_ID: '001',
            IS_INTENT: 0,
            HTML_URL: '/htmlParts/navbar.html'
        },
        NAV_BAR_INSTRUCTOR: {
            VIEW_ID: '002',
            IS_INTENT: 0,
            HTML_URL: '/htmlParts/navbarInstructor.html'
        }
    },
    COURSES: {
        MAIN: {
            VIEW_ID: 'C.1',
            HTML_URL: '/htmlParts/coursesTab.html'
        },
        INSTRUCTOR_MAIN: {
            VIEW_ID: 'C.2',
            HTML_URL: '/htmlParts/instructorCoursesTab.html'
        },
        COURSES_LIST: {
            MAIN: {
                VIEW_ID: 'C.1.1',
                HTML_URL: '/htmlParts/coursesTab_CoursesList.html'
            },
            MODAL_UNIV_LIST: {
                VIEW_ID: 'C.1.1.1',
                HTML_URL: ''
            },
            MODAL_FACUL_LIST: {
                VIEW_ID: 'C.1.1.2',
                HTML_URL: ''
            },
            MODAL_COURSES_LIST: {
                VIEW_ID: 'C.1.1.3',
                HTML_URL: ''
            },
            MODAL_YEARS_LIST: {
                VIEW_ID: 'C.1.1.4',
                HTML_URL: ''
            },
            MODAL_TERMS_LIST: {
                VIEW_ID: 'C.1.1.5',
                HTML_URL: ''
            },
            MODAL_SUBJECTS_LIST: {
                VIEW_ID: 'C.1.1.6',
                HTML_URL: ''
            },
            MODAL_SECTIONS_LIST: {
                VIEW_ID: 'C.1.1.7',
                HTML_URL: ''
            },
            MODAL_DEPARTMENTS_LIST: {
                VIEW_ID: 'C.1.1.8',
                HTML_URL: ''
            },
            MODAL_INSTRUCTORCOURSES_LIST: {
                VIEW_ID: 'C.1.1.9',
                HTML_URL: ''
            }
        },

        ADMIN_VIEW_COURSE: {
            VIEW_ID: 'C.1.2',
            HTML_URL: '/htmlParts/courseView.html'
        },
        STUDENT_VIEW_COURSE: {
            VIEW_ID: 'C.1.3',
            HTML_URL: '/htmlParts/courseView.html'
        },
        NEW_COURSE: {
            VIEW_ID: 'C.1.4',
            HTML_URL: '/htmlParts/newCourse.html'
        },
        ADD_LECTURES: {
            VIEW_ID: 'C.1.5',
            HTML_URL: '/htmlParts/addLecture.html'
        }
    },
    MODAL: {
        VIEW_ID: 'M.1.2',
        HTML_URL: '/htmlParts/modalPublic.html'
    },
    INSTRUCTORS: {
        MAIN: {
            VIEW_ID: 'IN.2',
            HTML_URL: '/htmlParts/instructorsList.html'
        },
        NEW_INSTRUCTOR: {
            VIEW_ID: "IN.2.1",
            HTML_URL: '/htmlParts/newInstructor.html'
        }
    },
    STUDENTS: {
        MAIN: {
            VIEW_ID: 'ST.3',
            HTML_URL: '/htmlParts/studentsList.html'
        },
        NEW_STUDENT: {
            VIEW_ID: "ST.3.1",
            HTML_URL: '/htmlParts/newStudent.html'
        },
        ADD_COURSE: {
            VIEW_ID: "ST.3.2",
            HTML_URL: '/htmlParts/addCourseForStudent.html'
        },
        INFO_COURSES: {
            VIEW_ID: "ST.3.3"
        }
        ,
        INFO_CART_COURSES: {
            VIEW_ID: "ST.3.4"
        },
        INFO_BLOCK_LIST: {
            VIEW_ID: "ST.3.5"
        },
        STUDENT_NOTIFICATION: {
            VIEW_ID: "ST.3.6",
            HTML_URL: '/htmlParts/studentNotification.html'
        }
    },
    INSTRUCTIONS: {
        MAIN: {
            VIEW_ID: 'IN.4',
            HTML_URL: '/htmlParts/instructionsModal.html'
        }
    },
    MODAL_ADD: {
        VIEW_ID: 'MD.5',
        HTML_URL: '/htmlParts/modalAdd.html'
    },
    MY_COURSES: {
        VIEW_ID: 'MC.6',
        HTML_URL: '/htmlParts/myCoursesTab.html'
    },
    STUDENT_WISHLIST: {
        VIEW_ID: 'MC.7',
        HTML_URL: '/htmlParts/myCoursesTab.html'
    },
    STUDENT_CART: {
        VIEW_ID: 'MC.8',
        HTML_URL: '/htmlParts/myCoursesTab.html'
    },
    FILTER: {
        VIEW_ID: 'FI.9',
        HTML_URL: ''
    },
    APP_VERSIONS: {
        MAIN: {
            VIEW_ID: 'AV.10',
            HTML_URL: '/htmlParts/appVersions.html'
        },
        LAST_VALID_VERSIONS: {
            VIEW_ID: 'AV.10.1',
            HTML_URL: '/htmlParts/lastValidVersions.html'
        },
        VERSIONS: {
            VIEW_ID: 'AV.10.2',
            HTML_URL: '/htmlParts/versions.html'
        }
    },
    GROUPS: {
        MAIN: {
            VIEW_ID: "G.11",
            HTML_URL: '/htmlParts/groupsList.html'
        },
        NEW_GROUP: {
            VIEW_ID: "G.11.1"
        }
    },
    NOTIFICATIONS: {
        MAIN: {
            VIEW_ID: 'N.12',
            HTML_URL: '/htmlParts/notificationsList.html'
        },
        NOTIFICATION_USERS: {
            VIEW_ID: 'N.12.1',
            HTML_URL: '/htmlParts/usersNotificationsList.html'
        },
    },
    PAGINATION: {
        VIEW_ID: 'PG.13',
        HTML_URL: '/htmlParts/pagination.html'
    }
}


export const viewsClasses = new Map([
    [V.BASE.VIEW_ID, View],

    [V.BASE.NAV_BAR.VIEW_ID, navBar],
    [V.BASE.NAV_BAR_INSTRUCTOR.VIEW_ID, navBar],
    [V.COURSES.MAIN.VIEW_ID, Courses_Main],
    [V.COURSES.INSTRUCTOR_MAIN.VIEW_ID, Courses_Main],
    [V.MODAL.VIEW_ID, MODAL],
    [V.COURSES.COURSES_LIST.MODAL_UNIV_LIST.VIEW_ID, ModalUniversitiesList],
    [V.COURSES.COURSES_LIST.MODAL_FACUL_LIST.VIEW_ID, ModalFacultiesList],
    [V.COURSES.COURSES_LIST.MODAL_COURSES_LIST.VIEW_ID, ModalCoursesList],
    [V.COURSES.COURSES_LIST.MODAL_YEARS_LIST.VIEW_ID, ModalYearsList],
    [V.COURSES.COURSES_LIST.MODAL_SUBJECTS_LIST.VIEW_ID, ModalSubjectsList],
    [V.COURSES.COURSES_LIST.MODAL_TERMS_LIST.VIEW_ID, ModalTermsList],
    [V.COURSES.COURSES_LIST.MODAL_SECTIONS_LIST.VIEW_ID, ModalSectionsList],
    [V.COURSES.COURSES_LIST.MODAL_DEPARTMENTS_LIST.VIEW_ID, ModalDepartmentsList],
    [V.COURSES.COURSES_LIST.MODAL_INSTRUCTORCOURSES_LIST.VIEW_ID, ModalInstructorCoursesList],


    [V.COURSES.ADMIN_VIEW_COURSE.VIEW_ID, ViewCourse],
    [V.COURSES.STUDENT_VIEW_COURSE.VIEW_ID, Student_ViewCourse],
    [V.COURSES.NEW_COURSE.VIEW_ID, NewCourse],
    [V.COURSES.ADD_LECTURES.VIEW_ID, AddLecturesForCourse],


    [V.INSTRUCTORS.MAIN.VIEW_ID, Instructors],
    [V.INSTRUCTORS.NEW_INSTRUCTOR.VIEW_ID, NewInstructor],

    [V.STUDENTS.MAIN.VIEW_ID, Students],
    [V.STUDENTS.NEW_STUDENT.VIEW_ID, NewStudent],
    [V.STUDENTS.ADD_COURSE.VIEW_ID, AddCourseForStudent],
    [V.STUDENTS.INFO_COURSES.VIEW_ID, StudentsCoursesInfo],
    [V.STUDENTS.INFO_CART_COURSES.VIEW_ID, StudentsCartCourses],
    [V.STUDENTS.INFO_BLOCK_LIST.VIEW_ID, StudentsBlockList],
    [V.STUDENTS.STUDENT_NOTIFICATION.VIEW_ID, StudentNotification],

    [V.INSTRUCTIONS.MAIN.VIEW_ID, InfoIconModal],
    [V.MODAL_ADD.VIEW_ID, Modal_Add],

    [V.MY_COURSES.VIEW_ID, My_Courses],
    [V.STUDENT_WISHLIST.VIEW_ID, wishList],
    [V.STUDENT_CART.VIEW_ID, cartList],

    [V.FILTER.VIEW_ID, FilterStudents],

    [V.APP_VERSIONS.MAIN.VIEW_ID, AppVersions],
    [V.APP_VERSIONS.LAST_VALID_VERSIONS.VIEW_ID, LastValidVersions_AppVersions],
    [V.APP_VERSIONS.VERSIONS.VIEW_ID, Versions_AppVersions],


    [V.GROUPS.MAIN.VIEW_ID, Groups],

    [V.NOTIFICATIONS.MAIN.VIEW_ID, Notifications],
    [V.NOTIFICATIONS.NOTIFICATION_USERS.VIEW_ID, UsersNotifications],

    [V.PAGINATION.VIEW_ID, Pagination],

])






/*
let router = new Router();
 setTimeout(() => {
    ;

    console.log (new (viewsClasses.get(V.BASE.VIEW_ID))());
    //var base = router.init(NewRepetitiveTask);
    /*
	
     
    base.newView (
        V.REPETITIVE_TASKS.NEW_TASK.VIEW_ID,
        '',
        {hi: 'hi', fi: 'fi'},
        {isChild: 0}
        )
	
}, 3000)
*/

/*
let baseID = router.init(V.BASE.NAV_BAR.VIEW_ID);

let baseInstance = router.getViewByInstanceID(baseID);

console.log (baseInstance);

let rTID = baseInstance.newView (
    V.REPETITIVE_TASKS.NEW_TASK.VIEW_ID,
    '',
    {hi: 'hi', fi: 'fi'},
    {isChild: 0}
    )
let rTInstance = router.getViewByInstanceID(rTID);

let rTCID = rTInstance.createChild();
console.log (router);
setTimeout(() => {
    console.log ('closing...')
    rTInstance.close();
    console.log (router);
}, 10000)
*/




let router = new Router();
let sideBarInstanceID;



sideBarInstanceID = router.init(V.BASE.NAV_BAR.VIEW_ID);