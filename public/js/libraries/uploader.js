//import * from './resumable.js';
import {get, post } from '../sdk/front.js';
import { IDENTIFIERS } from '../constants.js';


const GLOBAL_UPLOAD_TARGET = window.location.href + 'uploads';


/**
 * 	Must call render() at the beginning or at refreshing the view.
 * 	create html dom element so that user can click to choose files to be uploaded
 * 	then submit the form in order to inform the server that this user can upload these files
 * 	after submitting the form successfully:
 * 		1: start loading processing files until a callback via on('processingFinished', cb) is called
 * 		2: and server responded call upload() to start uploading
 * 	
 *  to resume there has to be another button than the one given to Uploader object, 
 *  so that when user clicks on it you call uploader.upload()
 *
 * 	on('event', callback) // events: 
 * 		'progress': gives value from 0-1, 
 * 		'failed': called if error happened (user has no right),
 * 		'processingFinished': two options to be called: 1: user has no right to upload these files or server error, 2: use has right and preprocessing (chunking) completed
 */
class Uploader {
    /**
     * [Uploader description]
     * @param {[type]} userID      [description]
     * @param {[type]} domElement  dom element that will be button to upload files on 
     * @param {[type]} FILES_GATE  [description]
     * @param {[type]} serviceData [description]
     */
    constructor(userID, domElement, targetURL, filesAllowed, FILES_GATE, serviceData) {
        this.userID = userID;
        this.domElement = domElement;
        this.targetURL = targetURL;
        this.filesAllowed = filesAllowed
        this.FILES_GATE = FILES_GATE; // FOR SECURITY TO HELP AUTHENTICATE ACCORDING TO THE SERVICE NEEDS, WITH A UNI DIRECTIONAL PROTOCOL
        //console.log('uploader constructor called ')
    }

    render(domElement) {
        //console.log(this.target, this.seed)
        if (this.filesAllowed.length == 0) {
            this.resumable = new Resumable({
                target: this.targetURL,
                seed: String(this.userID),
            })
        } else {
            this.resumable = new Resumable({
                target: this.targetURL,
                seed: String(this.userID),
                fileType: this.filesAllowed
            })
        }

        //console.log(this.resumable);

        if (domElement != undefined) {
            this.domElement = domElement
        }

        //this.resumable.assignBrowse ($(`#${this.domElementID}`))
        this.resumable.assignBrowse(this.domElement)

        // reset files added
        this.filesIDs = [];
        /**
         * 'filesAdded callback'
         * creates filesIDs user selected to be uploaded
         * filesIDs: [{id, name, size<in bytes>}]
         * returns empty array incase of error or no files selected.
         * no permission for this user to upload or server can't upload is an error
         * 
         * @param  {Array}  files       files collection by resumable.js after adding by the user
         * @return {[type]}              [description]
         */
        this.resumable.on('error', (msg, file) => {
            console.log('err resumable')
                //cb(msg);

        })
        this.filesAddedCB();

    }

    filesAddedCB(recievedCB) {
        this.resumable.on('filesAdded', (files) => {


            /*          files
                        if (!Array.isArray(files)) {
                            for (let file of files) {
                                this.filesIDs.push({
                                    name: file.fileName,
                                    id: file.uniqueIdentifier,
                                    size: file.size
                                }
                            }
                        }
            */

            //this.filesIDs = files;
            this.filesIDs = [];



            // single directory
            if (!Array.isArray(files)) {
                if (!files.hasOwnProperty('uniqueIdentifier')) {
                    this.filesIDs = []
                    return;
                }
                this.filesIDs = [{
                    name: files.fileName,
                    id: files.uniqueIdentifier,
                    size: files.size
                }]
                return;
            }

            // normal files
            for (let file of files) {
                this.filesIDs.push({
                    name: file.fileName,
                    id: file.uniqueIdentifier,
                    size: file.size
                })
            }

            if (recievedCB != undefined) {
                recievedCB(this.filesIDs)
            }

        })
    }



