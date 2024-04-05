/*
	SERVICE ID: 00T
	SCRIPT FOR FRONT END TASKS SERVICE
		-SUBMITS NEW TASK TO SERVER
		-VALIDATE TASK
		-VIEW TASKS LIST
		-LOG TASK PROGRESS
*/

import { retrieveNewTaskInputs, fillNewTaskPreData, clearNewTaskInputs } from '../frontEnd/projects/tasks/newTask.js';
import { GETspecificTask } from '../frontEnd/projects/tasks/taskList.js';
import { fillTaskLogProgressData } from '../frontEnd/projects/tasks/logProgress.js';
import { missingProperties } from '../sdk/sdkUtils.js';
import {
    runLoadingAnimation,
    stopLoadingAnimation,
    notifyResult
} from '../frontEnd/global.js';
import { servicesRequests } from '../connection.js';
$('#newTask_form').submit((e) => { e.preventDefault(); });




// WILL CONTAIN ALL FETCHED TASKS UNTILL CHANGE NOTIFIED FROM THE SERVER
// KEY: WILL BE THE ID OF THE TASK, VALUE: TASK DATA
//let reUsingTasksList = new Map();




/*
	REUSING DATA HERE
	
	TASKS LIST OBJECT


*/

class Cache {
    constructor(users, tasks) {
        this.usersList = users;
        this.validUsers = false;

        this.tasksList = tasks;
        this.validTasks = false;
    }
    set users(usersList) {
        this.validUsers = true;
        this.usersList = usersList;
    }
    set tasks(tasksList) {
        this.tasksList = true;
        this.validTasks = true;
    }

    get users() {
        return this.usersList;
    }
    get tasks() {
        return this.tasksList;
    }





    getUsersIdentifiers() {
        if (!this.validUsers) {
            // here if there is a ttl or notified via affectedUsers
        }
        return this.usersList;
    }
    updateUsersIdentifiers(usersList) {
        this.usersList = usersList;
        this.validUsers = true;
    }

}
let cache = new Cache([]);




let globalNewTaskPreData;

function isValidNewTaskInputs(taskData) {
    let errMsg = "";
    if (taskData.name == "") errMsg += "Name is required<br/>";
    /*if (taskData.category == "") errMsg += "Category is required<br/>";
    if (!taskData.hasOwnProperty('project') || taskData.project == '') {
        if (!taskData.hasOwnProperty('type') || taskData.type == '') {
            errMsg += 'Project or Type is required';
        }
    }
    if (taskData.timePlanning.deadline == "") errMsg += "Deadline is required<br/>";
    if (taskData.timePlanning.estimatedTime.hours == "") errMsg += "Estimated hours is required<br/>";
    if (taskData.timePlanning.estimatedTime.endDate == "") errMsg += "Estimated end date is required<br/>";
    if (taskData.responsibilities.assignedFrom == "") errMsg += "Assigned from is required<br/>";
    */
    if (taskData.responsibilities.assignedTo == "") errMsg += "Assigned to is required<br/>";
    /*
        let participants = taskData.responsibilities.participants;
        if (!Array.isArray(participants)) errMsg += "Participants is required<br/>";
        else if (Array.isArray(participants)) {
            if (participants.length == 0)
                errMsg += "Participants is required<br/>";
        }

        let observers = taskData.responsibilities.observers;
        if (!Array.isArray(observers)) errMsg += "Observers is required<br/>";
        else if (Array.isArray(observers)) {
            if (observers.length == 0)
                errMsg += "Observers is required<br/>";
        }
    */

    if (errMsg != "") {
        notifyResult(false, errMsg);
        return false;
    }
    return true;
}

