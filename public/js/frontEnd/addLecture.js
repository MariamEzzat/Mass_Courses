import { IDENTIFIERS } from '../constants.js';
import { get, post } from '../sdk/front.js';
import { notifyResult } from './navBar.js';
import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';
import { MODAL } from './courses.js';
import { InfoIconModal } from './navBar.js';
import { Uploader } from '../libraries/uploader.js';

export class AddLecturesForCourse extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        let vote = 2;
        get(
            IDENTIFIERS.COURSES.INSTRUCTORS.FILTER, {},
            (result) => {
                this.userID = result.userID
                if (--vote <= 0) {
                    super.load()
                }
            },
            (data) => {
                //super.loadError(data)
            });
        $(this.divID).load(V.COURSES.ADD_LECTURES.HTML_URL, () => {
            $('#addLectureForCourse_courseID').val(this.courseID)
            $(`${this.divID} h3 span`).html(this.courseName)
            if (--vote <= 0) {
                super.load()
            }
        });
 
    }
    render() {
        this.uploader = [];
        $('#addLectureForCourse_close').click(() => {
            this.close()
        });
        $('#addLectureForCourse_buttonClose').click(() => {
            this.close()
        });

        let videoUploader = new Uploader(
            this.userID, // userID that has been logged in
            $('#newLectureVideos'),
           // "https://p56dki765gz8k.com/uploads", []
           "http://localhost:8080/uploads", []
        )

        videoUploader.render($('#newLectureVideos'));
        videoUploader.on('filesAdded', (file) => {
            //console.log(file);
            document.querySelector('#newLectureVideos').nextElementSibling.innerHTML = file[0].name
        })
        if (this.filter == undefined) {
            this.lastInputFile = document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`)[document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`).length - 1].querySelector('input[type="file"]')
            this.createVariables(this.lastInputFile)

            this.addRowElement();
        }

        $('#addLectureForCourse_buttonSubmit').click(e => {
            if (document.querySelector(`${this.divID} [name="title"]`).value == '') {
                notifyResult(false, 'Please Fill Lecture Title');
                return;
            };
            if (document.querySelector(`${this.divID} [name="videoName"]`).value == '') {
                notifyResult(false, 'Please Fill Video Name');
                return;
            };
            if (document.querySelector(`${this.divID} [name="number"]`).value == '') {
                notifyResult(false, 'Please Fill Lecture Number');
                return;
            };
            if (videoUploader.getFilesIDs().length == 0) {
                notifyResult(false, 'Please Choose Video');
                return;
            };
            document.querySelector('#addLectureForCourse_buttonSubmit').innerHTML = ''
            document.querySelector('#addLectureForCourse_buttonSubmit').classList.add('button_Loading_submit')
            document.querySelector('#addLectureForCourse_buttonSubmit').setAttribute('disabled', 'disabled')
            let materialsarray = [];
            document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`).forEach((row, i) => {
                let object = {}
                if (row.querySelector('input').value !== '') {
                    object[row.querySelector('input').name] = row.querySelector('input').value;
                }

                if (this.uploader[i].upload.getFilesIDs().length !== 0) {
                    object['file'] = this.uploader[i].upload.getFilesIDs()[0]
                }
                if (Object.keys(object).length !== 0) {
                    materialsarray.push(object)
                }
            });
            //console.log(materialsarray);
            let FORM = document.querySelector(this.divID);
            let formElements = FORM.querySelectorAll('input , textarea , select');
            let dataObj = {};
            formElements.forEach(each => {
                dataObj[each.id] = each.value.trim();
            });

            let obj = {
                courseID: $('#addLectureForCourse_courseID').val(),
                courseName:this.courseName,
                title: dataObj.newLecture_input_title,
                number: dataObj.newLecture_input_lectureNumber,
                video:videoUploader.getFilesIDs()[0],
                videoName: dataObj.newLecture_input_videoName,
                materials: materialsarray,
                description: dataObj.newLecture_input_description,
                demo: $('#newLecture_input_MarkDemo').is(':checked')
            };
           /*  let vote = 1
            vote += this.uploader.length

            for (let i = 0; i < this.uploader.length; i++) {
                this.uploader[i].upload.on('progress', (progress) => {
                    document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`)[i].querySelector('#newlectureProgressMaterial').parentElement.classList.remove('d-none')
                    document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`)[i].querySelector('#newlectureProgressMaterial').style.width = `${progress * 100}%`
                    document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`)[i].querySelector('#newlectureProgressMaterial').innerHTML = `${Math.round(progress * 100)} %`

                    if (--vote <= 0) {
                        if (progress == 1) {
                            document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`)[i].querySelector('#newlectureProgressMaterial').parentElement.classList.add('d-none');
                            this.close()
                            super.pokeView({ viewID: V.COURSES.VIEW_COURSE.VIEW_ID });
                        }
                    }
                });
            }; */

            videoUploader.on('success', () => {
                console.log('success');
            });
            videoUploader.on('progress', (progress) => {
                document.querySelector(`${this.divID} #newlectureProgressVideos`).parentElement.classList.remove('d-none');
                document.querySelector(`${this.divID} #newlectureProgressVideos`).style.width = `${progress * 100}%`;
                document.querySelector(`${this.divID} #newlectureProgressVideos`).innerHTML = `${Math.round(progress * 100)} %`;
                /* if (--vote <= 0) { */
                    if (progress == 1) {
                        document.querySelector(`${this.divID} #newlectureProgressVideos`).parentElement.classList.add('d-none')
                        document.querySelector('#addLectureForCourse_buttonSubmit').innerHTML = 'create'
                        document.querySelector('#addLectureForCourse_buttonSubmit').classList.remove('button_Loading_submit')
                        document.querySelector('#addLectureForCourse_buttonSubmit').removeAttribute('disabled', 'disabled')
                        this.close()
                        super.pokeView({ viewID: V.COURSES.ADMIN_VIEW_COURSE.VIEW_ID });
                    }
                /* } */
            });
            
            post(
                IDENTIFIERS.COURSES.COURSES.ADD_LECTURE,
                obj,
                (d) => {
                    console.log(d);
                    document.querySelector(this.divID).querySelectorAll('input, select, textarea').forEach(elm => elm.value = '')

                    let arr = []
                    videoUploader.upload();
                    for (let i = 0; i < this.uploader.length; i++) {

                        this.uploader[i].upload.upload()
                        if (this.uploader[i].upload.upload()) arr.push(true)
                    }
                },
                (data) => {
                    console.log(data);
                    document.querySelector('#addLectureForCourse_buttonSubmit').innerHTML = 'create'
                    document.querySelector('#addLectureForCourse_buttonSubmit').classList.remove('button_Loading_submit')
                    document.querySelector('#addLectureForCourse_buttonSubmit').removeAttribute('disabled', 'disabled')
                }
            );

        })
        if (this.filter !== undefined) {
            $(`${this.divID} h3`).html(`❖ edit lecture '${this.filter.title}' for '<span>${this.courseName} course</span>' ❖`);
            $('#addLectureForCourse_buttonSubmit').addClass('d-none')
            $('#addLectureForCourse_buttonEdit').removeClass('d-none')
            for (let i in this.filter) {
                let element = $(this.divID).find(`[name="${i}"]`)[0]
                if (element !== undefined) {
                    if (element.tagName == "SELECT") {
                        $(element).val(this.filter[i])
                        element.setAttribute('data-oldValue', this.filter[i])
                        $(element).selectpicker('refresh')
                    } else if (element.tagName == "INPUT" && element.type == "checkbox") {
                        element.checked = this.filter[i]
                    } else if (element.tagName == "INPUT" && element.type !== "file" || element.tagName == 'TEXTAREA') {
                        $(element).val(this.filter[i])
                        element.setAttribute('data-oldValue', this.filter[i])
                    }
                }
            };

            this.fillMaterials(this.filter.materials);
            $('#addLectureForCourse_buttonEdit').click(e => {
                if (document.querySelector(`${this.divID} [name="title"]`).value == '') {
                    notifyResult(false, 'Please Fill Lecture Title');
                    return;
                };
                if (document.querySelector(`${this.divID} [name="videoName"]`).value == '') {
                    notifyResult(false, 'Please Fill Video Name');
                    return;
                };
                if (document.querySelector(`${this.divID} [name="number"]`).value == '') {
                    notifyResult(false, 'Please Fill Lecture Number');
                    return;
                };

                let materialsarray = [];
                document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`).forEach((row, i) => {
                    console.log(typeof row.querySelector('input').getAttribute('data-oldValue') !== 'undefined' && row.querySelector('input').getAttribute('data-oldValue') !== false);
                    let object = {}
                    if (row.querySelector('input').getAttribute('data-oldValue') !== row.querySelector('input').value) {
                        object[row.querySelector('input').name] = row.querySelector('input').value;
                    }else if(row.querySelector('input').getAttribute('data-oldValue') == null && row.querySelector('input').getAttribute('data-oldValue') == false){
                        object[row.querySelector('input').name] = row.querySelector('input').value;
                    }

                    if (this.uploader[i].upload.getFilesIDs().length !== 0) {
                        object['file'] = this.uploader[i].upload.getFilesIDs()[0]
                    }
                    if (Object.keys(object).length !== 0 && row.getAttribute('data-ID')!=null) {
                        object['_id'] = row.getAttribute('data-ID')
                        materialsarray.push(object)
                    }


                });
                //console.log(materialsarray);
                let FORM = document.querySelector(this.divID);
                let formElements = FORM.querySelectorAll('input , textarea , select');
                let dataObj = {};
                formElements.forEach(each => {
                    dataObj[each.id] = each.value.trim();
                });

                let obj = {
                    courseID: $('#addLectureForCourse_courseID').val(),
                    lectureID: this.filter._id,
                    title: ($('#newLecture_input_title').attr('data-oldValue') == dataObj.newLecture_input_title) ? "" : dataObj.newLecture_input_title,
                    number: ($('#newLecture_input_lectureNumber').attr('data-oldValue') == dataObj.newLecture_input_lectureNumber) ? "" : dataObj.newLecture_input_lectureNumber,
                    videoName: ($('#newLecture_input_videoName').attr('data-oldValue') == dataObj.newLecture_input_videoName) ? "" : dataObj.newLecture_input_videoName,
                    materials: materialsarray,
                    description: ($('#newLecture_input_description').attr('data-oldValue') == dataObj.newLecture_input_description) ? "" : dataObj.newLecture_input_description,
                    demo: ($('#newLecture_input_MarkDemo').attr('data-oldValue') == String($('#newLecture_input_MarkDemo').is(':checked'))) ? "" : $('#newLecture_input_MarkDemo').is(':checked')
                };
                if (videoUploader.getFilesIDs().length !== 0) {
                    obj.video = videoUploader.getFilesIDs()[0]
                    videoUploader.on('success', () => {
                        console.log('success');
                    });
                    videoUploader.on('progress', (progress) => {
                        document.querySelector(`${this.divID} #newlectureProgressVideos`).parentElement.classList.remove('d-none');
                        document.querySelector(`${this.divID} #newlectureProgressVideos`).style.width = `${progress * 100}%`;
                        document.querySelector(`${this.divID} #newlectureProgressVideos`).innerHTML = `${Math.round(progress * 100)} %`;

                        if (progress == 1) {
                            document.querySelector(`${this.divID} #newlectureProgressVideos`).parentElement.classList.add('d-none')
                        }
                    });
                };
                obj = this.removeEmpty(obj)
                console.log(obj);
                // post(
                //     IDENTIFIERS.COURSES.COURSES.EDIT_LECTURE,
                //     obj,
                //     (d) => {
                //         let arr = []
                //         videoUploader.upload();
                //         for (let i = 0; i < this.uploader.length; i++) {

                //             this.uploader[i].upload.upload()
                //             if (this.uploader[i].upload.upload()) arr.push(true)
                //         }
                //         if (videoUploader.upload() && this.uploader.length == arr.length) {
                //             super.pokeView({ viewID: V.COURSES.VIEW_COURSE.VIEW_ID });
                //             //this.close()
                //         }
                //     },
                //     function(data) {
                //         console.log(data);
                //     }
                // );

            })

        }
        super.render();
    };

    fillMaterials(arr) {
        if (arr.length == 0) {
            document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`).forEach((row, i) => {
                let fileInput = row.querySelector('input[type="file"]')
                this.createVariables(fileInput)
            });
            this.addRowElement();
            return
        }
        let row = ``;
        for (let f = 0; f < arr.length; f++) {
            row += `
            <div class="p-1 row parentChild_Lecture" data-ID="${arr[f]._id}">
                <div class="form-group col-md-2">
                    <label class="text-capitalize pl-2" id="newLecture_label_title">name</label>
                    <input type="text" class="form-control rounded-pill" id="newLecture_input_materialTitle" data-oldValue="${arr[f].name}" name="name" value="${arr[f].name}">
                </div>
                <div class="form-group col-md-2">
                    <label class="text-capitalize pl-2" id="newLecture_label_subject">materials</label>
                    <input type="file" id="newLectureMaterials" class="form-control rounded-pill" name="materials">
                    <div class="progress mt-2 d-none">
                        <div class="progress-bar progress-bar-striped" id="newlectureProgressMaterial" role="progressbar" style="width: 0%" value="0%" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
                <div class="form-group col-md-2 py-0 my-auto d-flex justify-content-end">
                    <i class="addRow_Lecture fas fa-plus text-warning border rounded p-2 d-none"></i>
                    <i class="fas fa-times border border-danger rounded text-danger p-2 removeRow_Lecture "></i>
                </div>
            </div>
            `
        }

        document.querySelector(`${this.divID} .parent`).innerHTML = row;
        let ModalTransporRows = document.querySelectorAll(`${this.divID} .parentChild_Lecture`)
        ModalTransporRows[ModalTransporRows.length - 1].querySelector('.addRow_Lecture').classList.remove('d-none')
        ModalTransporRows[ModalTransporRows.length - 1].querySelector('.removeRow_Lecture').classList.add('d-none')
        document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`).forEach((row, i) => {
            let fileInput = row.querySelector('input[type="file"]')
            this.createVariables(fileInput)
        });
        this.addRowElement();
        this.removeRowElement()
    }

    addRowElement() {
        document.querySelectorAll('.addRow_Lecture').forEach(btn => {
            btn.onclick = (e) => {
                let elementCopyToAdd = e.target.parentElement.parentElement
                $(`${this.divID} .parent`).append(this.nodeToString(elementCopyToAdd))
                e.target.classList.add('d-none')
                e.target.nextElementSibling.classList.remove('d-none')
                this.addRowElement();
                document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`)[document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`).length - 1].querySelector('output').innerHTML = ''
                this.lastInputFile = document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`)[document.querySelectorAll(`${this.divID} .parent .parentChild_Lecture`).length - 1].querySelector('input[type="file"]')

                this.createVariables(this.lastInputFile)
                this.removeRowElement()

            }
        })
    };
    removeRowElement() {
        document.querySelectorAll(`${this.divID} .removeRow_Lecture`).forEach(row => {
            row.onclick = (e) => {
                e.target.offsetParent.parentElement.remove();
                let ModalTransporRows = document.querySelectorAll(`${this.divID} .parentChild_Lecture`)
                ModalTransporRows[ModalTransporRows.length - 1].querySelector('.addRow_Lecture').classList.remove('d-none')
            }
        });

    };
    nodeToString(node) {
        var tmpNode = document.createElement("div");
        tmpNode.appendChild(node.cloneNode(true));
        var str = tmpNode.innerHTML;
        tmpNode = node = null; // prevent memory leaks in IE
        return str;
    };
    removeEmpty(obj) {
        for (let i in obj) {
            if (obj[i] == '') {
                delete obj[i]
            }
        }

        return obj;
    };
    createVariables(lastInputFile, ind) {
        let data = {
            upload: new Uploader(
                this.userID, // userID that has been logged in
                $(lastInputFile),
               // "https://p56dki765gz8k.com/uploads", []
               "http://localhost:8080/uploads", []
            )
        }
        console.log(data.upload);
        data.upload.render($(lastInputFile))

        data.upload.on('filesAdded', (file) => {
            //console.log(file);
            lastInputFile.nextElementSibling.innerHTML = file[0].name
        })
        this.uploader.push(data);
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