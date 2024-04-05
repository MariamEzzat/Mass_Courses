import { IDENTIFIERS } from '../constants.js';
import { get, post } from '../sdk/front.js';

import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';
export class navBar extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        get(IDENTIFIERS.USERS.USERS, {}, (result) => {
            
            this.userID=result.userID
            this.usersArray = result.data
            document.querySelector('footer').classList.remove('d-none')
            
            this.userData = result.data.filter(usr => {
                return usr.userID == result.userID
            })[0]
            if (this.userData.hasOwnProperty('type') && this.userData.type == 'ADMIN') {
           
                $('nav.topNavBar').load(V.BASE.NAV_BAR.HTML_URL, () => {
                    this.admin = true;
                    this.instructor = false;
                    super.load()
                });
            } 
            else if (this.userData.hasOwnProperty('type') && this.userData.type == 'INSTRUCTOR'){
                console.log("inst : "+JSON.stringify(this.userData))
                
                $('nav.topNavBar').load(V.BASE.NAV_BAR_INSTRUCTOR.HTML_URL, () => {
                    this.admin = false;
                    this.instructor = true;
                    super.load()
                });
            }
            else {
                document.querySelector('footer').remove()
                let div = document.createElement('nav')
                $(div).addClass('bottomNavBar border-top bg-white py-0')
                this.insertAfter(document.getElementById("warningAlertModal"), div, () => {
                    $('nav.bottomNavBar').load('/htmlParts/navBarStudent.html', () => {
                        super.load()
                    });
                })


            }

        }, (result) => {
            console.log(result);
        });

    }
    render() {

        this.currentView = -1;

 if (this.instructor == true) {
       
 this.currentView = V.COURSES.MAIN.VIEW_ID
            super.closeOthers({ children: 1 });
            let div = document.createElement('div')
            div.id = 'CoursesTab'
            document.querySelector('main').prepend(div);
            $('#CoursesTab').addClass('px-2')
            super.newView(V.COURSES.MAIN.VIEW_ID, '#CoursesTab', {}, {})
      
    };

        
        if (this.admin == true) {
            console.log("admin");
            $('#appVersion-card').removeClass('d-none')
            $('#appVersion-card').addClass('d-flex')
            this.clicked = -1
            document.querySelector('#appVersion-icon').onclick = e => {
                if (this.clicked == -1) {
                    this.clicked = 1
                    let div = document.createElement('div')
                    div.id = 'appVersions'
                    $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
                    super.newView(V.APP_VERSIONS.MAIN.VIEW_ID, '#appVersions', {}, {})
                }
                else {
                    return
                }
            }

            document.querySelector('#notifications-icon').onclick = e => {
                if (this.clicked == -1) {
                    this.clicked = 1
                    let div = document.createElement('div')
                    div.id = 'notifications'
                    $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
                    super.newView(V.NOTIFICATIONS.MAIN.VIEW_ID, '#notifications', {usersArray:this.usersArray}, {})
                }
                else {
                    return
                }
            }

            document.querySelector('#instructors-tabs').onclick = (e) => {
                if (this.currentView !== V.INSTRUCTORS.MAIN.VIEW_ID) {
                    this.currentView = V.INSTRUCTORS.MAIN.VIEW_ID;
                    super.closeOthers({ children: 1 });
                    $($(e.target.parentElement).siblings()).children().removeClass('nav-active')
                    $('.navbar-collapse').collapse('hide');
                    e.target.classList.add('nav-active')
                    let div = document.createElement('div')
                    div.id = 'instructorsList'
                    document.querySelector('main').prepend(div);
                    $('#instructorsList').addClass('px-2')
                    super.newView(V.INSTRUCTORS.MAIN.VIEW_ID, '#instructorsList', {}, {})
                } else {
                    super.closeOthers({ children: 1 });
                    this.currentView = -1
                    e.target.click()
                    return
                }
            };

            document.querySelector('#students-tabs').onclick = (e) => {
                if (this.currentView !== V.STUDENTS.MAIN.VIEW_ID) {
                    this.currentView = V.STUDENTS.MAIN.VIEW_ID;
                    super.closeOthers({ children: 1 });
                    $($(e.target.parentElement).siblings()).children().removeClass('nav-active')
                    $('.navbar-collapse').collapse('hide');
                    e.target.classList.add('nav-active')
                    let div = document.createElement('div')
                    div.id = 'studentsList'
                    document.querySelector('main').prepend(div);
                    $('#studentsList').addClass('px-1')
                    //console.log(this.userID);
                    super.newView(V.STUDENTS.MAIN.VIEW_ID, '#studentsList', {userID:this.userID}, {})
                } else {
                    super.closeOthers({ children: 1 });
                    this.currentView = -1
                    e.target.click()
                    return
                }
            };

            document.querySelector('#coursesTab-tabs').onclick = (e) => {
                if (this.currentView !== V.COURSES.MAIN.VIEW_ID) {
                    this.currentView = V.COURSES.MAIN.VIEW_ID
                    super.closeOthers({ children: 1 });

                    $($(e.target.parentElement).siblings()).children().removeClass('nav-active')
                    $('.navbar-collapse').collapse('hide');
                    e.target.classList.add('nav-active')
                    let div = document.createElement('div')
                    div.id = 'CoursesTab'
                    document.querySelector('main').prepend(div);
                    $('#CoursesTab').addClass('px-2')
                    super.newView(V.COURSES.MAIN.VIEW_ID, '#CoursesTab', {}, {})
                } else {
                    super.closeOthers({ children: 1 });
                    this.currentView = -1
                    e.target.click()
                    return
                }
            };
            document.querySelector('#coursesTab-tabs').click()
        } 
        
        
        
        
        else {

            document.querySelector('#coursesTab-tabs').onclick = (e) => {
                if (this.currentView !== V.COURSES.MAIN.VIEW_ID) {
                    this.currentView = V.COURSES.MAIN.VIEW_ID
                    super.closeOthers({ children: 1 });

                    $($(e.target.parentElement).siblings()).children().removeClass('nav-active')
                    $('.navbar-collapse').collapse('hide');
                    e.target.classList.add('nav-active')
                    let div = document.createElement('div')
                    div.id = 'CoursesTab'
                    document.querySelector('main').prepend(div);
                    $('#CoursesTab').addClass('px-2')
                    super.newView(V.COURSES.MAIN.VIEW_ID, '#CoursesTab', { student: true }, {})
                } else {
                    super.closeOthers({ children: 1 });
                    this.currentView = -1
                    e.target.click()
                    return
                }
            };

            document.querySelector('#wishList-tabs').onclick = (e) => {
                if (this.currentView !== V.STUDENT_WISHLIST.VIEW_ID) {
                    this.currentView = V.STUDENT_WISHLIST.VIEW_ID
                    super.closeOthers({ children: 1 });

                    $($(e.target.parentElement).siblings()).children().removeClass('nav-active')
                    $('.navbar-collapse').collapse('hide');
                    e.target.classList.add('nav-active')
                    let div = document.createElement('div')
                    div.id = 'studentWishList'
                    document.querySelector('main').prepend(div);
                    $('#studentWishList').addClass('px-2')
                    super.newView(V.STUDENT_WISHLIST.VIEW_ID, '#studentWishList', { student: true }, {})
                } else {
                    super.closeOthers({ children: 1 });
                    this.currentView = -1
                    e.target.click()
                    return
                }
            };

            document.querySelector('#cart-tabs').onclick = (e) => {
                if (this.currentView !== V.STUDENT_CART.VIEW_ID) {
                    this.currentView = V.STUDENT_CART.VIEW_ID
                    super.closeOthers({ children: 1 });

                    $($(e.target.parentElement).siblings()).children().removeClass('nav-active')
                    $('.navbar-collapse').collapse('hide');
                    e.target.classList.add('nav-active')
                    let div = document.createElement('div')
                    div.id = 'studentCart'
                    document.querySelector('main').prepend(div);
                    $('#studentCart').addClass('px-2')
                    super.newView(V.STUDENT_CART.VIEW_ID, '#studentCart', { student: true }, {})
                } else {
                    super.closeOthers({ children: 1 });
                    this.currentView = -1
                    e.target.click()
                    return
                }
            };

            document.querySelector('#myCourses-tabs').onclick = (e) => {
                if (this.currentView !== V.MY_COURSES.VIEW_ID) {
                    this.currentView = V.MY_COURSES.VIEW_ID
                    super.closeOthers({ children: 1 });

                    $($(e.target.parentElement).siblings()).children().removeClass('nav-active')
                    $('.navbar-collapse').collapse('hide');
                    e.target.classList.add('nav-active')
                    let div = document.createElement('div')
                    div.id = 'myCourses'
                    document.querySelector('main').prepend(div);
                    $('#myCourses').addClass('px-2')
                    super.newView(V.MY_COURSES.VIEW_ID, '#myCourses', {}, {})
                } else {
                    super.closeOthers({ children: 1 });
                    this.currentView = -1
                    e.target.click()
                    return
                }
            };
            document.querySelector('#myCourses-tabs').click()
        }
        super.render();
    }

    /* Where referenceNode is the node you want to put newNode after. 
    If referenceNode is the last child within its parent element, that's fine,
     because referenceNode.nextSibling will be null and insertBefore handles that case by adding to the end of the list. */
    insertAfter(referenceNode, newNode, next) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        if (next !== undefined) {
            next()
        }
    }

    stopLoading() { }
    reload() { super.reload({}); }
    onPoke(e, data) {
        this.clicked = data.clickedAppVersion
    }
    promptError(error) { console.log(error.errMsg) }
    close() { super.close(); }
}

