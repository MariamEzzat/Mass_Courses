import { viewsClasses, V } from '../viewsConstants.js'
export {
    Router,
    View,
    IntentView
}
/*
Contains front end frameworks definitions 
Rules: 
	parent has references to it's DIRECT children.
	each child has reference to it's DIRECT parent.
	closing view will close all it's children recursively until it reach an independent or no more
	reload function if not overrided will be called by the router if parent is reloaded & solo = 0
	reload will ignore solo if with parents, it first reload parent then children, withParent only direct parent, & withAllParents all direct parents & first parent will reload first
	poke to trigger custom actions to a view while sending custom data, using instanceID or viewID, or none for poking all direct children.


Instructions: 
	use each class method's function purpose inside it, ex: load in load(), render html in render().
	don't create new view or intent in view constructor.
	must use IntentView for any view that will send back data to it's caller, 
		send back using this.success(result) or this.cancel(reason)
	for data sent by caller view to be accessed by this. or super.
	load() function should load data & store it by this. & then call super.load()

	must call super.close on view closed by any means
	
	can send trigger action with dataObj for a view using super.pokeView(data, instanceID), if instanceID is undefined this poke will be sent to all child views.


	options while creating view & intent view
	{
		isChild: 0, // default 1
		isIndependent: 1, // default 0, 1 to not close if it's parent closed, can be minimized. (not for intent view), don't link to a parent in html (check for html delete if parent deleted)

	}

	reload options: {
		solo: 1, // default 0, (for only reload this view without it's children), 0 if withParent or withAllParents = 1
		withParent: 1, // default 0, (to also reload direct parent)
		withAllParents: 1, // default 0, (to also reload all parents (direct-direct.. parent))
	}

	to close views: {
		call super.closeOthers (identifiers) identifiers: {instanceIDs, viewIDs, children}
		nested views will be closed unless one in the hierarchy is independent 
	}

    Note for post() functions, only show loading on success, and data will automatically be updated by the onDataChange().
 

 */

class Router {
    constructor() {
        this.liveViews = new Map(); // do map & plan for a better way for structuring parent child
        this.instances = 0; // number of instances for instanceID creation
    }

    // returns the base view.
    init(viewID) {
        console.log("CHECK ON : "+viewID)
            return this.viewRequest({ viewID: viewID }, {}, { isChild: 0 }, // as no parent has called it.
            )
        }
        /**
         * [getViewByInstanceID description]
         * @param  {String} instanceID view instance id
         * @return {View}      View instance object
         */
    getViewByInstanceID(instanceID) {
        return this.liveViews.get(instanceID).instance;
    }

    /**
     * [viewRequest description]
     * @param  {[type]} identifiers contains {instanceID, viewID, divID, newDivID}
     * @param  {[type]} data        custom data to be send to the new view
     * @param  {[type]} options     minimized: 1, isChild: 0
     * view creation options ex: closeParent: 1, default 0 // to close this view parent, isChild defaul 1
     * @return {[type]}             [description]
     */
    viewRequest(identifiers, data, options) {
        // TODO: HANDLE PARENTING & viewID organizing
        // TODO: START VIEW
        let envelope = {
            router: this,
            instanceID: Date.now() + (this.instances++),
            viewID: identifiers.viewID,
            divID: (identifiers.hasOwnProperty('newDivID') ? identifiers.newDivID : ''),
            data: data
        }

        // add parent 
        let isChild = false;
        if (!options.hasOwnProperty('isChild') || options.isChild == 1) { // default all children
            envelope.parent = {
                    divID: identifiers.divID,
                    viewID: identifiers.viewID,
                    instanceID: identifiers.instanceID
                }
                // Add reference to this view in it's parent.
                // put child instanceID in parent.children
            this.liveViews.get(identifiers.instanceID).children.push(envelope.instanceID);
            isChild = true;
        }

        // create view & it's envelope to be added in liveViews map
        let newView = new(viewsClasses.get(identifiers.viewID))(envelope);
        let viewEnvelope = {
            viewID: identifiers.viewID,
            instanceID: envelope.instanceID,
            instance: newView,
            children: [],
            isIndependent: 0
        }
        if (isChild) {
            viewEnvelope.parentInstanceID = identifiers.instanceID;
        }
        if (options.hasOwnProperty('isIndependent') && options.isIndependent == 1) {
            viewEnvelope.isIndependent = 1;
        }
        this.liveViews.set(envelope.instanceID, viewEnvelope);
        // start view
        newView.start();
        return envelope.instanceID;
    }