export function submitNewTask(givenTaskData) {
    /*
    	TODO: VALIDATE VALUES 
    */

    let taskData = givenTaskData == undefined ? retrieveNewTaskInputs() : givenTaskData;
    if (!isValidNewTaskInputs(taskData)) {
        return;
    }

    runLoadingAnimation("Submitting task: " + taskData.name);


    function hasNewCategory(category) {
        if (globalNewTaskPreData == undefined) return false;
        for (let cat of globalNewTaskPreData.categories) {
            if (cat == category) return false;
        }
        return true;
    }

    function hasNewProject(project) {
        return false;
        /*
        for (let proj of globalNewTaskPreData.projects) {
            if (proj == project) return false;
        }
        return true;
        */
    }
    taskData["hasNewProject"] = hasNewProject(taskData.project) ? "TRUE" : "FALSE";
    taskData["hasNewCategory"] = hasNewCategory(taskData.category) ? "TRUE" : "FALSE";

    let newTaskEnvelope = {
        taskData: taskData
    };
    /*
        function onServiceRespond(recievedEnvylop) {
            notifyResult (true, "Task submitted successfully.", () => {clearNewTaskInputs();});
            
            stopLoadingAnimation();
            //TODO: DO POST SUBMIT TASK INFORMING ACTION.

        }*/

    //serviceRequest("00T02", newTaskEnvelope, onServiceRespond); //00T01 IS THE SERVICE ID FOR CREATE NEW TASK, WHERE 00T IS TASKS SERVICE ID

    let servicesArray = [
        { serviceID: "00T02", data: taskData }
    ]

    function postServicesResponds(recievedEnvelope) {
        for (let service of recievedEnvelope.servicesResponds) {
            if (service.status != "SUCCESS") {
                stopLoadingAnimation();
                notifyResult(false, " Error while submitting task, contact administrator");
                return;
            }

            notifyResult(true, "Task submitted successfully.", () => { clearNewTaskInputs(); });

            stopLoadingAnimation();
        }
    }
    servicesRequests(servicesArray, postServicesResponds);

}

export function loadNewTaskData() {

    runLoadingAnimation("Loading ...");

    /*    serviceRequest("00T01", {}, (recievedEnvelope) => {
            console.log("LoadNewTaskData recieved respond data: " + JSON.stringify(recievedEnvelope));
            let preData = {
            	categories: recievedEnvelope.data.categories,
            	projects: recievedEnvelope.data.projects
            }
            globalNewTaskPreData = preData;
            fillNewTaskPreData(recievedEnvelope.data);
            stopLoadingAnimation();

    	});*/

    let servicesArray = [
        { serviceID: "00T01", data: {} }
    ];
    if (cache.validUsers == false) {
        servicesArray.push({
            serviceID: "00U01",
            data: {}
        });
    }

    function postServicesResponds(recievedEnvelope) {
        // first check if users list is responded
        for (let service of recievedEnvelope.servicesResponds) {
            if (service.serviceID == "00U01") { // users
                if (service.status != "SUCCESS") {
                    notifyResult(false, "Error: USERS, contact administrator");
                    break;
                }
                cache.updateUsersIdentifiers(service.data);
            }
        }

        for (let service of recievedEnvelope.servicesResponds) {

            if (service.serviceID == "00T01") {
                if (service.status != "SUCCESS") {
                    stopLoadingAnimation();
                    notifyResult(false, "Error: task preData, contact administrator");
                    break;
                }
                let preData = {
                    categories: service.data.categories,
                    projects: service.data.projects,
                    priorities: service.data.priorities,
                    users: cache.getUsersIdentifiers()
                }
                globalNewTaskPreData = preData;
                fillNewTaskPreData(preData);
                stopLoadingAnimation();
            }
        }
    }

    servicesRequests(servicesArray, postServicesResponds);

}






/* LOG PROGRESS */



/*
	this function send request to server to recieve tasks list for this user
	recieved data will have:
	respond: {
			status: "SUCCESS/FAILED",
			data: {
				tasksList: [
					{one task data}, ..
				]
			}
		}
*/
let globalTasksList = [];

