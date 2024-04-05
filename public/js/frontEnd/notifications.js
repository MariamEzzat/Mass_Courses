import { IDENTIFIERS } from '../constants.js';
import { get, post } from '../sdk/front.js';
import { notifyResult, warningAlert } from './navBar.js';
import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';

export class Notifications extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        let vote = 3;
        get(
            IDENTIFIERS.NOTIFICATIONS.ALL_NOTIFICATIONS, {},
            (result) => {
                // /console.log(result);
                this.ArrayNotifications = result

                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                //super.loadError(data)
            });
        get(
            IDENTIFIERS.COURSES.STUDENTS.FILTER, {
            pageNumber: 1,
            pageSize: 1000,
            filterOptions: [{
                fieldID: 'delete',
                search: {
                    input: 0, // input user typed to search for
                }
            }]
        },
            (result) => {
                //console.log('students', result);
                this.studentsArray = result.result

                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                //super.loadError(data)
            });

        $(this.divID).load(V.NOTIFICATIONS.MAIN.HTML_URL, () => {

            if (--vote <= 0) {
                super.load()
            }
        });

    }
    render() {

        document.querySelector('#notifications_close').onclick = () => {
            this.close();
            this.pokeView({ viewID: V.BASE.NAV_BAR.VIEW_ID }, { clickedAppVersion: -1 })
        };
        this.fillNotificationsTable(this.ArrayNotifications)
        super.render();
    };

    fillNotificationsTable(array) {
        let tableRow = ``
        let counter = 0;
        for (let i of array) {
            //console.log(i);
            counter++
            tableRow += `
                <tr class="">
                    <td>${counter}</td>
                    <td>${i.msg}</td>
                    <td>${(new Date(i.time)).toLocaleString()}</td>
                    <td>${(new Date(i.submittedAt * 1000)).toLocaleString()}</td>
                    <td>${i.users.length}</td>
                    <td>${this.getTotalNumber(i.users, 'delivered')}</td>
                    <td>${this.getTotalNumber(i.users, 'read')}</td>
                    <td>${this.getTotalNumber(i.users, 'deleted')}</td>
                    <td>${this.getTotalNumber(i.users, 'deleteStatus')}</td>
                    <td><i data-notificationID="${i._id}" class="fas fa-users text-info h-100 w-100 openNotificationUsersList" style="cursor:pointer;"></i></td>
                </tr>
            `
        }
        document.querySelector(`${this.divID} #notificationsTable tbody`).innerHTML = tableRow
        this.openNotificationUsersList()
    }

    openNotificationUsersList() {
        document.querySelectorAll(`${this.divID} .openNotificationUsersList`).forEach(usersList => {
            usersList.onclick = e => {
                let notificationID = e.target.getAttribute('data-notificationID')
                let div = document.createElement('div')
                div.id = 'usersNotification'
                $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.NOTIFICATIONS.NOTIFICATION_USERS.VIEW_ID, '#usersNotification', {
                    notificationID: notificationID,
                    studentsArray: this.studentsArray
                }, {})
            }
        })
    }

    getTotalNumber(array, propertyName) {
        const count = array.reduce((acc, cur) => cur[propertyName].v == 1 ? ++acc : acc, 0);
        return count
    }
    isOdd(num) { return num % 2; }
    getValue(elementID) {

        let elementName = '';
        for (let i of this.studentsArray) {
            if (i._id == elementID) {
                elementName = i.name;
                break;
            }
        }
        return elementName
    }
    stopLoading() { }
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    onPoke(e, data) {
        this.reload()
    }
    close() {
        super.close();
        $(this.divID).animate({ left: '-100%' }, 650, () => {
            document.querySelector(this.divID).remove()
        })
    }
};

