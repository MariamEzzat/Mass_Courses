/*
	users.js:
		an SDK users responsible.
		role: 
			cache users,

*/

/**
 * - TODO: update updater when notifyAffected functionality is up
 * @var {object} cachedUsers
 */
let cachedUsers = {
    isValid: false,
    users: [],
    /**
     * - will use requestBackEnd and respond with the users list on success.
     * - TODO: IMPLEMENT isValid only in case of true respond
     * @function getUsers
     * @param {*} success 
     * @param {*} fail 
     */
    getUsers: (success, fail) => {
        /*
        	will use requestBackEnd and respond with the users list on success.
        */

        //TODO: IMPLEMENT isValid only in case of true respond
        isValid: true;
    }

    //TODO: update updater when notifyAffected functionality is up

}

/**
 * - TODO: IMPLEMENT RETRIEVING VISUAL USER_IDS & VISUAL NAMES
 * @function getBasicUsers - public/users.js
 * @param {*} data 
 * @param {*} success 
 * @param {*} fail 
 */
function getBasicUsers(data, success, fail) {
    // TODO: IMPLEMENT RETRIEVING VISUAL USER_IDS & VISUAL NAMES
}