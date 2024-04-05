/*
	NOTE: THIS JS IS TO MAP THE IDs TO ITS SERVICE AND RETURNS IT'S RECIEVER FUNCTION.

	ID PATTER CONSISTS OF: FIRST 3 DIGITS IS FOR THE MAIN SERVICE 
		LAST 2 DIGITS IS FOR THE INTERNAL SERVICE OR ACTION INSIDE THE SERVICE
		WE MAP HERE BY THE FIRST 3 DIGITS ONLY WHICH ARE NUMBERS AND CAPITAL OR SMALL LETTER

	TASKS SERVICE ID = 00T 00
*/
let Courses = require("./courses/Courses.js");
let Users = require("./users/Users.js");
let Notification = require("./courses/notification/notification.js");

/*
	TODO: IT'S BETTER TO BE HASH MAP ******

*/

/*var servicesMap = new Map();

servicesMap.set('00T', {
	name: "TASKS",
	key: "00T"
});
servicesMap.set('00U', {
	name: "USERS",
	key: "00U"
})

exports.getRequesterBySID = (serviceID) => {
	console.log("Services mapper serviceID: " + serviceID + ", obj: " + JSON.stringify(servicesMap.get(serviceID)));
	let coteIdentifier = JSON.parse(JSON.stringify(servicesMap.get(serviceID)));
	var requester = new Cote.Requester(coteIdentifier);
	return requester;
}
*/

let servicesMap = new Map([
    [
        "00C", Courses.reciever
    ],
    [
        '0CR', Courses.reciever
    ],
    [
        '00U', Users.reciever
    ],
    [
        '00N', Notification.reciever
    ]

]);
/*
servicesMap.set("00T", Tasks.reciever);
servicesMap.set("00U", Users.reciever);
*/
/**
 * @function getServiceReciever 
 * @param {*} serviceID 
 */
exports.getServiceReciever = (serviceID) => {
    return servicesMap.get(serviceID);
}