export class InfoIconModal extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {

        $(this.divID).load(V.INSTRUCTIONS.MAIN.HTML_URL, () => {
            super.load()
        });
    }
    render() {

        /* if (this.NEW_View !== undefined) {

            this.NEW_View()
        } */
        let _this = this;
        document.querySelector(this.divID).classList.remove('d-none');
        document.querySelector(this.divID).classList.add('fade-in');
        //document.querySelector('#instructionsModal_content').innerHTML = '';



        $('#instructionsModal_close').click((e) => {
            this.close()
        })
        super.render();
    }
    stopLoading() { }
    reload() { super.reload({}); }
    close() {
        super.close();
        $(this.divID).animate({ left: '-100%' }, 650, () => {
            document.querySelector(this.divID).remove()
        })
    }
    promptError(error) {
        console.log(error.errMsg)
        notifyResult(error.userMsg)
    };
}
/* to show msg from server if success or fail  */
export function notifyResult(boolean, msg, next) {
    $('#notifyModal').show().animate({ left: '0' }, 650)
    document.querySelector('#notifyModal_paragraph').innerHTML = '';
    document.querySelector('#notifyModal_paragraph').innerHTML = msg;
    if (boolean == true) {
        document.querySelector('#notifyModal_true').classList.remove('d-none');
        document.querySelector('#notifyModal_false').classList.add('d-none');
    } else {
        document.querySelector('#notifyModal_false').classList.remove('d-none');
        document.querySelector('#notifyModal_true').classList.add('d-none');
    };

    document.querySelector('#notifyModal_close').onclick = function () {
        $('#notifyModal').animate({ left: '-100%' }, () => {
            $('#notifyModal').hide()
        })
        if (next != undefined) next();
    }
};

export function warningAlert(msg, nextContinue, nextCancel) {


    $('#warningAlertModal').show().animate({ left: '0' })
    document.querySelector('#warningAlertModal_paragraph').innerHTML = '';
    document.querySelector('#warningAlertModal_paragraph').innerHTML = msg;

    document.querySelector('#warningAlertModal_close').onclick = function () {
        //document.querySelector('#warningAlertModal').classList.add('d-none');
        $('#warningAlertModal').animate({ left: '-100%' }, () => {
            $('#warningAlertModal').hide()
        })
        if (nextCancel != undefined) nextCancel();
    }
    document.querySelector('#warningAlertModal_continue').onclick = function () {
        //document.querySelector('#warningAlertModal').classList.add('d-none');
        $('#warningAlertModal').animate({ left: '-100%' }, () => {
            $('#warningAlertModal').hide()
        })
        if (nextContinue != undefined) nextContinue();
    }
};