import { IDENTIFIERS } from '../constants.js';
import {get, post } from '../sdk/front.js';
import { Uploader } from '../libraries/uploader.js';
import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';
import { warningAlert } from './navBar.js';

export class wishList extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() {}
    load() {
        let vote = 2;
        get(
            IDENTIFIERS.COURSES.COURSES.STUDENT_WISHLIST, {},
            (result) => {
                console.log(result);
                this.Array = result
                if (--vote <= 0) {
                    super.load();
                }
            },
            (data) => {
                console.log(data);
                //super.loadError(data)
            }
        );
        $(this.divID).load(V.MY_COURSES.HTML_URL, () => {
            document.querySelector(`${this.divID} h3`).innerHTML = 'my wishList'
            if (--vote <= 0) {
                super.load()
            }
        });
    }
    render() {


        this.fillWishList(this.Array);

        this.openCourse()

        super.render();
    };

    fillWishList(arr) {
            let row = `
            <div class="row" id="list">`
            for (let i of arr) {

                row += `
            
            <div class="col-md-4 col-xl-3 mt-2 px-1" data-ID="${i._id}" style="cursor: pointer;">
             <i class="fab fa-wpforms py-2 pl-2 text-primary requestCourse text-capitalize ml-auto" data-ID="${i._id}"> cart</i>
                <div class="card border eachCourse shadow rounded p-0 text-center text-capitalize" data-ID="${i._id}">
                    <div class="row" data-ID="${i._id}">
                        <div class="col-2" data-ID="${i._id}">
                        <img class="border shadow rounded" data-ID="${i._id}" width="75" height="75"
                        ${(i.files==null)?'src="../../img/imageNoteAvailable.jpg"':`src="http://localhost:8080/download/${i.files.id}"`}  />
                            
                        </div>
                        <p class="col-9 my-auto py-2" data-ID="${i._id}">${i.name}</p>
                    </div>
                </div>
            </div>
            `
        }
        row += `</div>`;
        document.querySelector(`${this.divID} #Content`).innerHTML = row;
        this.requestCourse()
        this.removeRequestCourse()
    }
    requestCourse() {
        document.querySelectorAll(`${this.divID} .requestCourse`).forEach(req=>{
            req.onclick = e => {

            post(IDENTIFIERS.COURSES.COURSES.ADD_TO_CART, {
                    courseID: e.target.getAttribute('data-ID'),
                },
                (result) => {
                    $(e.target).removeClass('text-primary requestCourse')
                    $(e.target).addClass('text-danger removeRequestCourse')
                    this.reload()
                    //this.removeRequestCourse()
                },
                (err) => {
                    super.loadError(err.err);
                }
            );
        }
        })
    }
    removeRequestCourse() {
        document.querySelectorAll(`${this.divID} .removeRequestCourse`).forEach(req=>{
            req.onclick = e => {

            post(IDENTIFIERS.COURSES.COURSES.REMOVE_FROM_CART, {
                    courseID: e.target.getAttribute('data-ID'),
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
        })
    }
    openCourse() {
        document.querySelectorAll(`${this.divID} .eachCourse`).forEach(course => {
            course.onclick = e => {
                let div = document.createElement('div')
                div.id = 'ViewCourse'

                $(div).addClass('custom-modal').appendTo("main").show().animate({ left: '0' }, 650)
                super.newView(V.COURSES.VIEW_COURSE.VIEW_ID, '#ViewCourse', { courseID: e.target.getAttribute('data-ID'),student:true,myCourse:true }, {})
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