function loadTasksListLogProgress(next) { // next Arg will be task ID as next is the select specific task after submitting log and refreshing all the data.
    runLoadingAnimation("Loading ...");

    let servicesArray = [
        { serviceID: "00T03", data: {} }
    ];
    if (cache.validUsers == false) {
        servicesArray.push({
            serviceID: "00U01",
            data: {}
        });
    }


    function postServicesResponds(envelope) {
        let servicesResponds = envelope.servicesResponds;

        // first check if users list is responded
        for (let service of servicesResponds) {
            if (service.serviceID == "00U01") { // users
                if (service.status != "SUCCESS") {
                    notifyResult(false, "Error: USERS, contact administrator");
                    break;
                }
                cache.updateUsersIdentifiers(service.data);
                break;
            }
        }

        for (let service of servicesResponds) {
            if (service.serviceID == "00T03") {
                if (service.status != "SUCCESS") {
                    stopLoadingAnimation();
                    notifyResult(false, "Error, tasks list, contact administrator");
                    return;
                }

                let tasksList = [];
                for (let task of service.data) {
                    tasksList.push({ taskID: task._id, taskName: task.taskData.description.name });

                }
                //fillTaskListLogProgress (tasksList);
                globalTasksList = tempFormatTasksList(service.data);


                if (next != undefined) {
                    next();
                }

                stopLoadingAnimation();
            }

        }
    }

    servicesRequests(servicesArray, postServicesResponds);

    // temporary
    function getVisualNameByUserID(userID, usersList) {
        for (let user of usersList) {
            if (user.userID == userID) return user.visualName;
        }
        return "unknown";
    }

    function tempFormatTasksList(respond) {
        let tasksList = respond;
        let formattedTasksList = [];
        for (let task of tasksList) {
            let subTasks = calculateSubtasksState(task.taskData.subTasks, task.taskData.logs);
            let state = calculateState(task.taskData.logs, task.taskData.subTasks);
            let from = getVisualNameByUserID(task.taskData.responsibilities.from, cache.getUsersIdentifiers());
            let to = getVisualNameByUserID(task.taskData.responsibilities.to, cache.getUsersIdentifiers());
            let tempTask = {
                id: task._id,
                taskData: {
                    name: task.taskData.description.name,
                    deadline: task.taskData.time.deadline,
                    estimatedTime: task.taskData.time.estimation.amount + " Hrs, From:[" + task.taskData.time.estimation.start + "], To:[" + task.taskData.time.estimation.end + "]",
                    from: from,
                    to: to,
                    state: state,
                    subTasks: subTasks,
                    logs: task.taskData.logs
                }
            }
            formattedTasksList.push(tempTask);
        }
        return formattedTasksList;
    }

}


/*	HERE WE SEARCH ON GLOBAL TASKS LISTS CUZ THIS FUNCTION WILL ONLY CALLED AFTER LOADING TASKS LIST
 */
function selectTaskLogProgress(taskID) {
    for (let task of globalTasksList) {
        if (taskID == task.id) {
            fillTaskLogProgressData(task);
            return;
        }
    }
    notifyResult(false, "Error, contact administrator");
}

// THIS FUNCTION SEARCHS IN THE TASK SUBTASKS LIST AND RETURNS TRUE IF FOUND
function hasNewSubTask(taskID, subTask) {
    if (subTask == "") return false;
    for (let task of globalTasksList) {
        if (taskID == task.id) {
            for (let mSubTask of task.taskData.subTasks) {
                if (subTask == mSubTask) {
                    return false;
                }
            }
            return true; //here we searched and didn't found the sub task in subtasks list
        }
    }
    // TASK NOT FOUND, HAZARD POINT.
    notifyResult(false, "Error while selecting task, contact administrator");
    return false;
}

function isValidLogProgressInputs(logInputs) {
    let errMsg = "";
    if (logInputs.date == "") errMsg += "Date is required<br/>";
    if (logInputs.hours == "") errMsg += "Hours is required<br/>";
    if (logInputs.percentage == "") errMsg += "Percentage is required<br/>";
    if (logInputs.subTask == "") errMsg += "SubTask is required<br/>";
    if (logInputs.location == "") errMsg += "Location is required<br/>";

    if (errMsg != "") {
        notifyResult(false, errMsg);
        return false;
    }
    return true;
}