    intentViewRequest(identifiers, data, success, cancel, options) {
        let envelope = {
            router: this,
            instanceID: Date.now() + (this.instances++),
            viewID: identifiers.viewID,
            divID: (identifiers.hasOwnProperty('newDivID') ? identifiers.newDivID : ''),
            data: data,
            success: success,
            cancel: cancel,
            parent: {
                divID: identifiers.divID,
                viewID: identifiers.viewID,
                instanceID: identifiers.instanceID
            }
        }

        let newView = new(viewsClasses.get(identifiers.viewID))(envelope);
        let viewEnvelope = {
            viewID: identifiers.viewID,
            instance: newView,
            parentInstanceID: identifiers.instanceID,
            isIntent: 1
        }
        this.liveViews.set(envelope.instanceID, viewEnvelope);
        newView.start();
        return envelope.instanceID;
    }



    postViewStart(instanceID) {
        try {
            let instance = this.liveViews.get(instanceID).instance;
            instance.promptLoading();
            instance.load();
        } catch (e) {
            console.log('Router post view start catched err, instanceID: ' + instanceID);
            console.log(e);
        }
    }

    postViewLoad(instanceID) {
        try {
            let instance = this.liveViews.get(instanceID).instance;
            instance.stopLoading();
            instance.render();
        } catch (e) {
            console.log('Router post view load catched err, instanceID: ' + instanceID);
            console.log(e);
        }
    }



    postViewRender(instanceID) {
        // HERE THE VIEW HAS RENDERED IT'S HTML
        // TODO: Plan for retentivity, flag ready for snaping & types of views for retentivity
        // TODO: Define & create close methods

    }

    postViewMaximize(instanceID) {
        // TODO: MINIZE CHILDREN VIEWS
        this.liveViews.get(instanceID).minimized = 1;
    }

    postViewMinimize(instanceID) {
        //TODO: MINIMIZE CHILDREN VIEWS
        this.liveViews.get(instanceID).minimized = 0;
    }

    postViewClose(instanceID) {
        // TODO: unsubscribe if a subscription plan is made for caching (using data identifiers)

        // loop for all children views & close them after loop (on each)
        // each child will close it self by it self, first complete close will be in the leaves
        let viewEnvelope = this.liveViews.get(instanceID);
        for (let childInstanceID of viewEnvelope.children) {
            let childEnvelope = this.liveViews.get(childInstanceID);
            if (childEnvelope.isIndependent) { // must not be closed and it's children but has remove it's parent reference as it will be closed.
                delete childEnvelope.parentInstanceID;
                continue;
            }


            childEnvelope.instance.close();
        }

        let parentEnvelope = this.liveViews.get(viewEnvelope.parentInstanceID);
        parentEnvelope.children = parentEnvelope.children.filter((item) => {
            return item != instanceID;
        })


        this.liveViews.delete(instanceID);
        // TODO: DELETE IT'S REFERENCE FROM IT'S PARENT.

        // TODO: REMOVE ALL CHILDREN REFERENCE & close instances & don't remove if isIndependent & 
        // NOTICE: The problem here is when closing a parent first it's children will not find it's html because of html linkage
    }

    /**
     * to close different
     * @param  {[type]} identifiers {instanceIDs: [], viewIDs: [], children: 1/0}
     * @return {[type]}           
     */
    closeViews(instanceID, identifiers) {


        // TODO: close all views given, instanceIDs, viewIDs, &/or nested children
        // 
        if (identifiers.hasOwnProperty('instanceIDs')) {
            for (let instanceID of identifiers.instanceIDs) {
                if (!this.liveViews.has(instanceID)) {
                    continue;
                }
                this.liveViews.get(instanceID).instance.close();
            }
        }
        // * n-squared time complexity *
        if (identifiers.hasOwnProperty('viewsIDs')) {
            for (let viewID of identifiers.viewsIDs) {
                for (let [instanceID, instanceEnvelope] of this.liveViews) {
                    if (instanceEnvelope.viewID == viewID) {
                        instanceEnvelope.instance.close();
                    }
                }
            }
        }

        if (identifiers.hasOwnProperty('children') && identifiers.children == 1) {
            for (let childInstanceID of this.liveViews.get(instanceID).children) {
                this.liveViews.get(childInstanceID).instance.close();
            }


        }
    }

    /*
    	TODO: & plan 
	
    	recursiveChildrenCalls(parentInstanceID, callback) { // foreach-like
	
    	}
    */

