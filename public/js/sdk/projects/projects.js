/*
this script contains functions to serve the SDK for projects service.
called from front.js
*/





export function newProjectSDK(data, success, fail) {
    // TODO: CREATE NEW OBJECT FROM YET FIELD CLASS AND ADD TO IT THE GIVEN INPUTS FROM THE FORM.
    // then do magic to it insha'Allah.

    let servicesObjects = [{
        serviceID: IDENTIFIERS.PROJECTS.NEW_PROJECT,
        data: data,
        successCallback: (recieved) => {
            console.log(JSON.stringify(recieved));
            success(recieved);
        },
        failedCallback: (recieved) => {
            console.log("ERROR: " + JSON.stringify(recieved));
            fail(recieved);
        }
    }]
    requestBackEnd(servicesObjects);

}

/*


init - show inputs

edit - 

submit - 

feedback - 

init -




*/