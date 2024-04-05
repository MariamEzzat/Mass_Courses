








exports.getfullTimeString = () => {
	const DateHelper = new Date();
	let date = ("0" + DateHelper.getDate()).slice(-2);

	// current month
	let month = ("0" + (DateHelper.getMonth() + 1)).slice(-2);

	// current year
	let year = String(DateHelper.getFullYear());

	// current hours
	let hours = String(DateHelper.getHours());
    if (hours.length == 1) hours = "0" + hours;

	// current minutes
	let minutes = String(DateHelper.getMinutes());
	if (minutes.length == 1) minutes = "0" + minutes;
    
	// current seconds
	let seconds = String(DateHelper.getSeconds());
    if (seconds.length == 1) seconds = "0" + seconds;

	let fullTimeString = year + month + date + hours + minutes + seconds;

	return fullTimeString;
}

/**
 * 
 * @param  {[type]} date optional date to be converted
 * @return {[type]}      ex: 2021-09-02
 */
exports.getBasicISODate = (date) => {
	if (date == undefined) {
		date = new Date();
	}
	let result = date.getFullYear();
	result = result + "-" + ("0" + (date.getMonth() + 1)).slice(-2);
	result = result + "-" + ("0" + date.getDate()).slice(-2);

	return result;
}

/**
 * [formatDate description]
 * formatDate(new Date('Sun May 11,2014'), 'yyyy-MM-dd') --> "2014-05-11
 * @param {Date} daterequired to be formatted
 * @param {string} string to format the date to 
 * @type {[type]}
 */
exports.formatDate = (x, y) => {
    var z = {
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
        return ((v.length > 1 ? "0" : "") + z[v.slice(-1)]).slice(-2)
    });

    return y.replace(/(y+)/g, function(v) {
        return x.getFullYear().toString().slice(-v.length)
    });
}

exports.getMonthFirstDay = () => {
	var date = new Date();
	var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	return getBasicISODate(firstDay);
}
exports.getMonthLastDay = () => {
	var date = new Date();
	var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	return lastDay;
}


exports.getRandomNumber = (multiplier) => {
	return Math.floor(Math.random() * multiplier);
} 



//NOTICE: RETURNS A FIXED STRING AS A SUBSET OR COMPLETED WITH ZEROS TO MATCH THE REQUIRED LENGTH
exports.getFixedSubstring = (string, requiredLength) => {
	var tempString = string;
	if (string.length < requiredLength) {

		for (i = string.length; i<requiredLength; i++) {
			tempString = tempString + "0";
		}
	} else if (string.length > requiredLength) {
		tempString = string.substring (0, requiredLength);
	}

	return tempString;
}

/**
 * [getCurrentTime, a global function for getting current date to seconds]
 * @return {string} [current date & time in ISO format] ex: 2021-09-02T07:10:32.689Z
 */
exports.getCurrentTime = () => {
	return new Date().toISOString();
}

/**
 * [retrieves current unix eposh time ]
 * @return {[integer]} time stamp unix eposh 
 */
exports.nowTimeStamp = () => {
	return (Math.floor(Date.now() / 1000));
}

/**
 * [changeTimeObjectID() generates mongodb ObjectID with a given time, by changing given objectID's time & setting the given time]
 * @param  {string} time     [ISO time string]
 * @param  {string} objectID [hex STRING object id to change it's time]
 * @return {string}          [changed time objectID - hex string]
 */
exports.changeTimeObjectID = (time, objectID) => {
	// convert time to unix epoch seconds
	let timePart = Math.floor((new Date(time)).getTime() / 1000).toString(16)

	objectID = String(objectID);

	//attach the non time part of the objectid to the time part
	// first 8 characters is for the seconds in hex decimal.
	let result = String(timePart) + objectID.substring(8, objectID.length);

	return result;
}








/*
	return array of the missing properties.
	return false if all properties exist
	
*/
exports.missingProperties = (properties, obj) => {

	let result = [];
	for (property of properties) {
		if (! obj.hasOwnProperty(property)) {
			result.push(property);
		}
	}

	return (result.length > 0)? result: false;

}

exports.addDays = (date, requiredDays) => {
	let result = new Date(date);
    result.setDate(result.getDate() + requiredDays);
    return result;
}


/**
 * adds field schema to object & its nested object to the end values only
 * ex: {f: 'f'} -> {f: {l: 'f', h: [{b: b, t: t, v: 'f'}]}}
 * @param  {[type]} field [description]
 * @param  {[type]} b     [description]
 * @param  {[type]} t     [description]
 * @return {[type]}       [description]
 */
function toField (field, b, t, customEdit) {
	let newField = {}
    // object
	if ( !Array.isArray (field) ) {
        for (let sFName in field) {
        	if (typeof field[sFName] != 'object') { // direct value
                // 
                //if (!customEdit(sFName, field)) {
                	newField[sFName] = {
                    	l: field[sFName],
                        h: [{
                        	b: b,
                            t: t,
                            v: field[sFName]
                        }]
                     }
                //}
                 
            } else { // object or array
            	newField[sFName] = toField(field[sFName], b, t)
            }
        }
    } 
    // array
    else {
    	newField = [];
    	for (let item of field) {
        	if (typeof item != 'object') {
            	newField.push ({
                	l: item,
                    h: [{
                    	b: b,
                        t: t,
                        v: item
                    }]
                })
            } else { // object or array 
            	newField.push (toField(item, b, t))
            }
        }
    }

    return newField;
}

exports.toFIELD = toField;

/**
 * To get fields in the last nested object 'leaf values'
 *   for direct values array participants:[{l, h}] onLeaf will be called with key = 'participants' on all items in the array
 *   onLeaf will be given key, value, index. index: is the index of this item in it's parent array, ex: addressName index=2 means the second address of person it's address name
 * @param  {[type]} objobject to be destructed
 * @param  {[type]} onLeaf    callback to be called for each end field
 * @param  {[type]} parentKey key string of each object
 * @return {[type]}           [description]
 */
exports.leafForeach = (obj, onLeaf, parentKey) => {
		
    let objKeys = Object.keys(obj);
    if ( (objKeys.includes('l') && objKeys.includes('h')) || typeof obj != 'object') {
    	// base case 
    	onLeaf(parentKey, obj, index);
        return;
    }
    
    if (!Array.isArray(obj)) {
    	for (let key of objKeys) {
        	leafForeach(obj[key], onLeaf, key, index);
        }
    } else {
    	/*for (let item of obj) {
        	leafForeach(item, onLeaf, parentKey)
        }*/
        for (let i = 0; i<obj.length; i++) {
            leafForeach(obj[i], onLeaf, parentKey, i);
        }
    }

}