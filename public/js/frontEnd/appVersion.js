import { IDENTIFIERS } from '../constants.js';
import { get, post } from '../sdk/front.js';
import { notifyResult, warningAlert } from './navBar.js';
import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';

export class AppVersions extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        let vote = 1;
        $(this.divID).load(V.APP_VERSIONS.MAIN.HTML_URL, () => {
            $('#appVersions_os').selectpicker('refresh');
            if (--vote <= 0) {
                super.load()
            }
        });

    }
    render() {

        this.getVersions()
        this.getLastValidVersions()
        document.querySelector('#appVersions_close').onclick = () => {
            this.close();
            this.pokeView({ viewID: V.BASE.NAV_BAR.VIEW_ID }, { clickedAppVersion: -1 })
        };

        document.querySelector('#appVersions_versionSubmit').onclick = e => {
            e.target.innerHTML = ''
            e.target.classList.add('button_Loading_submit')
            e.target.setAttribute('disabled', 'disabled')

            let obj = {};
            if ($('#appVersions_os').val().length > 1) {
                obj.android = $('#appVersions_version').val();
                obj.ios = $('#appVersions_version').val();
            } else if ($('#appVersions_os').val().length == 1) {
                obj[$('#appVersions_os').val()[0]] = $('#appVersions_version').val();
            } else {
                return
            }
            console.log(obj);
            post(
                IDENTIFIERS.COURSES.COURSES.MOBILE.NEW_APP_VERSION,
                obj,
                (d) => {
                    document.querySelector('#appVersions_addVersion').querySelectorAll('input, select, textarea').forEach(elm => elm.value = '')
                    $('#appVersions_os').val('')
                    $('#appVersions_os').selectpicker('refresh')
                    e.target.innerHTML = 'add'
                    e.target.classList.remove('button_Loading_submit')
                    e.target.removeAttribute('disabled', 'disabled')
                    this.getVersions()
                    this.getLastValidVersions()
                }, (data) => {
                    console.log(data);
                    e.target.innerHTML = 'add'
                    e.target.classList.remove('button_Loading_submit')
                    e.target.removeAttribute('disabled', 'disabled')
                }
            );
        }

        document.querySelector('#appVersions_validVersionSubmit').onclick = e => {
            e.target.innerHTML = ''
            e.target.classList.add('button_Loading_submit')
            e.target.setAttribute('disabled', 'disabled')

            let obj = {
                android: $('#appVersions_validAndroid').val(),
                ios: $('#appVersions_validIOS').val()
            };
            console.log(obj);
            post(
                IDENTIFIERS.COURSES.COURSES.MOBILE.ADD_VALID_VERSIONS,
                obj,
                (d) => {
                    $('#appVersions_validAndroid').val('')
                    $('#appVersions_validAndroid').selectpicker('refresh')
                    $('#appVersions_validIOS').val('')
                    $('#appVersions_validIOS').selectpicker('refresh')
                    e.target.innerHTML = 'add'
                    e.target.classList.remove('button_Loading_submit')
                    e.target.removeAttribute('disabled', 'disabled')
                    this.getLastValidVersions()
                    console.log('d');
                }, (data) => {
                    console.log(data);
                    e.target.innerHTML = 'add'
                    e.target.classList.remove('button_Loading_submit')
                    e.target.removeAttribute('disabled', 'disabled')
                }
            );
        }

        //super.newView(V.APP_VERSIONS.LAST_VALID_VERSIONS.VIEW_ID,'#appVersions_viewLastValidVersions')
        //super.newView(V.APP_VERSIONS.VERSIONS.VIEW_ID,'#appVersions_viewVersions')
        super.render();
    };

    getVersions() {
        get(
            IDENTIFIERS.COURSES.COURSES.MOBILE.APP_VERSIONS, {},
            (result) => {
                console.log(result);
                this.appVersions = result
                //this.appVersions = {android:['1','2','3.0.0'],ios:['1','2','3.0.0']}
                this.fillSelectVersions(this.appVersions)
                this.fillTableVersions(this.appVersions)
            },
            (data) => {
                super.loadError(data)
            });
    }
    getLastValidVersions() {
        get(
            IDENTIFIERS.COURSES.COURSES.MOBILE.LAST_VALID_VERSIONS, {},
            (result) => {
                //console.log(result);
                this.appValidVersions = result
                this.fillTableValidVersions(this.appValidVersions)
            },
            (data) => {
                super.loadError(data)
            });
    }
    fillSelectVersions(arr) {
        let elm2 = '<option disabled></option>'
        for (let element of arr.android) {
            elm2 += `<option value="${element}">${element}</option>`
        }
        document.querySelector('#appVersions_validAndroid').innerHTML = elm2;
        $("#appVersions_validAndroid").selectpicker('refresh');

        let elm3 = '<option disabled></option>'
        for (let element of arr.ios) {
            elm3 += `<option value="${element}">${element}</option>`
        }
        document.querySelector('#appVersions_validIOS').innerHTML = elm3;
        $("#appVersions_validIOS").selectpicker('refresh');
    }
    fillTableVersions(arr) {
        let counter = 0
        let row = ``;
        for (let i of arr.android) {
            counter++
            row += `
            <tr class="text-secondary">
                <td>${counter}</td>
                <td>android</td>
                <td>${i}</td>
                <td>
                    <a href="#" data-type="android" data-value="${i}" class="fas fa-trash text-danger removeItemFromVersions w-100 text-decoration-none"> </a>
                </td>
            </tr>
            `
        }
        for (let i of arr.ios) {
            counter++
            row += `
            <tr class="text-primary">
                <td>${counter}</td>
                <td>IOS</td>
                <td>${i}</td>
                <td>
                    <a href="#" data-type="ios" data-value="${i}" class="fas fa-trash text-danger removeItemFromVersions w-100 text-decoration-none"> </a>
                </td>
            </tr>
            `
        }
        document.querySelector(`${this.divID} #appVersions_Versionstable tbody`).innerHTML = row;
        this.removeItemFromVersions();
    }
    fillTableValidVersions(arr) {
        let counter = 0
        let row = ``;
        for (let i of arr.android) {
            counter++
            row += `
            <tr class="text-secondary">
                <td>${counter}</td>
                <td>android</td>
                <td>${i}</td>
                <td>
                    <a href="#" data-type="android" data-value="${i}" class="fas fa-trash text-danger removeItemFromLastValidVersion w-100 text-decoration-none"></a>
                </td>
            </tr>
            `
        }
        for (let i of arr.ios) {
            counter++
            row += `
            <tr class="text-primary">
                <td>${counter}</td>
                <td>IOS</td>
                <td>${i}</td>
                <td>
                    <a href="#" data-type="ios" data-value="${i}" class="fas fa-trash text-danger removeItemFromLastValidVersion w-100 text-decoration-none"></a>
                </td>
            </tr>
            `
        }
        document.querySelector(`${this.divID} #appVersions_LastValidVersionstable tbody`).innerHTML = row;
        this.removeItemFromLastValidVersion()

    }
    removeItemFromLastValidVersion() {
        document.querySelectorAll(`${this.divID} .removeItemFromLastValidVersion`).forEach(remove => {
            remove.onclick = e => {
                let type = e.target.getAttribute('data-type');
                let value = e.target.getAttribute('data-value');
                console.log(type, value);
                let obj = {}
                obj[type] = value
                post(
                    IDENTIFIERS.COURSES.COURSES.MOBILE.REMOVE_VALID_VERSION,
                    obj,
                    (data) => {
                        //console.log(data);
                        this.getLastValidVersions()
                    },
                    (err) => {
                        console.log(err);
                    }
                )
            }
        })
    }
    removeItemFromVersions() {
        document.querySelectorAll(`${this.divID} .removeItemFromVersions`).forEach(remove => {
            remove.onclick = e => {
                let type = e.target.getAttribute('data-type');
                let value = e.target.getAttribute('data-value');
                console.log(type, value);
                let obj = {}
                obj[type] = value
                post(
                    IDENTIFIERS.COURSES.COURSES.MOBILE.REMOVE_VERSION,
                    obj,
                    (data) => {
                        //console.log(data);
                        this.getVersions();
                    },
                    (err) => {
                        console.log(err);
                    }
                )
            }
        })
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

export class Versions_AppVersions extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        console.log(this.divID);
        let vote = 1;
        // get(
        //     IDENTIFIERS.COURSES.COURSES.MOBILE.APP_VERSIONS, {},
        //     (result) => {
        //         this.appVersions = result
        this.appVersions = { android: ['1', '2', '3'], ios: ['1', '2', '3'] }
        //         if (--vote <= 0) {
        //             super.load()
        //         }
        //     },
        //     (data) => {
        //         super.loadError(data)
        //     });


        $(this.divID).load(V.APP_VERSIONS.VERSIONS.HTML_URL, () => {
            if (--vote <= 0) {
                super.load()
            }
        });

    }
    render() {


        super.render();
    };

    stopLoading() { }
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();
    }
};

export class LastValidVersions_AppVersions extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {
        let vote = 1;
        // get(
        //     IDENTIFIERS.COURSES.COURSES.MOBILE.LAST_VALID_VERSION, {},
        //     (result) => {
        //         this.appVersions = result
        this.appVersions = { android: ['1', '2', '3'], ios: ['1', '2', '3'] }
        //         if (--vote <= 0) {
        //             super.load()
        //         }
        //     },
        //     (data) => {
        //         super.loadError(data)
        //     });

        $(this.divID).load(V.APP_VERSIONS.LAST_VALID_VERSION.HTML_URL, () => {
            if (--vote <= 0) {
                super.load()
            }
        });
    }
    render() {


        super.render();
    };

    stopLoading() { }
    reload() { super.reload({}); }
    promptError(error) { console.log(error.errMsg) }
    close() {
        super.close();
    }
};