    postViewReload(instanceID, options) {
        if (options == undefined) options = {}
        let solo = 0; //  only this view or all it's children.
        if (options.hasOwnProperty('solo')) {
            solo = options.solo;
        }

        let instanceEnvelope = this.liveViews.get(instanceID);

        // reload parents & all parents 
        if (options.hasOwnProperty('withParent') && options.withParent == 1) { // direct parent only.
            if (instanceEnvelope.hasOwnProperty('parentInstanceID')) {
                this.liveViews.get(instanceEnvelope.parentInstanceID).instance.reload({ /*empty optins*/ });
                return;
            }
            // Here this doesn't has a parent then continue.
        } else if (options.hasOwnProperty('withAllParents') && options.withAllParents == 1) { // extended direct parents direct-direct.. parents
            if (instanceEnvelope.hasOwnProperty('parentInstanceID')) {
                this.liveViews.get(instanceEnvelope.parentInstanceID).instance.reload(options); // options to recursively reload parents.
                return;
            }
        }

        // prompt loading & load, children too, if solo != 1
        // before calling children to reload in order of parents to children

        instanceEnvelope.instance.promptLoading();
        instanceEnvelope.instance.load();

        if (solo == 0) {
            // call reload for each children, & this will reload children recursively
            for (let childInstanceID of instanceEnvelope.children) {
                this.liveViews.get(childInstanceID).instance.reload({ /*empty options*/ });
            }
        }

    }

    postViewLoadError(instanceID, errEnvelope) {
        // TODO: options for prompt error for children or not 
        // TODO: subscriptions notify or de-assign
        this.liveViews.get(instanceID).promptError(errEnvelope);
    }

    pokeView(instanceID, identifiers, data) {
        // first check what to be poked: identifiers.instanceID for specific view, viewID for all views of this type, none of them for all direct children of this view.

        if (identifiers.hasOwnProperty('instanceID')) {
            // no instance id fatal
            if (!this.liveViews.has(identifiers.instanceID)) {
                this.liveViews.get(instanceID).promptError({
                    err: "No instance for this instanceID, liveViews doesn't contain: " + identifiers.instanceID,
                    userMsg: LABELS.FRONT_END.INTERNAL_ERROR
                })
                return;
            }
            // instanceID exists.
            // TODO: poke this view instanceID
            let caller = {
                instanceID: instanceID,
                viewID: this.liveViews.get(instanceID).viewID
            }
            this.liveViews.get(identifiers.instanceID).onPoke(caller, data);

        } else if (identifiers.hasOwnProperty('viewID')) {
            // no class for this viewID is fatal
            if (!viewsClasses.has(identifiers.viewID)) {
                this.liveViews.get(instanceID).promptError({
                    err: "No view class for this id, viewsClasses doesn't contain: " + identifiers.viewID,
                    userMsg: LABELS.FRONT_END.INTERNAL_ERROR
                })
                return;
            }
            // viewID exists
            // TODO: poke all views with this viewID
            for (const [instanceID, instanceEnvelope] of this.liveViews.entries()) {
                if (instanceEnvelope.viewID == identifiers.viewID) {
                    let caller = {
                        instanceID: instanceID,
                        viewID: this.liveViews.get(instanceID).viewID
                    }
                    instanceEnvelope.instance.onPoke(caller, data);
                }
            }
        } else {
            // TODO: poke all children for this view.
            let caller = {
                instanceID: instanceID,
                viewID: this.liveViews.get(instanceID).viewID
            }
            for (let childInstanceID of this.liveViews.get(instanceID).children) {

                this.liveViews.get(childInstanceID).instance.onPoke(caller, data);
            }
        }

    }






}

class View {
    constructor(routerEnvelope) {
        this.router = routerEnvelope.router;
        this.instanceID = routerEnvelope.instanceID; // this object id, differ from viewID as a view can have multiple instances
        this.viewID = routerEnvelope.viewID; // view class reference
        this.divID = routerEnvelope.divID; // div element containing this view
        // if this view has a parent view, ex: subtask parent to checklists & logProgress views
        if (routerEnvelope.hasOwnProperty('parent')) {
            this.parent = {
                divID: routerEnvelope.parent.divID,
                viewID: routerEnvelope.parent.viewID,
                parentInstanceID: routerEnvelope.parent.instanceID
            }
        }
        // to assign sent data from this view main creator to this super class to ease using them from slave class, ex: tasklist view created taskview & sent it it's required data{_id}, taskview constructor doesn't need using this._id = _id, without assigning them in slave constructor just use this._id, (whenever creating new CLASS)
        for (let objName in routerEnvelope.data) {
            this[objName] = routerEnvelope.data[objName];
        }

    }