// TODO: IMPLEMENT AFTER IMPLEMENTING TASKS LIST CACHING
function taskValidForLogProgress(taskID) {
    return true;
}

export function submitTaskLogProgress(LogObjData) {

    runLoadingAnimation("Submitting Progress");

    let log = LogObjData /* retrieveTaskLogProgressInputs() */ ;
    if (!isValidLogProgressInputs(log)) {
        stopLoadingAnimation();
        console.log("invalid");
        return;
    }
    /*log.hasNewSubTask = hasNewSubTask(log.taskID, log.subTask)? "TRUE": "FALSE";*/

    if (!taskValidForLogProgress(log.taskID)) {
        stopLoadingAnimation();
        console.log("Task state is not in progress");
        notifyResult(false, "This task is not In-Progress");
        return;
    }

    //AU	log.affectedUsers = [{userID:"5fe8393478e2417e81900822", data:"from fejs to omarA"}, {userID:"5feaec23ccac1aeffe321a98", data:"from fejs to devdev"}];

    //serviceRequest ("00T04", log, postServiceRequest);



    let servicesArray = [{
        serviceID: "00T04",
        data: log
    }];

    function postServicesResponds(envelope) {
        stopLoadingAnimation();
        let servicesResponds = envelope.servicesResponds;
        if (!Array.isArray(servicesResponds)) {
            notifyResult(false, "Error: no servicesResponds, contact administrator");
            return;
        }
        for (let service of servicesResponds) {
            if (service.serviceID == "00T04") {
                if (service.status != "SUCCESS") {
                    if (JSON.stringify(service.data) == "Task is not In-Progress")
                        notifyResult(false, "Task is NOT In-Progress");
                    else
                        notifyResult(false, service.data.userMsg);
                    return;
                }

                function postNotify() {
                    // HERE THE USER CLICKED ON ONTINUE AND WE WILL PROCEED WITH LOADING TASKS LIST AGAIN, AND SELECT CURRENT TASK


                    function postLoadTasks() { selectTaskLogProgress(log.taskID); }
                    loadTasksListLogProgress(postLoadTasks);
                }
                notifyResult(true, "New log submitted successfully", postNotify);
                return;
            }
        }
    }

    servicesRequests(servicesArray, postServicesResponds);


}

/* ***** LOG PROGRESS END ****** */





/* ***** TASKS LIST START ****** */


/*WILL:
	 FORMAT TASKS ACCORDING TO THE DOCUMENTATION OF JSON OBJECTS
	 CALCULATE PROGRESS AND STATE OF EACH TASK
*/
function formatTasksListForTasksTable(tasksList) {
    function calculateProgress(taskLogs) { //returns string: (In-Progress:40% (hours)) (Completed:100%) (No Progress)
        let percent = 0;
        let hours = 0;
        for (let log of taskLogs) {
            percent += parseFloat(log.percentage);
            hours += parseFloat(log.hours);
        }
        let result = "No Progress";
        if (percent > 0) {
            result = "(" + hours + " Hours done)";
        }
        return result;
    }
    let result = {
        users: cache.getUsersIdentifiers(),
        tasks: []
    };
    for (let task of tasksList) {
        let formattedTask = {
            id: task._id,
            submitter: task.submitter,
            submitDate: task.submitDate,
            progress: calculateProgress(task.taskData.logs),
            state: calculateProgress(task.taskData.logs),
            taskData: task.taskData
        }
        formattedTask.taskData.subTasks = calculateSubtasksState(task.taskData.subTasks, task.taskData.logs);
        formattedTask.state = calculateState(task.taskData.logs, formattedTask.taskData.subTasks);
        formattedTask.progress = calculateState(task.taskData.logs, formattedTask.taskData.subTasks);

        formattedTask.taskData.description.state = formattedTask.state;

        result.tasks.push(formattedTask);
    }
    return result;
}

