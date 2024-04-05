import { IDENTIFIERS } from '../constants.js';
import {get, post } from '../sdk/front.js';
import { notifyResult } from './navBar.js';
import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';
import { Uploader } from '../libraries/uploader.js';
export class NewInstructor extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {
        let vote = 1;
        if (this.editInstructor == true) {
            vote += 1;
            get(
                IDENTIFIERS.COURSES.INSTRUCTORS.INSTRUCTOR, {
                    instructorMID: this.instructorMID
                },
                (result) => {
                    this.instructorData = result
                    console.log(result);
                    if (--vote <= 0) {
                        super.load()
                    }
                },
                (data) => {
                    super.loadError(data)
                });
        }
        $(this.divID).load(V.INSTRUCTORS.NEW_INSTRUCTOR.HTML_URL, () => {
            document.querySelector('body').classList.add('overflow-hidden');
            $('#newInstructor_input_subject').selectpicker('refresh');
            document.querySelectorAll(`${this.divID} input`).forEach(input => {
                input.setAttribute('autocomplete', 'new-password')
            })
            if (--vote <= 0) {
                super.load()
            }
        });
    }
    render() {
        document.querySelector('#newInstructor_close').onclick = () => {
            this.close();
            this.pokeView({ viewID: V.INSTRUCTORS.MAIN.VIEW_ID })
        };


        $('#newInstructor_input_primaryMobile').on('keyup', (e) => {
            this.mobileNumber(e)
        });
        $('#newInstructor_input_secondaryMobile').on('keyup', (e) => {
            this.mobileNumber(e)
        });

        //TODO: CREATE  UPLOADER 
        let uploader = new Uploader(
            this.userID, // userID that has been logged in
            $('#newInstructor_input_image'),
            "http://localhost:8080/uploads", []
        );
        //console.log(uploader);

        uploader.render($('#newInstructor_input_image'));

        $('#newInstructor_buttonSubmit').click(e => {
            if (document.querySelector(`${this.divID} [name="mID"]`).value == '') {
                notifyResult(false, 'Please Fill ID');
                return;
            };
            if (document.querySelector(`${this.divID} [name="name"]`).value == '') {
                notifyResult(false, 'Please Fill Student Name');
                return;
            };
            if (document.querySelector(`${this.divID} [name="email"]`).value == '') {
                notifyResult(false, 'Please Fill Email');
                return;
            };
            if (document.querySelector(`${this.divID} [name="password"]`).value == '') {
                notifyResult(false, 'Please Fill Password');
                return;
            };
            document.querySelector('#newInstructor_buttonSubmit').innerHTML = ''
            document.querySelector('#newInstructor_buttonSubmit').classList.add('button_Loading_submit')
            document.querySelector('#newInstructor_buttonSubmit').setAttribute('disabled', 'disabled')
            let FORM = document.querySelector(this.divID);
            let formElements = FORM.querySelectorAll('input , textarea , select');
            let dataObj = {};
            formElements.forEach(each => {
                dataObj[each.id] = each.value.trim();
            });
            let obj = {
                mID: dataObj.newInstructor_input_ID,
                name: dataObj.newInstructor_input_name,
                email: dataObj.newInstructor_input_email,
                primaryMobile: dataObj.newInstructor_input_primaryMobile,
                primaryWhatsapp: $('#newInstructor_checkBox_primaryMobile').is(':checked'),
                secondaryMobile: dataObj.newInstructor_input_secondaryMobile,
                secondaryWhatsapp: $('#newInstructor_checkBox_secondaryMobile').is(':checked'),
                password: dataObj.newInstructor_input_password,
                notes: dataObj.newInstructor_input_notes,
                image: uploader.getFilesIDs()[0],
                subjects: $('#newInstructor_input_subject').val()
            }
            uploader.on('success', () => {
                console.log('uploaded successfully');
            })

            uploader.on('progress', (progress) => {
                document.querySelector(`${this.divID} #newInstructorProgressImage`).parentElement.classList.remove('d-none')
                document.querySelector(`${this.divID} #newInstructorProgressImage`).style.width = `${progress*100}%`
                document.querySelector(`${this.divID} #newInstructorProgressImage`).innerHTML = `${Math.round(progress*100)} %`
                    // show user progress percentage
                    // according to progress variable
                console.log(progress * 100);
                if (progress == 1) {
                    document.querySelector(`${this.divID} #newInstructorProgressImage`).parentElement.classList.add('d-none')
                    document.querySelector('#newInstructor_buttonSubmit').innerHTML = 'create'
                    document.querySelector('#newInstructor_buttonSubmit').classList.remove('button_Loading_submit')
                    document.querySelector('#newInstructor_buttonSubmit').removeAttribute('disabled', 'disabled')
                    this.close()
                    this.pokeView({ viewID: V.INSTRUCTORS.MAIN.VIEW_ID })
                }
            });
            post(
                IDENTIFIERS.COURSES.INSTRUCTORS.NEW,
                obj,
                (d) => {

                    document.querySelector(this.divID).querySelectorAll('input, select, textarea').forEach(elm => elm.value = '')
                    if (uploader.getFilesIDs().length == 0) {
                        this.close()
                        this.pokeView({ viewID: V.INSTRUCTORS.MAIN.VIEW_ID })
                    } else {
                        uploader.upload();
                    }

                },
                function(data) {
                    if (data.err == 'mID exists') {
                        notifyResult(false, data.err.split('m')[1])
                    } else {
                        notifyResult(false, data.userMsg)
                    }
                    console.log(data);
                    document.querySelector('#newInstructor_buttonSubmit').innerHTML = 'create'
                    document.querySelector('#newInstructor_buttonSubmit').classList.remove('button_Loading_submit')
                    document.querySelector('#newInstructor_buttonSubmit').removeAttribute('disabled', 'disabled')
                }
            );
        });

        if (this.editInstructor == true) {
            document.querySelector(`${this.divID} h3`).innerHTML = '❖ edit instructor ❖';
            $('#edit_instructorID').val(this.instructorData._id)
            $('#newInstructor_buttonSubmit').addClass('d-none');
            $('#newInstructor_input_ID').attr('disabled', 'true');
            $('#newInstructor_buttonEdit').removeClass('d-none');
            for (let i in this.instructorData) {
                let element = $(this.divID).find(`[name="${i}"]`)[0]
                if (element !== undefined) {
                    if (element.tagName == "SELECT") {
                        $(element).val(this.instructorData[i])
                        element.setAttribute('data-oldValue', this.instructorData[i])
                        $(element).selectpicker('refresh')
                    } else if (element.tagName == "INPUT" && element.type == "checkbox") {
                        element.checked = this.instructorData[i]
                    } else {
                        $(element).val(this.instructorData[i])
                        element.setAttribute('data-oldValue', this.instructorData[i])
                    }
                }
            }

            $('#newInstructor_buttonEdit').click(e => {
                document.querySelector('#newInstructor_buttonEdit').innerHTML = ''
                document.querySelector('#newInstructor_buttonEdit').classList.add('button_Loading_submit')
                document.querySelector('#newInstructor_buttonEdit').setAttribute('disabled', 'disabled')
                let FORM = document.querySelector(this.divID);
                let formElements = FORM.querySelectorAll('input , textarea , select');
                let dataObj = {};
                formElements.forEach(each => {
                    dataObj[each.id] = each.value.trim();
                });
                console.log($('#newInstructor_input_subject').val());
                let obj = {
                    name: ($('#newInstructor_input_name').attr('data-oldValue') == dataObj.newInstructor_input_name) ? '' : dataObj.newInstructor_input_name,
                    email: ($('#newInstructor_input_email').attr('data-oldValue') == dataObj.newInstructor_input_email) ? '' : dataObj.newInstructor_input_email,
                    primaryMobile: ($('#newInstructor_input_primaryMobile').attr('data-oldValue') == dataObj.newInstructor_input_primaryMobile) ? '' : dataObj.newInstructor_input_primaryMobile,

                    primaryWhatsapp: ($('#newInstructor_checkBox_primaryMobile').attr('data-oldValue') == String($('#newInstructor_checkBox_primaryMobile').is(':checked'))) ? '' : $('#newInstructor_checkBox_primaryMobile').is(':checked'),

                    secondaryMobile: ($('#newInstructor_input_secondaryMobile').attr('data-oldValue') == dataObj.newInstructor_input_secondaryMobile) ? '' : dataObj.newInstructor_input_secondaryMobile,

                    secondaryWhatsapp: ($('#newInstructor_checkBox_secondaryMobile').attr('data-oldValue') == String($('#newInstructor_checkBox_secondaryMobile').is(':checked'))) ? '' : $('#newInstructor_checkBox_secondaryMobile').is(':checked'),

                    password: ($('#newInstructor_input_password').attr('data-oldValue') == dataObj.newInstructor_input_password) ? '' : dataObj.newInstructor_input_password,
                    university: ($('#newInstructor_input_university').attr('data-oldValue') == dataObj.newInstructor_input_university) ? '' : dataObj.newInstructor_input_university,
                    faculty: ($('#newInstructor_input_faculty').attr('data-oldValue') == dataObj.newInstructor_input_faculty) ? '' : dataObj.newInstructor_input_faculty,
                    department: ($('#newInstructor_input_department').attr('data-oldValue') == dataObj.newInstructor_input_department) ? '' : dataObj.newInstructor_input_department,
                    section: ($('#newInstructor_input_section').attr('data-oldValue') == dataObj.newInstructor_input_section) ? '' : dataObj.newInstructor_input_section,
                    acadimicYear: ($('#newInstructor_input_acadimicYear').attr('data-oldValue') == dataObj.newInstructor_input_acadimicYear) ? '' : dataObj.newInstructor_input_acadimicYear,
                    term: ($('#newInstructor_input_term').attr('data-oldValue') == dataObj.newInstructor_input_term) ? '' : dataObj.newInstructor_input_term,
                    group: $('#newInstructor_input_subject').val(),
                }

                obj = this.removeEmpty(obj)
                if (Object.keys(obj).length !== 0) {
                    post(
                        IDENTIFIERS.COURSES.INSTRUCTORS.EDIT_INSTRUCTOR, {
                            instructorID: $('#edit_instructorID').val(),
                            editData: obj
                        },
                        (d) => {
                            document.querySelector(this.divID).querySelectorAll('input, select, textarea').forEach(elm => elm.value = '')
                            document.querySelector('#newInstructor_buttonEdit').innerHTML = 'create'
                            document.querySelector('#newInstructor_buttonEdit').classList.remove('button_Loading_submit')
                            document.querySelector('#newInstructor_buttonEdit').removeAttribute('disabled', 'disabled')
                            this.close();
                            this.pokeView({ viewID: V.INSTRUCTORS.MAIN.VIEW_ID })
                        },
                        function(data) {
                            if (data.err == 'mID exists') {
                                notifyResult(false, data.err.split('m')[1])
                            } else {
                                notifyResult(false, data.userMsg)
                            }
                            console.log(data);
                            document.querySelector('#newInstructor_buttonEdit').innerHTML = 'create'
                            document.querySelector('#newInstructor_buttonEdit').classList.remove('button_Loading_submit')
                            document.querySelector('#newInstructor_buttonEdit').removeAttribute('disabled', 'disabled')
                        }
                    );
                } else {
                    this.close();
                    this.pokeView({ viewID: V.INSTRUCTORS.MAIN.VIEW_ID })
                }
            });
        };



        super.render();
    };
    removeEmpty(obj) {
        for (let i in obj) {
            if (obj[i] == '') {
                delete obj[i]
            }
        }

        return obj;
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