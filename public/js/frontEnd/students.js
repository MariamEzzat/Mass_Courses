import { IDENTIFIERS } from '../constants.js';
import { get, post } from '../sdk/front.js';
import { notifyResult, warningAlert } from './navBar.js';
import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';
import { MODAL } from './courses.js';
import { Uploader } from '../libraries/uploader.js';
import { InfoIconModal } from './navBar.js'
export class Students extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        this.studentsPageSize = 10
        this.pageNumber = 1
        this.filterStudentsArray = []
        let vote = 4;
        get(
            IDENTIFIERS.COURSES.COURSES.COURSES_TREE.COURSE_TREES, {},
            (result) => {
                this.CourseTrees = result

                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                //super.loadError(data)
            });
        // console.log(this.filterStudentsArray.length !== 0);
        // console.log(this.filterStudentsArray);
        get(
            IDENTIFIERS.COURSES.STUDENTS.FILTER, {
            pageNumber: this.pageNumber,
            pageSize: this.studentsPageSize,
            filterOptions: this.filterStudentsArray
        },
            (result) => {
                //console.log('students', result);
                this.studentsResult = result
                this.studentsArray = result.result

                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                super.loadError(data)
            });

        get(
            IDENTIFIERS.COURSES.COURSES.FILTER, {
            pageNumber: 1,
            pageSize: 1000,
            filterOptions: []
        },
            (result) => {
                //console.log(result);
                this.ArrayCourses = result.result;
                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                super.loadError(data)
            });
        $(this.divID).load(V.STUDENTS.MAIN.HTML_URL, () => {
            $('#studentsList_NOTIFY_type').selectpicker('refresh');
            if (--vote <= 0) {
                super.load()
            }
        });

    }
    render() {
        if (this.notification == undefined) {
            this.fillStudentsTable(this.studentsArray);
            $(`${this.divID} #studentsList_header`).append(`<div class="d-flex">
                    <button class="mr-2 btn btn-outline-secondary text-capitalize" title="Groups" id="studentsList_open_groups">
                        <i class="fas fa-users"></i>
                    </button>
                    <button class="mr-2 btn btn-outline-darkBlue text-capitalize" title="New Student" id="studentsList_open_newStudent">
                        <i class="fas fa-user-plus"></i>
                    </button>
                </div>`);
            this.clicked = -1
            $('#studentsList_open_newStudent').click(e => {
                if (this.clicked == -1) {
                    this.clicked = 1
                    super.closeOthers({
                        children: 1
                    });
                    let div = document.createElement('div')
                    div.id = 'newStudent'
                    $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
                    super.newView(V.STUDENTS.NEW_STUDENT.VIEW_ID, '#newStudent', {}, {})
                } else {
                    return
                }
            });

            $('#studentsList_open_groups').click(e => {
                if (this.clicked == -1) {
                    this.clicked = 1
                    super.closeOthers({
                        children: 1
                    });
                    let div = document.createElement('div')
                    div.id = 'groups'
                    $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
                    super.newView(V.GROUPS.MAIN.VIEW_ID, '#groups', {}, {})
                } else {
                    return
                }
            });

            let notificationFormSection = document.createElement('div')
            notificationFormSection.id = 'notificationFormSection'
            document.querySelector('#notificationFormSection').innerHTML = notificationFormSection;
            super.newView(V.STUDENTS.STUDENT_NOTIFICATION.VIEW_ID, '#notificationFormSection', { mainTab: this.divID }, {})

        } else if (this.notification == true) {
            //console.log(this.studentsArray);
            let hghg = this.studentsArray.map(r => {
                //console.log(this.studentsArrayFromNotification.includes(r._id));
                if (this.studentsArrayFromNotification.includes(r._id)) {
                    return r
                }
            }).filter(r => { return r !== undefined })
            //console.log(hghg);
            this.fillStudentsTable(hghg);
            $(`${this.divID} #studentsList_header`).append(`<div class="d-flex">
                <button class="mr-2 btn btn-outline-darkBlue text-capitalize" title="Groups" id="studentsList_sendUsersListToNotification">
                    <i class="fas fa-share"></i>
                </button>
            
            </div>`);
            $(`${this.divID}`).append(`<div class="d-flex justify-content-center">
                <button class="mr-2 btn btn-outline-darkBlue text-capitalize" title="Groups" id="studentsList_closeModalStudents">
                    <i class="fas fa-caret-left"> Back</i>
                </button>
            
            </div>`);
            $('#studentsList_closeModalStudents').click(e => {
                this.close()
            });

            $('#studentsList_sendUsersListToNotification').click(e => {
                let studentsList = this.getStudentsIDsFromTable();
                //console.log(studentsList);
                this.close()
            });
        }

        /* revert selection to get records not listed in filter */
        document.querySelector('#studentsList_filterReverseAll').onclick = e => {
            this.pageNumber = 1
            //console.log('this.filterStudentsArray bef',this.filterStudentsArray);
            let target = e.target.getAttribute('data-target')
            if (target == 'ExceptionAll') {
                //console.log('this.filterStudentsArray bef exc',this.filterStudentsArray);
                //super.pokeView({ viewID: V.PAGINATION.VIEW_ID }, { exception: true })
                this.exception = true
                this.getDataFilter(this.filterStudentsArray, true)
                //super.pokeView({viewID:V.PAGINATION.VIEWID},{exception:true})
                e.target.setAttribute('data-target', 'includingAll')
                e.target.innerHTML = ` filter including all`
                $(e.target).removeClass('text-danger')
                $(e.target).addClass('text-success')
            } else if (target == 'includingAll') {
                //console.log('this.filterStudentsArray aft inc',this.filterStudentsArray);
                //super.pokeView({ viewID: V.PAGINATION.VIEW_ID }, { exception: false })
                this.exception = false
                this.getDataFilter(this.filterStudentsArray, false)
                //super.pokeView({viewID:V.PAGINATION.VIEWID},{exception:false})
                e.target.setAttribute('data-target', 'ExceptionAll')
                e.target.innerHTML = ` filter except selected`
                $(e.target).removeClass('text-success')
                $(e.target).addClass('text-danger')
            }

        }

        document.querySelectorAll('#studentsList_table .dropdown-toggle').forEach(dropDown => {
            dropDown.onclick = (e) => {
                e.stopPropagation()
                //console.log(e.target.parentElement);
                $(e.target.parentElement).siblings().find('div.studentList_head_FilterBox').each(function () {

                    (this.classList.contains('d-none')) ? "" : $(this).addClass('d-none')
                });
                $(e.target.parentElement.querySelector('div.studentList_head_FilterBox')).toggleClass('d-none')
                if (e.target.parentElement.querySelector('div.studentList_head_FilterBox').classList.contains('d-none')) {
                    super.pokeView({ viewID: V.FILTER.VIEW_ID })

                }

                super.newView(V.FILTER.VIEW_ID, `#${this.divID.split('#')[1]} #${e.target.id}`, {
                    coursesList: this.ArrayCourses,
                    type: e.target.getAttribute('data-type'),
                    fieldID: e.target.getAttribute('data-fieldID'),
                    propertyName: e.target.getAttribute('data-propertyName'),
                    CourseTrees: this.CourseTrees,
                    filterStudentsArray: this.filterStudentsArray,
                    closeOthersChild: (filter) => {
                        super.closeOthers({ children: 1 })
                    }
                }, {})
            }
        });

        let divPagination = document.createElement('div')
        divPagination.id = 'pagination_parent'
        $(divPagination).addClass('d-flex justify-content-center').appendTo(this.divID)
        this.callPaginationView(this.studentsResult.pages, this.pageNumber, false, this.studentsResult.numberOfResults)

        super.render();
    };

    getStudentsIDsFromTable() {
        let array = []
        document.querySelectorAll(`${this.divID} table tbody tr`).forEach(tr => {
            let studentID = $(tr).attr('data-studentID')
            //console.log(studentID);
            array.push(studentID)
        })
        //console.log(array);
        return array
    }
    fillStudentsTable(array) {
        let row = '';
        for (let i = array.length - 1; i >= 0; i--) {
            row += `
                <tr data-studentID="${array[i]._id}">
                    <td><input type="checkbox" class="custom-checkbox studentsList_table_checkStudent" data-studentID="${array[i]._id}"></td>
                    <td>${array[i].mID}</td>
                    <td>${array[i].name}</td>
                    <td>${array[i].email}</td>
                    <td>${array[i].primaryMobile}</td>
                    <td>${this.getValue(array[i].university, 'universities')}</td>
                    <td>${this.getValue(array[i].faculty, 'faculties')}</td>
                    <td>${this.getValue(array[i].department, 'departments')}</td>
                    <td>${this.getValue(array[i].section, 'sections')}</td>
                    <td>${this.getValue(array[i].year, 'years')}</td>
                    <td>${this.getValue(array[i].term, 'terms')}</td>
                    
                    <td>${this.getValue(array[i].group, 'groups')}</td>
                    <td><input class="custom-checkbox checkboxDeactive" type="checkbox" data-studentID="${array[i]._id}" ${(array[i].hasOwnProperty('deactivate') && array[i].deactivate == true) ? 'checked' : ''}></td>
                    <td>
                        <div class="dropdown dropleft">
                            <a class="fas fa-caret-down" href="#" role="button" id="dropdownMenuLinkStudents" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            </a>
                    
                            <div class="dropdown-menu py-0" aria-labelledby="dropdownMenuLinkStudents">
                                <a href="#" class="fas fa-shopping-cart text-success viewStudentCart w-100 px-2 py-2 border-bottom text-decoration-none" data-studentID="${array[i]._id}"> cart</a>
                                <a href="#" class="far fa-eye text-secondary viewStudentCourses w-100 px-2 py-2 border-bottom text-decoration-none" data-studentID="${array[i]._id}"> view courses</a>
                                <a href="#" data-studentID="${array[i]._id}" data-studentName="${array[i].name}" class="fas fa-plus text-primary addCourseForStudent w-100 px-2 py-2 border-bottom text-decoration-none"> add courses</a>
                                <a href="#" data-studentMID="${array[i].mID}" class="fas fa-edit text-info editStudent w-100 px-2 py-2 border-bottom text-decoration-none"> edit</a>
                                <a href="#" data-studentID="${array[i]._id}" data-studentName="${array[i].name}" class="fas fa-ban text-danger viewStudentBlockList w-100 px-2 py-2 border-bottom text-decoration-none"> Block List</a>
                                <a href="#" data-studentMID="${array[i].mID}" data-studentName="${array[i].name}" class="fas fa-times text-danger removeStudent w-100 px-2 py-2 text-decoration-none"> delete</a>
                            </div>
                        </div>
                    </td>

                </tr>
                `
        }
        document.querySelector(`${this.divID} table tbody`).innerHTML = row;
        this.addCoursesForStudent();
        this.viewStudentCourses();
        this.viewStudentCartCourses();
        this.removeStudent();
        this.editStudent();
        this.checkboxDeactiveOrActiveStudent();
        this.viewStudentBlockList();
        this.selectAllStudentsInTable()
    };
    checkboxDeactiveOrActiveStudent() {
        document.querySelectorAll(`${this.divID} .checkboxDeactive`).forEach(icon => {
            icon.onclick = e => {
                post(
                    IDENTIFIERS.COURSES.STUDENTS.EDIT_STUDENT, {
                    studentID: e.target.getAttribute('data-studentID'),
                    editData: {
                        deactivate: $(e.target).is(':checked')
                    }
                },
                    (d) => {
                        //this.reload()
                    },
                    (err) => {
                        console.log(err);
                    }
                );
            }
        })
    }
    viewStudentCourses() {
        document.querySelectorAll(`${this.divID} .viewStudentCourses`).forEach(icon => {
            icon.onclick = e => {
                let div = document.createElement('div')
                div.id = 'StudentCoursesModal'
                $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.STUDENTS.INFO_COURSES.VIEW_ID, '#StudentCoursesModal', { studentID: e.target.getAttribute('data-studentID') }, {});
            }
        })
    };
    viewStudentCartCourses() {
        document.querySelectorAll(`${this.divID} .viewStudentCart`).forEach(icon => {
            icon.onclick = e => {
                let div = document.createElement('div')
                div.id = 'ViewCartStudentModal'
                $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.STUDENTS.INFO_CART_COURSES.VIEW_ID, '#ViewCartStudentModal', { studentID: e.target.getAttribute('data-studentID') }, {});
            }
        })
    };
    viewStudentBlockList() {
        document.querySelectorAll(`${this.divID} .viewStudentBlockList`).forEach(icon => {
            icon.onclick = e => {
                let div = document.createElement('div')
                div.id = 'ViewBlockListStudentModal'
                $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.STUDENTS.INFO_BLOCK_LIST.VIEW_ID, '#ViewBlockListStudentModal', { studentID: e.target.getAttribute('data-studentID'), studentName: e.target.getAttribute('data-studentName') }, {});
            }
        })
    };

    addCoursesForStudent() {
        document.querySelectorAll(`${this.divID} .addCourseForStudent`).forEach(student => {
            student.onclick = e => {
                let div = document.createElement('div')
                div.id = 'addCourseForStudent'
                $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.STUDENTS.ADD_COURSE.VIEW_ID, '#addCourseForStudent', {
                    studentID: e.target.getAttribute('data-studentID'),
                    studentName: e.target.getAttribute('data-studentName')
                }, {})
            }
        })
    };
    getValue(elementID, propertyName) {
        if (Array.isArray(elementID)) {
            let elementName = [];
            for (let jj = 0; jj < elementID.length; jj++) {
                for (let i of this.CourseTrees[propertyName]) {
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
            let elementName = '';
            for (let i of this.CourseTrees[propertyName]) {
                if (i._id == elementID) {
                    elementName = i.name;
                    break;
                }
            }
            return elementName
        }
    }
    removeStudent() {
        document.querySelectorAll(`${this.divID} .removeStudent`).forEach(student => {
            student.onclick = e => {
                warningAlert(`are you want delete student <span class="font-weight-bold">${e.target.getAttribute('data-studentName')}</span> ?`, () => {
                    let studentMID = e.target.getAttribute('data-studentMID');
                    post(
                        IDENTIFIERS.COURSES.STUDENTS.DELETE_STUDENT, {
                        studentMID: studentMID
                    }, (d) => {
                        //console.log(d);
                        this.reload();
                    }, (data) => {
                        notifyResult(false, data.userMsg)
                        console.log(data);
                    }
                    );
                })
            }
        })
    };

    selectAllStudentsInTable() {
        document.querySelector('#studentsList_table_checkAllStudents').onclick = e => {
            document.querySelectorAll(`${this.divID} #studentsList_table .studentsList_table_checkStudent`).forEach(checkbox => {
                if ($(e.target).is(':checked')) {
                    $(checkbox).prop("checked", true)
                } else {
                    $(checkbox).prop("checked", false)
                }
            })
        }
    }

    editStudent() {
        document.querySelectorAll(`${this.divID} .editStudent`).forEach(student => {
            student.onclick = e => {
                if (this.clicked == -1) {
                    let studentMID = e.target.getAttribute('data-studentMID');
                    this.clicked = 1

                    let div = document.createElement('div')
                    div.id = 'editStudent'
                    $(div).addClass('custom-modal p-5').appendTo("main").show().animate({ left: '0' }, 650)
                    super.newView(V.STUDENTS.NEW_STUDENT.VIEW_ID, '#editStudent', { editStudent: true, studentMID: studentMID }, {})
                } else {
                    return
                }
            }
        })
    };

    onPoke(d, a) {
        this.clicked = -1
        if (a !== undefined) {
            if(a.hasOwnProperty('restAll') && a.restAll == true){
                super.closeOthers({ children: 1 })
                this.reload()
            }else{
                this.pageNumber = 1
            this.studentsPageSize = (a.studentsPageSize !== undefined && a.hasOwnProperty('studentsPageSize')) ? a.studentsPageSize : this.studentsPageSize
            this.filterStudentsArray = /* a.filterStudentsArray */(a.filterStudentsArray == undefined) ? this.filterStudentsArray : a.filterStudentsArray
            //console.log('this.pageNumber', this.pageNumber);
            super.closeOthers({ children: 1 })
            this.getDataFilter(this.filterStudentsArray, this.exception)
            }
        } else {

            // this.reload()
            this.getDataFilter(this.filterStudentsArray, this.exception)
        }
    }

    getDataFilter(array, exception) {
        //console.log('getDataFilter',exception);
        let obj =
        {
            pageNumber: this.pageNumber,
            pageSize: this.studentsPageSize,
            filterOptions: array
        }
        if (exception !== undefined && exception !== false && exception == true) {
            obj.exceptionAll = true
        }
        console.log(obj);
        get(
            IDENTIFIERS.COURSES.STUDENTS.FILTER, obj,
            (result) => {
                //console.log('qqthis.pageNumber',this.pageNumber);
                //console.log('students ffff', result);
                this.studentsResult = result
                this.studentsArray = result.result
                //console.log({ numOfPages: this.studentsResult.pages, currentPage: this.pageNumber });
                this.fillStudentsTable(this.studentsArray)
                this.callPaginationView(this.studentsResult.pages, this.pageNumber, exception, result.numberOfResults)
            },
            (data) => {
                //super.loadError(data)
            });
    }

    callPaginationView(numOfPages, currentPage, exception, numberOfResults) {
        //console.log(numberOfResults);
        //console.log('pagination excep', exception);
        super.newView(V.PAGINATION.VIEW_ID, '#pagination_parent', {
            numberOfResults: numberOfResults,
            exception: exception,
            numOfPages: numOfPages,
            studentsPageSize: this.studentsPageSize,
            currentPage: currentPage,
            target: 'Students',
            filterStudentsArray: this.filterStudentsArray,
            sendPageNumber: (pageNumber, exception) => {
                //console.log(this.filterStudentsArray);
                this.pageNumber = pageNumber
                this.getDataFilter(this.filterStudentsArray, exception)
            }
        }, {})
    }

    stopLoading() { }
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();
        if (this.notification == undefined) {
            document.querySelector(this.divID).remove()
        } else {
            document.querySelector(this.divID.split(' ')[0]).remove()
        }
    }
};