function loadTasksList() {

    runLoadingAnimation("Loading Tasks");

    /*	function postServiceRequest (recievedEnvelope) {
    		if (recievedEnvelope.respond.status != "SUCCESS") {
    			notifyResult (false, "Error while retrieving tasks, contact administrator");
    			return;
    		}
    		// HERE WE FORMAT RECIEVED TASKS LIST THEN CALL fillTasksListTable
    		let respond = recievedEnvelope.respond;
    		fillTasksListTable(formatTasksListForTasksTable(respond));
    		stopLoadingAnimation();
    	}*/



    //serviceRequest ("00T05", {}, postServiceRequest);

    let servicesArray = [{
        serviceID: "00T05",
        data: {}
    }];

    if (!cache.validUsers) {
        servicesArray.push({
            serviceID: "00U01",
            data: {}
        });
    }

    function postServicesResponds(envelope) {
        // here backend responded with an object containing servicesResponds list
        let servicesResponds = envelope.servicesResponds;
        if (!Array.isArray(servicesResponds)) {
            notifyResult(false, "Error: no servicesResponds, contact administrator");
            return;
        }

        // first check if users list is responded
        for (let service of servicesResponds) {
            if (service.serviceID == "00U01") { // users
                if (service.status != "SUCCESS") {
                    notifyResult(false, "Error: USERS, contact administrator");
                    break;
                }
                cache.updateUsersIdentifiers(service.data);
            }
        }

        for (let service of servicesResponds) {
            if (service.serviceID == "00T05") {
                if (service.status != "SUCCESS") {
                    notifyResult(false, "Error: TASKS, contact administrator");
                    break;
                }
                fillTasksListTable(formatTasksListForTasksTable(service.data));
                globalTasksList = tempFormatTasksList(service.data);
                stopLoadingAnimation();
            }
        }
    }




    servicesRequests(servicesArray, postServicesResponds);



}



export function calculateSubtasksState(subtasks, logs) {
    let subtasksMap = new Map();
    for (let subtask of subtasks) {
        let subTaskName = subtask.name.trim();

        subtasksMap.set(
            subTaskName, {
                logHours: new Number(0.00),
                percentage: new Number(0.00),
                name: subtask.name,
                type: subtask.type,
                hours: subtask.hours,
                _id: subtask._id,
                notes: subtask.notes
            });
    }

    let result = [];
    for (let log of logs) {
        let subTask = subtasksMap.get(log.subTask);
        try {
            subTask.logHours += parseFloat(log.hours);
            subTask.percentage += parseFloat(log.percentage);
        } catch (e) {
            //console.log("catched err: " + JSON.stringify(e.message) + ", subTask: " + JSON.stringify(subTask) + ", log: " + JSON.stringify(log));

        }

    }

    let formattedSubTasks = [];
    for (let subTask of subtasksMap.entries()) {
        formattedSubTasks.push({
            name: subTask[1].name,
            hours: parseFloat(subTask[1].hours).toFixed(1),
            type: subTask[1].type,
            logHours: parseFloat(subTask[1].logHours).toFixed(1),
            percentage: subTask[1].percentage.toFixed(0),
            notes: subTask[1].notes,
            _id: subTask[1]._id,
        });
    }
    //console.log("subTasks after caclulating state: " + JSON.stringify(formattedSubTasks));
    return formattedSubTasks;
}

function tempFormatTasksList(respond) {
    let tasksList = respond;
    let formattedTasksList = [];

    for (let task of tasksList) {
        let subTasks = calculateSubtasksState(task.taskData.subTasks, task.taskData.logs);
        let state = calculateState(task.taskData.logs, subTasks);
        let from = getVisualNameByUserID(task.taskData.responsibilities.from, cache.getUsersIdentifiers());
        let to = getVisualNameByUserID(task.taskData.responsibilities.to, cache.getUsersIdentifiers());
        let tempTask = {
            id: task._id,
            taskData: {
                name: task.taskData.description.name,
                deadline: task.taskData.time.deadline,
                estimatedTime: task.taskData.time.estimation.amount + " Hrs, From:[" + task.taskData.time.estimation.start + "], To:[" + task.taskData.time.estimation.end + "]",
                from: from,
                to: to,
                state: state,
                subTasks: subTasks,
                logs: task.taskData.logs
            }
        }
        formattedTasksList.push(tempTask);
    }
    //console.log ("SDK tasksList: " + JSON.stringify(formattedTasksList));
    return formattedTasksList;
}


