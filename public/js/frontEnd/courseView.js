import { IDENTIFIERS } from "../constants.js";
import { get, post } from "../sdk/front.js";

import { View } from "../frameworks/Router.js";
import { V } from "../viewsConstants.js";
import { MODAL } from "./courses.js";

import { warningAlert } from "./navBar.js";

export class ViewCourse extends MODAL {
    constructor(envelope) {
        super(envelope);
    }
    start() {
        super.start();
    }
    promptLoading() { }
    load() {
        let vote = 2;

        get(IDENTIFIERS.COURSES.COURSES.COURSE_STUDENTS, {
            courseID: this.courseID
        },
        (result) => {
      
            this.enrolledStudentsList = result
            //if (--vote <= 0) {
                super.load()
          //  }
        }, (data) => {
            super.loadError(data.err)
        });

        get(
            IDENTIFIERS.COURSES.INSTRUCTORS.FILTER, {},
            (result) => {
                this.instructorsArray = result.instructors;
                if (--vote <= 0) {
                    super.load();
                }
            },
            (data) => {
                //super.loadError(data)
            }
        );
        get(
            IDENTIFIERS.COURSES.COURSES.COURSE, {
            courseID: this.courseID,
        },
            (result) => {
               
                this.courseData = result;
                if (--vote <= 0) {
                    super.load();
                }
            },
            (data) => {
                super.loadError(data.err);
            }
        );


     
    }
    render() {



        $(`${this.divID} #Content`).load(V.COURSES.STUDENT_VIEW_COURSE.HTML_URL, () => {
            this.player = new Plyr("#player", {
                controls: [
                    "play-large",
                    "play",
                    "progress",
                    "current-time",
                    "mute",
                    "volume",
                    "rewind" /* , 'captions' */, ,
                    "settings",
                    "pip",
                    "airplay",
                    "fullscreen",
                ],
                resetOnEnd: true,
                autoplay: true,
                keyboard: { focused: true, global: false },
                displayDuration: true,
                /* captions: { active: true, language: 'auto', update: false }, */
                ratio: "10:5",
                storage: { enabled: true, key: "plyr" },
                quality: {
                    default: 720,
                    options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240],
                },
                fullscreen: {
                    enabled: true,
                    fallback: true,
                    iosNative: true,
                    container: null,
                },
            });

            $(`${this.divID} #view_courseTitle`).html(this.courseData.name);

            $(`${this.divID} #view_instructorsNames`).html(
                `Instructors of Course : <span class="font-weight-light">${this.getValue(this.courseData.instructor)}</span>`
            );

            const coursesTab = document.querySelectorAll("[course-tab-target]");
            coursesTab.forEach((tab) => {
                tab.onclick = (e) => {
                    const target = document.querySelector(
                        tab.getAttribute("course-tab-target")
                    );
                    $(target).siblings().addClass("d-none");
                    $($(e.target.parentElement).siblings())
                        .children()
                        .removeClass("newUresActive");
                    tab.classList.add("newUresActive");
                    this.currentTab = e.target.id;
                    target.classList.remove("d-none");
                };
            });

            $(`${this.divID} #view_header`).append(`<button class="mr-2 btn btn-outline-darkBlue text-capitalize" id="addLecture_btn_open">
                <i class="fas fa-plus-circle "></i>
                </button>`);

            // $(`${this.divID} #view_header`).append(`<button class="mr-2 btn btn-outline-darkBlue text-capitalize" id="ShowStudents">
            // <i class="fas fa-user-friends"></i>
            //     </button>`);

               
            this.addLecturesForCourse();


            this.fillLecturesList(this.courseData.lectures);
            this.fillStudentsList();
        });

