import { IDENTIFIERS } from '../constants.js';
import {get, post } from '../sdk/front.js';
import { Uploader } from '../libraries/uploader.js';
import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';
import { warningAlert } from './navBar.js';

export class Courses_Main extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {
        $(this.divID).load(V.COURSES.MAIN.HTML_URL, () => {
            super.load()
        });
    }
    render() {

        $('#CoursesTab_filter_universities').click(e => {
            super.closeOthers({ children: 1 })
            let div = document.createElement('div')
            div.id = 'CoursesTab_filter_universitiesList';
            $('#CoursesTab_filter_universities').css({ "z-index": "0" })

            $(div).addClass('custom-modal').appendTo("main").show().animate({ left: '0' }, 650)
            super.newView(V.COURSES.COURSES_LIST.MODAL_UNIV_LIST.VIEW_ID, '#CoursesTab_filter_universitiesList', { student: this.student }, {})
        });

        $('#CoursesTab_filter_courses').click(e => {
          
            super.closeOthers({ children: 1 })
            let div = document.createElement('div')
            div.id = 'CoursesTab_filter_coursesList'
            $('#CoursesTab_filter_courses').css({ "z-index": "0" })
            $(div).addClass('custom-modal').appendTo("main").show().animate({ left: '0' }, 650)
         
            super.newView(V.COURSES.COURSES_LIST.MODAL_COURSES_LIST.VIEW_ID, '#CoursesTab_filter_coursesList', {
                
                filterOptions: [],
                student: this.student
            }, {})
        });




        // if (this.student == undefined) {
        //     $('#CoursesTab_header_buttonAddCourse').html(`  
        //         <button class="mr-2 btn btn-outline-darkBlue text-capitalize" id="CoursesTab_open_newCourse">
        //             <i class="fas fa-plus-circle "></i>
        //         </button>`)
        //     this.clicked = -1
        //     $('#CoursesTab_open_newCourse').click(e => {
        //         if (this.clicked == -1) {
        //             this.clicked = 1
        //             super.closeOthers({
        //                 children: 1
        //             });
        //             let div = document.createElement('div')
        //             div.id = 'newCourse'
        //             $('#CoursesTab_filter_universities').css({ "z-index": "0" })
        //             $('#CoursesTab_filter_courses').css({ "z-index": "0" })
        //             $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
        //             super.newView(V.COURSES.NEW_COURSE.VIEW_ID, '#newCourse', {}, {})
        //         } else {
        //             return
        //         }
        //     });
        // }

        super.render();
    };

    stopLoading() {}
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    onPoke() {
        this.clicked == -1
        this.reload()
    }
    close() {
        super.close();
        document.querySelector(this.divID).remove()
    }
};

export class MODAL extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {
        this.vote = 1
        $(this.divID).load(V.MODAL.HTML_URL, () => {
            document.querySelector('body').classList.add('overflow-hidden')
            if (--this.vote <= 0) { super.load() }
        });

    }
    render() {
        if (this.student !== undefined) {
            document.querySelectorAll('.custom-modal .card.parent').forEach(modal => {
                modal.classList.add('mt-0')
            })
        }
        $(`${this.divID} .backArrow`).click(() => {
            this.close()
        });

        super.render();
    };

    stopLoading() {}
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();
        $(this.divID).animate({ left: '-100%' }, 650, () => {
            document.querySelector(this.divID).remove()
        })
        document.querySelector('body').classList.remove('overflow-hidden')
    }
};

export class ModalUniversitiesList extends MODAL {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {

        get(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.UNIVERSITIES, {},
            (result) => {
                this.universitiesArray = result;
                super.load()
            }, (err) => {
                super.loadError(err.err)
            })

    }
    render() {

        this.fillUniversities(this.universitiesArray)

        if (this.student == undefined) {
            document.querySelector('.addUniversity').classList.remove('d-none')
            document.querySelector('.addUniversity').onclick = e => {
                let div = document.createElement('div')
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    image: true,
                    labelTitle: 'University',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_UNIVERSITY,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_UNIV_LIST.VIEW_ID }
                }, {})
            }
        }

        super.render();
    };

    openFuculties() {
        document.querySelectorAll(`${this.divID} .eachUniversity`).forEach(univ => {
            univ.onclick = e => {
                console.log(e.target.getAttribute('data-ID'));
                let div = document.createElement('div')
                div.id = 'CoursesTab_filter_facultiesList'
                $('#CoursesTab_filter_facultiesList').addClass('custom-modal');
                $(div).addClass('custom-modal').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.COURSES.COURSES_LIST.MODAL_FACUL_LIST.VIEW_ID, '#CoursesTab_filter_facultiesList', { universityID: e.target.getAttribute('data-ID'), student: this.student }, {})
            }
        })

    }

    fillUniversities(arr) {
            let row = `
            <div class="d-flex justify-content-between">
                <h3 class="text-capitalize">universities</h3>
                <i class="fas fa-plus-circle addUniversity d-none fa-2x text-warning my-auto"></i>
            </div>
            <div class="row pl-3" id="list">`
            for (let i of arr) {
                row += `
            <div class="col-md-4 col-xl-3 d-flex mt-2" data-ID="${i._id}" style="cursor: pointer;">
                <div class="${(this.student==undefined)?'col-10':'col-12'} row card border eachUniversity shadow rounded p-0 text-center text-capitalize" data-ID="${i._id}">
                    <div class="row" data-ID="${i._id}">
                        <div class="col-2" data-ID="${i._id}">
                            <img class="border shadow rounded" data-ID="${i._id}" width="75" height="75"
                            ${(i.logoURL==null)?'src="../../img/imageNoteAvailable.jpg"':`src="https://p56dki765gz8k.com/download/${i.logoURL.id}"`} />
                        </div>
                        <p class="col-9 my-auto py-2" data-ID="${i._id}">${i.name}</p>
                    </div>
                </div>
                ${(this.student==undefined)?`
                <div class="col-2 d-flex flex-column pr-2"> 
                    <button class="btn btn-outline-warning hideElement font-size-14px text-capitalize p-0 mb-1" data-ID="${i._id}" id="">
                        <i class="fas fa-minus-circle mx-auto" data-ID="${i._id}"></i>
                    </button>
                    <button class="btn btn-outline-danger deleteElement font-size-14px text-capitalize p-0 mb-1" data-Name="${i.name}" data-ID="${i._id}" data-Name="${i.name}" id="">
                        <i class=" fas fa-times mx-auto" data-ID="${i._id}" data-Name="${i.name}" data-Name="${i.name}"></i>
                    </button>
                    <button class="btn btn-outline-primary editElement font-size-14px text-capitalize p-0" data-ID="${i._id}" id="">
                        <i class=" fas fa-edit mx-auto" data-ID="${i._id}"></i>
                    </button>
                </div>
                `:''}
                
            </div>
            
            `
        }
        row += `</div>`
        document.querySelector(`${this.divID} #Content`).innerHTML = row;
        this.openFuculties();
        this.hideElement();
        this.deleteElement();
        this.editElement();
    }

    hideElement() {
        document.querySelectorAll(`${this.divID} .hideElement`).forEach(hide => {
            hide.onclick = e => {

                let id = e.target.getAttribute('data-ID');
                post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_UNIVERSITY, {
                    universityID: id,
                    hidden: 1
                }, (result) => {
                    this.reload()
                }, (err) => {
                    super.loadError(err.err)
                })
            }
        })
    }
    deleteElement() {
        document.querySelectorAll(`${this.divID} .deleteElement`).forEach(deleteElement => {
            deleteElement.onclick = e => {
                warningAlert(`Are you sure to delete <span class="text-danger">${e.target.getAttribute('data-Name')}</span>`, () => {
                    let id = e.target.getAttribute('data-ID');
                    post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_UNIVERSITY, {
                        universityID: id,
                        deleted: 1
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
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                let filter = this.universitiesArray.filter(uni => {
                    return uni._id == e.target.getAttribute('data-ID')
                })[0]
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    image: true,
                    labelTitle: 'University',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_UNIVERSITY,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_UNIV_LIST.VIEW_ID },
                    targetName: 'universityID',
                    edit: filter
                }, {})
            }
        })
    }
    stopLoading() {}
    reload() { super.reload({}); }
    onPoke() {
        this.reload()
    }
    promptError(error) { console.log(error.errMsg) }
    close() { super.close(); }
};

