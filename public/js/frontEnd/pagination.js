import { IDENTIFIERS } from '../constants.js';
import { get, post } from '../sdk/front.js';
import { notifyResult, warningAlert } from './navBar.js';
import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';

export class Pagination extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {

        $(`${this.divID}`).load(V.PAGINATION.HTML_URL, () => {
            // document.querySelector('#taskList_pagination_previous').style.cursor = 'pointer';
            // document.querySelector('#taskList_pagination_next').style.cursor = 'pointer';
            super.load()
        });

    }
    render() {
        document.querySelector('#taskList_pagination_pages').children[1].innerHTML = this.numOfPages;
        document.querySelector('#taskList_pagination_pages').children[0].innerHTML = (this.numOfPages==0)? 0 : this.currentPage;
        document.querySelector('#taskList_pagination_page_total').innerHTML = "of " + this.numberOfResults;
        document.querySelector('#taskList_pagination_page_numberWrite').value = (this.studentsPageSize <= this.numberOfResults) ? this.studentsPageSize : this.numberOfResults;
        //console.log(parseInt(document.querySelector('#taskList_pagination_pages').children[0].innerHTML) == parseInt(document.querySelector('#taskList_pagination_pages').children[1].innerHTML));
        if (parseInt(document.querySelector('#taskList_pagination_pages').children[0].innerHTML) == parseInt(document.querySelector('#taskList_pagination_pages').children[1].innerHTML)
            && parseInt(document.querySelector('#taskList_pagination_pages').children[0].innerHTML) == 1 && parseInt(document.querySelector('#taskList_pagination_pages').children[1].innerHTML) == 1
        ) {
            document.querySelector('#taskList_pagination_next').classList.add('d-none')
            document.querySelector('#taskList_pagination_previous').classList.add('d-none')
        } else if (parseInt(document.querySelector('#taskList_pagination_pages').children[0].innerHTML) == 1) {
            document.querySelector('#taskList_pagination_previous').classList.add('d-none')
        } if (parseInt(document.querySelector('#taskList_pagination_pages').children[0].innerHTML) == parseInt(document.querySelector('#taskList_pagination_pages').children[1].innerHTML)) {
            if(parseInt(document.querySelector('#taskList_pagination_pages').children[0].innerHTML) == 0&& parseInt(document.querySelector('#taskList_pagination_pages').children[1].innerHTML) == 0){
                document.querySelector('#taskList_pagination_next').classList.add('d-none')
                document.querySelector('#taskList_pagination_previous').classList.add('d-none')
            }else{
                document.querySelector('#taskList_pagination_next').classList.add('d-none')
            }
        }


        document.querySelectorAll(`${this.divID} .taskList_pagination`).forEach(button => {

            button.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();

                //console.log('equality',parseInt(document.querySelector('#taskList_pagination_pages').children[0].innerHTML) == this.numOfPages);
                if (e.target.getAttribute('data-title') == 'next') {
                    if (parseInt(document.querySelector('#taskList_pagination_pages').children[0].innerHTML) == this.numOfPages) {
                        document.querySelector('#warningAlertModal_continue').classList.add('d-none')
                        // warningAlert('No More ' + this.target)
                        return
                    }
                    document.querySelector('#taskList_pagination_pages').children[0].innerHTML = parseInt(document.querySelector('#taskList_pagination_pages').children[0].innerHTML) + 1
                    //console.log(document.querySelector('#taskList_pagination_pages').children[0].innerHTML);
                    this.sendPageNumber(
                        parseInt(document.querySelector('#taskList_pagination_pages').children[0].innerHTML),
                        this.exception
                    )
                } else if (e.target.getAttribute('data-title') == 'previous' && parseInt(document.querySelector('#taskList_pagination_pages').children[0].innerHTML) != 1) {
                    document.querySelector('#taskList_pagination_pages').children[0].innerHTML = parseInt(document.querySelector('#taskList_pagination_pages').children[0].innerHTML) - 1

                    this.sendPageNumber(
                        parseInt(document.querySelector('#taskList_pagination_pages').children[0].innerHTML),
                        this.exception
                    )
                }

            }
        })

        document.querySelector('#taskList_pagination_page_numberWrite').onkeyup = e => {
            //console.log(this.filterStudentsArray);
            if (e.target.value != '' & e.keyCode == 13) {
                this.pokeView({ viewID: V.STUDENTS.MAIN.VIEW_ID }, { filterStudentsArray: this.filterStudentsArray, studentsPageSize: parseInt(e.target.value) })
            }
        }

        super.render();
    }
    stopLoading() { }
    onPoke(a, data) {
        //console.log(data);
    }
    reload() { super.reload(); }
    close() { super.close(); }
};