export class AddCourseForStudent extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        let vote = 2;
        get(
            IDENTIFIERS.COURSES.COURSES.FILTER, {
            pageNumber: 1,
            pageSize: 1000,
            filterOptions: []
        },
            (result) => {

                this.coursesArray = result.result
                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                super.loadError(data)
            });
        $(this.divID).load(V.STUDENTS.ADD_COURSE.HTML_URL, () => {
            $('#addCourseForStudent_studentID').val(this.studentID)
            $(`${this.divID} h3 span`).html(this.studentName)
            if (--vote <= 0) {
                super.load()
            }
        });

    }
    render() {
        let elmnt = '<option></option>'
        for (let element of this.coursesArray) {
            elmnt += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#addCourseForStudent_select_courses').innerHTML = elmnt;
        /* $("#addCourseForStudent_select_courses").selectpicker('refresh'); */

        document.querySelector('#addCourseForStudent_close').onclick = () => {
            this.close()
        };

        $('#addCourseForStudent_buttonSubmit').click(e => {
            let obj = this.handleFormData();
            post(
                IDENTIFIERS.COURSES.STUDENTS.ADD_COURSE,
                obj,
                (d) => {

                    this.close()
                },
                function (data) {
                    console.log(data);
                }
            );
        })
        this.addRowElement()
        super.render();
    };
    onClickDateNow(THIS) {
        let date = new Date();

        let getDay = date.getDate();
        if (getDay < 10) getDay = '0' + getDay;

        let getMonth = date.getMonth() + 1;
        if (getMonth < 10) getMonth = '0' + getMonth;

        let getYear = date.getUTCFullYear();
        THIS.parentElement.querySelectorAll('input[type="date"]').forEach(inp => {
            inp.value = `${getYear}-${getMonth}-${getDay}`;
        })
    };
    addRowElement() {
        document.querySelectorAll('.addRow_Course').forEach(btn => {
            btn.onclick = (e) => {
                let elementCopyToAdd = e.target.parentElement.parentElement
                $(`${this.divID} .parent`).append(this.nodeToString(elementCopyToAdd))
                e.target.classList.add('d-none')
                e.target.nextElementSibling.classList.remove('d-none')
                this.addRowElement()
                document.querySelectorAll(`${this.divID} .removeRow_Course`).forEach(row => {
                    row.onclick = (e) => {
                        this.removeRowElement(e.target)
                    }
                });
            }
        })
    };
    removeRowElement(ButtonRemove) {
        ButtonRemove.offsetParent.parentElement.remove();
        let ModalTransporRows = document.querySelectorAll(`${this.divID} .parentChild_course`)
        ModalTransporRows[ModalTransporRows.length - 1].querySelector('.addRow_Course').classList.remove('d-none')
    };
    nodeToString(node) {
        var tmpNode = document.createElement("div");
        tmpNode.appendChild(node.cloneNode(true));
        var str = tmpNode.innerHTML;
        tmpNode = node = null; // prevent memory leaks in IE
        return str;
    };
    handleFormData() {
        let arr = [];
        document.querySelectorAll(`${this.divID} .parent .parentChild_course`).forEach((row) => {

            let formElements = row.querySelectorAll('input , textarea , select');
            let dataObj = {};
            formElements.forEach(each => {
                if (each.tagName == 'INPUT' && each.type == "checkbox") {
                    console.log(each.tagName, each.type);
                    dataObj[each.id] = $(each).is(':checked');
                } else {
                    dataObj[each.id] = each.value.trim();
                }
            });
            arr.push(dataObj);
        });
        console.log(arr);
        let finalArray = arr.map(obj => {
            return {
                courseID: obj.addCourseForStudent_select_courses,
                from: obj.addCourseForStudent_filter_fromDate,
                to: obj.addCourseForStudent_filter_toDate,
                subscribeToZoom: obj.newLecture_input_subscribeToZoom,
                replay: obj.addCourseForStudent_input_replay,
                unlimited: $('#addCourseForStudent_checkbox_unlimited').is(':checked'),
                notes: obj.addCourseForStudent_input_notes
            }
        });
        //console.log(finalArray);
        let objectToSend = {
            studentID: $('#addCourseForStudent_studentID').val(),
            courses: finalArray
        }
        return objectToSend
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
};
export class StudentsCoursesInfo extends InfoIconModal {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        let vote = 2;

        get(
            IDENTIFIERS.COURSES.STUDENTS.FILTER, {
            pageNumber: 1,
            pageSize: 10000,
            filterOptions: []
        },
            (result) => {

                this.ListArray = result.result.filter(r => {
                    return r._id == this.studentID
                })[0].courses

                if (--vote <= 0) {
                    super.load()
                }

            },
            function (data) {
                console.log(data.errMsg);
                notifyResult(false, data.userMsg);
            }
        );
        get(
            IDENTIFIERS.COURSES.COURSES.FILTER, {
            pageNumber: 1,
            pageSize: 1000,
            filterOptions: []
        },
            (result) => {
                this.ListArrayCourses = result.result
                if (--vote <= 0) {
                    super.load()
                }

            },
            function (data) {
                console.log(data.errMsg);
                notifyResult(false, data.userMsg);
            }
        );
    }
    render() {

        document.querySelector('#instructionsModal_content').innerHTML = `
                
                <table class="table table-striped"></table>`
        let row = `
            
            <thead class="text-center text-capitalize">
                <tr>
                    <th scope="col">course</th>
                    <th scope="col">from</th>
                    <th scope="col">to</th>
                    <th scope="col">subsc. zoom</th>
                    <th scope="col">replay</th>
                    <th scope="col">notes</th>
                    <th scope="col"></th>
                </tr>
            </thead>
            `

        for (let i = this.ListArray.length - 1; i >= 0; i--) {
            row += `
                <tbody class="text-center">
                    <tr>
                        <td>${this.getValue(this.ListArray[i].courseID)}</td>
                        <td>${this.ListArray[i].from}</td>
                        <td>${this.ListArray[i].to}</td>
                        <td>${(this.ListArray[i].subscribeToZoom == true) ? 'yes' : 'no'}</td>
                        <td>${(this.ListArray[i].unlimited == true) ? '0' : `${this.ListArray[i].replay} time(s)`}</td>
                        <td>${this.ListArray[i].notes}</td>
                        <td><i class="fas fa-times text-danger removeCourseFormStudent" data-courseID="${this.ListArray[i].courseID}" data-studentID="${this.studentID}"></i></td>
                    </tr>
                </tbody>
                `
        }

        document.querySelector('#instructionsModal_content table').innerHTML = row
        this.removeCourseForStudent()
        super.render();
    }

    removeCourseForStudent() {
        document.querySelectorAll(`${this.divID} .removeCourseFormStudent`).forEach(removeCourse => {
            removeCourse.onclick = e => {
                let studentID = e.target.getAttribute('data-studentID');
                let courseID = e.target.getAttribute('data-courseID');

                post(
                    IDENTIFIERS.COURSES.STUDENTS.REMOVE_COURSE,
                    {
                        studentID: studentID,
                        courseID: courseID
                    },
                    (e) => {
                        this.reload()
                    }, err => {
                        console.log(err);
                    }
                )
            }
        })
    }
    stopLoading() { }

    getValue(elementID) {
        let elementName = '';
        for (let i of this.ListArrayCourses) {
            if (i._id == elementID) {
                elementName = i.name;
                break;
            }
        }
        return elementName
    };

    /*    getVisualName(userID) {
           var userVisualName;
           for (let user of this.usersList) {
               if (user.userID == userID) {
                   userVisualName = user.visualName;
                   break;
               };
           };
           return userVisualName;
       };
    */
    reload() { super.reload({}); }
    close() { super.close(); }
    promptError(error) {
        console.log(error.errMsg)
        notifyResult(error.userMsg)
    };
}