export class ModalFacultiesList extends MODAL {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {
        get(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.FACULTIES, {
                universityID: this.universityID
            },
            (result) => {
                console.log(result);
                this.Array = result;
                super.load()
            }, (err) => {
                super.loadError(err.err)
            })
    }
    render() {

        this.fillFaculties(this.Array)

        if(this.student==undefined){
            document.querySelector('.addFaculty').classList.remove('d-none')
            document.querySelector('.addFaculty').onclick = e => {
                let div = document.createElement('div')
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    image: true,
                    labelTitle: 'Faculty',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_FACULTY,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_FACUL_LIST.VIEW_ID },
                    haveParent: true,
                    parentName: 'universityID',
                    parentID: this.universityID
                }, {})
            }
        }


        super.render();
    };
    openDepartments() {
        document.querySelectorAll(`${this.divID} .eachFaculty`).forEach(faculty => {
            faculty.onclick = e => {
                let div = document.createElement('div')
                div.id = 'CoursesTab_filter_DepartmentsList'
                $(div).addClass('custom-modal').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.COURSES.COURSES_LIST.MODAL_DEPARTMENTS_LIST.VIEW_ID, '#CoursesTab_filter_DepartmentsList', {
                    facultyID: e.target.getAttribute('data-ID'),student:this.student
                }, {})
            }
        });
    }
    fillFaculties(arr) {
        let row = `
            <div class="d-flex justify-content-between">
                <h3 class="text-capitalize">faculties</h3>
                <i class="fas fa-plus-circle d-none addFaculty fa-2x text-warning my-auto"></i>
            </div>
            <div class="row pl-3" id="list">`
        for (let i of arr) {
            row += `
            <div class="col-md-4 col-xl-3 d-flex mt-2" data-ID="${i._id}" style="cursor: pointer;">
                <div class="${(this.student==undefined)?'col-10':'col-12'} row card border eachFaculty shadow rounded p-0 text-center text-capitalize" data-ID="${i._id}">
                    <div class="row" data-ID="${i._id}">
                        <div class="col-2" data-ID="${i._id}">
                            <img class="border shadow rounded" data-ID="${i._id}" width="75" height="75" 
                            ${(i.logoURL==null)?'src="../../img/imageNoteAvailable.jpg"':`src="https://p56dki765gz8k.com/download/${i.logoURL.id}"`}  />
                        </div>
                        <p class="col-9 my-auto py-2" data-ID="${i._id}">${i.name}</p>
                    </div>
                </div>
                ${(this.student==undefined)?`
                <div class="col-2 d-flex flex-column pr-2"> 
                    <button class="btn btn-outline-warning hideElement font-size-14px text-capitalize p-0 mb-1" data-ID="${i._id}" id="">
                        <i class="fas fa-minus-circle mx-auto" data-ID="${i._id}"></i>
                    </button>
                    <button class="btn btn-outline-danger deleteElement font-size-14px text-capitalize p-0 mb-1" data-Name="${i.name}" data-ID="${i._id}" data-Name="${i.name}" id="">
                        <i class=" fas fa-times mx-auto" data-ID="${i._id}" data-Name="${i.name}" data-Name="${i.name}"></i>
                    </button>
                    <button class="btn btn-outline-primary editElement font-size-14px text-capitalize p-0" data-ID="${i._id}" id="">
                        <i class=" fas fa-edit mx-auto" data-ID="${i._id}"></i>
                    </button>
                </div>
                `:''}
                
            </div>
            
            `
        }
        row += `</div>`
        document.querySelector(`${this.divID} #Content`).innerHTML = row;
        this.openDepartments()
        this.hideElement();
        this.deleteElement();
        this.editElement();
    }
    hideElement() {
        document.querySelectorAll(`${this.divID} .hideElement`).forEach(hide => {
            hide.onclick = e => {
                e.stopPropagation()
                let id = e.target.getAttribute('data-ID');
                post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_FACULTY, {
                    facultyID: id,
                    hidden: 1
                }, (result) => {
                    this.reload()
                }, (err) => {
                    super.loadError(err.err)
                })
            }
        })
    }
    deleteElement() {
        document.querySelectorAll(`${this.divID} .deleteElement`).forEach(deleteElement => {
            deleteElement.onclick = e => {
                warningAlert(`Are you sure to delete <span class="text-danger">${e.target.getAttribute('data-Name')}</span>`, () => {
                    let id = e.target.getAttribute('data-ID');
                    post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_FACULTY, {
                        facultyID: id,
                        deleted: 1
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
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                let filter = this.Array.filter(faculty => {
                    return faculty._id == e.target.getAttribute('data-ID')
                })[0]
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    image: true,
                    labelTitle: 'Faculty',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_FACULTY,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_FACUL_LIST.VIEW_ID },
                    haveParent: true,
                    parentName: 'universityID',
                    parentID: this.universityID,
                    targetName: 'facultyID',
                    edit: filter
                }, {})
            }
        })
    }
    stopLoading() {}
    reload() { super.reload({}); }
    onPoke() {
        this.reload()
    }
    promptError(error) { console.log(error.errMsg) }
    close() { super.close(); }
};

