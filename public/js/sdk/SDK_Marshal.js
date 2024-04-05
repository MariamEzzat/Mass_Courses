/*
	This script is for routing between services
	services including 
		FrontService(contains: get, post),
		BackEndService (contains: requestBackend),
		TasksService (contains: getTaskFullData),
		UsersService (contains: getBasicUsers)



*/
/*import * as Tasks from 'tasks/tasks.js'
import * as Users from 'users/users.js'*/


let servicesMapper = new Map([
    ["00T", Tasks.reciever],
    ["00U", Users.reciever]
]);


/*
export function request (requestArray, finalCallback) {

}*/


/*
	requestArray will contain: 
	requestArray: [
		{
			serviceID: 
			data,
			successCallback,
			failedCallback
		}
	]
	finalCallback: called after all callbacks in requestArray are called.
*/

/**
 * 
 * @function request
 * @param {*} requestArray 
 * @param {*} finalCallback 
 */
function request(requestArray, finalCallback) {

    let remaining = requestArray.length;

    for (let serviceRequest of requestArray) {
        let serviceReciever = servicesMapper.get(serviceRequest.serviceID.substr(0, 3));
        serviceReciever(
            serviceRequest.serviceID,
            serviceRequest.data,
            serviceRequest.successCallback,
            serviceRequest.failedCallback
        )
    }




}








/*
	what are the requirements for sdk marshal
	what are the communications protocol: 
		identifier, data, callbacks, final callback

*/