export class StudentsCartCourses extends InfoIconModal {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        let vote = 3;
        get(
            IDENTIFIERS.COURSES.COURSES.COURSES_TREE.COURSE_TREES, {},
            (result) => {
                console.log(result);
                this.CourseTrees = result

                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                //super.loadError(data)
            });
        get(
            IDENTIFIERS.COURSES.INSTRUCTORS.FILTER, {},
            (result) => {
                console.log(result);
                this.instructorsArray = result.instructors
                if (--vote <= 0) {
                    super.load()
                }

            },
            function (data) {
                console.log(data.errMsg);
                notifyResult(false, data.userMsg);
            }
        );

        get(
            IDENTIFIERS.COURSES.COURSES.STUDENT_CART, { userID: this.studentID },
            (result) => {
                console.log(result);
                this.Array = result
                if (--vote <= 0) {
                    super.load();
                }
            },
            (data) => {
                //super.loadError(data)
            }
        );
    }
    render() {
        console.log('here');
        $('#instructionsModal_content').html(`<table class="table table-striped"></table>`)
        this.fillTable();

        super.render();
    }
    stopLoading() { }
    fillTable() {
        let row = `
                
        <thead class="text-center text-capitalize">   
            <tr>
                <th style="width: 5%;" scope="col">course</th>
                <th style="width: 6%;" scope="col">instructor</th>
                <th style="width: 4%;" scope="col">university</th>
                <th style="width: 2%;" scope="col"></th>
                <th style="width: 2%;" scope="col"></th>
            </tr>
        </thead>
        `

        for (let i = this.Array.length - 1; i >= 0; i--) {
            row += `
                <tbody class="text-center">
                    <tr>
                        <td>${this.Array[i].name}</td>
                        <td>${this.getVisualName(this.Array[i].instructor)}</td>
                        <td>${this.getValue(this.Array[i].university, 'universities')}</td>
                        <td>
                            <a href="#" class="fas fa-check-circle text-primary approveCourseForStudent w-100 px-2 py-2 text-capitalize text-decoration-none" data-courseID="${this.Array[i]._id}"> approve</a>
                        </td>
                        <td>
                            <a href="#" class="fas fa-times-circle text-danger disapproveCourseForStudent w-100 px-2 py-2 text-capitalize text-decoration-none" data-courseID="${this.Array[i]._id}"> remove</a>
                        </td>
                    </tr>
                </tbody>
                `
        }

        document.querySelector('#instructionsModal_content table').innerHTML = row
        this.approveCourseForStudent()
    }

    getValue(elementID, propertyName) {
        let elementName = '';
        for (let i of this.CourseTrees[propertyName]) {
            if (i._id == elementID) {
                elementName = i.name;
                break;
            }
        }
        return elementName
    }

    getVisualName(ids) {
        var name = '';
        for (let instructor of this.instructorsArray) {
            for (let j of ids) {
                if (instructor._id == j) {
                    name += `${instructor.name}, `;
                };
            }
        };
        return name;
    };

    approveCourseForStudent() {
        console.log(document.querySelectorAll(`${this.divID} .approveCourseForStudent`));
        document.querySelectorAll(`${this.divID} .approveCourseForStudent`).forEach(approve => {
            //console.log(approve);
            approve.onclick = e => {

                let courseID = e.target.getAttribute('data-courseID')

                post(
                    IDENTIFIERS.COURSES.STUDENTS.ADD_COURSE,
                    {
                        studentID: this.studentID,
                        courses: [{
                            courseID: courseID,

                            from: this.dateNow(),
                            to: this.dateAfter3Months(),
                            subscribeToZoom: false,
                            replay: '10',
                            unlimited: false,
                            notes: ''
                        }]
                    },
                    (d) => {
                        post(IDENTIFIERS.COURSES.COURSES.APPROVE_PURCHASE, {
                            courseID: courseID,
                            studentID: this.studentID
                        },
                            (result) => {
                                $(e.target).removeClass('text-primary approveCourseForStudent')
                                $(e.target).addClass('text-success')
                                this.reload()
                            },
                            (err) => {
                                super.loadError(err.err);
                            }
                        );
                    },
                    (err) => {
                        super.loadError(err.err);
                    }
                );
            }
        })
    }
    dateNow() {
        let date = new Date();

        let getDay = date.getDate();
        if (getDay < 10) getDay = '0' + getDay;

        let getMonth = date.getMonth() + 1;
        if (getMonth < 10) getMonth = '0' + getMonth;

        let getYear = date.getUTCFullYear();

        return `${getYear}-${getMonth}-${getDay}`;
    };
    dateAfter3Months() {
        let date = new Date();

        let getDay = date.getDate();
        if (getDay < 10) getDay = '0' + getDay;

        let getMonth = date.getMonth() + 1;
        if (getMonth < 10) getMonth = '0' + getMonth;
        //console.log(getMonth)
        let getYear = date.getUTCFullYear();

        for (let i = 1; i < 4; i++) {
            if (parseInt(getMonth) < 12) {
                getMonth = getMonth + 1
            } else if (parseInt(getMonth) == 12) {
                getMonth = 1
                getYear = parseInt(getYear) + 1
            }
        }
        if (getMonth < 10) getMonth = '0' + getMonth;
        return `${getYear}-${getMonth}-${getDay}`;
    };
    reload() { super.reload({}); }
    close() { super.close(); }
    promptError(error) {
        console.log(error.errMsg)
        notifyResult(error.userMsg)
    };
}