export class ModalDepartmentsList extends MODAL {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {
        get(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.DEPARTMENTS, {
                facultyID: this.facultyID
            },
            (result) => {
                this.Array = result;
                super.load()
            }, (err) => {
                super.loadError(err.err)
            })
    }
    render() {

        this.fillDepartments(this.Array)

        if(this.student==undefined){
            document.querySelector('.addDepartment').classList.remove('d-none')
            document.querySelector('.addDepartment').onclick = e => {
                let div = document.createElement('div')
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    image: true,
                    labelTitle: 'Department',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_DEPARTMENT,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_DEPARTMENTS_LIST.VIEW_ID },
                    haveParent: true,
                    parentName: 'facultyID',
                    parentID: this.facultyID
                }, {})
            };
        }

        super.render();
    };
    fillDepartments(arr) {
        let row = `
            <div class="d-flex justify-content-between">
                <h3 class="text-capitalize">departments</h3>
                <i class="fas fa-plus-circle d-none addDepartment fa-2x text-warning my-auto"></i>
            </div>
            <div class="row pl-3" id="list">`
        for (let i of arr) {
            row += `
            <div class="col-md-4 col-xl-3 d-flex mt-2" data-ID="${i._id}" style="cursor: pointer;">
                <div class="${(this.student==undefined)?'col-10':'col-12'} row card border eachDepartment shadow rounded p-0 text-center text-capitalize" data-ID="${i._id}">
                    <div class="row" data-ID="${i._id}">
                        <div class="col-2" data-ID="${i._id}">
                            <img class="border shadow rounded" data-ID="${i._id}" width="75" height="75" 
                            ${(i.logoURL==null)?'src="../../img/imageNoteAvailable.jpg"':`src="https://p56dki765gz8k.com/download/${i.logoURL.id}"`}  />
                        </div>
                        <p class="col-9 my-auto py-2" data-ID="${i._id}">${i.name}</p>
                    </div>
                </div>
                ${(this.student==undefined)?`
                <div class="col-2 d-flex flex-column pr-2"> 
                    <button class="btn btn-outline-warning hideElement font-size-14px text-capitalize p-0 mb-1" data-ID="${i._id}" id="">
                        <i class="fas fa-minus-circle mx-auto" data-ID="${i._id}"></i>
                    </button>
                    <button class="btn btn-outline-danger deleteElement font-size-14px text-capitalize p-0 mb-1" data-Name="${i.name}" data-ID="${i._id}" data-Name="${i.name}" id="">
                        <i class=" fas fa-times mx-auto" data-ID="${i._id}" data-Name="${i.name}" data-Name="${i.name}"></i>
                    </button>
                    <button class="btn btn-outline-primary editElement font-size-14px text-capitalize p-0" data-ID="${i._id}" id="">
                        <i class=" fas fa-edit mx-auto" data-ID="${i._id}"></i>
                    </button>
                </div>
                `:''}
                
            </div>
            
            `
        }
        row += `</div>`
        document.querySelector(`${this.divID} #Content`).innerHTML = row;
        this.openSection()
        this.hideElement();
        this.deleteElement();
        this.editElement();
    }
    hideElement() {
        document.querySelectorAll(`${this.divID} .hideElement`).forEach(hide => {
            hide.onclick = e => {
                e.stopPropagation()
                let id = e.target.getAttribute('data-ID');
                post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_DEPARTMENT, {
                    departmentID: id,
                    hidden: 1
                }, (result) => {
                    this.reload()
                }, (err) => {
                    super.loadError(err.err)
                })
            }
        })
    }
    deleteElement() {
        document.querySelectorAll(`${this.divID} .deleteElement`).forEach(deleteElement => {
            deleteElement.onclick = e => {
                warningAlert(`Are you sure to delete <span class="text-danger">${e.target.getAttribute('data-Name')}</span>`, () => {
                    e.stopPropagation()
                    let id = e.target.getAttribute('data-ID');
                    post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_DEPARTMENT, {
                        departmentID: id,
                        deleted: 1
                    }, (result) => {
                        this.reload()
                    }, (err) => {
                        super.loadError(err.err)
                    })
                })

            }
        })
    }
    openSection() {
        document.querySelectorAll(`${this.divID} .eachDepartment`).forEach(term => {
            term.onclick = e => {
                let div = document.createElement('div')
                div.id = 'CoursesTab_filter_sectionsList'
                $(div).addClass('custom-modal').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.COURSES.COURSES_LIST.MODAL_SECTIONS_LIST.VIEW_ID, '#CoursesTab_filter_sectionsList', {
                    departmentID: e.target.getAttribute('data-ID'),
                    student:this.student
                }, {})
            }
        })
    }
    editElement() {
        document.querySelectorAll(`${this.divID} .editElement`).forEach(edit => {
            edit.onclick = e => {
                let div = document.createElement('div')
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                let filter = this.Array.filter(faculty => {
                    return faculty._id == e.target.getAttribute('data-ID')
                })[0]
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    image: true,
                    labelTitle: 'Department',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_DEPARTMENT,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_DEPARTMENTS_LIST.VIEW_ID },
                    haveParent: true,
                    parentName: 'facultyID',
                    parentID: this.facultyID,
                    targetName: 'departmentID',
                    edit: filter
                }, {})
            }
        })
    }
    onPoke() {
        this.reload()
    }
    stopLoading() {}
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();

    }
};

