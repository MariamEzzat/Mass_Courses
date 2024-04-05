/**
 * - return array of the missing properties.
 *	return false if all properties exist
 * @function missingProperties
 * @param {*} properties 
 * @param {*} obj 
 */
export function missingProperties(properties, obj) {

    if (obj == undefined) console.log("missingProperties: undefined obj, properties: " + JSON.stringify(properties));
    let result = [];
    for (let property of properties) {
        if (!obj.hasOwnProperty(property)) {
            result.push(property);
        }
    }

    return (result.length > 0) ? result : false;
}

export function mongoIDToISOTime(objectID) {
    return new Date(parseInt(objectID.substring(0, 8), 16) * 1000).toISOString();
}

export function hoursDifference (date1, date2) {
    let secondsDif = date1.getTime() - date2.getTime();
    return (secondsDif / (1000 * 3600))
}


/**
 * To get fields in the last nested object 'leaf values'
 *   for direct values array participants:[{l, h}] onLeaf will be called with key = 'participants' on all items in the array
 *   onLeaf will be given key, value, index. index: is the index of this item in it's parent array, ex: addressName index=2 means the second address of person it's address name
 *   
 * @param  {[type]} obj       object to be destructed
 * @param  {[type]} onLeaf    callback to be called for each end field
 * @param  {[type]} parentKey key string of each object
 * @return {[type]}           [description]
 */
export function leafForeach (obj, onLeaf, parentKey, index) {
        
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