export class StudentsBlockList extends InfoIconModal {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        let vote = 1;
        get(
            IDENTIFIERS.COURSES.STUDENTS.STUDENT_BLOCK_LIST, {
            studentID: this.studentID
        },
            (result) => {
                //console.log(result);
                this.Array = result.reasons

                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                //super.loadError(data)
            });

    }
    render() {
        // console.log('here');
        $('#instructionsModal_content').html(`
        <h4 class="text-capitalize font-weight-bold">${this.studentName}</h4>
        <table class="table table-striped table-bordered"></table>`)
        this.fillTable();

        super.render();
    }
    stopLoading() { }
    fillTable() {
        let row = `
                
        <thead class="text-center text-capitalize">   
            <tr>
                <th style="width: 20%;" scope="col">time</th>
                <th scope="col">reason</th>
            </tr>
        </thead>
        `

        for (let i = this.Array.length - 1; i >= 0; i--) {
            row += `
                <tbody class="text-center">
                    <tr>
                        <td>${(new Date(this.Array[i].t * 1000)).toLocaleString()}</td>
                        <td>${(this.Array[i].hasOwnProperty('v')) ? this.Array[i].v : ''}</td>
                    </tr>
                </tbody>
                `
        }

        document.querySelector('#instructionsModal_content table').innerHTML = row
    }

    reload() { super.reload({}); }
    close() { super.close(); }
    promptError(error) {
        console.log(error.errMsg)
        notifyResult(error.userMsg)
    };
}