export class ModalSectionsList extends MODAL {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {
        get(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.SECTIONS, {
                departmentID: this.departmentID
            },
            (result) => {
                this.Array = result;
                super.load()
            }, (err) => {
                super.loadError(err.err)
            })
    }
    render() {

        this.fillSections(this.Array);

        if(this.student==undefined){
            document.querySelector('.addSection').classList.remove('d-none')
            document.querySelector('.addSection').onclick = e => {
                let div = document.createElement('div')
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    image: true,
                    labelTitle: 'Section',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_SECTION,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_SECTIONS_LIST.VIEW_ID },
                    haveParent: true,
                    parentName: 'departmentID',
                    parentID: this.departmentID
                }, {})
            }
        }
        super.render();
    };
    fillSections(arr) {
        let row = `
            <div class="d-flex justify-content-between">
                <h3 class="text-capitalize">sections</h3>
                <i class="fas fa-plus-circle d-none addSection fa-2x text-warning my-auto"></i>
            </div>
            <div class="row pl-3" id="list">`
        for (let i of arr) {
            row += `
            <div class="col-md-4 col-xl-3 d-flex mt-2" data-ID="${i._id}" style="cursor: pointer;">
                <div class="${(this.student==undefined)?'col-10':'col-12'} row card border eachSection shadow rounded p-0 text-center text-capitalize" data-ID="${i._id}">
                    <div class="row" data-ID="${i._id}">
                        <div class="col-2" data-ID="${i._id}">
                            <img class="border shadow rounded" data-ID="${i._id}" width="75" height="75" 
                            ${(i.logoURL==null)?'src="../../img/imageNoteAvailable.jpg"':`src="http://p56dki765gz8k.com/download/${i.logoURL.id}"`}  />
                        </div>
                        <p class="col-9 my-auto py-2" data-ID="${i._id}">${i.name}</p>
                    </div>
                </div>
                ${(this.student==undefined)?`
                <div class="col-2 d-flex flex-column pr-2"> 
                    <button class="btn btn-outline-warning hideElement font-size-14px text-capitalize p-0 mb-1" data-ID="${i._id}" id="">
                        <i class="fas fa-minus-circle mx-auto" data-ID="${i._id}"></i>
                    </button>
                    <button class="btn btn-outline-danger deleteElement font-size-14px text-capitalize p-0 mb-1" data-Name="${i.name}" data-ID="${i._id}" data-Name="${i.name}" id="">
                        <i class=" fas fa-times mx-auto" data-ID="${i._id}" data-Name="${i.name}" data-Name="${i.name}"></i>
                    </button>
                    <button class="btn btn-outline-primary editElement font-size-14px text-capitalize p-0" data-ID="${i._id}" id="">
                        <i class=" fas fa-edit mx-auto" data-ID="${i._id}"></i>
                    </button>
                </div>
                `:''}
                
            </div>
            
            `
        }
        row += `</div>`
        document.querySelector(`${this.divID} #Content`).innerHTML = row;
        this.openYears();
        this.hideElement();
        this.deleteElement();
        this.editElement();
    }
    hideElement() {
        document.querySelectorAll(`${this.divID} .hideElement`).forEach(hide => {
            hide.onclick = e => {
                e.stopPropagation()
                let id = e.target.getAttribute('data-ID');
                post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_SECTION, {
                    sectionID: id,
                    hidden: 1
                }, (result) => {
                    this.reload()
                }, (err) => {
                    super.loadError(err.err)
                })
            }
        })
    }
    deleteElement() {
        document.querySelectorAll(`${this.divID} .deleteElement`).forEach(deleteElement => {
            deleteElement.onclick = e => {
                warningAlert(`Are you sure to delete <span class="text-danger">${e.target.getAttribute('data-Name')}</span>`, () => {
                    e.stopPropagation()
                    let id = e.target.getAttribute('data-ID');
                    post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_SECTION, {
                        sectionID: id,
                        deleted: 1
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
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                let filter = this.Array.filter(faculty => {
                    return faculty._id == e.target.getAttribute('data-ID')
                })[0]
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    image: true,
                    labelTitle: 'Section',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_SECTION,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_SECTIONS_LIST.VIEW_ID },
                    haveParent: true,
                    parentName: 'departmentID',
                    parentID: this.departmentID,
                    targetName: 'sectionID',
                    edit: filter
                }, {})
            }
        })
    }
    openYears() {
        document.querySelectorAll(`${this.divID} .eachSection`).forEach(faculty => {
            faculty.onclick = e => {
                let div = document.createElement('div')
                div.id = 'CoursesTab_filter_YearsList'
                $(div).addClass('custom-modal').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.COURSES.COURSES_LIST.MODAL_YEARS_LIST.VIEW_ID, '#CoursesTab_filter_YearsList', {
                    sectionID: e.target.getAttribute('data-ID'),
                    student:this.student
                }, {})
            }
        });
    }
    onPoke() {
        this.reload()
    }
    stopLoading() {}
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();

    }
};