    /**
     * to update
     * @param  {[type]} seed             [description]
     * @param  {[type]} filesUniqueSeeds [description]
     * @return {[type]}                  [description]
     */
    updateSeed(seed, filesUniqueSeeds) {

        this.resumable.updateFiles();

    }

    /**
     * getFilesIDs 
     * returns files identifiers(id, size, name) user selected to be uploaded
     * @return {Array} [{id, size, name}]
     */
    getFilesIDs() {
        return this.filesIDs
    }

    /**
     * upload - first check if user can upload this files using given FILES_GATE(each service has it's files gate, the way to authenticate user accessibility and others)
     * @param {object} 	onUploadData optional data to be added to service data to be sent to the server for authentication MUST BE OBJECT OTHERWISE WILL NOT BE SENT
     *                               {
     *                               	files: [
     *                               	{
     *                               		id,
     *                               		prev_id,
     *                               	}
     *                               	
     *                               	]
     *                               }
     * @return {[type]} [description]
     */
    upload(onUploadData) {
        //this.resumable.updateFilesIDs('asdf');
        // TODO: check if user can upload/resume all these files, with serviceData
        // call server to check for authentication.

        //TODO: CHANGE FILES NAMES IN RESUMABLE TO THE NEW onUploadData list of names
        if (typeof onUploadData == 'object') {

            if (this.serviceData == undefined) this.serviceData = {};

            for (let field in onUploadData) {
                this.serviceData[field] = onUploadData[field]
            }
        }

        //console.log(this.targetURL)

        //console.log ( this.resumable.updateFilesIDs(onUploadData.files) )

        this.resumable.upload();

        /*		get (
        			this.FILES_GATE.UPLOAD_PERMISSION,
        			{
        				filesIDs: this.filesIDs,
        				data: this.serviceData
        			},
        			(result) => { // success
        				// TODO: get upload target from server  **
        				this.resumable.updateTargetURL('https://test.roots.solutions/uploads')
        				this.resumable.upload(); // START UPLOAD
        			}, 
        			(err) => { // error server or user can't upload these files
        				if (this.authenticationFinishedCallback != undefined) {
        					this.authenticationFinishedCallback();
        				}
        				if (this.authenticationErrorCallback != undefined) {
        					this.authenticationErrorCallback(err);
        				}
        			}
        		)*/
        return true
    }

    /**
     * [on description]
     * types are:  progress success failed
     * filesAdded: when cb passed it will override the previous callback with another one that will call the passed cb
     * 
     * @param  {[type]}   type [description]
     * @param  {Function} cb   [description]
     * @return {[type]}        [description]
     */
    on(type, cb) {
        type.toLowerCase();

        switch (type) {
            case 'filesAdded':
                {
                    this.filesAddedCB(cb);
                    break;
                }
            case 'progress':
                {
                    this.resumable.on('progress', () => {
                        cb(this.resumable.progress())
                    })
                    break;
                }
                // two options to be called: 1: user has no right to upload these files, 2: use has right and preprocessing (chunking) completed
            case 'processingFinished':
                {
                    this.authenticationFinishedCallback = cb;
                    this.resumable.on('chunkingComplete', cb);
                }
            case 'success':
                {
                    this.resumable.on('success', () => {
                        cb()
                    })

                    // TODO: TELL THE SERVER THAT THE FILES HAS BEEN UPLOADED SUCCESSFULLY. OR DESIGN ANOTHER WAY, EITHER BY RESUMABLE-BACKEND OR BY CHECKING FIZE SIZE ON THE SERVER.

                    break;
                }
            case 'failed':
                {
                    console.log('failed')
                    this.authenticationErrorCallback = cb;
                    this.resumable.on('error', (msg, file) => {
                        cb(msg);

                    })
                    break;
                }
        }
    }

}



export { Uploader }