export class Groups extends InfoIconModal {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        let vote = 1;
        get(
            IDENTIFIERS.COURSES.GROUPS.GROUPS, {},
            (result) => {
                console.log(result);
                this.Array = result

                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                //super.loadError(data)
            });
    }
    render() {
        console.log('here');
        $('#instructionsModal_content').load(`/htmlParts/groupsList.html`, () => {
            this.fillTable();

            this.clicked = -1
            $(`${this.divID} #groups_newGroup`).click(e => {
                if (this.clicked == -1) {
                    let div = document.createElement('div')
                    div.id = 'modalXX'
                    $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                    super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                        image: false,
                        labelTitle: 'Group',
                        identifier: IDENTIFIERS.COURSES.GROUPS.NEW_GROUP,
                        viewToBePoked: { viewID: V.GROUPS.MAIN.VIEW_ID }
                    }, {});
                } else {
                    return
                }
            });
        })


        super.render();
    }

    fillTable() {
        let counter = 0
        let row = ``

        for (let i = this.Array.length - 1; i >= 0; i--) {
            counter++
            row += `
                <tr>
                    <td>${counter}</td>
                    <td>${this.Array[i].name}</td>
                    <td>
                        <div class="d-flex justify-content-center">
                            <a data-ID="${this.Array[i]._id}" href="#" class="fas fa-edit text-info editGroup px-2 py-2 text-capitalize text-decoration-none" data-courseID="${this.Array[i]._id}"></a>
                            <a data-ID="${this.Array[i]._id}" href="#" class="fas fa-times text-danger removeGroup ml-2 px-2 py-2 text-capitalize text-decoration-none" data-courseID="${this.Array[i]._id}"></a>    
                        </div>
                    </td>
                </tr>
            `
        }

        document.querySelector('#instructionsModal_content table tbody').innerHTML = row
        this.removeGroup();
        this.editElement();
    }
    removeGroup() {
        document.querySelectorAll(`${this.divID} .removeGroup`).forEach(group => {
            group.onclick = e => {
                let id = e.target.getAttribute('data-ID');
                post(
                    IDENTIFIERS.COURSES.GROUPS.EDIT_GROUP,
                    {
                        groupID: id,
                        deleted: 1
                    },
                    (data) => {
                        this.reload()
                    },
                    (err) => {
                        console.log(err);
                    }
                )
            }
        })
    }
    editElement() {
        document.querySelectorAll(`${this.divID} .editGroup`).forEach(edit => {
            edit.onclick = e => {
                let div = document.createElement('div')
                div.id = 'modalXX'
                $(div).addClass('custom-modal pt-5 ').appendTo("main").show().animate({ left: '0' }, 650)
                let filter = this.Array.filter(group => {
                    return group._id == e.target.getAttribute('data-ID')
                })[0]
                super.newView(V.MODAL_ADD.VIEW_ID, '#modalXX', {
                    image: false,
                    labelTitle: 'Group',
                    identifier: IDENTIFIERS.COURSES.GROUPS.EDIT_GROUP,
                    viewToBePoked: { viewID: V.GROUPS.MAIN.VIEW_ID },
                    targetName: 'groupID',
                    edit: filter
                }, {});
            }
        })
    }
    onPoke() {
        this.reload()
    }
    stopLoading() { }
    reload() { super.reload({}); }
    close() { super.close(); this.pokeView({ viewID: V.STUDENTS.MAIN.VIEW_ID }) }
    promptError(error) {
        console.log(error.errMsg)
        notifyResult(error.userMsg)
    };
}

