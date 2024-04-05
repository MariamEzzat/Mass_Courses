/* SOCKET CONNECTION */

/*
	    		****** DEVELOPMENT NOTES *******
		All this script part will be separeted with a script tag to be downloaded
		to avoid editing the same file from different branches.
*/


/*
NOTE: WE RETRIEVE COOKIES (USERNAME, TOKEN)
		THAT ARE SET BY LOGIN PAGE
		-THEN CREATE SOCKET CONNECTION  (TODO: SEND COOKIES ON CONNECTION.)
		-THEN DIRECTRY AFTER CONNECTION
			*SEND AUTHENTICATION COOKIES FOR THE SERVER
			 TO CREATE ACCESS FOR FURTHER ACTIONS

*/

var authenticationState = false;

/**
 * 
 * @function setCookie
 * @param {*} cname 
 * @param {*} cvalue 
 * @param {*} exdays 
 */
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * 
 * @function getCookie
 * @param {*} name 
 * @returns *notfound*
 */
function getCookie(name) {
    // Split cookie string and get all individual name=value pairs in an array
    var cookieArr = document.cookie.split(";");

    // Loop through the array elements
    for (var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        /* Removing whitespace at the beginning of the cookie name
        and compare it with the given string */
        if (name == cookiePair[0].trim()) {
            // Decode the cookie value and return
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return "*notfound*";
}

/**
 * @var {object} dataToSend
 */
var dataToSend = {
    username: getCookie("username"),
    token: getCookie("token")
};

/*console.log("dataToSend: " + JSON.stringify(dataToSend));
 */

if (dataToSend.username == "*notfound*" || dataToSend.token == "*notfound*") {
    console.log("notfound");
    //TODO: REDIRECT TO LOGIN PAGE AND CHECK IF COOKIES ARE NOT ENABLED 
}




var socket = io.connect(window.location.origin);

console.log("url check :"+ window.location.origin);

//CONNECT THEN AUTHENTICATE.
socket.on("connect", () => {
    //console.log(dataToSend);
    // send a message to all the connected clients.
    socket.emit("authenticate", dataToSend);
    //Start listening for socket events 
    socket.on("authentication result", (respond) => {
        console.log("Auth result: " + JSON.stringify(respond));
        console.log("data result: " + JSON.stringify(dataToSend));
        if (respond.status == "SUCCESS") {
            //NOTICE: HERE SERVER VALIDATED SOCKET CONNECTION.
        } else {
            window.location.replace("./instructor_login.html");
        }
    });
});



socket.on('action respond', (respond) => {
    console.log(respond);
});

socket.on('data changed', (respond) => {
    console.log("Data Changed notification, data: " + JSON.stringify(respond));
})



//
/*	
	** MAPPING RESPONDS TO THE ASSIGNED CALLBACK **

	IMPORTANT NOTICE: 
	 DUE TO THE ABSTRACT TRANSEIVING IN SOCKET CONNECTION
	 WE CREATE ARRAY FOR  SERVICES REQUESTS AND MAP THE RESPOND WITH THE
	 CORROSPONDING CALLBACK MAPPED TO THE REQUEST ID IN THE ARRAY
*/
/**
 * -  MAPPING RESPONDS TO THE ASSIGNED CALLBACK **
 * IMPORTANT NOTICE: 
 *  DUE TO THE ABSTRACT TRANSEIVING IN SOCKET CONNECTION
 * WE CREATE ARRAY FOR  SERVICES REQUESTS AND MAP THE RESPOND WITH THE
 * CORROSPONDING CALLBACK MAPPED TO THE REQUEST ID IN THE ARRAY
 */
var respondsCallbacks = new Map();
var requestsCounts = 0;
var remainingRequests = 0;

/*function serviceRequest(serviceID, envelope, callback) {
    //NOTICE: HERE WE ENVELOPE THE REQUEST DATA AND ATTACH AN ID FOR THIS REQUEST
    //			TO RETRIEVE THE CALLBACK FOR THIS REQUEST WHEN THE RESPOND HAS BEEN RECIEVED.

    requestsCounts++;
    remainingRequests++;
    var bigEnvelope = {
        serviceID: serviceID,
        requestID: requestsCounts,
        user: { //TODO: CHECK FOR TIME OUT AND VALIDITY OF TOKEN IF POSSIBLE
            username: getCookie("username"),
            token: getCookie("token")
        },
        data: envelope
    }
    console.log("Service Request: final envelope: " + JSON.stringify(bigEnvelope));
    socket.emit('service', bigEnvelope);
    respondsCallbacks.set(requestsCounts, callback); //adding id as the request count.
}

socket.on('service respond', (recievedEnvelope) => {
    respondsCallbacks.get(recievedEnvelope.requestID)(recievedEnvelope); 
    respondsCallbacks.delete(recievedEnvelope.requestID);
    remainingRequests--;
});*/


// to save starting time of each request.
let requestsStartTime = new Map();



/*
    recieves services array & next
    services array: [
        {servicesID, data},..
    ]
    responds by calling next with servicesResponds array
    servicesResponds: [
        {servicesID, status, data}
    ]
*/
/**
 *
 * @function servicesRequests 
 * @param {*} servicesArray 
 * @param {*} next 
 */
export function servicesRequests(servicesArray, next) {

    requestsCounts++;
    remainingRequests++;
    var bigEnvelope = {
        requestID: requestsCounts,
        user: { //TODO: CHECK FOR TIME OUT AND VALIDITY OF TOKEN IF POSSIBLE
            username: getCookie("username"),
            token: getCookie("token")
        },
        services: servicesArray
    }
//console.log(bigEnvelope);
    //console.log("Requesting a service: request array: " + JSON.stringify(servicesArray) );

    socket.emit('services requests', bigEnvelope);

    respondsCallbacks.set(requestsCounts, next); //adding id as the request count.
    requestsStartTime.set(requestsCounts, performance.now());
}
/*
    envelope contains the servicesResponds array without initial services array
*/
/**
 *envelope contains the servicesResponds array without initial services array
 */
socket.on("services responds", (recievedEnvelope) => {
    //console.log(recievedEnvelope);
    //try {
        let servicesIDs = "(";
        for (let service of recievedEnvelope.servicesResponds) {
            servicesIDs += (service.serviceID + ", ");
        }
        servicesIDs = servicesIDs.slice(0, -2);
        servicesIDs += ")";

        let requestTimeTaken = (performance.now() - requestsStartTime.get(recievedEnvelope.requestID)).toFixed(2);
        console.log("Monitor: " + servicesIDs + "\n" + JSON.stringify(recievedEnvelope.Monitor) + "\n" + "{\"RTT\":\"" + requestTimeTaken + "ms\"}");

        respondsCallbacks.get(recievedEnvelope.requestID)(recievedEnvelope);
        respondsCallbacks.delete(recievedEnvelope.requestID);
        requestsStartTime.delete(recievedEnvelope.requestID);
        remainingRequests--;
/*
    } catch (e) {
        console.log (e);
        console.log (respondsCallbacks.get(5))
        console.log ('recievedEnvelope: ' + JSON.stringify(recievedEnvelope))
    }*/
});


if (navigator.servcieWorker) {
    navigator.serviceWorker.register('/sw.js');

    navigator.serviceWorker.addEventListener( 'message', event => {
        console.log ('SERVICE WORKER MESSAGE: event') 
        console.log (event);
    })
}