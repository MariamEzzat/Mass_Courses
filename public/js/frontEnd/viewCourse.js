import { IDENTIFIERS } from '../constants.js';
import {get, post } from '../sdk/front.js';

import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';
import { MODAL } from './courses.js';

import { warningAlert } from './navBar.js';

export class ViewCourse extends MODAL {
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

            get(IDENTIFIERS.COURSES.COURSES.COURSE_STUDENTS, {
                courseID: this.courseID
            },
            (result) => {
                console.log("enrolled student list "+result);
                this.enrolledStudentsList = result
                if (--vote <= 0) {
                    super.load()
                }
            }, (data) => {
                super.loadError(data.err)
            })

        get(IDENTIFIERS.COURSES.COURSES.COURSE, {
                courseID: this.courseID
            },
            (result) => {
                //console.log(result);
                this.courseData = result
                console.log("ngrb: "+ JSON.stringify(result))
                if (--vote <= 0) {
                    super.load()
                }
            }, (data) => {
                super.loadError(data.err)
            })

    }
    render() {

        $(`${this.divID} #Content`).load(V.COURSES.VIEW_COURSE.HTML_URL, () => {
            this.player = new Plyr('#player', {
                title: 'Example Title',
                controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'rewind', /* , 'captions' */ , 'settings', 'pip', 'airplay', 'fullscreen'],
                clickToPlay: true,
                resetOnEnd: true,
                keyboard: { focused: true, global: false },
                displayDuration: true,
                /* captions: { active: true, language: 'auto', update: false }, */
                ratio: '10:5',
                storage: { enabled: true, key: 'plyr' },
                quality: { default: 720, options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240] },
            });


            $(`${this.divID} #view_courseTitle`).html(this.courseData.name)

            $(`${this.divID} #view_instructorsNames`).html(`Instructors of Course : <span class="font-weight-light">${this.getValue(this.courseData.instructor)}</span>`);

            const coursesTab = document.querySelectorAll('[course-tab-target]')
            coursesTab.forEach(tab => {
                tab.onclick = (e) => {
                    const target = document.querySelector(tab.getAttribute('course-tab-target'))
                    $(target).siblings().addClass('d-none')
                    $($(e.target.parentElement).siblings()).children().removeClass('newUresActive')
                    tab.classList.add('newUresActive');
                    this.currentTab = e.target.id
                    target.classList.remove('d-none');
                };
            });
            this.addLecturesForCourse();
            this.fillLecturesList(this.courseData.lectures);
            this.enrolledStudentsList(this.enrolledStudentsList)

        })

        super.render();
    };
    addLecturesForCourse() {
        document.querySelector(`${this.divID} #addLecture_btn_open`).onclick = e => {
            let div = document.createElement('div')
            div.id = 'addLecturesForCourse'
            $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
            super.newView(V.COURSES.ADD_LECTURES.VIEW_ID, '#addLecturesForCourse', {
                courseID: this.courseID,
                courseName: this.courseData.name
            }, {})
        }

    };
    fillLecturesList(arr) {
        if (arr == undefined) return
        let row = ``
        for (let i = 0; i < arr.length; i++) {
            row += `
                <li class="p-1">
                    <div class="rounded border ${(arr[i].demo)?'alert-primary':'rgba-grey-lighter'} px-1 py-2 d-flex flex-column">
                        <div class="d-flex justify-content-end p-0" data-ID="${arr[i]._id}" data-Name="${arr[i].title}">
                        <!--<i class="fas fa-edit text-info editElement my-auto" data-ID="${arr[i]._id}"></i>-->
                            <i class="fas fa-times text-danger deleteElement my-auto mr-2" data-Name="${arr[i].title}" data-ID="${arr[i]._id}"></i>

                        </div>
                        <div class="d-flex justify-content-between p-2" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="false" aria-controls="multiCollapseExample2">
                            <p class="my-auto text-capitalize font-weight-bold" >${arr[i].title}</p>
                            <i class="fas fa-caret-down my-auto"></i>
                        </div>
                        <div class="p-2 openLectureVideo collapse rounded border p-2 bg-white" style="cursor: pointer;" id="collapse${i}" data-lectureID="${arr[i]._id}" data-parent="#lecturesList">
                            <div class="d-flex align-items-center justify-content-start" data-lectureID="${arr[i]._id}">
                                <i class="fas fa-play-circle fa-2x text-secondary" data-lectureID="${arr[i]._id}"></i>
                                <p class=" ml-3 my-auto" data-lectureID="${arr[i]._id}">${arr[i].videoName}</p>
                            </div>
                        </div>
                    </div>
                </li>
            
            `
        }
        document.querySelector(`${this.divID} #lecturesList`).innerHTML = row
        this.openLectureVideo();
        this.deleteElement();
        //this.editElement();
    };

    deleteElement() {
        document.querySelectorAll(`${this.divID} .deleteElement`).forEach(deleteElement => {
            deleteElement.onclick = e => {
                warningAlert(`Are you sure to delete <span class="text-danger">${e.target.getAttribute('data-Name')}</span>`, () => {

                    let id = e.target.getAttribute('data-ID');
                    post(IDENTIFIERS.COURSES.COURSES.DELETE_LECTURE, {
                        courseID: this.courseData._id,
                        lectureID: id
                    }, (result) => {
                        this.reload()
                    }, (err) => {
                        super.loadError(err.err)
                    })
                })

            }
        })
    }

    editElement() {
        document.querySelectorAll(`${this.divID} .editElement`).forEach(edit => {
            edit.onclick = e => {
                let div = document.createElement('div')
                div.id = 'editLecturesForCourse'
                $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
                let filter = this.courseData.lectures.filter(lec => {
                        return lec._id == e.target.getAttribute('data-ID')
                    })[0]
                    //console.log(filter);
                super.newView(V.COURSES.ADD_LECTURES.VIEW_ID, '#editLecturesForCourse', {
                    courseID: this.courseID,
                    filter: filter,
                    courseName: this.courseData.name
                }, {})


            }
        })
    }
    openLectureVideo() {
        document.querySelectorAll(`${this.divID} .openLectureVideo`).forEach(video => {
            video.onclick = e => {
                let lectureID = e.target.getAttribute('data-lectureID')
                let filter = this.courseData.lectures.filter(lecture => {
                        return lecture._id == lectureID
                    })[0]
                    //console.log(filter);
                this.player.source = {
                    type: 'video',
                    title: filter.videoName,
                    sources: [{
                        src: window.location.origin + '/download/' + filter.video.id,
                        size: 720,
                    }],
                };

                $(`${this.divID} #view_videoName`).html(`Video: <span class="font-weight-light">${filter.videoName}</span>`)
                $(`${this.divID} #view_lectureDescription`).html(`Description: <span class="font-weight-light">${(filter.description!==undefined)?filter.description:''}</span>`)
                this.fillAttachmentsList(filter.materials)
            }
        })
    }

    fillAttachmentsList(arr) {
       
        let row = ``;
        for (let k = 0; k < arr.length; k++) {
            row += `
                <a href="${window.location.origin}/download/${(arr[k].file==null)?'':arr[k].file.id}" class="fas fa-paperclip m-2" download> ${arr[k].materialName}</a>
            `
        }
        $('#view_listOfAttachments').html(row);
    }

    fillStudentsList(arr) {
        console.log("oksmballah d5lt")
        let row = ``;
        for (let k = 0; k < arr.length; k++) {
            row += `
                <h1>hh</h1>
            `
        }
        $('#view_fillStudentsList').html(row);
    }



    onPoke() {
        this.reload()
    }
    getValue(elementID) {
        if (Array.isArray(elementID)) {
            let elementName = [];
            for (let jj = 0; jj < elementID.length; jj++) {
                for (let i of this.instructorsArray) {
                    if (i._id == elementID[jj]) {
                        if (jj == elementID.length - 1) {
                            elementName.push(i.name);
                        } else { elementName.push(i.name + ', '); }
                        break;
                    }
                }
            }
            return elementName
        } else {
            let elementName = '';
            for (let i of this.instructorsArray) {
                if (i._id == elementID) {
                    elementName = i.name;
                    break;
                }
            }
            return elementName
        }
    };
    stopLoading() {}
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();
        //document.querySelector(this.divID).remove()
    }
};