export class StudentNotification extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        let vote = 1;
        $(this.divID).load(V.STUDENTS.STUDENT_NOTIFICATION.HTML_URL, () => {
            $('#studentsList_NOTIFY_type').selectpicker('refresh');
            if (--vote <= 0) {
                super.load()
            }
        });
    }
    render() {
        //console.log('here');

        document.querySelector('#studentsList_NOTIFY_type').onchange = e => {
            if (e.target.value == 'LINK' || e.target.value == "APP") {
                $('#studentsList_NOTIFY_linkDiv').removeClass('d-none')
                $('#studentsList_NOTIFY_coursesList').addClass('d-none')
            } else {
                $('#studentsList_NOTIFY_coursesList').removeClass('d-none')
                $('#studentsList_NOTIFY_linkDiv').addClass('d-none')
                this.getCoursesAndFillSelect()
            }
        }

        //TODO: CREATE  UPLOADER 
        let uploader = new Uploader(
            this.userID, // userID that has been logged in
            $('#studentsList_NOTIFY_image'),
           // "https://files.p56dki765gz8k.com/uploads", []
           "http://localhost:8080/uploads", []
        )
        //console.log(uploader);

        uploader.render($('#studentsList_NOTIFY_image'));

        document.querySelector('#studentsList_NOTIFY').onclick = (e) => {
            if ($('#studentsList_NOTIFY_DATEtiem').val() == '' /* || $('#studentsList_NOTIFY_MESSAGE').val() == '' */) {
                notifyResult(false, ($('#studentsList_NOTIFY_DATEtiem').val() == '') ? 'Select date and time' : '')
                return
            }
            document.querySelector('#studentsList_NOTIFY').innerHTML = ''
            document.querySelector('#studentsList_NOTIFY').classList.add('button_Loading_submit')
            document.querySelector('#studentsList_NOTIFY').setAttribute('disabled', 'disabled')
            let studentsArray = this.getStudentsIDsFromTable();
            let dateTimeNumber = new Date($('#studentsList_NOTIFY_DATEtiem').val()).getTime()
            let data = {
                message: $('#studentsList_NOTIFY_MESSAGE').val(),
                dateTime: dateTimeNumber,
                students: studentsArray
            }

            if ($('#studentsList_NOTIFY_type').val() == '') {

            } else if ($('#studentsList_NOTIFY_type').val() == 'APP'
                || $('#studentsList_NOTIFY_type').val() == 'LINK' && $('#studentsList_NOTIFY_link').val() !== '') {
                data.target = {
                    external: {
                        type: $('#studentsList_NOTIFY_type').val(),
                        data: $('#studentsList_NOTIFY_link').val()
                    }
                }
            } else if ($('#studentsList_NOTIFY_type').val() !== 'APP'
                || $('#studentsList_NOTIFY_type').val() !== 'LINK' && $('#studentsList_NOTIFY_courses').val() !== '') {
                data.target = {
                    internal: {
                        targetScreen: ($('#studentsList_NOTIFY_type').val()).split('_')[1],
                        data: {
                            courseID: $('#studentsList_NOTIFY_courses').val()
                        }
                    }
                }
            }
            if (uploader.getFilesIDs().length !== 0) {
                data.image = uploader.getFilesIDs()[0]
            }
            //console.log(data);
            uploader.on('progress', (progress) => {
                document.querySelector(`${this.divID} #studentsList_NOTIFY_ProgressImage`).parentElement.classList.remove('d-none');
                document.querySelector(`${this.divID} #studentsList_NOTIFY_ProgressImage`).style.width = `${progress * 100}%`;
                document.querySelector(`${this.divID} #studentsList_NOTIFY_ProgressImage`).innerHTML = `${Math.round(progress * 100)} %`;
                // show user progress percentage
                // according to progress variable
                //console.log(progress * 100);
                if (progress == 1) {
                    document.querySelector(`${this.divID} #studentsList_NOTIFY_ProgressImage`).parentElement.classList.add('d-none')
                    this.reload()
                }
            });

            //uploader.upload();

            post(
                IDENTIFIERS.NOTIFICATIONS.NEW_NOTIFICATION, data,
                (sa) => {
                    console.log(sa);

                    console.log(uploader.getFilesIDs().length !== 0);
                    if (uploader.getFilesIDs().length !== 0) {
                        uploader.upload();
                    } else {
                        console.log('reeeeeload');
                        this.reload()
                    }
                    //console.log(sa);
                },
                (data) => {
                    console.log(data);
                    document.querySelector('#studentsList_NOTIFY').innerHTML = 'create'
                    document.querySelector('#studentsList_NOTIFY').classList.remove('button_Loading_submit')
                    document.querySelector('#studentsList_NOTIFY').removeAttribute('disabled', 'disabled')
                }
            );
        }

        super.render();
    }
    getCoursesAndFillSelect() {
        get(
            IDENTIFIERS.COURSES.COURSES.FILTER, {
            pageNumber: 1,
            pageSize: 1000,
            filterOptions: []
        },
            (result) => {
                let elm = '<option disabled></option>'
                for (let element of result.result) {
                    elm += `<option value="${element._id}">${element.name}</option>`
                }
                document.querySelector('#studentsList_NOTIFY_courses').innerHTML = elm;
                $("#studentsList_NOTIFY_courses").selectpicker('refresh');
            },
            (data) => {
                super.loadError(data)
            });
    }

    getStudentsIDsFromTable() {
        let array = []
        document.querySelectorAll(`${this.mainTab} table tbody .studentsList_table_checkStudent`).forEach(checkbox => {
            if ($(checkbox).is(':checked')) {
                let studentID = $(checkbox).attr('data-studentID')
                console.log(studentID);
                array.push(studentID)
            }
        })
        //console.log(array);
        return array
    }

    onPoke() {
        this.reload()
    }
    stopLoading() { }
    reload() { super.reload({}); }
    close() { super.close(); }
    promptError(error) {
        console.log(error.errMsg)
        notifyResult(error.userMsg)
    };
}
