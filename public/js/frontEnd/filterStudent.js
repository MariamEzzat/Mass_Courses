import { IDENTIFIERS } from '../constants.js';
import { get, post } from '../sdk/front.js';
import { notifyResult, warningAlert } from './navBar.js';
import { View } from '../frameworks/Router.js';
import { V } from '../viewsConstants.js';
import { MODAL } from './courses.js';

import { InfoIconModal } from './navBar.js'

export class FilterStudents extends View {
    constructor(envelope) { super(envelope); }
    start() { super.start(); }
    promptLoading() { }
    load() {


        $(document.querySelector(this.divID).parentElement.querySelector(`.studentList_head_FilterBox`)).addClass('border')
        super.load()
    }
    render() {

        if (this.type == "search" && $.trim($(document.querySelector(this.divID).parentElement.querySelector(`.studentList_head_FilterBox`)).html()) == '') {
            document.querySelector(this.divID).parentElement.querySelector(' .studentList_head_FilterBox').innerHTML = `
                <div class="pb-3 mt-1 d-none justify-content-end">
                    <label for="filterBox_sort_smallerToGreater_${this.divID.split('#')[2]}" class="fas fa-sort-alpha-down font-size-17px darkBlue">
                        <input type="checkbox" hidden id="filterBox_sort_smallerToGreater_${this.divID.split('#')[2]}" data-fieldID="${this.fieldID}">
                    </label>
                    <label for="filterBox_sort_greaterToSmaller_${this.divID.split('#')[2]}" class="fas fa-sort-alpha-up font-size-17px ml-2 darkBlue">
                        <input type="checkbox" hidden id="filterBox_sort_greaterToSmaller_${this.divID.split('#')[2]}" data-fieldID="${this.fieldID}">
                    </label>
                </div>
                <div class="d-flex justify-content-between border-bottom py-1 mb-1">
                    <a class="fas fa-times btn-outline-secondary text-dark border rounded border-secondary text-dark p-1" data-toggle="tooltip" title="Reset" id="reset_${this.divID.split('#')[2]}"></a>
                    <a href="#" class=" fas fa-eraser btn-outline-danger border rounded border-danger p-1" data-toggle="tooltip" title="Reset All" id="resetAll_${this.divID.split('#')[2]}"></a>
                    <a href="#" class="submit_exception_${this.divID.split('#')[2]} fas fa-minus-circle rounded p-1 border-dark" data-toggle="tooltip" title="Except Selection"></a>
                    <a href="#" style="line-height:1;" class="submit_${this.divID.split('#')[2]} far fa-paper-plane btn-outline-darkBlue rounded p-1 border border-darkBlue" data-toggle="tooltip" title="Filter"></a>
                </div>
                <div>
                    <input type="text" class="form-control" id="input_search_${this.divID.split('#')[2]}" placeholder="Search..." data-fieldID="${this.fieldID}">
                </div>
                `
        } else if (this.type == "select" && $.trim($(document.querySelector(this.divID).parentElement.querySelector(`.studentList_head_FilterBox`)).html()) == '') {
            //console.log(this.propertyName);
            document.querySelector(this.divID).parentElement.querySelector(' .studentList_head_FilterBox').innerHTML = `
                <div class="pb-3 mt-1 d-none justify-content-end">
                    <label for="filterBox_sort_smallerToGreater_${this.divID.split('#')[2]}" class="fas fa-sort-alpha-down font-size-17px darkBlue">
                        <input type="checkbox" hidden id="filterBox_sort_smallerToGreater_${this.divID.split('#')[2]}" data-fieldID="${this.fieldID}">
                    </label>
                    <label for="filterBox_sort_greaterToSmaller_${this.divID.split('#')[2]}" class="fas fa-sort-alpha-up font-size-17px ml-2 darkBlue">
                        <input type="checkbox" hidden id="filterBox_sort_greaterToSmaller_${this.divID.split('#')[2]}" data-fieldID="${this.fieldID}">
                    </label>
                </div>
                <div class="d-flex justify-content-between border-bottom py-1 mb-1">
                    <a href="#" class="fas fa-times btn-outline-secondary text-dark border rounded border-secondary text-dark p-1" data-toggle="tooltip" title="Reset" id="reset_${this.divID.split('#')[2]}"></a>
                    <a href="#" class=" fas fa-eraser btn-outline-danger border rounded border-danger p-1" data-toggle="tooltip" title="Reset All" id="resetAll_${this.divID.split('#')[2]}"></a>
                    <a href="#" class="submit_exception_${this.divID.split('#')[2]} fas fa-minus-circle rounded p-1 border-dark" data-toggle="tooltip" title="Except Selection"></a>
                    <a href="#" style="line-height:1;" class="submit_${this.divID.split('#')[2]} far fa-paper-plane btn-outline-darkBlue rounded p-1 border border-darkBlue" data-toggle="tooltip" title="Filter"></a>
                </div>
                <div class="d-flex py-1">
                    <select data-header="Select" data-width="95%" class="selectpicker" data-size="5" multiple data-style="bg-white text-dark font-weight-light text-capitalize rounded border p-1 font-size-15px" 
                        data-live-search="true" id="select_${this.propertyName}_${this.divID.split('#')[2]}" value="" data-fieldID="${this.fieldID}">
                        ${this.fillSelect(`${this.propertyName}`)}
                    </select>
                </div>
                `
            $(`#select_${this.propertyName}_${this.divID.split('#')[2]}`).selectpicker('refresh')

        }
        $(function () {
            $('[data-toggle="tooltip"]').tooltip({
                trigger: 'hover'
            })
        })

        document.querySelectorAll('[id*="filterBox_sort_"]').forEach(sort => {
        
            sort.onchange = (e) => {
                let taaarget= e.target.id.split('_')[2]
                console.log(e.target.id);
                console.log('taaarget',taaarget);
                let fieldID = e.target.getAttribute('data-fieldID')
                
                    if ($(e.target).is(':checked')) {
                        document.querySelectorAll('[id*="filterBox_sort_"]').forEach(sort => {
                            sort.parentElement.classList.remove('text-warning')
                            sort.parentElement.classList.add('darkBlue')
                            sort.setAttribute('data-checked', '0')
                        })
                        e.target.setAttribute('data-checked', '1')
                        e.target.parentElement.classList.remove('darkBlue')
                        e.target.parentElement.classList.add('text-warning')
                        let filter = this.filterStudentsArray.filter(obj => {
                            return !obj.hasOwnProperty('sort')
                        })
                        if(taaarget=='smallerToGreater'){
                            filter.push({
                                fieldID: fieldID,
                                sort: {
                                    order: 1 , // 1 for increasing sort, & -1 for decreasing sort(greater to smaller)
                                }
                            })
                        }else{
                            filter.push({
                                fieldID: fieldID,
                                sort: {
                                    order: -1 , // 1 for increasing sort, & -1 for decreasing sort(greater to smaller)
                                }
                            })
                        }
                        
                        this.filterStudentsArray = filter
                        this.pokeView({ viewID: V.STUDENTS.MAIN.VIEW_ID }, { filterStudentsArray: this.filterStudentsArray })
    
                    } else {
                        e.target.setAttribute('data-checked', '0')
                        e.target.parentElement.classList.remove('text-warning')
                        e.target.parentElement.classList.add('darkBlue')
                        let filter = this.filterStudentsArray.filter(obj => {
                            return !obj.hasOwnProperty('sort')
                        })
    
                        this.filterStudentsArray = filter
                        this.pokeView({ viewID: V.STUDENTS.MAIN.VIEW_ID }, { filterStudentsArray: this.filterStudentsArray })
                    }
            }
        })

        document.querySelector(`#${this.divID.split('#')[1]} #reset_${this.divID.split('#')[2]}`).onclick = (e) => {

            if (this.type == 'search') {
                let value = e.target.parentElement.parentElement.querySelector('input').value
                let fieldID = e.target.parentElement.parentElement.querySelector('input').getAttribute('data-fieldID')
                //console.log(fieldID);
                this.filterStudentsArray = this.filterStudentsArray.filter(re => {
                    return re.fieldID !== fieldID
                })
            } else if (this.type == 'select') {
                let value = e.target.parentElement.parentElement.querySelector('select').value
                let fieldID = e.target.parentElement.parentElement.querySelector('select').getAttribute('data-fieldID')
                //console.log(fieldID);
                this.filterStudentsArray = this.filterStudentsArray.filter(re => {
                    return re.fieldID !== fieldID
                })
            }
            document.querySelectorAll(' .studentList_head_FilterBox').forEach(eachFilterBox => {
                eachFilterBox.innerHTML = ''
                eachFilterBox.classList.add('d-none')

            })
            this.close()
            this.pokeView({ viewID: V.STUDENTS.MAIN.VIEW_ID }, { filterStudentsArray: this.filterStudentsArray })

        };

        document.querySelector(`#${this.divID.split('#')[1]} #resetAll_${this.divID.split('#')[2]}`).onclick = () => {
            this.close()
            this.pokeView({ viewID: V.STUDENTS.MAIN.VIEW_ID }, { filterStudentsArray: [],restAll:true })
        };
        // console.log(this.filterStudentsArray);
        document.querySelector(`#${this.divID.split('#')[1]} .studentList_head_FilterBox .submit_${this.divID.split('#')[2]}`).onclick = (e) => {
            console.log(e.target.parentElement.parentElement.querySelector('input'));
            e.preventDefault();
            if (this.type == 'search') {
                let value = e.target.parentElement.parentElement.querySelector('input[type="text"]').value;
                let fieldID = e.target.parentElement.parentElement.querySelector('input').getAttribute('data-fieldID');

                if (value.trim() !== '') {
                    if (this.filterStudentsArray.filter(e => e.fieldID === fieldID).length > 0) {
                        this.filterStudentsArray = this.filterStudentsArray.filter(e => { return e.fieldID !== fieldID })
                        let searchObj = {
                            fieldID: fieldID,
                            search: {
                                input: value,
                            }
                        }
                        this.filterStudentsArray.push(searchObj)
                    } else {
                        let searchObj = {
                            fieldID: fieldID,
                            search: {
                                input: value,
                            }
                        }
                        this.filterStudentsArray.push(searchObj)
                    }
                }

            } else if (this.type == 'select') {
                let value = $(`#select_${this.propertyName}_${this.divID.split('#')[2]}`).val().map(this.booleanFromStringOtherwiseReturnValue);
                let fieldID = e.target.parentElement.parentElement.querySelector('select').getAttribute('data-fieldID');

                if (value.length !== 0) {
                    if (this.filterStudentsArray.filter(e => e.fieldID === fieldID).length > 0) {
                        this.filterStudentsArray = this.filterStudentsArray.filter(e => { return e.fieldID !== fieldID })
                        let selectObj = {
                            fieldID: fieldID,
                            select: {

                                items: value,
                            }
                        }
                        this.filterStudentsArray.push(selectObj)
                    } else {
                        let selectObj = {
                            fieldID: fieldID,
                            select: {

                                items: value,
                            }
                        }
                        //console.log(selectObj);
                        this.filterStudentsArray.push(selectObj)
                    }

                }
            }
            this.pokeView({ viewID: V.STUDENTS.MAIN.VIEW_ID }, { filterStudentsArray: this.filterStudentsArray })

        };
        document.querySelector(`#${this.divID.split('#')[1]} .studentList_head_FilterBox .submit_exception_${this.divID.split('#')[2]}`).onclick = (e) => {
            e.preventDefault();
            if (this.type == 'search') {
                let value = e.target.parentElement.parentElement.querySelector('input').value;
                let fieldID = e.target.parentElement.parentElement.querySelector('input').getAttribute('data-fieldID');

                if (value.trim() !== '') {
                    if (this.filterStudentsArray.filter(e => e.fieldID === fieldID).length > 0) {
                        this.filterStudentsArray = this.filterStudentsArray.filter(e => { return e.fieldID !== fieldID })
                        let searchObj = {
                            fieldID: fieldID,
                            search: {
                                input: value,
                                exception: 1
                            }
                        }
                        this.filterStudentsArray.push(searchObj)
                    } else {
                        let searchObj = {
                            fieldID: fieldID,
                            search: {
                                input: value,
                                exception: 1
                            }
                        }
                        this.filterStudentsArray.push(searchObj)
                    }
                }

            } else if (this.type == 'select') {
                let value = $(`#select_${this.propertyName}_${this.divID.split('#')[2]}`).val().map(this.booleanFromStringOtherwiseReturnValue);
                let fieldID = e.target.parentElement.parentElement.querySelector('select').getAttribute('data-fieldID');

                if (value.length !== 0) {
                    if (this.filterStudentsArray.filter(e => e.fieldID === fieldID).length > 0) {
                        this.filterStudentsArray = this.filterStudentsArray.filter(e => { return e.fieldID !== fieldID })
                        let selectObj = {
                            fieldID: fieldID,
                            select: {

                                items: value,
                                exception: 1
                            }
                        }
                        this.filterStudentsArray.push(selectObj)
                    } else {
                        let selectObj = {
                            fieldID: fieldID,
                            select: {

                                items: value,
                                exception: 1
                            }
                        }
                        this.filterStudentsArray.push(selectObj)
                    }

                }
            }
            this.pokeView({ viewID: V.STUDENTS.MAIN.VIEW_ID }, { filterStudentsArray: this.filterStudentsArray })

        };
        super.render();
    }

    fillSelect(propertyName) {
        //console.log(propertyName);
        //console.log(this.CourseTrees);
        let elmnt = ''
        if (propertyName == 'deactivate') {
            elmnt += `<option value="true">not-active</option> 
                <option value="false">active</option>`
        }else if (propertyName == 'courses'){
            for (let elm of this.coursesList) {
                elmnt += `<option value="${elm._id}">${elm.name}</option> `
            }
        } else {
            for (let elm of this.CourseTrees[propertyName]) {
                elmnt += `<option value="${elm._id}">${elm.name}</option> `
            }
        }
        return elmnt
    }
    booleanFromStringOtherwiseReturnValue(s) {
        if (s == 'true') return true
        if (s == 'false') return false
        return s
    }
    stopLoading() { }
    reload() { super.reload(); }
    close() {
        super.close();
        $(document.querySelector(this.divID).parentElement.querySelector(`.studentList_head_FilterBox`)).toggleClass('d-none')
        /* $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        }) */
        $(document.querySelector(this.divID).parentElement.querySelector(`.studentList_head_FilterBox`)).removeClass('border')
    }
};