function getVisualNameByUserID(userID, usersList) {
    for (let user of usersList) {
        if (user.userID == userID) return user.visualName;
    }
    return "unknown";
}

export function calculateState(taskLogs, subTasks) { //returns string: (In-Progress:40% (hours)) (Completed:100%) (No Progress)
    subTasks = calculateSubtasksState(subTasks, taskLogs);
    let percent = 0;
    let hours = 0;
    if (Array.isArray(taskLogs)) {
        for (let log of taskLogs) {
            percent += parseFloat(log.percentage);
            hours += parseFloat(log.hours);
        }
    }

    let totalSubTasksEstHours = parseFloat(0.0);

    for (let subTask of subTasks) {
        totalSubTasksEstHours += parseFloat(subTask.hours);
    }

    let totalTaskStatePerc = parseFloat(0.0);




    for (let subTask of subTasks) {
        let subTaskPercentage = parseFloat((subTask.percentage > 100 ? 100 : subTask.percentage));

        totalTaskStatePerc += parseFloat((subTaskPercentage / 100) * (subTask.hours / totalSubTasksEstHours));


    }
    totalTaskStatePerc *= 100.00;
    totalTaskStatePerc = totalTaskStatePerc.toFixed(1);
    hours = hours.toFixed(1);
    /*
    	console.log ( "--------totalSubTasksEstHours: " + JSON.stringify(totalSubTasksEstHours) 
    		+ ", totalTaskStatePerc " + JSON.stringify(totalTaskStatePerc) );*/




    let result = {
        show: "No Progress",
        percentage: '0'
    };
    if (percent > 0) {
        if (totalTaskStatePerc >= 100) {
            result = {
                hours: hours,
                percentage: totalTaskStatePerc
            };
        } else {
            result = {
                hours: hours,
                percentage: totalTaskStatePerc
            };
        }
        /*
        		result = "In-Progress:( " + hours.toFixed(1) + "Hrs )";
        */
    }
    return result;
}





/* ***** TASKS LIST END ****** */












/* ******** SUB TASKS START ****** */



/*
 addSubtask:
 	push subtask to server then
	retrieve subTasks from server in both cases
	notify result
 	call fillSubTasksList (subTasks)

*/

export function addSubTask(subTask) {
    // validation: 
    let missing = missingProperties(["taskID", "name", "hours", "type"], subTask);
    if (missing !== false) {
        console.log("subTask given to addSubTask is not valid");
        notifyResult(false, "Error, contact administrator");
        return;
    }
    if (subTask.name == "") {
        notifyResult(false, "Subtask name required");
        return;
    }
    if (subTask.hours == "") {
        notifyResult(false, "Subtask estimation required");
        return;
    }
    if (subTask.type == "") {
        notifyResult(false, "Subtask type required");
        return;
    }



    // constants
    let SERVICE_ID = "00T06";
    let ERROR_MSG = "Can't submit subtask";
    let SUCCESS_MSG = "SubTask submitted successfully";


    //service request
    let servicesArray = [{
        serviceID: SERVICE_ID, // insert subtask
        data: subTask
    }];

    function postServicesResponds(envelope) {
        for (let service of envelope.servicesResponds) {
            if (service.serviceID == SERVICE_ID) {
                stopLoadingAnimation();
                if (service.status != "SUCCESS") {
                    notifyResult(false, ERROR_MSG + ", " + JSON.stringify(service.data));

                } else {
                    notifyResult(true, SUCCESS_MSG);
                }

                GETspecificTask(document.querySelector('#taskView #taskView_taskID').value);
                return;
            }
        }
    }

    servicesRequests(servicesArray, postServicesResponds);
}

