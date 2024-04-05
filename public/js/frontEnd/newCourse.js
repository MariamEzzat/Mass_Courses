import { IDENTIFIERS } from '../constants.js';
import {get, post } from '../sdk/front.js';
import { Uploader } from '../libraries/uploader.js';
import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';
import { MODAL } from './courses.js';
import { notifyResult } from './navBar.js';
export class NewCourse extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {
        let vote = 3;
        get(
            IDENTIFIERS.COURSES.COURSES.COURSES_TREE.UNIVERSITIES, {},
            (result) => {

                this.UNIVERSITIES = result
                    //console.log(result);
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
                this.userID = result.userID
                this.instructorsArray = result.instructors
                    //console.log(result);
                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                //super.loadError(data)
            });
        $(this.divID).load(V.COURSES.NEW_COURSE.HTML_URL, () => {
            $('#newCourse_input_university').selectpicker('refresh');
            $('#newCourse_input_faculty').selectpicker('refresh');
            $('#newCourse_input_department').selectpicker('refresh');
            $('#newCourse_input_section').selectpicker('refresh');
            $('#newCourse_input_year').selectpicker('refresh');
            $('#newCourse_input_term').selectpicker('refresh');
            $('#newCourse_input_subject').selectpicker('refresh');
            if (--vote <= 0) {
                super.load()
            }
        });
    }
    render() {

        document.querySelector('#newCourse_close').onclick = () => {
            this.close();
            this.pokeView({ viewID: V.COURSES.MAIN.VIEW_ID })
        };

        let elmnt = '<option disabled></option>'
        for (let element of this.instructorsArray) {
            elmnt += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newCourse_input_instructor').innerHTML = elmnt;
        $("#newCourse_input_instructor").selectpicker('refresh');

        let elm = '<option></option>'
        for (let element of this.UNIVERSITIES) {
            elm += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newCourse_input_university').innerHTML = elm;
        $("#newCourse_input_university").selectpicker('refresh');

        $('#newCourse_input_university').change(e => {
            $("#newCourse_input_faculty").val('');
            $("#newCourse_input_department").val('');
            $("#newCourse_input_section").val('');
            $("#newCourse_input_year").val('');
            $("#newCourse_input_term").val('');
            $("#newCourse_input_subject").val('');
            $("#newCourse_input_faculty").selectpicker('refresh');
            $("#newCourse_input_department").selectpicker('refresh');
            $("#newCourse_input_section").selectpicker('refresh');
            $("#newCourse_input_year").selectpicker('refresh');
            $("#newCourse_input_term").selectpicker('refresh');
            $("#newCourse_input_subject").selectpicker('refresh');

            let ID = e.target.value;
            get(
                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.FACULTIES, {
                    universityID: ID
                },
                (result) => {
                    this.changeFaculties(result)

                },
                (data) => {
                    //super.loadError(data)
                });
        })

        //TODO: CREATE  UPLOADER 
        let uploader = new Uploader(
                this.userID, // userID that has been logged in
                $('#newCourseFiles'),
              //  "https://p56dki765gz8k.com/uploads", []
              "http://localhost:8080/uploads", []
            )
            //console.log(uploader);

        uploader.render($('#newCourseFiles'));

        uploader.on('filesAdded', (file) => {
            //console.log(file);
            document.querySelector('#newCourseFiles').nextElementSibling.innerHTML = file[0].name
        })
        $('#newCourse_buttonSubmit').click(e => {

            if (document.querySelector(`${this.divID} [name="name"]`).value == '') {
                notifyResult(false, 'Please Fill Course Name');
                return;
            };
            if (document.querySelector(`${this.divID} [name="instructor"]`).value == '') {
                notifyResult(false, 'Please Select at least one instructor');
                return;
            };

            if (document.querySelector(`${this.divID} [name="subject"]`).value == '') {
                notifyResult(false, 'Please Fill subject name');
                return;
            };

            if (uploader.getFilesIDs().length == 0) {
                notifyResult(false, 'Please Choose Image For Course');
                return;
            };
            document.querySelector('#newCourse_buttonSubmit').innerHTML = ''
            document.querySelector('#newCourse_buttonSubmit').classList.add('button_Loading_submit')
            document.querySelector('#newCourse_buttonSubmit').setAttribute('disabled', 'disabled')
            let FORM = document.querySelector(this.divID);
            let formElements = FORM.querySelectorAll('input , textarea , select');
            let dataObj = {};
            formElements.forEach(each => {
                dataObj[each.id] = each.value.trim();
            });
            let obj = {
                name: dataObj.newCourse_input_name,
                university: dataObj.newCourse_input_university,
                faculty: dataObj.newCourse_input_faculty,
                department: dataObj.newCourse_input_department,
                section: dataObj.newCourse_input_section,
                term: dataObj.newCourse_input_term,
                year: dataObj.newCourse_input_year,
                subject: dataObj.newCourse_input_subject,
                instructor: $('#newCourse_input_instructor').val(),
                files: uploader.getFilesIDs()[0]
            }
            uploader.on('success', () => {
                console.log('uploaded successfully');
            })

            uploader.on('progress', (progress) => {
                document.querySelector(`${this.divID} #newCourseProgressImage`).parentElement.classList.remove('d-none')
                document.querySelector(`${this.divID} #newCourseProgressImage`).style.width = `${progress*100}%`
                document.querySelector(`${this.divID} #newCourseProgressImage`).innerHTML = `${Math.round(progress*100)} %`
                    // show user progress percentage
                    // according to progress variable
                    //console.log(progress * 100);
                if (progress == 1) {
                    document.querySelector(`${this.divID} #newCourseProgressImage`).parentElement.classList.add('d-none')
                    document.querySelector('#newCourse_buttonSubmit').innerHTML = 'create'
                    document.querySelector('#newCourse_buttonSubmit').classList.remove('button_Loading_submit')
                    document.querySelector('#newCourse_buttonSubmit').removeAttribute('disabled', 'disabled')
                    this.close()
                    this.pokeView({ viewID: V.COURSES.MAIN.VIEW_ID })
                }
            });
            //console.log(obj);
            // on backend respond success on the form submit 
            // call uploader.upload();

            post(
                IDENTIFIERS.COURSES.COURSES.NEW,
                obj,
                (d) => {
                    uploader.upload();
                    document.querySelector(this.divID).querySelectorAll('input, select, textarea').forEach(elm => elm.value = '')

                },
                function(data) {
                    console.log(data);
                    document.querySelector('#newCourse_buttonSubmit').innerHTML = 'create'
                    document.querySelector('#newCourse_buttonSubmit').classList.remove('button_Loading_submit')
                    document.querySelector('#newCourse_buttonSubmit').removeAttribute('disabled', 'disabled')
                }
            );
        });



        if (this.edit !== undefined) {
            $('#newCourse_buttonEdit').removeClass('d-none')
            $('#newCourse_buttonSubmit').addClass('d-none');

            for (let i in this.edit) {
                let element = $(this.divID).find(`[name="${i}"]`)[0]
                    //console.log(element);
                if (element !== undefined) {
                    if (element.tagName == "SELECT") {
                        if (element.name == 'university') {
                            $("#newCourse_input_university").val(this.edit['university']);
                            $("#newCourse_input_university").selectpicker('refresh');

                        } else if (element.name == 'faculty') {
                            get(
                                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.FACULTIES, {
                                    universityID: this.edit['university']
                                },
                                (result) => {
                                    let elmnt = '<option disabled></option>'
                                    for (let element of result) {
                                        elmnt += `<option value="${element._id}">${element.name}</option>`
                                    }
                                    document.querySelector('#newCourse_input_faculty').innerHTML = elmnt;
                                    $("#newCourse_input_faculty").selectpicker('refresh');

                                    $("#newCourse_input_faculty").val(this.edit['faculty'])
                                    $("#newCourse_input_faculty").selectpicker('refresh');
                                },
                                (data) => {
                                    //super.loadError(data)
                                });
                        } else if (element.name == 'department') {
                            get(
                                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.DEPARTMENTS, {
                                    facultyID: this.edit['faculty']
                                },
                                (result) => {
                                    let elmnt = '<option disabled></option>'
                                    for (let element of result) {
                                        elmnt += `<option value="${element._id}">${element.name}</option>`
                                    }
                                    document.querySelector('#newCourse_input_department').innerHTML = elmnt;
                                    $("#newCourse_input_department").selectpicker('refresh');
                                    $("#newCourse_input_department").val(this.edit['department'])
                                    $("#newCourse_input_department").selectpicker('refresh');
                                },
                                (data) => {
                                    //super.loadError(data)
                                });
                        } else if (element.name == 'section') {
                            get(
                                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.SECTIONS, {
                                    departmentID: this.edit['department']
                                },
                                (result) => {
                                    let elmnt = '<option disabled></option>'
                                    for (let element of result) {
                                        elmnt += `<option value="${element._id}">${element.name}</option>`
                                    }
                                    document.querySelector('#newCourse_input_section').innerHTML = elmnt;
                                    $("#newCourse_input_section").selectpicker('refresh');
                                    $("#newCourse_input_section").val(this.edit['section'])
                                    $("#newCourse_input_section").selectpicker('refresh');
                                },
                                (data) => {
                                    //super.loadError(data)
                                });
                        } else if (element.name == 'year') {
                            get(
                                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.YEARS, {
                                    sectionID: this.edit['section']
                                },
                                (result) => {
                                    let elmnt = '<option disabled></option>'
                                    for (let element of result) {
                                        elmnt += `<option value="${element._id}">${element.name}</option>`
                                    }
                                    document.querySelector('#newCourse_input_year').innerHTML = elmnt;
                                    $("#newCourse_input_year").selectpicker('refresh');
                                    $("#newCourse_input_year").val(this.edit['year'])
                                    $("#newCourse_input_year").selectpicker('refresh');
                                },
                                (data) => {
                                    //super.loadError(data)
                                });
                        } else if (element.name == 'term') {
                            get(
                                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.TERMS, {
                                    yearID: this.edit['year']
                                },
                                (result) => {
                                    let elmnt = '<option disabled></option>'
                                    for (let element of result) {
                                        elmnt += `<option value="${element._id}">${element.name}</option>`
                                    }
                                    document.querySelector('#newCourse_input_term').innerHTML = elmnt;
                                    $("#newCourse_input_term").selectpicker('refresh');
                                    $("#newCourse_input_term").val(this.edit['term'])
                                    $("#newCourse_input_term").selectpicker('refresh');
                                },
                                (data) => {
                                    //super.loadError(data)
                                });
                        } else if (element.name == 'subject') {
                            get(
                                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.SUBJECTS, {
                                    termID: this.edit['term']
                                },
                                (result) => {
                                    let elmnt = '<option disabled></option>'
                                    for (let element of result) {
                                        elmnt += `<option value="${element._id}">${element.name}</option>`
                                    }
                                    document.querySelector('#newCourse_input_subject').innerHTML = elmnt;
                                    $("#newCourse_input_subject").selectpicker('refresh');
                                    $("#newCourse_input_subject").val(this.edit['subject'])
                                    $("#newCourse_input_subject").selectpicker('refresh');
                                },
                                (data) => {
                                    //super.loadError(data)
                                });
                        } else {
                            $(element).val(this.edit[i])
                            element.setAttribute('data-oldValue', this.edit[i])
                            let r = $(element).change()
                        }



                    } else if (element.tagName == "INPUT" && element.type == "checkbox") {
                        element.checked = this.edit[i]
                    } else {
                        $(element).val(this.edit[i])
                        element.setAttribute('data-oldValue', this.edit[i])
                    }
                }
            }

            $('#newCourse_buttonEdit').click(e => {
                if (document.querySelector(`${this.divID} [name="name"]`).value == '') {
                    notifyResult(false, 'Please Fill Course Name');
                    return;
                };
                if (document.querySelector(`${this.divID} [name="instructor"]`).value == '') {
                    notifyResult(false, 'Please Select at least one instructor');
                    return;
                };

                document.querySelector('#newCourse_buttonEdit').innerHTML = 'create'
                document.querySelector('#newCourse_buttonEdit').classList.add('button_Loading_submit')
                document.querySelector('#newCourse_buttonEdit').setAttribute('disabled', 'disabled')
                let FORM = document.querySelector(this.divID);
                let formElements = FORM.querySelectorAll('input , textarea , select');
                let dataObj = {};
                formElements.forEach(each => {
                    dataObj[each.id] = each.value.trim();
                });
                let obj = {
                    courseID: this.edit._id,
                    name: dataObj.newCourse_input_name,
                    university: dataObj.newCourse_input_university,
                    faculty: dataObj.newCourse_input_faculty,
                    department: dataObj.newCourse_input_department,
                    section: dataObj.newCourse_input_section,
                    term: dataObj.newCourse_input_term,
                    year: dataObj.newCourse_input_year,
                    subject: dataObj.newCourse_input_subject,
                    instructor: $('#newCourse_input_instructor').val(),
                }
                if (uploader.getFilesIDs().length !== 0) {
                    obj.files = uploader.getFilesIDs()[0]
                    uploader.on('success', () => {
                        console.log('uploaded successfully');
                    })

                    uploader.on('progress', (progress) => {
                        document.querySelector(`${this.divID} #newCourseProgressImage`).parentElement.classList.remove('d-none')
                        document.querySelector(`${this.divID} #newCourseProgressImage`).style.width = `${progress*100}%`
                        document.querySelector(`${this.divID} #newCourseProgressImage`).innerHTML = `${Math.round(progress*100)} %`
                            // show user progress percentage
                            // according to progress variable
                            //console.log(progress * 100);
                        if (progress == 1) {
                            document.querySelector(`${this.divID} #newCourseProgressImage`).parentElement.classList.add('d-none')
                            document.querySelector('#newCourse_buttonEdit').innerHTML = 'create'
                            document.querySelector('#newCourse_buttonEdit').classList.remove('button_Loading_submit')
                            document.querySelector('#newCourse_buttonEdit').removeAttribute('disabled', 'disabled')
                            this.close()
                            this.pokeView({ viewID: V.COURSES.MAIN.VIEW_ID })

                        }
                    });
                }

                //console.log(obj);
                // on backend respond success on the form submit 
                // call uploader.upload();

                post(
                    IDENTIFIERS.COURSES.COURSES.EDIT,
                    obj,
                    (d) => {
                        document.querySelector(this.divID).querySelectorAll('input, select, textarea').forEach(elm => elm.value = '')
                        if (uploader.getFilesIDs().length !== 0) {
                            uploader.upload();
                        } else {
                            this.close()
                            this.pokeView({ viewID: V.COURSES.MAIN.VIEW_ID })
                        }
                    },
                    function(data) {
                        console.log(data);
                        document.querySelector('#newCourse_buttonEdit').innerHTML = 'create'
                        document.querySelector('#newCourse_buttonEdit').classList.remove('button_Loading_submit')
                        document.querySelector('#newCourse_buttonEdit').removeAttribute('disabled', 'disabled')
                    }
                );
            })
        }
        super.render();
    };
    changeFaculties(arr) {
        console.log(arr);
        let elmnt = '<option></option>'
        for (let element of arr) {
            elmnt += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newCourse_input_faculty').innerHTML = elmnt;
        $("#newCourse_input_faculty").selectpicker('refresh');

        $('#newCourse_input_faculty').change(e => {
            let ID = e.target.value;
            get(
                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.DEPARTMENTS, {
                    facultyID: ID
                },
                (result) => {
                    this.changeDepartments(result)
                },
                (data) => {
                    super.loadError(data)
                });
        })
    }
    changeDepartments(arr) {
        let elmnt = '<option></option>'
        for (let element of arr) {
            elmnt += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newCourse_input_department').innerHTML = elmnt;
        $("#newCourse_input_department").selectpicker('refresh');

        $('#newCourse_input_department').change(e => {
            let ID = e.target.value;
            get(
                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.SECTIONS, {
                    departmentID: ID
                },
                (result) => {
                    this.changeSections(result)
                },
                (data) => {
                    super.loadError(data)
                });
        })
    }
    changeSections(arr) {
        let elmnt = '<option></option>'
        for (let element of arr) {
            elmnt += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newCourse_input_section').innerHTML = elmnt;
        $("#newCourse_input_section").selectpicker('refresh');

        $('#newCourse_input_section').change(e => {
            let ID = e.target.value;
            get(
                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.YEARS, {
                    sectionID: ID
                },
                (result) => {
                    this.changeYears(result)
                },
                (data) => {
                    super.loadError(data)
                });
        })
    }
    changeYears(arr) {
        let elmnt = '<option ></option>'
        for (let element of arr) {
            elmnt += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newCourse_input_year').innerHTML = elmnt;
        $("#newCourse_input_year").selectpicker('refresh');

        $('#newCourse_input_year').change(e => {
            let ID = e.target.value;
            get(
                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.TERMS, {
                    yearID: ID
                },
                (result) => {
                    this.changeTerms(result)

                },
                (data) => {
                    super.loadError(data)

                });
        })
    }
    changeTerms(arr) {
        let elmnt = '<option ></option>'
        for (let element of arr) {
            elmnt += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newCourse_input_term').innerHTML = elmnt;
        $("#newCourse_input_term").selectpicker('refresh');

        $('#newCourse_input_term').change(e => {
            let ID = e.target.value;
            get(
                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.SUBJECTS, {
                    termID: ID
                },
                (result) => {
                    let elmnt = '<option disabled></option>'
                    for (let element of result) {
                        elmnt += `<option value="${element._id}">${element.name}</option>`
                    }
                    document.querySelector('#newCourse_input_subject').innerHTML = elmnt;
                    $("#newCourse_input_subject").selectpicker('refresh');
                },
                (data) => {
                    super.loadError(data)
                });
        })
    }
    stopLoading() {}
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();
        $(this.divID).animate({ left: '-100%' }, 650, () => {
            document.querySelector(this.divID).remove()
        })
        document.querySelector('body').classList.remove('overflow-hidden');
    }
};