export class ModalYearsList extends MODAL {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {
        get(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.YEARS, {
                sectionID: this.sectionID
            },
            (result) => {
                this.Array = result;
                super.load()
            }, (err) => {
                super.loadError(err.err)
            })
    }
    render() {
        this.fillYears(this.Array)

        if(this.student==undefined){
            document.querySelector('.addYear').classList.remove('d-none')
            document.querySelector('.addYear').onclick = e => {
                let div = document.createElement('div')
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    labelTitle: 'Year',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_YEAR,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_YEARS_LIST.VIEW_ID },
                    haveParent: true,
                    parentName: 'sectionID',
                    parentID: this.sectionID
                }, {})
            }
        }
        super.render();
    };
    fillYears(arr) {
        let row = `
            <div class="d-flex justify-content-between">
                <h3 class="text-capitalize">years</h3>
                <i class="fas fa-plus-circle d-none addYear fa-2x text-warning my-auto"></i>
            </div>
            <div class="row pl-3" id="list">`
        for (let i of arr) {
            row += `
            <div class="col-md-4 col-xl-2 d-flex mt-2" data-ID="${i._id}" style="cursor: pointer;">
                <div class="${(this.student==undefined)?'col-9':'col-12'} card border eachYear shadow rounded p-2 text-center text-capitalize" data-ID="${i._id}">
                    <p class="m-auto py-2" data-ID="${i._id}">${i.name}</p>
                </div>
                ${(this.student==undefined)?`
                <div class="col-2 d-flex flex-column px-1"> 
                    <button class="btn btn-outline-warning hideElement font-size-14px text-capitalize p-0 mb-1" data-ID="${i._id}" id="">
                        <i class="fas fa-minus-circle mx-auto" data-ID="${i._id}"></i>
                    </button>
                    <button class="btn btn-outline-danger deleteElement font-size-14px text-capitalize p-0 mb-1" data-Name="${i.name}" data-ID="${i._id}" data-Name="${i.name}" id="">
                        <i class=" fas fa-times mx-auto" data-ID="${i._id}" data-Name="${i.name}" data-Name="${i.name}"></i>
                    </button>
                    <button class="btn btn-outline-primary editElement font-size-14px text-capitalize p-0" data-ID="${i._id}" id="">
                        <i class=" fas fa-edit mx-auto" data-ID="${i._id}"></i>
                    </button>
                </div>
                `:''}
                
            </div>
            
            `
        }
        row += `</div>`
        document.querySelector(`${this.divID} #Content`).innerHTML = row;
        this.openTerm();
        this.hideElement();
        this.deleteElement();
        this.editElement();
    }
    hideElement() {
        document.querySelectorAll(`${this.divID} .hideElement`).forEach(hide => {
            hide.onclick = e => {
                e.stopPropagation()
                let id = e.target.getAttribute('data-ID');
                post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_YEAR, {
                    yearID: id,
                    hidden: 1
                }, (result) => {
                    this.reload()
                }, (err) => {
                    super.loadError(err.err)
                })
            }
        })
    }
    deleteElement() {
        document.querySelectorAll(`${this.divID} .deleteElement`).forEach(deleteElement => {
            deleteElement.onclick = e => {
                warningAlert(`Are you sure to delete <span class="text-danger">${e.target.getAttribute('data-Name')}</span>`, () => {
                    e.stopPropagation()
                    let id = e.target.getAttribute('data-ID');
                    post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_YEAR, {
                        yearID: id,
                        deleted: 1
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
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                let filter = this.Array.filter(year => {
                    return year._id == e.target.getAttribute('data-ID')
                })[0]
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    labelTitle: 'Year',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_YEAR,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_YEARS_LIST.VIEW_ID },
                    haveParent: true,
                    parentName: 'sectionID',
                    parentID: this.sectionID,
                    targetName: 'yearID',
                    edit: filter
                }, {})
            }
        })
    }

    openTerm() {
        document.querySelectorAll(`${this.divID} .eachYear`).forEach(term => {
            term.onclick = e => {
                let div = document.createElement('div')
                div.id = 'CoursesTab_filter_termsList'
                $(div).addClass('custom-modal').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.COURSES.COURSES_LIST.MODAL_TERMS_LIST.VIEW_ID, '#CoursesTab_filter_termsList', { yearID: e.target.getAttribute('data-ID'),student:this.student }, {})
            }
        })
    }
    stopLoading() {}
    reload() { super.reload({}); }
    onPoke() {
        this.reload()
    }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();

    }
};