export class UsersNotifications extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        let vote = 2;
        get(
            IDENTIFIERS.NOTIFICATIONS.ALL_NOTIFICATIONS, {},
            (result) => {
                this.usersNotification = result.filter(notifi => {
                    return notifi._id == this.notificationID
                })[0].users
                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                //super.loadError(data)
            });
        $(this.divID).load(V.NOTIFICATIONS.NOTIFICATION_USERS.HTML_URL, () => {
            if (--vote <= 0) {
                super.load()
            }
        });

    }
    render() {
        this.fillUsersNotification(this.usersNotification, this.notificationID)

        document.querySelector('#usersNotification_close').onclick = () => {
            this.close();
            this.pokeView({ viewID: V.NOTIFICATIONS.MAIN.VIEW_ID })
        };

        document.querySelector('#usersNotification_deleteAll').onclick = e => {
            let usersList = this.usersNotification.map(usr => {
                return usr.userID
            })
            let object = {
                usersID: usersList,
                notificationID: this.notificationID,
                deleted: 1
            }
            post(
                IDENTIFIERS.NOTIFICATIONS.NOTIFICATION_DELETE,
                object,
                (data) => {
                    console.log(data);
                    this.reload()
                },
                (err) => {
                    console.log(err.msg);
                }
            )
        }
        document.querySelector('#usersNotification_selectUsersFromTable').onclick = e => {
            let div = document.createElement('div')
            div.id = 'studentsListParent'
            let divChild = document.createElement('div')
            divChild.id = 'studentsList'
            $(divChild).addClass('card p-3 mt-5')

            $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
            $(divChild).appendTo(div)
            super.newView(V.STUDENTS.MAIN.VIEW_ID, '#studentsListParent #studentsList', { notification:true,studentsArrayFromNotification:this.studentss}, {})

        }

        super.render();
    };

    fillUsersNotification(arr, notificationID) {
        this.studentss=[]
        let counter = 0
        let row = ``;
        for (let i of arr) {
            this.studentss.push(i.userID)
            //console.log(i);
            counter++
            row += `
            <tr>
                <td class="font-weight-bold">${counter}</td>
                <td class="font-weight-bold">${this.getValue(i.userID)}</td>
                <td>${(i.delivered.v == 0) ? " - " : `true, at ${(new Date(i.delivered.t * 1000)).toLocaleString()}`}</td>
                <td >${(i.read.v == 0) ? " - " : `true, at ${(new Date(i.read.t * 1000)).toLocaleString()}`} </td>
                <td >${(i.deleted.v == 0) ? " - " : `true, at ${(new Date(i.deleted.t * 1000)).toLocaleString()}`} </td>
                <td >${(i.deleteStatus.v == 0) ? " - " : `true, at ${(new Date(i.deleteStatus.t * 1000)).toLocaleString()}`} </td>
                <td data-notifiID="${notificationID}" data-userID="${i.userID}">
                    ${(i.deleted.v == 1) ? '' : `<i data-notifiID="${notificationID}" data-userID="${i.userID}" style="cursor:pointer;" class="fas fa-times text-danger deleteNotificationForUser w-100 h-100"></i> `
                }
                </td>
            </tr>
            `
        }
        document.querySelector(`${this.divID} #usersNotificationTable tbody`).innerHTML = row
        this.deleteNotificationForUser()
    }

    isOdd(num) { return num % 2; }

    deleteNotificationForUser() {
        document.querySelectorAll(`${this.divID} .deleteNotificationForUser`).forEach(deleteNotifi => {
            deleteNotifi.onclick = e => {
                let userID = e.target.getAttribute('data-userID')
                let notificationID = e.target.getAttribute('data-notifiID')
                let object = {
                    usersID: [userID],
                    notificationID: notificationID,
                    deleted: 1
                }
                //console.log(object);
                post(
                    IDENTIFIERS.NOTIFICATIONS.NOTIFICATION_DELETE,
                    object,
                    (data) => {
                        console.log(data);
                        this.reload()
                    },
                    (err) => {
                        console.log(err.msg);
                    }
                )
            }
        })
    }

    getValue(elementID) {

        let elementName = '';
        for (let i of this.studentsArray) {
            if (i._id == elementID) {
                elementName = i.name;
                break;
            }
        }
        return elementName
    }
    stopLoading() { }
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();
        $(this.divID).animate({ left: '-100%' }, 650, () => {
            document.querySelector(this.divID).remove()
        })
    }
}