/*
function retrieveSubTasks (taskID) {
	//validation
	let ERROR_FE_MSG = "Error (retrieveSubtasks), contact administrator";
	if (taskID == "") {
		notifyResult(false, ERROR_FE_MSG);
		console.log (ERROR_FE_MSG + ", taskID empty");
		return;
	}

	runLoadingAnimation();

	// constants
	let SERVICE_ID = "00T07";
	let ERROR_MSG = "Can't retrieve subtasks";
	let SUCCESS_MSG = "Subtasks retrieved successfully";

	// service request
	//service request
	let servicesArray = [
		{
			serviceID: SERVICE_ID, // insert subtask
			data: {taskID: taskID}
		}
	];

	function postServicesResponds (envelope) {
		for (let service of envelope.servicesResponds) {
			if (service.serviceID == SERVICE_ID) {
				if (service.status != "SUCCESS") {
					notifyResult (false, ERROR_MSG + ", " + JSON.stringify(service.data));
				} else {
					refreshTaskView();
				}
				stopLoadingAnimation();
				return;
			}
		}
	}


	servicesRequests (servicesArray, postServicesResponds);


}
*/




export function removeSubTask(subTaskIdentifier) {
    // VALIDATION
    let ERROR_FE_MSG = "Error (removeSubTask), contact administrator";
    let missing = missingProperties(["taskID", "name"], subTaskIdentifier);
    if (missing !== false) {
        console.log(ERROR_FE_MSG + ", subTaskIdentifier missing: " + JSON.stringify(missing));
        notifyResult(false, ERROR_FE_MSG);
        return;
    }
    runLoadingAnimation();

    // CONSTANTS
    let SERVICE_ID = "00T08";
    let ERROR_MSG = "Can't remove subtask";
    let SUCCESS_MSG = "Subtask removed successfully";


    // SERVICE REQUEST
    let servicesArray = [{
        serviceID: SERVICE_ID, // insert subtask
        data: subTaskIdentifier
    }];

    function postServicesResponds(envelope) {
        for (let service of envelope.servicesResponds) {
            if (service.serviceID == SERVICE_ID) {
                if (service.status != "SUCCESS") {
                    notifyResult(false, ERROR_MSG + ", " + JSON.stringify(service.data));

                } else {
                    notifyResult(true, SUCCESS_MSG);

                }
                stopLoadingAnimation();
                GETspecificTask(document.querySelector('#taskView #taskView_taskID').value);
                return;
            }
        }
    }

    servicesRequests(servicesArray, postServicesResponds);

}



/*
function submitNewStateLogProgress (taskID, stateName) {
	// VALIDATION
	let ERROR_FE_MSG = "Error (submitNewStateLogProgress), contact administrator";
	if (taskID == "" || stateName == "") {
		console.log (ERROR_FE_MSG + ", invalid taskID or stateName");
		notifyResult(false, ERROR_FE_MSG);
		return;
	}

	runLoadingAnimation();

	// CONSTANTS
	let SERVICE_ID = "00T10";
	let ERROR_MSG = "Can't submit new state, contact administrator";
	let SUCCESS_MSG = "Task state updated successfully";


	// SERVICE REQUEST
	let servicesArray = [
		{
			serviceID: SERVICE_ID, // insert task state.
			data: {
				taskID: taskID,
				name: stateName
			}
		}
	];

	function postServicesResponds (envelope) {
		for (let service of envelope.servicesResponds) {
			if (service.serviceID == SERVICE_ID) {
				if (service.status != "SUCCESS") {
					console.log (ERROR_MSG + ", submitting new task state err: " + JSON.stringify(service.data));
					notifyResult (false, ERROR_MSG + ", " + JSON.stringify(service.data));
					
				} else {
					notifyResult (true, SUCCESS_MSG);

				} 
				stopLoadingAnimation();
				retrieveTaskLogProgressInputs();
				return;
			}
		}
	}

	servicesRequests (servicesArray, postServicesResponds); 

}
*/