export class ModalTermsList extends MODAL {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {
        get(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.TERMS, {
                yearID: this.yearID
            },
            (result) => {
                this.Array = result;
                super.load()
            }, (err) => {
                super.loadError(err.err)
            })
    }
    render() {
        this.fillTerms(this.Array)

        if(this.student==undefined){
            document.querySelector('.addTerms').classList.remove('d-none')
            document.querySelector('.addTerms').onclick = e => {
                let div = document.createElement('div')
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    labelTitle: 'Term',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_TERM,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_TERMS_LIST.VIEW_ID },
                    haveParent: true,
                    parentName: 'yearID',
                    parentID: this.yearID
                }, {})
            };
        }

        super.render();
    };
    fillTerms(arr) {
        let row = `
            <div class="d-flex justify-content-between">
                <h3 class="text-capitalize">terms</h3>
                <i class="fas fa-plus-circle d-none addTerms fa-2x text-warning my-auto"></i>
            </div>
            <div class="row pl-3" id="list">`
        for (let i of arr) {
            row += `
            <div class="col-md-4 col-xl-2 d-flex mt-2" data-ID="${i._id}" style="cursor: pointer;">
                <div class="${(this.student==undefined)?'col-9':'col-12'} card border eachTerm shadow rounded p-2 text-center text-capitalize" data-ID="${i._id}">
                    <p class="m-auto py-2" data-ID="${i._id}">${i.name}</p>
                </div>
                ${(this.student==undefined)?`
                <div class="col-2 d-flex flex-column px-1"> 
                    <button class="btn btn-outline-warning hideElement font-size-14px text-capitalize p-0 mb-1" data-ID="${i._id}" id="">
                        <i class="fas fa-minus-circle mx-auto" data-ID="${i._id}"></i>
                    </button>
                    <button class="btn btn-outline-danger deleteElement font-size-14px text-capitalize p-0 mb-1" data-Name="${i.name}" data-ID="${i._id}" data-Name="${i.name}" id="">
                        <i class=" fas fa-times mx-auto" data-ID="${i._id}" data-Name="${i.name}" data-Name="${i.name}"></i>
                    </button>
                    <button class="btn btn-outline-primary editElement font-size-14px text-capitalize p-0" data-ID="${i._id}" id="">
                        <i class=" fas fa-edit mx-auto" data-ID="${i._id}"></i>
                    </button>
                </div>
                `:''}
                
            </div>
            
            `
        }
        row += `</div>`
        document.querySelector(`${this.divID} #Content`).innerHTML = row;
        this.openSubjects();
        this.hideElement();
        this.deleteElement();
        this.editElement();
    }
    hideElement() {
        document.querySelectorAll(`${this.divID} .hideElement`).forEach(hide => {
            hide.onclick = e => {
                e.stopPropagation()
                let id = e.target.getAttribute('data-ID');
                post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_TERM, {
                    termID: id,
                    hidden: 1
                }, (result) => {
                    this.reload()
                }, (err) => {
                    super.loadError(err.err)
                })
            }
        })
    }
    deleteElement() {
        document.querySelectorAll(`${this.divID} .deleteElement`).forEach(deleteElement => {
            deleteElement.onclick = e => {
                warningAlert(`Are you sure to delete <span class="text-danger">${e.target.getAttribute('data-Name')}</span>`, () => {
                    e.stopPropagation()
                    let id = e.target.getAttribute('data-ID');
                    post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_TERM, {
                        termID: id,
                        deleted: 1
                    }, (result) => {
                        this.reload()
                    }, (err) => {
                        super.loadError(err.err)
                    })
                })

            }
        })
    }
    openSubjects() {
        document.querySelectorAll(`${this.divID} .eachTerm`).forEach(term => {
            term.onclick = e => {
                let div = document.createElement('div')
                div.id = 'CoursesTab_filter_subjectsList'
                $(div).addClass('custom-modal').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.COURSES.COURSES_LIST.MODAL_SUBJECTS_LIST.VIEW_ID, '#CoursesTab_filter_subjectsList', { termID: e.target.getAttribute('data-ID'),student:this.student }, {})
            }
        })
    }
    editElement() {
        document.querySelectorAll(`${this.divID} .editElement`).forEach(edit => {
            edit.onclick = e => {
                let div = document.createElement('div')
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                let filter = this.Array.filter(year => {
                    return year._id == e.target.getAttribute('data-ID')
                })[0]
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    labelTitle: 'Term',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_TERM,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_TERMS_LIST.VIEW_ID },
                    haveParent: true,
                    parentName: 'yearID',
                    parentID: this.yearID,
                    targetName: 'termID',
                    edit: filter
                }, {})
            }
        })
    }
    stopLoading() {}
    reload() { super.reload({}); }
    onPoke() {
        this.reload()
    }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();

    }
};