    /**
     * [newView description]
     * @param  {[type]} newViewID view reference which the router will create from, from viewsConstants.js
     * @param  {[type]} newDivID  view container div ID, will be sent to new view instance to render html on
     * @param  {[type]} data      additional required data for the new view, ex: tasklist view will send taskID to taskView view so that taskView view can retrieve this required task 
     * @param  {[type]} options   additional options like closeParents: 1, isChild: 1, isIntent: 1 default 0
     * @return {Integer}          new view instanceID
     */
    newView(newViewID, newDivID, data, options) {

        let identifiers = {
                instanceID: this.instanceID, // this view's id
                viewID: newViewID, // view reference
                divID: this.divID, // this view's container divID
                newDivID: newDivID // new view's container divID
            }
            // create & return returned new instanceID
        return this.router.viewRequest(
            identifiers,
            data, // data to be passed to the new view
            options // options for creating the view, ex: isChild: 1, to make this new view a child to this view
        );
    }

    /**
     * [newIntentView description]
     * @param  {[type]} newIntentViewID view class reference
     * @param  {[type]} newDivID        if this view will be attached in predefined div
     * @param  {[type]} data            data to be sent by this view
     * @param  {[type]} success         callback for success with result arg
     * @param  {[type]} cancel          callback for canceled or fail with optional reason arg
     * @param  {[type]} options         creating view options
     * @return {[type]}                 [description]
     */
    newIntentView(newIntentViewID, newDivID, data, success, cancel, options) {
        let identifiers = {
                instanceID: this.instanceID, // this view's id
                viewID: this.viewID, // view reference
                divID: this.divID, // this view's container divID
                newDivID: newDivID, // new view's container divID
            }
            // create & return returned new instanceID
        return this.router.intentViewRequest(
            identifiers,
            data,
            success,
            cancel,
            options
        )

    }

    start() {
        this.router.postViewStart(this.instanceID);
    }

    load() {
        this.router.postViewLoad(this.instanceID);
    }
    loadError(errEnvelope) {
        this.router.postViewLoadError(this.instanceID, errEnvelope);
    }


    render() {
        this.router.postViewRender(this.instanceID);
    }
    minimize() {
        this.router.postViewMinimize(this.instanceID);
    }
    maximize() {
        this.router.postViewMaximize(this.instanceID);
    }
    close() {
        this.router.postViewClose(this.instanceID);
    }
    reload(options) {
        this.router.postViewReload(this.instanceID, options);
    }


    promptLoading() {}
    stopLoading() {}
    onPoke(caller, data) {}
    onDataChange(dataIdentifiers) {}

    pokeView(identifiers, data) {
        this.router.pokeView(this.instanceID, identifiers, data);
    }

    /**
     * [closeOthers to close other views
     * @param  {[type]} identifiers {instanceIDs, viewIDs, children}
     * @return {[type]}             [description]
     */
    closeOthers(identifiers) {
        if (identifiers == undefined) {
            return;
        }

        this.router.closeViews(this.instanceID, identifiers);
    }

}

class IntentView extends View {
    constructor(routerEnvelope) {
        super(routerEnvelope);
    }

    start() {
        // if needed do any initial actions before loading, then call super.start()
        super.start();
    }

    promptLoading() {
        // start loading prompt only 
    }

    load() {
        // to only load data, and store it in this instance IF NEEDED, then call super.load() 
        super.load();
    }

    render() {
        // to create and publish the html, then call super.render()
        super.render();
    }

    stopLoading() {
        // close loading prompt only
    }

    restart() { // 

    }

    minimize() {

    }

    close() {
        super.close();
        // remove html then call super.close().

    }

    success(result) {

    }

