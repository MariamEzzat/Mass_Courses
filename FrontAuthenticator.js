/** 
	*FOR INITIAL LOG IN 
	*FOR NOW WE AUTHENTICATE USING STATIC ARRAY WITH PREDEFINED CREDENTIALS
	*NEXT WE MUST AUTHENTICATE VIA CONNECTING TO THE DATABASE OR 
	*OTHER DEFINED DESIGN, & LOG LOGIN ATTEMPT
	@function verifyUser
	@argument {Array} predefinedUsers
*/

const { json } = require("body-parser");
var dbLoginHandler = require("./models/Login");
const signup=require("./models/signup")
const deleteAcc=require("./models/deleteAccount");
const predefinedUsers = [
    { username: "", email: "omar.abossrie@roots.solutions", password: "omar.abossrie" },
    { username: "test", email: "test@test.test", password: "test" },
    { username: "testtesttesttest", email: "", password: "test" }

];

function verifyUserAsAdmin(username, email, password, postVerify) {

    dbLoginHandler.getUser( //NOTICE: ASSUMING THAT WE ONLY ADD USERNAME AS EMAIL.
        {
            email: username
        },
        postDbResult
    );
    
    
    
    //Instructor Modification 
    function postDbResult(result) {
        console.log(result)

        var envelope = { status: "FAILED", reason: "nothing happened" };
        if (result == null) { //MEANS THAT THERE IS NO USER WITH THE GIVEN DATA.
            envelope.reason = "NO USER WITH THE GIVEN DATA";
            postVerify(envelope);
            return;

            //ADD A NEW OPTION INSTRUCTOR
        } else if (result.type !== 'ADMIN' ) {
            envelope.reason = "Not Admin";
        } else if (result.password == password) {
            envelope = { status: "SUCCESS", userID: result._id };
        } else if (result.password != password) {
            envelope.reason = "WRONG PASSWORD";
        } else {
            envelope.reason = "ERROR WHILE CHECKING PASSWORD MATCH";
        }
        if (result.active == 0) {
            postVerify({
                status: "FAILED",
                reason: "USER IN-ACTIVE"
            })
            return;
        }
        postVerify(envelope);

    }


}

function verifyUser(username, email, password, postVerify) {

    dbLoginHandler.getUser( //NOTICE: ASSUMING THAT WE ONLY ADD USERNAME AS EMAIL.
        {
            email: username
        },
        postDbResult
    );



   
    function postDbResult(result) {
        
        var envelope = { status: "FAILED", reason: "nothing happened" };
        if (result == null) { //MEANS THAT THERE IS NO USER WITH THE GIVEN DATA.
            envelope.reason = "NO USER WITH THE GIVEN DATA";
            postVerify(envelope);
            return;
        } else if (result.password == password) {
            envelope = { status: "SUCCESS", userID: result._id };
        } else if (result.password != password) {
            envelope.reason = "WRONG PASSWORD";
        } else {
            envelope.reason = "ERROR WHILE CHECKING PASSWORD MATCH";
        }
        if(result.active == 0) {
            postVerify({
                status: "FAILED",
                reason: "USER IN-ACTIVE"
            })
            return;
        }
        postVerify(envelope);

    }


}



function verifyUserAsInstructor(username, email, password, postVerify) {

    dbLoginHandler.getInstructorUser( //NOTICE: ASSUMING THAT WE ONLY ADD USERNAME AS EMAIL.
        {
            email: username
        },
        postDbResult
    );

   
    function postDbResult(result) {

        console.log("Res: "+ JSON.stringify(result))
        
        var envelope = { status: "FAILED", reason: "nothing happened" };
        if (result == null) { //MEANS THAT THERE IS NO USER WITH THE GIVEN DATA.
            envelope.reason = "NO USER WITH THE GIVEN DATA";
            postVerify(envelope);
            return;
        } else if (result.password == password) {
            envelope = { status: "SUCCESS", userID: result._id };
        } else if (result.password != password) {
            console.log("Wrong Password");
            envelope.reason = "WRONG PASSWORD";
        } else {
            envelope.reason = "ERROR WHILE CHECKING PASSWORD MATCH";
        }
        if(result.active == 0) {
            console.log("Inactive");
            postVerify({
                status: "FAILED",
                reason: "USER IN-ACTIVE"
            })
            return;
        }
        postVerify(envelope);

    }


}




/**
 * authenticate user credentials
 * @param  {[type]} mobile   [description]
 * @param  {[type]} password [description]
 * @return {Promise}         null if user wrong credentials
 *                                  user document if correct credentials
 */
function studentAuth (mobile, password) {

    return dbLoginHandler.studentMobileAuth(mobile, password);
}



function studentSignup(name, mobile , password){

return signup.signup(name,mobile,password);

}

function studentDeleteAccount(mobile){

    return deleteAcc.delete(mobile);
    
    }


module.exports = {
    verifyUser,
    studentAuth,
    verifyUserAsAdmin,
    verifyUserAsInstructor,
    studentSignup,
    studentDeleteAccount

}