export class ModalSubjectsList extends MODAL {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {
        get(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.SUBJECTS, {
                termID: this.termID
            },
            (result) => {
                console.log(result);
                this.Array = result;
                super.load()
            }, (err) => {
                super.loadError(err.err)
            })
    }
    render() {
        this.fillSubject(this.Array);

        if(this.student==undefined){
            document.querySelector('.addSubject').classList.remove('d-none')
            document.querySelector('.addSubject').onclick = e => {
                let div = document.createElement('div')
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    image: true,
                    labelTitle: 'Subject',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.NEW_SUBJECT,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_SUBJECTS_LIST.VIEW_ID },
                    haveParent: true,
                    parentName: 'termID',
                    parentID: this.termID
                }, {})
            }
        }


        super.render();
    };
    fillSubject(arr) {
        let row = `
            <div class="d-flex justify-content-between">
                <h3 class="text-capitalize">subjects</h3>
                <i class="fas fa-plus-circle d-none addSubject fa-2x text-warning my-auto"></i>
            </div>
            <div class="row pl-3" id="list">`
        for (let i of arr) {
            row += `
            <div class="col-md-4 col-xl-3 d-flex mt-2" data-ID="${i._id}" style="cursor: pointer;">
                <div class="${(this.student==undefined)?'col-10':'col-12'} row card border eachSubject shadow rounded p-0 text-center text-capitalize" data-ID="${i._id}">
                    <div class="row" data-ID="${i._id}">
                        <div class="col-2" data-ID="${i._id}">
                            <img class="border shadow rounded" data-ID="${i._id}" width="75" height="75" 
                            ${(i.logoURL==null)?'src="../../img/imageNoteAvailable.jpg"':`src="https://p56dki765gz8k.com/download/${i.logoURL.id}"`}  />
                        </div>
                        <p class="col-9 my-auto py-2" data-ID="${i._id}">${i.name}</p>
                    </div>
                </div>
                ${(this.student==undefined)?`
                <div class="col-2 d-flex flex-column pr-2"> 
                    <button class="btn btn-outline-warning hideElement font-size-14px text-capitalize p-0 mb-1" data-ID="${i._id}" id="">
                        <i class="fas fa-minus-circle mx-auto" data-ID="${i._id}"></i>
                    </button>
                    <button class="btn btn-outline-danger deleteElement font-size-14px text-capitalize p-0 mb-1" data-Name="${i.name}" data-ID="${i._id}" data-Name="${i.name}" id="">
                        <i class=" fas fa-times mx-auto" data-ID="${i._id}" data-Name="${i.name}" data-Name="${i.name}"></i>
                    </button>
                    <button class="btn btn-outline-primary editElement font-size-14px text-capitalize p-0" data-ID="${i._id}" id="">
                        <i class=" fas fa-edit mx-auto" data-ID="${i._id}"></i>
                    </button>
                </div>
                `:''}
                
            </div>
            
            `
        }
        row += `</div>`
        document.querySelector(`${this.divID} #Content`).innerHTML = row;
        this.openCourses();
        this.hideElement();
        this.deleteElement();
        this.editElement();
    }
    hideElement() {
        document.querySelectorAll(`${this.divID} .hideElement`).forEach(hide => {
            hide.onclick = e => {
                e.stopPropagation()
                let id = e.target.getAttribute('data-ID');
                post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_SUBJECT, {
                    subjectID: id,
                    hidden: 1
                }, (result) => {
                    this.reload()
                }, (err) => {
                    super.loadError(err.err)
                })
            }
        })
    };

    deleteElement() {
        document.querySelectorAll(`${this.divID} .deleteElement`).forEach(deleteElement => {
            deleteElement.onclick = e => {
                warningAlert(`Are you sure to delete <span class="text-danger">${e.target.getAttribute('data-Name')}</span>`, () => {
                    e.stopPropagation()
                    let id = e.target.getAttribute('data-ID');
                    post(IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_SUBJECT, {
                        subjectID: id,
                        deleted: 1
                    }, (result) => {
                        this.reload()
                    }, (err) => {
                        super.loadError(err.err)
                    })
                })

            }
        })
    };

    openCourses() {
        document.querySelectorAll(`${this.divID} .eachSubject`).forEach(term => {
            term.onclick = e => {
                let div = document.createElement('div')
                div.id = 'CoursesTab_filter_coursesList'
                $(div).addClass('custom-modal').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.COURSES.COURSES_LIST.MODAL_COURSES_LIST.VIEW_ID, '#CoursesTab_filter_coursesList', {
                    subjectID: e.target.getAttribute('data-ID'),
                    filterOptions: [{
                        fieldID: 'subject',
                        select: { // multi- select
                            items: [e.target.getAttribute('data-ID')], // ex: select users in to field: ['userID1', 'userID2']
                        }
                    }],student:this.student
                }, {})
            }
        })
    };

    editElement() {
        document.querySelectorAll(`${this.divID} .editElement`).forEach(edit => {
            edit.onclick = e => {
                let div = document.createElement('div')
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                let filter = this.Array.filter(year => {
                    return year._id == e.target.getAttribute('data-ID')
                })[0]
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    image: true,
                    labelTitle: 'Subject',
                    identifier: IDENTIFIERS.COURSES.COURSES.COURSES_TREE.EDIT_SUBJECT,
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_SUBJECTS_LIST.VIEW_ID },
                    haveParent: true,
                    parentName: 'termsID',
                    parentID: this.termID,
                    targetName: 'subjectID',
                    edit: filter
                }, {})
            }
        })
    };
    onPoke() {
        this.reload()
    }
    stopLoading() {}
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();

    }
};


export class ModalCoursesList extends MODAL {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {

        get(
            IDENTIFIERS.COURSES.COURSES.FILTER, {
                pageNumber: 1,
                pageSize: 1000,
                filterOptions: this.filterOptions
            },
            (result) => {
               
                this.Array = result.result;
                super.load()
            },
            (data) => {
                super.loadError(data)
            });
    }
    render() {
 
        this.fillCourses(this.Array);

        $('#selectYearFilter').selectpicker('refresh')
        this.openCourse()

        super.render();
    };