    cancel(result) {

    }
}
/*
class SubIntentViewTemplate extends IntentView {
	constructor (routerEnvelope) {
		super(routerEnvelope);
	}
	// can call success(result), cancel(reason), viewRequest(), intentViewRequest(), 
}
	
class SubviewTemplate extends View {
	constructor (routerEnvelope) {
		super(routerEnvelope);
	}
	
	
		//call newIntentView(args...) for a view for a result ex: add category small input view
	 
	
	start () {
		// if needed do any initial actions before loading, then call super.start()
		super.start();
	}
	
	promptLoading () {
		// start loading prompt only
	}
	loadHtml () {
        super.loadHtml();
        // or error
        super.loadHtmlError();
    }
	loadData () {
		// to only load data, and store it in this instance, then call super.load() 
		super.loadData();
		// or error msg
		super.loadDataError(errEnvelope);
	}
	
	render() {
		// to create and publish the html, then call super.render()
		super.render();
	}
	
	stopLoading () {
		// close loading prompt only
	}
	
	/**
	 * [promptError description]
	 * @param  {[type]} errEnvelope {userMsg, err}
	 * @return {[type]}             [description]
	 *
	promptError (errEnvelope) {
		// here to prompt error happened and show user what error is this
	}
	
/*	restart () {// optional
		
	}
	
	reload() {
		let options; // options contains options for reloading, {solo: 1} default 0, 0 for reload children
		super.reload(options); 
	}
	
/*	minimize () {
		 
		 super.minimize();
	}
	
	maximize () {
	
		super.maximize();
	}
*
	
	
	pokeView () {
		let identifier = {
			instanceID: '', // instance id of the view to be poked
			viewID: '', // to poke all views of this viewID
			// none of the above will poke all this view's direct children
		}
		super.pokeView (identifier, data);
	
	}
	
	/**
	 * onPoke : poke reciever should be implemented in the child
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 *
	onPoke (data) {
	
	}

    
   
   /**
    * [onDataChange router will call this function if the data used by this view is changed.
    * implement required actions if data changed. will be called if the data on the server has been changed. ex: subtask progress increased by another participants.
    * @param  {String array} dataIdentifiers constants based data identifiers ex: 00T01 new task predata, 
    * @return {[type]}                 [description]
    
    onDataChange(dataIdentifiers) {
        
    }

   /*

	
	// to be called for this object
	closeOthers () {
		let identifiers = {
			instanceIDs: ['instanceID'], // all instances with this instanceID
			viewIDs: ['viewID'], // all views to be deleted.
			children: 1, // close all nested children 
		}
		super.closeOthers(identifiers)
	}
	
	
	close () {
		super.close ();
		// remove html after calling super.close().
		
	}
	
}
	
	
class NewRepetitiveTask extends View {
	constructor (envelope) {
		super(envelope);
		console.log ('constructor');
	}
	
	start () {
		console.log ('start');
		super.start();
	}
	promptLoading() {
		console.log ('promptLoading..');
	}
	load() {
		console.log ('loading');
		setTimeout(()=> {super.load()}, 3000);
	}
	render() {
		console.log ('render');
		super.render();
	}
	stopLoading() {
		console.log ('stopLoading');
	}
	
	reload() {
		super.reload({});
	}
	
	close () {
		console.log ('starting close ');
		super.close();
		console.log ('closed ');
	
	}
	
	// debugging only.
	createChild() {
		return super.newView( // return new instanceID
			V.REPETITIVE_TASKS.NEW_TASK.NEW_TASK_CHILD,
			'',
			{ci: 'ci', di: 'di'},
			{}
			)
	}
}
	
	
	
class NewRepetitiveTaskChild extends View {
	constructor (envelope) {
		super(envelope);
		console.log ('constructor child');
	}
	
	start () {
		console.log ('start child');
		super.start();
	}
	promptLoading () {
		console.log ('promptLoading.. child');
	}
	load () {
		console.log ('loading child');
		setTimeout(()=> {super.load()}, 3000);
	}
	render () {
		console.log ('render child');
		super.render();
	}
	stopLoading () {
		console.log ('stopLoading child');
	}
	
	reload () {
		super.reload({});
	}
	
	close () {
		console.log ('starting close child');
		super.close();
		console.log ('closed child');
	}
	
	
}
	
	
	
*/

class NavBar extends View {
    constructor(envelope) {
        super(envelope);
        console.log('constructor');
    }

    start() {
        console.log('start');
        super.start();
    }
    promptLoading() {
        console.log('promptLoading..');
    }
    loadHTML() {
        console.log('loading html');
        // load html then call super.loadHTML();
    }
    loadData() {
        console.log('loading');
        setTimeout(() => { super.loadData() }, 3000);
    }
    render() {
        console.log('render');
        super.render();
    }
    stopLoading() {
        console.log('stopLoading');
    }

    reload() {
        super.reload({});
    }

    close() {
        console.log('starting close ');
        super.close();
        console.log('closed ');

    }



    // debugging only.
    createChild() {
        return super.newView( // return new instanceID
            V.REPETITIVE_TASKS.NEW_TASK.NEW_TASK_CHILD,
            '', { ci: 'ci', di: 'di' }, {}
        )
    }
}