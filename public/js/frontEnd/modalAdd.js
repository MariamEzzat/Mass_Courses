import { IDENTIFIERS } from '../constants.js';
import {get, post } from '../sdk/front.js';
import { Uploader } from '../libraries/uploader.js';
import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';

export class Modal_Add extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
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
        $(this.divID).load(V.MODAL_ADD.HTML_URL, () => {
            if (--vote <= 0) {
                super.load()
            }
        });
    }
    render() {
        $('#modalXX_close').click(e => {
            this.close()
        })
        $('#labelTitle').html(this.labelTitle)
        if (this.image == true) {

            $(`${this.divID} #formData`).append(`
                    <div class="form-group col-md-4">
                        <label class="text-capitalize pl-2">image</label>
                        <input type="file" class="form-control" id="modalXX_logoURL" accept="image/*">
                        <output></output>
                        <div class="progress mt-2 d-none">
                            <div class="progress-bar progress-bar-striped" id="modalXX_logoURLProgress" role="progressbar" style="width: 0%" value="10%" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </div>
            `)

            this.uploader = new Uploader(
                this.userID, // userID that has been logged in
                $('#modalXX_logoURL'),
                "http://localhost:8080/uploads", []
            )

            this.uploader.render($('#modalXX_logoURL'));
            this.uploader.on('filesAdded', (file) => {
                //console.log(file);
                document.querySelector('#modalXX_logoURL').nextElementSibling.innerHTML = file[0].name
            })
            this.uploader.on('success', () => {
                console.log('successfully uploaded ')
            })

        }
        document.querySelector('#modalXX #submit').onclick = e => {
            e.target.innerHTML = ''
            e.target.classList.add('button_Loading_submit')
            e.target.setAttribute('disabled', 'disabled')
            let object = {
                name: $('#name').val(),
            };

            if (this.image == true) {
                object.logoURL = this.uploader.getFilesIDs()[0]
                this.uploader.on('progress', (progress) => {
                    document.querySelector(`${this.divID} #modalXX_logoURLProgress`).parentElement.classList.remove('d-none');
                    document.querySelector(`${this.divID} #modalXX_logoURLProgress`).style.width = `${progress*100}%`;
                    document.querySelector(`${this.divID} #modalXX_logoURLProgress`).innerHTML = `${Math.round(progress*100)} %`;

                    if (progress == 1) {
                        document.querySelector(`${this.divID} #modalXX_logoURLProgress`).parentElement.classList.add('d-none');
                        document.querySelector('#modalXX #submit').innerHTML = 'add'
                        document.querySelector('#modalXX #submit').classList.remove('button_Loading_submit')
                        document.querySelector('#modalXX #submit').removeAttribute('disabled', 'disabled')
                        this.close();
                        this.pokeView(viewToBePoked);
                    }
                });
            };
            if (this.haveParent == true) {
                object[this.parentName] = this.parentID;
            };

            let viewToBePoked = this.viewToBePoked
            let identifier = this.identifier;
            console.log(object);
            post(identifier, object, (result) => {
                document.querySelector(this.divID).querySelectorAll('input, select, textarea').forEach(elm => elm.value = '')

                if (this.image == true) {
                    this.uploader.upload();
                } else {
                    this.close();
                    this.pokeView(viewToBePoked);
                }
            }, (err) => {

                document.querySelector('#modalXX #submit').innerHTML = 'add'
                document.querySelector('#modalXX #submit').classList.remove('button_Loading_submit')
                document.querySelector('#modalXX #submit').removeAttribute('disabled', 'disabled')
                console.log(err);
                super.loadError(err.err)
            })
        }

        if (this.edit !== undefined) {
            $('#modalXX #submit').addClass('d-none')
            $('#modalXX #edit').removeClass('d-none');
            $('#name').val(this.edit.name);
            document.querySelector('#modalXX #edit').onclick = e => {
                e.target.innerHTML = ''
                e.target.classList.add('button_Loading_submit')
                e.target.setAttribute('disabled', 'disabled')
                let object = {
                    name: $('#name').val(),
                };
                object[this.targetName] = this.edit._id
                if (this.image == true) {
                    if (this.uploader.getFilesIDs().length !== 0) {
                        object.logoURL = this.uploader.getFilesIDs()[0]
                        this.uploader.on('progress', (progress) => {
                            document.querySelector(`${this.divID} #modalXX_logoURLProgress`).parentElement.classList.remove('d-none');
                            document.querySelector(`${this.divID} #modalXX_logoURLProgress`).style.width = `${progress*100}%`;
                            document.querySelector(`${this.divID} #modalXX_logoURLProgress`).innerHTML = `${Math.round(progress*100)} %`;

                            if (progress == 1) {
                                document.querySelector(`${this.divID} #modalXX_logoURLProgress`).parentElement.classList.add('d-none');
                                document.querySelector('#modalXX #edit').innerHTML = 'edit'
                                document.querySelector('#modalXX #edit').classList.remove('button_Loading_submit')
                                document.querySelector('#modalXX #edit').removeAttribute('disabled', 'disabled')
                                this.close()
                                this.pokeView(viewToBePoked)
                            }
                        });
                    }

                };
                if (this.haveParent == true) {
                    object[this.parentName] = this.parentID;
                };


                let viewToBePoked = this.viewToBePoked
                let identifier = this.identifier;

                post(identifier, object, (result) => {
                    document.querySelector(this.divID).querySelectorAll('input, select, textarea').forEach(elm => elm.value = '')

                    if (this.image == true && this.uploader.getFilesIDs().length !== 0) {
                        this.uploader.upload();
                    } else {
                        this.close()
                        this.pokeView(viewToBePoked)
                    }
                }, (err) => {
                    document.querySelector('#modalXX #edit').innerHTML = 'edit'
                    document.querySelector('#modalXX #edit').classList.remove('button_Loading_submit')
                    document.querySelector('#modalXX #edit').removeAttribute('disabled', 'disabled')
                    console.log(err);
                    super.loadError(err.err)
                })
            }
        }
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
    }
};