    fillCourses(arr) {
            let row = `
            <div class="d-flex justify-content-between">
                <h3 class="text-capitalize">courses</h3>
                <!--<button class="mr-2 btn btn-outline-darkBlue text-capitalize" id="CoursesTab_open_newCourse">
                    <i class="fas fa-plus-circle "></i>
                </button>-->
            </div>
            <!--<div class="form-group ml-auto" style="width: fit-content;">
                <label class="text-capitalize pl-2" id="newTask_label_assignedTo">year</label>
                <div class="d-flex align-items-center">
                    <select class="selectpicker" data-size="5" title="Select User" data-style="text-dark font-weight-light text-capitalize rounded border bg-white" data-live-search="true " id="selectYearFilter" value="">
                        <option value="32">2010</option>
                        <option value="231">2011</option>
                        <option value="32re">2012</option>
                        <option value="3e2">2013</option>
                        <option value="3cz2">2021</option>
                    </select>
                </div>
            </div>-->
            
            <div class="row pl-3" id="list">`
            for (let i of arr) {
                row += `
            <div class="col-md-4 col-xl-3 d-flex mt-2" data-ID="${i._id}" style="cursor: pointer;">
                <div class="${(this.student==undefined)?'col-10':'col-12'} row card border eachCourse shadow rounded p-0 text-center text-capitalize" data-ID="${i._id}">
                    <div class="row" data-ID="${i._id}">
                        <div class="col-2" data-ID="${i._id}">
                            <img class="border shadow rounded" data-ID="${i._id}" width="75" height="75"
                            ${(i.files==null)?'src="../../img/imageNoteAvailable.jpg"':`src="https://p56dki765gz8k.com/download/${i.files.id}"`}  />
                        </div>
                        <p class="col-9 my-auto py-2" data-ID="${i._id}">${i.name}</p>
                    </div>
                </div>
                ${(this.student==undefined)?`
                <div class="col-2 d-flex flex-column pr-2"> 
                    <button class="btn btn-outline-warning hideElement font-size-14px text-capitalize p-0 mb-1" data-ID="${i._id}" id="">
                        <i class="fas fa-minus-circle mx-auto" data-ID="${i._id}"></i>
                    </button>
                    <button class="btn btn-outline-danger deleteElement font-size-14px text-capitalize p-0 mb-1" data-Name="${i.name}" data-ID="${i._id}" data-Name="${i.name}" id="">
                        <i class=" fas fa-times mx-auto" data-ID="${i._id}" data-Name="${i.name}" data-Name="${i.name}"></i>
                    </button>
                    <button class="btn btn-outline-primary editElement font-size-14px text-capitalize p-0" data-ID="${i._id}" id="">
                        <i class=" fas fa-edit mx-auto" data-ID="${i._id}"></i>
                    </button>
                </div>
                `:''}
            </div>
            `
        }
        row += `</div>`;
        document.querySelector(`${this.divID} #Content`).innerHTML = row;
        this.hideElement();
        this.deleteElement();
        this.editElement();
        // this.clicked = -1
        // $(`${this.divID} #CoursesTab_open_newCourse`).click(e => {
        //     if (this.clicked == -1) {
        //         this.clicked = 1
        //         let div = document.createElement('div')
        //         div.id = 'newCourse'
        //         $('#CoursesTab_filter_universities').css({ "z-index": "0" })
        //         $('#CoursesTab_filter_courses').css({ "z-index": "0" })
        //         $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
        //         super.newView(V.COURSES.NEW_COURSE.VIEW_ID, '#newCourse', {}, {})
        //     } else {
        //         return
        //     }
        // });
    }
    hideElement() {
        document.querySelectorAll(`${this.divID} .hideElement`).forEach(hide => {
            hide.onclick = e => {

                let id = e.target.getAttribute('data-ID');
                post(IDENTIFIERS.COURSES.COURSES.EDIT, {
                    courseID: id,
                    hidden: 1
                }, (result) => {
                    this.reload()
                }, (err) => {
                    super.loadError(err.err)
                })
            }
        })
    }
    deleteElement() {
        document.querySelectorAll(`${this.divID} .deleteElement`).forEach(deleteElement => {
            deleteElement.onclick = e => {
                warningAlert(`Are you sure to delete <span class="text-danger">${e.target.getAttribute('data-Name')}</span>`, () => {

                    let id = e.target.getAttribute('data-ID');
                    post(IDENTIFIERS.COURSES.COURSES.EDIT, {
                        courseID: id,
                        deleted: 1
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
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                console.log(this.Array);
                let filter = this.Array.filter(uni => {
                    return uni._id == e.target.getAttribute('data-ID')
                })[0]
                console.log(filter);
                super.newView(V.COURSES.NEW_COURSE.VIEW_ID, '#modalXX', {
                    viewToBePoked: { viewID: V.COURSES.COURSES_LIST.MODAL_COURSES_LIST.VIEW_ID },
                    targetName: 'courseID',
                    edit: filter
                }, {})
            }
        })
    }
    openCourse() {
        document.querySelectorAll(`${this.divID} .eachCourse`).forEach(course => {
            course.onclick = e => {
                let div = document.createElement('div')
                div.id = 'ViewCourse'

                $(div).addClass('custom-modal').appendTo("main").show().animate({ left: '0' }, 650)
                if(this.student==undefined){
                    super.newView(V.COURSES.ADMIN_VIEW_COURSE.VIEW_ID, '#ViewCourse', { courseID: e.target.getAttribute('data-ID')}, {})
                }else{
                    super.newView(V.COURSES.STUDENT_VIEW_COURSE.VIEW_ID, '#ViewCourse', { courseID: e.target.getAttribute('data-ID')}, {})
                }
                
            }
        })

    }
    stopLoading() {}
    onPoke() {
        this.reload()
    }
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();

    }
};

export class My_Courses extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {
        let vote =2;
        get(
            IDENTIFIERS.COURSES.COURSES.STUDENT_MY_COURSES, {},
            (result) => {
                //console.log(result);
                this.Array = result;
               if(--vote<=0){
                    super.load()
               }
            },
            (data) => {
                super.loadError(data)
            });
            $(this.divID).load(V.MY_COURSES.HTML_URL, () => {
                if(--vote<=0){
                    super.load()
                }
            });
    }
    render() {
        this.fillCourses(this.Array);
        
        this.openCourse()

        super.render();
    };

    fillCourses(arr) {
            let row = `
            <div class="row" id="list">`
            for (let i of arr) {
                
                row += `
            
            <div class="col-md-4 col-xl-3 mt-2 px-1" data-ID="${i._id}" style="cursor: pointer;">
                <div class="card border eachCourse shadow rounded p-0 text-center text-capitalize" data-ID="${i._id}">
                    <div class="row" data-ID="${i._id}">
                        <div class="col-2" data-ID="${i._id}">
                        <img class="border shadow rounded" data-ID="${i._id}" width="75" height="75"
                        ${(i.files==null)?'src="../../img/imageNoteAvailable.jpg"':`src="https://p56dki765gz8k.com/download/${i.files.id}"`}  />
                            
                        </div>
                        <p class="col-9 my-auto py-2" data-ID="${i._id}">${i.name}</p>
                    </div>
                </div>
            </div>
            `
        }
        row += `</div>`;
        document.querySelector(`${this.divID} #Content`).innerHTML = row;
        
    }

    openCourse() {
        document.querySelectorAll(`${this.divID} .eachCourse`).forEach(course => {
            course.onclick = e => {
                let div = document.createElement('div')
                div.id = 'ViewCourse'

                $(div).addClass('custom-modal').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.COURSES.STUDENT_VIEW_COURSE.VIEW_ID, '#ViewCourse', { courseID: e.target.getAttribute('data-ID'),myCourse:true }, {})
            }
        })

    }
    stopLoading() {}
    onPoke(e,data) {
        console.log(data);
        this.reload()
    }
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();
        document.querySelector(this.divID).remove()

    }
};




export class ModalInstructorCoursesList extends MODAL {

    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {

        get(
            IDENTIFIERS.COURSES.INSTRUCTORS.GET_COURSES_INSTRUCTORID, {
                pageNumber: 1,
                pageSize: 1000,
                filterOptions: this.filterOptions
            },
            (result) => {
                console.log(result);
                this.Array = result.result;
                super.load()
            },
            (data) => {
                super.loadError(data)
            });
    }

    render() {

    }

}