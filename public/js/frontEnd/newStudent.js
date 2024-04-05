import { IDENTIFIERS } from '../constants.js';
import { get, post } from '../sdk/front.js';
import { notifyResult } from './navBar.js';

import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';

export class NewStudent extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        let vote = 3;
        get(
            IDENTIFIERS.COURSES.COURSES.COURSES_TREE.UNIVERSITIES, {},
            (result) => {

                this.UNIVERSITIES = result
                console.log(result);
                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                //super.loadError(data)
            });
        if (this.editStudent == true) {
            vote += 1;
            get(
                IDENTIFIERS.COURSES.STUDENTS.STUDENT, { studentMID: this.studentMID },
                (result) => {
                    this.studentData = result
                    if (--vote <= 0) {
                        super.load()
                    }
                },
                (data) => {
                    super.loadError(data)
                });
        }
        get(
            IDENTIFIERS.COURSES.GROUPS.GROUPS, {},
            (result) => {
                console.log(result);
                this.groupsArray = result

                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                //super.loadError(data)
            });
        $(this.divID).load(V.STUDENTS.NEW_STUDENT.HTML_URL, () => {
            document.querySelector('body').classList.add('overflow-hidden');
            $('#newStudent_input_university').selectpicker('refresh');
            $('#newStudent_input_faculty').selectpicker('refresh');
            $('#newStudent_input_department').selectpicker('refresh');
            $('#newStudent_input_section').selectpicker('refresh');
            $('#newStudent_input_year').selectpicker('refresh');
            $('#newStudent_input_term').selectpicker('refresh');
            $('#newStudent_select_group').selectpicker('refresh');
            document.querySelectorAll(`${this.divID} input`).forEach(input => {
                input.setAttribute('autocomplete', 'new-password')
            })
            if (--vote <= 0) {
                super.load()
            }
        });
    }
    render() {
        let elm = '<option disabled></option>'
        for (let element of this.UNIVERSITIES) {
            elm += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newStudent_input_university').innerHTML = elm;
        $("#newStudent_input_university").selectpicker('refresh');

        let elmgroup = '<option disabled></option>'
        for (let element of this.groupsArray) {
            elmgroup += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newStudent_select_group').innerHTML = elmgroup;
        $("#newStudent_select_group").selectpicker('refresh');

        $('#newStudent_input_university').change(e => {
            $("#newStudent_input_faculty").val('');
            $("#newStudent_input_department").val('');
            $("#newStudent_input_section").val('');
            $("#newStudent_input_year").val('');
            $("#newStudent_input_term").val('');
            $("#newStudent_input_faculty").selectpicker('refresh');
            $("#newStudent_input_department").selectpicker('refresh');
            $("#newStudent_input_section").selectpicker('refresh');
            $("#newStudent_input_year").selectpicker('refresh');
            $("#newStudent_input_term").selectpicker('refresh');
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
        document.querySelector('#newStudent_close').onclick = () => {
            this.close()
            this.pokeView({ viewID: V.STUDENTS.MAIN.VIEW_ID })
        };

        $('#newStudent_input_primaryMobile').on('keyup', (e) => {
            this.mobileNumber(e)
        });
        $('#newStudent_input_secondaryMobile').on('keyup', (e) => {
            this.mobileNumber(e)
        });

        /*   $('#newStudent_input_password').on('keyup', (e) => {
            this.password(e)
        })
        */
        $('#newStudent_buttonSubmit').click(e => {
            if (document.querySelector(`${this.divID} [name="mID"]`).value == '') {
                notifyResult(false, 'Please Fill ID');
                return;
            };
            if (document.querySelector(`${this.divID} [name="name"]`).value == '') {
                notifyResult(false, 'Please Fill Student Name');
                return;
            };
            if (document.querySelector(`${this.divID} [name="primaryMobile"]`).value == '') {
                notifyResult(false, 'Please Fill Primary Primary Number');
                return;
            };
            if (document.querySelector(`${this.divID} [name="password"]`).value == '') {
                notifyResult(false, 'Please Fill Password');
                return;
            };
            document.querySelector('#newStudent_buttonSubmit').innerHTML = ''
            document.querySelector('#newStudent_buttonSubmit').classList.add('button_Loading_submit')
            document.querySelector('#newStudent_buttonSubmit').setAttribute('disabled', 'disabled')
            let FORM = document.querySelector(this.divID);
            let formElements = FORM.querySelectorAll('input , textarea , select');
            let dataObj = {};
            formElements.forEach(each => {
                dataObj[each.id] = each.value.trim();
            });

            let obj = {
                mID: dataObj.newStudent_input_ID,
                name: dataObj.newStudent_input_name,
                email: dataObj.newStudent_input_email,
                primaryMobile: dataObj.newStudent_input_primaryMobile,
                primaryWhatsapp: $('#newStudent_checkBox_primaryMobile').is(':checked'),
                secondaryMobile: dataObj.newStudent_input_secondaryMobile,
                secondaryWhatsapp: $('#newStudent_checkBox_secondaryMobile').is(':checked'),
                password: dataObj.newStudent_input_password,
                university: dataObj.newStudent_input_university,
                faculty: dataObj.newStudent_input_faculty,
                department: dataObj.newStudent_input_department,
                section: dataObj.newStudent_input_section,
                year: dataObj.newStudent_input_year,
                term: dataObj.newStudent_input_term,
                group: $('#newStudent_select_group').val(),
            }

            post(
                IDENTIFIERS.COURSES.STUDENTS.NEW,
                obj,
                (d) => {
                    document.querySelector(this.divID).querySelectorAll('input, select, textarea').forEach(elm => elm.value = '')
                    document.querySelector('#newStudent_buttonSubmit').innerHTML = 'create'
                    document.querySelector('#newStudent_buttonSubmit').classList.remove('button_Loading_submit')
                    document.querySelector('#newStudent_buttonSubmit').removeAttribute('disabled', 'disabled')
                    this.close();
                    this.pokeView({ viewID: V.STUDENTS.MAIN.VIEW_ID })
                },
                function (data) {
                    if (data.err == 'mID exists') {
                        notifyResult(false, data.err.split('m')[1])
                    } else {
                        notifyResult(false, data.userMsg)
                    }
                    console.log(data);
                    document.querySelector('#newStudent_buttonSubmit').innerHTML = 'create'
                    document.querySelector('#newStudent_buttonSubmit').classList.remove('button_Loading_submit')
                    document.querySelector('#newStudent_buttonSubmit').removeAttribute('disabled', 'disabled')
                }
            );
        });

        if (this.editStudent == true) {
            document.querySelector(`${this.divID} h3`).innerHTML = '❖ edit student ❖';
            $('#edit_studentID').val(this.studentData._id)
            $('#newStudent_buttonSubmit').addClass('d-none');
            $('#newStudent_input_ID').attr('disabled', 'true');
            $('#newStudent_buttonEdit').removeClass('d-none');
            for (let i in this.studentData) {
                let element = $(this.divID).find(`[name="${i}"]`)[0]
                if (element !== undefined) {
                    if (element.tagName == "SELECT") {

                        if (element.name == 'university') {
                            $("#newStudent_input_university").val(this.studentData['university']);
                            $("#newStudent_input_university").selectpicker('refresh');

                        } else if (element.name == 'faculty') {
                            get(
                                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.FACULTIES, {
                                universityID: this.studentData['university']
                            },
                                (result) => {
                                    let elmnt = '<option disabled></option>'
                                    for (let element of result) {
                                        elmnt += `<option value="${element._id}">${element.name}</option>`
                                    }
                                    document.querySelector('#newStudent_input_faculty').innerHTML = elmnt;
                                    $("#newStudent_input_faculty").selectpicker('refresh');

                                    $("#newStudent_input_faculty").val(this.studentData['faculty'])
                                    $("#newStudent_input_faculty").selectpicker('refresh');
                                },
                                (data) => {
                                    //super.loadError(data)
                                });
                        } else if (element.name == 'department') {
                            get(
                                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.DEPARTMENTS, {
                                facultyID: this.studentData['faculty']
                            },
                                (result) => {
                                    let elmnt = '<option disabled></option>'
                                    for (let element of result) {
                                        elmnt += `<option value="${element._id}">${element.name}</option>`
                                    }
                                    document.querySelector('#newStudent_input_department').innerHTML = elmnt;
                                    $("#newStudent_input_department").selectpicker('refresh');
                                    $("#newStudent_input_department").val(this.studentData['department'])
                                    $("#newStudent_input_department").selectpicker('refresh');
                                },
                                (data) => {
                                    //super.loadError(data)
                                });
                        } else if (element.name == 'section') {
                            get(
                                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.SECTIONS, {
                                departmentID: this.studentData['department']
                            },
                                (result) => {
                                    let elmnt = '<option disabled></option>'
                                    for (let element of result) {
                                        elmnt += `<option value="${element._id}">${element.name}</option>`
                                    }
                                    document.querySelector('#newStudent_input_section').innerHTML = elmnt;
                                    $("#newStudent_input_section").selectpicker('refresh');
                                    $("#newStudent_input_section").val(this.studentData['section'])
                                    $("#newStudent_input_section").selectpicker('refresh');
                                },
                                (data) => {
                                    //super.loadError(data)
                                });
                        } else if (element.name == 'year') {
                            get(
                                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.YEARS, {
                                sectionID: this.studentData['section']
                            },
                                (result) => {
                                    let elmnt = '<option disabled></option>'
                                    for (let element of result) {
                                        elmnt += `<option value="${element._id}">${element.name}</option>`
                                    }
                                    document.querySelector('#newStudent_input_year').innerHTML = elmnt;
                                    $("#newStudent_input_year").selectpicker('refresh');
                                    $("#newStudent_input_year").val(this.studentData['year'])
                                    $("#newStudent_input_year").selectpicker('refresh');
                                },
                                (data) => {
                                    //super.loadError(data)
                                });
                        } else if (element.name == 'term') {
                            get(
                                IDENTIFIERS.COURSES.COURSES.COURSES_TREE.TERMS, {
                                yearID: this.studentData['year']
                            },
                                (result) => {
                                    let elmnt = '<option disabled></option>'
                                    for (let element of result) {
                                        elmnt += `<option value="${element._id}">${element.name}</option>`
                                    }
                                    document.querySelector('#newStudent_input_term').innerHTML = elmnt;
                                    $("#newStudent_input_term").selectpicker('refresh');
                                    $("#newStudent_input_term").val(this.studentData['term'])
                                    $("#newStudent_input_term").selectpicker('refresh');
                                },
                                (data) => {
                                    //super.loadError(data)
                                });
                        } else {
                            $(element).val(this.studentData[i])
                            element.setAttribute('data-oldValue', this.studentData[i])
                            $(element).selectpicker('refresh')
                        }
                    } else if (element.tagName == "INPUT" && element.type == "checkbox") {
                        element.checked = this.studentData[i]
                    } else {
                        $(element).val(this.studentData[i])
                        element.setAttribute('data-oldValue', this.studentData[i])
                    }
                }
            }

            $('#newStudent_buttonEdit').click(e => {
                if (document.querySelector(`${this.divID} [name="mID"]`).value == '') {
                    notifyResult(false, 'Please Fill ID');
                    return;
                };
                if (document.querySelector(`${this.divID} [name="name"]`).value == '') {
                    notifyResult(false, 'Please Fill Student Name');
                    return;
                };
                if (document.querySelector(`${this.divID} [name="primaryMobile"]`).value == '') {
                    notifyResult(false, 'Please Fill Primary Primary Number');
                    return;
                };
                if (document.querySelector(`${this.divID} [name="password"]`).value == '') {
                    notifyResult(false, 'Please Fill Password');
                    return;
                };
                document.querySelector('#newStudent_buttonEdit').innerHTML = ''
                document.querySelector('#newStudent_buttonEdit').classList.add('button_Loading_submit')
                document.querySelector('#newStudent_buttonEdit').setAttribute('disabled', 'disabled')
                let FORM = document.querySelector(this.divID);
                let formElements = FORM.querySelectorAll('input , textarea , select');
                let dataObj = {};
                formElements.forEach(each => {
                    dataObj[each.id] = each.value.trim();
                });
                console.log($('#newStudent_input_year').val());
                let obj = {
                    name: ($('#newStudent_input_name').attr('data-oldValue') == dataObj.newStudent_input_name) ? '' : dataObj.newStudent_input_name,
                    email: ($('#newStudent_input_email').attr('data-oldValue') == dataObj.newStudent_input_email) ? '' : dataObj.newStudent_input_email,
                    primaryMobile: ($('#newStudent_input_primaryMobile').attr('data-oldValue') == dataObj.newStudent_input_primaryMobile) ? '' : dataObj.newStudent_input_primaryMobile,

                    primaryWhatsapp: ($('#newStudent_checkBox_primaryMobile').attr('data-oldValue') == String($('#newStudent_checkBox_primaryMobile').is(':checked'))) ? '' : $('#newStudent_checkBox_primaryMobile').is(':checked'),

                    secondaryMobile: ($('#newStudent_input_secondaryMobile').attr('data-oldValue') == dataObj.newStudent_input_secondaryMobile) ? '' : dataObj.newStudent_input_secondaryMobile,

                    secondaryWhatsapp: ($('#newStudent_checkBox_secondaryMobile').attr('data-oldValue') == String($('#newStudent_checkBox_secondaryMobile').is(':checked'))) ? '' : $('#newStudent_checkBox_secondaryMobile').is(':checked'),

                    password: ($('#newStudent_input_password').attr('data-oldValue') == dataObj.newStudent_input_password) ? '' : dataObj.newStudent_input_password,
                    university: $('#newStudent_input_university').val(),

                }

                obj = this.removeEmpty(obj)
                obj.faculty = $('#newStudent_input_faculty').val(),
                    obj.department = $('#newStudent_input_department').val(),
                    obj.section = $('#newStudent_input_section').val(),
                    obj.year = $('#newStudent_input_year').val(),
                    obj.term = $('#newStudent_input_term').val(),
                    obj.group = $('#newStudent_select_group').val();

                    
                if (Object.keys(obj).length !== 0) {
                    post(
                        IDENTIFIERS.COURSES.STUDENTS.EDIT_STUDENT, {
                        studentID: $('#edit_studentID').val(),
                        editData: obj
                    },
                        (d) => {
                            document.querySelector(this.divID).querySelectorAll('input, select, textarea').forEach(elm => elm.value = '')
                            document.querySelector('#newStudent_buttonEdit').innerHTML = 'create'
                            document.querySelector('#newStudent_buttonEdit').classList.remove('button_Loading_submit')
                            document.querySelector('#newStudent_buttonEdit').removeAttribute('disabled', 'disabled')
                            this.close();
                            this.pokeView({ viewID: V.STUDENTS.MAIN.VIEW_ID })
                        },
                        (data) => {
                            if (data.err == 'mID exists') {
                                notifyResult(false, data.err.split('m')[1])
                            } else {
                                notifyResult(false, data.userMsg)
                            }
                            console.log(data);
                            document.querySelector('#newStudent_buttonEdit').innerHTML = 'create'
                            document.querySelector('#newStudent_buttonEdit').classList.remove('button_Loading_submit')
                            document.querySelector('#newStudent_buttonEdit').removeAttribute('disabled', 'disabled')
                        }
                    );
                } else {
                    this.close();
                    this.pokeView({ viewID: V.STUDENTS.MAIN.VIEW_ID })
                }
            });
        };

        super.render();
    };
    mobileNumber(e) {
        var Number = e.target.value;
        var IndNum = /^\d+$/;
        if (IndNum.test(Number)) {
            return;
        } else {
            notifyResult(false, 'please enter valid mobile number', () => {
                e.target.value = ''
                e.target.focus();
            });

        }
    };
    removeEmpty(obj) {
        for (let i in obj) {
            if (obj[i] == '') {
                delete obj[i]
            }
        }

        return obj;
    };
    password(e) {
        var input = e.target.value;
        var regex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
        if (regex.test(input)) {
            e.target.parentElement.querySelector('div.alert').innerHTML = ''
            e.target.parentElement.querySelector('div.alert').classList.add('d-none')
            return;
        } else {
            /*  notifyResult(false, 'please enter valid password', () => {
                 e.target.value = ''
                 e.target.focus();
             }); */
            e.target.parentElement.querySelector('div.alert').innerHTML = 'please enter valid password'
            e.target.parentElement.querySelector('div.alert').classList.remove('d-none')

        }
    }
    changeFaculties(arr) {
        let elmnt = '<option disabled></option>'
        for (let element of arr) {
            elmnt += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newStudent_input_faculty').innerHTML = elmnt;
        $("#newStudent_input_faculty").selectpicker('refresh');

        $('#newStudent_input_faculty').change(e => {
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
        let elmnt = '<option disabled></option>'
        for (let element of arr) {
            elmnt += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newStudent_input_department').innerHTML = elmnt;
        $("#newStudent_input_department").selectpicker('refresh');

        $('#newStudent_input_department').change(e => {
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
        let elmnt = '<option disabled></option>'
        for (let element of arr) {
            elmnt += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newStudent_input_section').innerHTML = elmnt;
        $("#newStudent_input_section").selectpicker('refresh');

        $('#newStudent_input_section').change(e => {
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
        let elmnt = '<option disabled></option>'
        for (let element of arr) {
            elmnt += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newStudent_input_year').innerHTML = elmnt;
        $("#newStudent_input_year").selectpicker('refresh');

        $('#newStudent_input_year').change(e => {
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
        let elmnt = '<option disabled></option>'
        for (let element of arr) {
            elmnt += `<option value="${element._id}">${element.name}</option>`
        }
        document.querySelector('#newStudent_input_term').innerHTML = elmnt;
        $("#newStudent_input_term").selectpicker('refresh');


    }
    stopLoading() { }
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();
        document.querySelector('body').classList.remove('overflow-hidden');
        $(this.divID).animate({ left: '-100%' }, 650, () => {
            document.querySelector(this.divID).remove()
        })

    }
};