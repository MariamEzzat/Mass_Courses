import { IDENTIFIERS } from '../constants.js';
import {get, post } from '../sdk/front.js';
import { notifyResult, warningAlert } from './navBar.js';
import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';
import { MODAL } from './courses.js';


export class Instructors extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {
        let vote = 2;
        get(
            IDENTIFIERS.COURSES.INSTRUCTORS.FILTER, {},
            (result) => {
                this.instructorsArray = result.instructors
                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                //super.loadError(data)
            });
        $(this.divID).load(V.INSTRUCTORS.MAIN.HTML_URL, (e) => {
            if (--vote <= 0) {
                super.load()
            }
        });

    }
    render() {
        this.fillInstructorsTable(this.instructorsArray);
        this.clicked = -1
        $('#instructorsList_open_newInstructor').click(e => {
            if (this.clicked == -1) {
                this.clicked = 1
                super.closeOthers({
                    children: 1
                });
                let div = document.createElement('div')
                div.id = 'newInstructor'
                $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.INSTRUCTORS.NEW_INSTRUCTOR.VIEW_ID, '#newInstructor', {}, {})
            } else {
                return
            }
        });

        super.render();
    };
    fillInstructorsTable(array) {
        let row = '';
        for (let i = array.length - 1; i >= 0; i--) {
            row += `
                <tr>
                    <td>${array[i].mID}</td>
                    <td>${array[i].name}</td>
                    <td>${array[i].email}</td>
                    <td>${array[i].primaryMobile}</td>
                    <td>${array[i].subjects}</td>
                    <td>
                        <div class="dropdown dropleft">
                            <a class="fas fa-caret-down" href="#" role="button" id="dropdownMenuLinkInstructors" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            </a>
                    
                            <div class="dropdown-menu py-0" aria-labelledby="dropdownMenuLinkInstructors">
                                <!--<i class="far fa-eye text-secondary viewInstructorCourses w-100 px-2 py-2 border-bottom" data-instructorID="${array[i]._id}"> view courses</i>
                                <i data-instructorID="${array[i]._id}" data-instructorName="${array[i].name}" class="fas fa-plus text-primary addCourseForInstructor w-100 px-2 py-2 border-bottom"> add courses</i>-->
                                <i data-instructorMID="${array[i].mID}" class="fas fa-edit text-info editInstructor w-100 px-2 py-2 border-bottom"> edit</i>
                                <i data-instructorMID="${array[i].mID}" data-instructorName="${array[i].name}" class="fas fa-times text-danger removeInstructor w-100 px-2 py-2"> delete</i>
                        
                            </div>
                        </div>
                    </td>
                </tr>
                `
        }
        document.querySelector(`${this.divID} table tbody`).innerHTML = row;

        this.removeInstructor();
        this.editInstructor();
    };

    removeInstructor() {
        document.querySelectorAll(`${this.divID} .removeInstructor`).forEach(student => {
            student.onclick = e => {
                warningAlert(`are you want delete instructor <span class="font-weight-bold">${e.target.getAttribute('data-instructorName')}</span> ?`, () => {
                    let instructorMID = e.target.getAttribute('data-instructorMID');
                    post(
                        IDENTIFIERS.COURSES.INSTRUCTORS.DELETE_INSTRUCTOR, {
                            instructorMID: instructorMID
                        },
                        (d) => {

                            this.reload();
                        },
                        function(data) {
                            notifyResult(false, data.userMsg)
                            console.log(data);
                        }
                    );
                })
            }
        })
    };

    editInstructor() {
        document.querySelectorAll(`${this.divID} .editInstructor`).forEach(student => {
            student.onclick = e => {
                if (this.clicked == -1) {
                    let instructorMID = e.target.getAttribute('data-instructorMID');
                    this.clicked = 1

                    let div = document.createElement('div')
                    div.id = 'editInstructor'
                    $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
                    super.newView(V.INSTRUCTORS.NEW_INSTRUCTOR.VIEW_ID, '#editInstructor', { editInstructor: true, instructorMID: instructorMID }, {})
                } else {
                    return
                }
            }
        })
    };

    onPoke() {
        this.clicked = -1
        this.reload()
    }
    stopLoading() {}
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();
        document.querySelector(this.divID).remove()
    }
};