        super.render();
    }

    addLecturesForCourse() {
        document.querySelector(`${this.divID} #addLecture_btn_open`).onclick = (e) => {
            let div = document.createElement("div");
            div.id = "addLecturesForCourse";
            $(div)
                .addClass("custom-modal p-5")
                .appendTo("main")
                .show()
                .animate({ left: "0" }, 650);
            super.newView(V.COURSES.ADD_LECTURES.VIEW_ID, "#addLecturesForCourse", {
                courseID: this.courseID,
                courseName: this.courseData.name,
            }, {});
        };
    }


    fillStudentsList() {

       // console.log("here is the array: "+ JSON.stringify(this.enrolledStudentsList))
        // document.querySelector(`${this.divID} #ShowStudents`).onclick = (e) => {
        //     let div = document.createElement("div");
        //     div.id = "ShowStudentsList";
        //     $(div)
        //         .addClass("custom-modal p-5")
        //         .appendTo("main")
        //         .show()
        //         .animate({ left: "0" }, 650);




        // }
    }


    fillLecturesList(arr) {
        if (arr == undefined) return;
        let row = ``;

        for (let i = 0; i < arr.length; i++) {
            row += `
                <li class="p-1">
                    <div class="rounded border ${arr[i].demo ? "alert-primary" : "rgba-grey-lighter"} px-1 py-2 d-flex flex-column">
                        <div class="d-flex justify-content-end p-0" data-ID="${arr[i]._id}" data-Name="${arr[i].title}">
                        <!--<i class="fas fa-edit text-info editElement mr-2 my-auto" data-ID="${arr[i]._id}"></i>-->
                        ${this.student == true ? "" : `<i class="fas fa-times text-danger deleteElement my-auto mr-2" data-Name="${arr[i].title}" data-ID="${arr[i]._id}"></i>`}
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
                </li>`;
            document.querySelector(`${this.divID} #lecturesList`).innerHTML = row;
            this.openLectureVideo();
        }
        this.deleteElement();
        this.editElement();
    }

    deleteElement() {
        document.querySelectorAll(`${this.divID} .deleteElement`).forEach((deleteElement) => {
            deleteElement.onclick = (e) => {
                warningAlert(`Are you sure to delete <span class="text-danger">${e.target.getAttribute("data-Name")}</span>`,
                    () => {
                        let id = e.target.getAttribute("data-ID");
                        let filter = this.courseData.lectures.filter((lec) => {
                            return lec._id == id;
                        })[0];
                        //console.log(filter);
                        let videoId = filter.video.id;
                        //console.log(videoId);
                        post(
                            IDENTIFIERS.COURSES.COURSES.DELETE_LECTURE,
                            {
                                courseID: this.courseData._id,
                                lectureID: id,
                            },
                            (result) => {
                                fetch("http://:8080/delete/" + videoId, {
                                    mode: "cors",
                                });
                                this.reload();
                            },
                            (err) => {
                                super.loadError(err.err);
                            }
                        );
                    }
                );
            };
        });
    }

    editElement() {
        document.querySelectorAll(`${this.divID} .editElement`).forEach((edit) => {
            edit.onclick = (e) => {
                let div = document.createElement("div");
                div.id = "editLecturesForCourse";
                $(div).addClass("custom-modal p-5").appendTo("main").show().animate({ left: "0" }, 650);
                let filter = this.courseData.lectures.filter((lec) => {
                    return lec._id == e.target.getAttribute("data-ID");
                })[0];
                //console.log(filter);
                super.newView(V.COURSES.ADD_LECTURES.VIEW_ID, "#editLecturesForCourse",
                    {
                        courseID: this.courseID,
                        filter: filter,
                        courseName: this.courseData.name,
                    },
                    {}
                );
            };
        });
    }

    openLectureVideo() {
        document.querySelectorAll(`${this.divID} .openLectureVideo`).forEach((video) => {
            video.onclick = (e) => {
                let lectureID = e.target.getAttribute("data-lectureID");
                get(
                    IDENTIFIERS.COURSES.COURSES.LECTURE,
                    {
                        lectureID: lectureID,
                        courseID: this.courseData._id,
                    },
                    (result) => {
                        //console.log(result);
                        this.player.source = {
                            type: "video",
                            title: result.videoName,
                            sources: [{
                                src: "http://localhost:8080/video/" + result.video.id,
                                size: 720,
                            }],
                        };
                        document.querySelector(`${this.divID} video`).setAttribute("data-lectureID", result._id);

                        this.videoCurrentTime(lectureID);

                        //console.log(result.video.currentTime);
                        $(`${this.divID} #view_videoName`).html(`Video: <span class="font-weight-light">${result.videoName}</span>`);
                        $(`${this.divID} #view_lectureDescription`).html(`Description: <span class="font-weight-light">${result.description !== undefined ? result.description : ""}</span>`);
                        this.fillAttachmentsList(result.materials);
                        this.intervalCurrentVideoTime();
                    },
                    (err) => {
                        console.log(err);
                    }
                );
            };
        });

        if (this.courseData.lectures.length!==0) {
            document.querySelectorAll(`${this.divID} .openLectureVideo`)[0].click()
            $(document.querySelectorAll(`${this.divID} .openLectureVideo`)[0]).collapse('show');
        }
    }

    intervalCurrentVideoTime() {
        this.intervalVideo = setInterval((e) => {
            if (document.querySelector(`${this.divID} video`).paused == false && document.querySelector(`${this.divID} video`).currentTime > 1) {
                //console.log("h");
                // console.log({
                //     lectureID:document.querySelector(`${this.divID} video`).getAttribute('data-lectureID'),
                //     currentTime:document.querySelector(`${this.divID} video`).currentTime
                // });
                post(
                    IDENTIFIERS.COURSES.COURSES.INSERT_VIDEO_CURRENT_TIME,
                    {
                        courseID: this.courseData._id,
                        lectureID: document.querySelector(`${this.divID} video`).getAttribute("data-lectureID"),
                        currentTime: document.querySelector(`${this.divID} video`).currentTime,
                    },
                    () => {
                        //console.log('done');
                    },
                    (err) => {
                        console.log(err);
                    }
                );
            }
        }, 3000);
    }

    fillAttachmentsList(arr) {
      
        let row = ``;
        for (let k = 0; k < arr.length; k++) {
            row += `
                <a target="_blank" href="http://localhost:8080/video/${arr[k].file == null ? "" : arr[k].file.id}" class="fas fa-paperclip m-2" download> ${arr[k].name}</a>
            `;
        }
        $("#view_listOfAttachments").html(row);
    }



    videoCurrentTime(lectureID) {
        get(
            IDENTIFIERS.COURSES.COURSES.VIDEO_CURRENT_TIME,
            {
                lectureID: lectureID
            },
            (result) => {
                //console.log(result);
                if (Object.keys(result).length !== 0 && result.hasOwnProperty('stopPoint')) {
                    //console.log('here');
                    //console.log(result.stopPoint);
                    document.querySelector(`${this.divID} video`).pause();
                    document.querySelector(`${this.divID} video`).currentTime = result.stopPoint;
                    document.querySelector(`${this.divID} video`).play();
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    getValue(elementID) {
        if (Array.isArray(elementID)) {
            let elementName = [];
            for (let jj = 0; jj < elementID.length; jj++) {
                for (let i of this.instructorsArray) {
                    if (i._id == elementID[jj]) {
                        if (jj == elementID.length - 1) {
                            elementName.push(i.name);
                        } else {
                            elementName.push(i.name + ", ");
                        }
                        break;
                    }
                }
            }
            return elementName;
        } else {
            let elementName = "";
            for (let i of this.instructorsArray) {
                if (i._id == elementID) {
                    elementName = i.name;
                    break;
                }
            }
            return elementName;
        }
    }
    stopLoading() { }
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg); }
    onPoke() { this.reload(); }
    close() {
        super.close();
        clearInterval(this.intervalVideo);
    }
}











export class Student_ViewCourse extends MODAL {
    constructor(envelope) {
        super(envelope);
    }
    start() {
        super.start();
    }
    promptLoading() { }
    load() {
        let vote = 2;
        if (this.myCourse == undefined) {
            vote += 1;
            get(
                IDENTIFIERS.COURSES.COURSES.COURSE_LAST_STATE, {
                courseID: this.courseID,
            },
                (result) => {
                    console.log(result);
                    this.wishListState = result.wishList
                    this.cartState = result.cart
                    if (--vote <= 0) {
                        super.load();
                    }
                },
                (data) => {
                    super.loadError(data.err);
                }
            );
            // get(
            //     IDENTIFIERS.COURSES.COURSES.COURSE_LAST_CART_STATE, {
            //     courseID: this.courseID,
            // },
            //     (result) => {
            //         //console.log(result);
            //         this.cartState = result
            //         if (--vote <= 0) {
            //             super.load();
            //         }
            //     },
            //     (data) => {
            //         super.loadError(data.err);
            //     }
            // );
        }
        get(
            IDENTIFIERS.COURSES.INSTRUCTORS.FILTER, {},
            (result) => {
                this.instructorsArray = result.instructors;
                if (--vote <= 0) {
                    super.load();
                }
            },
            (data) => {
                //super.loadError(data)
            }
        );
        get(
            IDENTIFIERS.COURSES.COURSES.COURSE, {
            courseID: this.courseID,
        },
            (result) => {
               console.log(result);
                this.courseData = result;
                if (--vote <= 0) {
                    super.load();
                }
            },
            (data) => {
                super.loadError(data.err);
            }
        );
    }
    render() {
        document.querySelector(`${this.divID}.custom-modal .card.parent`).classList.add('mt-0')
        document.querySelector(`${this.divID}.custom-modal`).style.zIndex = '55555'
        document.querySelector(`${this.divID}.custom-modal .card.parent`).classList.add('mb-0')
        $(`${this.divID} #Content`).load(V.COURSES.ADMIN_VIEW_COURSE.HTML_URL, () => {
            this.player = new Plyr("#player", {
                controls: [
                    "play-large",
                    "play",
                    "progress",
                    "current-time",
                    "mute",
                    "volume",
                    "rewind" /* , 'captions' */, ,
                    "settings",
                    "pip",
                    "airplay",
                    "fullscreen",
                ],
                resetOnEnd: true,
                autoplay: true,
                keyboard: { focused: true, global: false },
                displayDuration: true,
                /* captions: { active: true, language: 'auto', update: false }, */
                ratio: "10:5",
                storage: { enabled: true, key: "plyr" },
                quality: {
                    default: 720,
                    options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240],
                },
                fullscreen: {
                    enabled: true,
                    fallback: true,
                    iosNative: true,
                    container: null,
                }, 
            });

            $(`${this.divID} #view_courseTitle`).html(this.courseData.name);

            $(`${this.divID} #view_instructorsNames`).html(
                `Instructors of Course : <span class="font-weight-light">${this.getValue(this.courseData.instructor)}</span>`
            );

            const coursesTab = document.querySelectorAll("[course-tab-target]");
            coursesTab.forEach((tab) => {
                tab.onclick = (e) => {
                    const target = document.querySelector(
                        tab.getAttribute("course-tab-target")
                    );
                    $(target).siblings().addClass("d-none");
                    $($(e.target.parentElement).siblings())
                        .children()
                        .removeClass("newUresActive");
                    tab.classList.add("newUresActive");
                    this.currentTab = e.target.id;
                    target.classList.remove("d-none");
                };
            });

            $(`${this.divID} #view_header`).append(`
                <div class="btn-group dropleft my-auto">
                    <i class="fas fa-caret-down font-size-18px" data-toggle="dropdown" aria-expanded="false"></i>
                    <div class="dropdown-menu">
                        ${(this.myCourse == undefined && this.wishListState.wishList == 'cart') ?
                    '<a class="far fa-star py-2 pl-2 text-warning text-capitalize text-decoration-none" href="#" disabled="disabled"> wishList</a>'
                    : (this.myCourse == undefined && this.wishListState.wishList == 1) ? '<a class="far fa-star py-2 pl-2 text-danger removeToWishList text-capitalize text-decoration-none" href="#"> wishList</a>' :
                        '<a class="far fa-star py-2 pl-2 text-warning addToWishList text-capitalize text-decoration-none" href="#"> wishList</a>'}

                        ${(this.myCourse == undefined && this.cartState.cart == 1) ?
                    '<a class="fab fa-wpforms dropdown-item py-2 pl-2 text-danger removeRequestCourse text-capitalize text-decoration-none" href="#"> cart</a>'
                    : (this.myCourse == undefined && this.cartState.cart == 'purchase') ?
                        '<a class="fab fa-wpforms dropdown-item py-2 pl-2 text-primary text-capitalize text-decoration-none" href="#" disabled="disabled"> cart</a>'
                        : '<a class="fab fa-wpforms dropdown-item py-2 pl-2 text-primary requestCourse text-capitalize text-decoration-none" href="#"> cart</a>'}
                    </div>
                </div>`);

            /* Avoid dropdown menu close on click inside */
            $(document).on('click', `${this.divID} #view_header  .dropdown-menu`, function (e) {
                e.stopPropagation();
            });

            if (this.myCourse == undefined && this.wishListState.wishList == 'cart') {

            } else if (this.myCourse == undefined && this.wishListState.wishList == 1) {
                this.removeToWishList();
            } else {
                this.addToWishList();
            }
            // console.log(this.wishListState.wishList);
            // console.log(this.cartState.cart);

            if (this.myCourse == undefined && this.cartState.cart == 'purchase') {
            } else if (this.myCourse == undefined && this.cartState.cart == 1) {
                this.removeRequestCourse();
            } else if (this.myCourse == undefined) {
                this.requestCourse();
            }

            this.fillLecturesList(this.courseData.lectures);
        });
        super.render();
    }
    requestCourse() {
        document.querySelector(`${this.divID} .requestCourse`).onclick = e => {
            post(IDENTIFIERS.COURSES.COURSES.ADD_TO_CART, {
                courseID: this.courseData._id,
            },
                (result) => {
                    $(e.target).removeClass('text-primary requestCourse')
                    $(e.target).addClass('text-danger removeRequestCourse')
                    this.removeRequestCourse()
                },
                (err) => {
                    super.loadError(err.err);
                }
            );
        }
    }

    removeRequestCourse() {
        document.querySelector(`${this.divID} .removeRequestCourse`).onclick = e => {
            post(IDENTIFIERS.COURSES.COURSES.REMOVE_FROM_CART, {
                courseID: this.courseData._id,
            },
                (result) => {
                    $(e.target).removeClass('text-danger removeRequestCourse');
                    $(e.target).addClass('text-primary requestCourse')
                    this.requestCourse()
                },
                (err) => {
                    super.loadError(err.err);
                }
            );
        }
    }

    addToWishList() {
        document.querySelector(`${this.divID} .addToWishList`).onclick = e => {
            post(IDENTIFIERS.COURSES.COURSES.ADD_TO_WISHLIST, {
                courseID: this.courseData._id,
            },
                (result) => {
                    e.target.remove()
                    $(`${this.divID} #view_header .dropdown-menu`).prepend(`<a class="fas fa-star py-2 pl-2 text-warning removeToWishList text-capitalize text-decoration-none" href='#'> wishList</a>`)
                    this.removeToWishList()
                },
                (err) => {
                    super.loadError(err.err);
                }
            );
        }
    }

    removeToWishList() {
        document.querySelector(`${this.divID} .removeToWishList`).onclick = e => {
            post(IDENTIFIERS.COURSES.COURSES.REMOVE_FROM_WISHLIST, {
                courseID: this.courseData._id,
            },
                (result) => {
                    e.target.remove()
                    $(`${this.divID} #view_header .dropdown-menu`).prepend(`<a class="far fa-star py-2 pl-2 text-warning addToWishList text-capitalize text-decoration-none" href='#'> wishList</a>`)
                    this.addToWishList()
                },
                (err) => {
                    super.loadError(err.err);
                }
            );
        }
    }

    fillLecturesList(arr) {
        if (arr == undefined) return;
        let row = ``;
        for (let i = 0; i < arr.length; i++) {
            if (this.myCourse == undefined && arr[i].demo == true) {
                row += `
                    <li class="p-1">
                        <div class="rounded border ${arr[i].demo ? "alert-primary" : "rgba-grey-lighter"} px-1 py-2 d-flex flex-column">
                            <div class="d-flex justify-content-end p-0" data-ID="${arr[i]._id}" data-Name="${arr[i].title}">
                            <!--<i class="fas fa-edit text-info editElement my-auto" data-ID="${arr[i]._id}"></i>-->
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
                    </li>`;
            }else if (this.myCourse==true){
                row += `
                    <li class="p-1">
                        <div class="rounded border ${arr[i].demo ? "alert-primary" : "rgba-grey-lighter"} px-1 py-2 d-flex flex-column">
                            <div class="d-flex justify-content-end p-0" data-ID="${arr[i]._id}" data-Name="${arr[i].title}">
                            <!--<i class="fas fa-edit text-info editElement my-auto" data-ID="${arr[i]._id}"></i>-->
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
                    </li>`;
            }
            document.querySelector(`${this.divID} #lecturesList`).innerHTML = row;
            this.openLectureVideo();
        }
    }

    openLectureVideo() {
        document.querySelectorAll(`${this.divID} .openLectureVideo`).forEach((video) => {
            video.onclick = (e) => {
                let lectureID = e.target.getAttribute("data-lectureID");
                get(
                    IDENTIFIERS.COURSES.COURSES.LECTURE,
                    {
                        lectureID: lectureID,
                        courseID: this.courseData._id,
                    },
                    (result) => {
                        //console.log(result);
                        this.player.source = {
                            type: "video",
                            title: result.videoName,
                            sources: [{
                                src: "http://localhost:8080/video/" + result.video.id,
                                size: 720,
                            }],
                        };
                        document.querySelector(`${this.divID} video`).setAttribute("data-lectureID", result._id);

                        this.videoCurrentTime(lectureID);

                        //console.log(result.video.currentTime);
                        $(`${this.divID} #view_videoName`).html(`Video: <span class="font-weight-light">${result.videoName}</span>`);
                        $(`${this.divID} #view_lectureDescription`).html(`Description: <span class="font-weight-light">${result.description !== undefined ? result.description : ""}</span>`);
                        this.fillAttachmentsList(result.materials);
                        this.intervalForCurrentVideoTime()
                    },
                    (err) => {
                        console.log(err);
                    }
                );


            };
        });
        if (this.courseData.lectures.length!==0) {
            document.querySelectorAll(`${this.divID} .openLectureVideo`)[0].click()
            $(document.querySelectorAll(`${this.divID} .openLectureVideo`)[0]).collapse('show');
        }
    }

    intervalForCurrentVideoTime() {
        this.intervalVideo = setInterval((e) => {
            if (document.querySelector(`${this.divID} video`).paused == false && document.querySelector(`${this.divID} video`).currentTime > 1) {
                //console.log("h");
                // console.log({
                //     lectureID:document.querySelector(`${this.divID} video`).getAttribute('data-lectureID'),
                //     currentTime:document.querySelector(`${this.divID} video`).currentTime
                // });
                post(
                    IDENTIFIERS.COURSES.COURSES.INSERT_VIDEO_CURRENT_TIME,
                    {
                        courseID: this.courseData._id,
                        lectureID: document.querySelector(`${this.divID} video`).getAttribute("data-lectureID"),
                        currentTime: document.querySelector(`${this.divID} video`).currentTime,
                    },
                    () => {
                        //console.log('done');
                    },
                    (err) => {
                        console.log(err);
                    }
                );
            }
        }, 3000);
    }

    fillAttachmentsList(arr) {
        
        let row = ``;
        for (let k = 0; k < arr.length; k++) {
            row += `
                <a target="_blank" href="http://localhost:8080/video/${arr[k].file == null ? "" : arr[k].file.id
                }" class="fas fa-paperclip m-2" download> ${arr[k].name}</a>
            `;
        }
        $("#view_listOfAttachments").html(row);
    }
    // fillStudentsList(arr) {
    //     console.log("oksmballah d5lt")
    //     let row = ``;
    //     for (let k = 0; k < arr.length; k++) {
    //         row += `
    //             <h1>hh</h1>
    //         `
    //     }
    //     $('#view_fillStudentsList').html(row);
    // }
    videoCurrentTime(lectureID) {
        get(
            IDENTIFIERS.COURSES.COURSES.VIDEO_CURRENT_TIME,
            {
                lectureID: lectureID
            },
            (result) => {
                //console.log(result);
                if (Object.keys(result).length !== 0 && result.hasOwnProperty('stopPoint')) {
                    //console.log('here');
                    //console.log(result.stopPoint);
                    document.querySelector(`${this.divID} video`).pause();
                    document.querySelector(`${this.divID} video`).currentTime = result.stopPoint;
                    document.querySelector(`${this.divID} video`).play();
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    getValue(elementID) {
        if (Array.isArray(elementID)) {
            let elementName = [];
            for (let jj = 0; jj < elementID.length; jj++) {
                for (let i of this.instructorsArray) {
                    if (i._id == elementID[jj]) {
                        if (jj == elementID.length - 1) {
                            elementName.push(i.name);
                        } else {
                            elementName.push(i.name + ", ");
                        }
                        break;
                    }
                }
            }
            return elementName;
        } else {
            let elementName = "";
            for (let i of this.instructorsArray) {
                if (i._id == elementID) {
                    elementName = i.name;
                    break;
                }
            }
            return elementName;
        }
    }
    stopLoading() { }
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg); }
    onPoke() { this.reload(); }
    close() {
        super.close();
        clearInterval(this.intervalVideo);
    }
}