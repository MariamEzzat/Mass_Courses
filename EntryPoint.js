const path = require('path');
const dev = require("./utils/dev");
const helpers = require("./utils/helpers");
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io");
const sIO = io(http);
const bodyParser = require('body-parser');
const { UserData } = require("./utils/models/Definitions");
const { studentDeleteAccount, studentSignup, verifyUser, studentAuth,verifyUserAsAdmin , verifyUserAsInstructor } = require("./FrontAuthenticator");
const flatted = require("flatted"); // for cyclic json objects 
const SCRIPT_NAME = "\nEntryPoint";
const FrontMarshal = require("./FrontMarshal");
const ServicesMarshal = require("./services/ServicesMarshal")
var cors = require('cors')

// resumable.js dependencies, (uploading)
const resumable = require('./libraries/resumable-node.js')('./uploads-temp/');
const multipart = require('connect-multiparty');
const crypto = require('crypto');
const fs = require("fs")
const dbLoginHandler = require("./models/Login");  //login.js
const mergeFiles = require('merge-files');
const MobileDetect = require('mobile-detect')
const webPush = require('web-push');
const { Console } = require('console');
require('dotenv').config({ path: 'variables.env' });

var connectedUsers = new Map();
/* console.log(connectedUsers); */
/** 
 *ENTRY POINT HANDLES:
 *INITIAL LOGIN
 *CREATES SOCKET 
 *	DIRECT DATA SENT FROM USER THROUGH SOCKET TO THE FRONT MARSHAL 
 *GIVES CLIENT THE CONFIGURATIONS OF THE OTHER SERVERS IN NEED 
 *	CACHE IP WHERE THE CLIENT OPENS SOCKET WITH IT 
 *	ANYOTHER FUTURE LIGHT OR NON-DEPENDENT DIRECT TRANSACTION
 *@method 
 */

// ********************** START RESUMABLE.JS DEPENDENCIES

// Host most stuff in the public folder
// __dirname : This is a Node.js environment variable that specifies the absolute path for the directory
// which contains the currently executing file.
// the public folder is now being served as static to the server.
//express.static() is the middleware that we can use to serve static files to the user.
app.use(express.static(__dirname + '/public'));

app.use(multipart());


//Uncomment to allow CORS
app.use(function (req, res, next) {
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
res.header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
   next();
});


// retrieve file id. invoke with /fileid?filename=my-file.jpg
app.get('/fileid', function (req, res) {
    console.log('1');
    if (!req.query.filename) {
        return res.status(500).end('query parameter missing');
    }
    // create md5 hash from filename
    res.end(
        crypto.createHash('md5')
            .update(req.query.filename)
            .digest('hex')
    );
});

let filesToBeReassembled = new Map();

function reassembleUploadedChunks(baseFileName, chunksCount) {
    console.log('reassble started');
    // create files from chunks count
    // return promise
    let outputDir = 'uploads/';
    let sourceDir = 'uploads-temp/';
    let outputPath = outputDir + baseFileName;
    let inputPathList = [];
    for (let i = 1; i <= chunksCount; i++) {
        inputPathList.push(`${sourceDir}resumable-${baseFileName}.${i}`)
    }
    console.log('reassmble files prepared last:', inputPathList[inputPathList.length - 1])
    return mergeFiles(inputPathList, outputPath)
}

// Handle uploads through Resumable.js
// app.post('/uploads', function(req, res) {
//     //console.log(req)
//     /*    res.sendStatus(403);
//         return;
//         */
//     //console.log (++numberOfRequests)
//     resumable.post(req, function(status, chunksNumber, oFileName, original_filename, identifier) {
//         //console.log('POST-UPLOAD', status, filename, original_filename, identifier);
//         //console.log (status);
//         if (status === 1) {
//             if (!filesToBeReassembled.has(oFileName)) {
//                 // call reassembling function 
//                 filesToBeReassembled.set(identifier, chunksNumber)
//                 reassembleUploadedChunks(identifier, chunksNumber)
//                     .then(result => {
//                         console.log('reassemble finished status: ', result)
//                         setTimeout(() => {
//                             // remove the file name from the map after time to ensure client already checked multiple times
//                             filesToBeReassembled.delete(identifier);
//                             res.send('done');
//                         }, 5000)
//                     })
//                     .catch(err => {
//                         console.log('error while assembling: ', err);
//                         res.send('invalid_resumable_request');
//                     })
//             } else {
//                 console.log('already beign reassembled')
//                 res.send('done');
//             }
//         } else {
//             res.send(status);
//         }
//     });
// });

app.post('/uploads', function (req, res) {
    console.log("post:" + req)
    resumable.post(req, function (status, oFileName, original_filename, identifier, chunksNumber) {
        console.log('status',status)
        res.send(status);
        if (status === "done") {
            if (!filesToBeReassembled.has(oFileName)) {
                // call reassembling function 
                filesToBeReassembled.set(identifier, chunksNumber)
                reassembleUploadedChunks(identifier, chunksNumber)
                    .then(result => {
                        console.log('reassemble finished status: ', result)
                        setTimeout(() => {
                            // remove the file name from the map after time to ensure client already checked multiple times
                            filesToBeReassembled.delete(identifier);
                          //  res.send('done');
                        }, 5000)
                    })
                    .catch(err => {
                        console.log('error while assembling: ', err);
                    //    res.send('invalid_resumable_request');
                    })
            } else {
                console.log('already beign reassembled')
                //res.send("partlyDone");
            }
        } else {
	    console.log('if not done',status)

           // res.send(status)
        }
    });
});

// Handle status checks on chunks through Resumable.js
app.get('/uploads', function (req, res) {

    console.log('get')
    //console.log ('3');
    // check user can upload
    // refuse check or call resumable.get();
    /*    res.sendStatus(403);
        return;
        */
    resumable.get(req, function (status, filename, original_filename, identifier) {
        //console.log('GET', status);
        //res.send((status == 'found' ? 200 : 404), status);
//res.send(status);
(status == 'found') ? res.status(200).send(status) : res.status(404).send(status) 
    });

    //resumable.post(req, function(status, chunksNumber, oFileName, original_filename, identifier) {
    //console.log('POST-UPLOAD', status, filename, original_filename, identifier);
    //console.log (status);
});

app.get('/download/:identifier', function (req, res) {
    //console.log('4')
    // TODO: implement download authentication & accept by calling download resumable
    if (req.hasOwnProperty('headers')) {
        if (req.headers.hasOwnProperty('range')) {
            console.log("range exists ", req.headers.range);
        } else {
            resumable.write(req.params.identifier, res);
            return
        }
    }
console.log('req.params.identifier',req.params.identifier)
    runFullStream(req, res, "./uploads/" + req.params.identifier);
    //resumable.write(req.params.identifier, res);
});

function runFullStream(req, res, path) {
    console.log(req.headers);

    // Ensure there is a range given for the video
    const range = req.headers.range;
    console.log("range: ", range);
    if (!range) {
        res.status(400).send("Requires Range header");
    }

    // get video stats (about 11MB)
    const videoPath = path;
    const videoSize = fs.statSync(videoPath).size;
    console.log("video size : "+videoSize)

    // Parse Range
    // Example: 'bytes=6750208-'
    const CHUNK_SIZE = 5 * 10 ** 5; // ~500 KB => 500000 Bytes
    const start = Number(range.split('-')[0].split('=')[1]); // 'bytes=6750208-' => 6750208
    //const end = Number

    let end = Number(range.split('-')[1]); //Math.min(start + CHUNK_SIZE, videoSize - 1);
    console.log("end: ", end)
    if (end == '') {
        end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    }

    console.log(start, end);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });

    // Stream the video chunk to the client
    videoStream.pipe(res);
}

app.get('/resumable.js', function (req, res) {
    var fs = require('fs');
    res.setHeader("content-type", "application/javascript");
    fs.createReadStream("../../resumable.js").pipe(res);
});

app.get('/delete/:identifier', function (req, res) {
    //console.log('4')
    // TODO: implement download authentication & accept by calling delete resumable
    resumable.clean(req.params.identifier);
});

// *********************** END RESUMABLE.JS DEPENDENCIES

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('uploads'));

app.use('/attachments', checkIfUserCanDownload, express.static(path.join(__dirname, 'attachments')))
app.get('/video/:id', (req, res) => {
    console.log("check for id: " + req.params.id);
    
    res.sendFile('uploads/' + req.params.id, { root: __dirname });
});
function checkIfUserCanDownload(one, res, next) {
    //return express.static(path.join( __dirname, 'attachments' ))
    //two.send('no access');
    //console.log (one);
    let mPath = path.join(__dirname, 'attachments/helloooo.zip');
    res.download(mPath);
    res.status(200);
    //return express.static('/attachments/hello.txt', {})
}

app.get('/', frontPage, (req, res) => {
    console.log('get landing page login');
    //dev.log("app.get callled");
    res.send("Home Page " + JSON.stringify(req.prevData));
});

app.get("/student", studentFrontPage, (req, res) => {
    // does nth
    res.send("Home Page " + JSON.stringify({ msg: "hello" }));
})

app.post('/', preHomeAuth, serveHomePage);


// each argument after the path is called in sequence. Usually, this is a way of implementing middleware 
//middleware : software between OS and the program

app.post('/inst', preInstructorHomeAuth, serveInstructorHomePage);


/* app version */
app.get("/version-auth", (req, res) => {
    let md = new MobileDetect(req.headers['user-agent'])
    //console.log(md.os());
    dbLoginHandler.appVersion().then(result => {
        res.send({ lastValidVersions: result, currentOS: md.os() })
    })
})

app.use(express.static("/out/"));
app.get('/out/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, './out', 'index.html'));
});

app.post('/finger', (req, res) => {
    //res.status(200).json(JSON.stringify(req.body));
    let credintials = JSON.parse(JSON.stringify(req.body))
    if (credintials.username == 'username' && credintials.password == 'password') {
        res.status(200).json({ authenticationResult: 'SUCCESS', token: '123456' });
    } else {
        res.status(200).json({ authenticationResult: 'FAILED', reason: 'wrong username/password' });
    }
})

/**
 * TODO: IT'S BETTER TO MAKE CLASS THAT AUTHENTICATE USERS
 * CREATES USER TOKEN, AND RETURNS USER OBJECT
 * 10 digits usernamesubstring
 * @method
 */
app.post('/auth', authenticator, (req, res) => {
    console.log("path");
    var authenticationResult = 'UNAUTHENTICATED';
    var userData = {};
    userData = JSON.parse(JSON.stringify(req.body[0]));
    if (userData.username == undefined || userData.password == undefined) {
        authenticationFailed("Authentication Fail: missing username &/or password", userData);
    }

    /*TODO: IT'S BETTER TO MAKE CLASS THAT AUTHENTICATE USERS*/

    // CREATES USER TOKEN, AND RETURNS USER OBJECT
    function createAuthenticatedUser(userData, userID) {
        console.log("user id" +userID)
        var user = "Couldn't be created due to error";
        try {
            //NOTE: FOR NOW WE ONLY CREATE EASY TOKEN BY TIME, USERNAME, & RANDOM#
            var fullTime = helpers.getfullTimeString(); //year to seconds no spaces
            var randomValue = helpers.getRandomNumber(100000); // five digit random
            var usernameSubstring = helpers.getFixedSubstring(
                (userData.username == undefined ? userData.email : userData.username),
                10
            ); // 10 digits usernamesubstring

            var token = fullTime + randomValue + usernameSubstring;
            user = new UserData( //create an object from userdata class which is exported as module 
                userData.username,
                userData.email,
                token,
                "", //socket ID
                userID
            );
        } catch (error) {
            console.log("EntryPoint-/auth-createToken: ERROR while creating authenticated user, error: " + error);
        }
        return user;
    }

    // VERIFY IF USER EXISTS AND PW CORRECT.
    verifyUserAsAdmin(
        userData.username,
        userData.email,
        userData.password,
        (recievedEnvylop) => {
            authenticationResult = recievedEnvylop.status == "SUCCESS" ? "AUTHENTICATED" : "UNAUTHENTICATED";
            postUserVerification(recievedEnvylop);
        }
    );

    function postUserVerification(recievedEnvylop) {
        if (authenticationResult == 'AUTHENTICATED') {
            //TODO: SETUP INITIAL CONFIGS & DIRECT USER TO THE MAIN PAGE OR ELSE IF EXISTED
            //NOTE: FOR NOW WE ONLY LET THE FRONT END DIRECT HIMSELF
            // 		WHAT SHOULD BE DONE IS BACK END DIRECTING ACCORDING TO THIS USER ACCISSIBILITY
            //NOTE: FOR NOW WE EXTRACT USERDATA RAW FROM REQ.BODY AS IT IS 
            //		BUT THIS MUST BE CHANGED IN TERMS OF VALIDATION & THE AUTHENTICATION PROCESS.
            var user = createAuthenticatedUser(userData, recievedEnvylop.userID);
            //** pushing user to connected users array
            /*connectedUsers.push(user);*/
            connectedUsers.set(user.username, user);
            var respond = {
                status: "AUTHENTICATED",
                userData: {
                    username: user.username,
                    email: user.email,
                    token: user.token
                }
            };
            res.send(respond);
        } else {
            //TODO: SEND USER FAILED AUTHENTICATION RESPOND AND ALLOW TO RELOGIN 
            authenticationFailed("Authentication Fail: Wrong username &/or password", userData);
        }

        function authenticationFailed(reason, userData) {
            //TODO: IF DECIDED, LOG WRONG ACCESS TRIAL &/OR CHECK FOR BRUTE FORCE?DENY:.
            if (userData == undefined) userData = {};
            var respond = {
                status: "UNAUTHENTICATED",
                reason: reason,
                userData: {
                    username: userData.username,
                    email: userData.email,
                    password: userData.password
                }
            }
            res.send(respond);
        }
    }
});





app.post('/authInstructor', authenticator, (req, res) => {
    console.log("instructor");
    var authenticationResult = 'UNAUTHENTICATED';
    var userData = {};
    userData = JSON.parse(JSON.stringify(req.body[0]));
    if (userData.username == undefined || userData.password == undefined) {
        authenticationFailed("Authentication Fail: missing username &/or password", userData);
    }

    /*TODO: IT'S BETTER TO MAKE CLASS THAT AUTHENTICATE USERS*/

    // CREATES USER TOKEN, AND RETURNS USER OBJECT
    function createAuthenticatedUser(userData, userID) {
        var user = "Couldn't be created due to error";
        try {
            //NOTE: FOR NOW WE ONLY CREATE EASY TOKEN BY TIME, USERNAME, & RANDOM#
            var fullTime = helpers.getfullTimeString(); //year to seconds no spaces
            var randomValue = helpers.getRandomNumber(100000); // five digit random
            var usernameSubstring = helpers.getFixedSubstring(
                (userData.username == undefined ? userData.email : userData.username),
                10
            ); // 10 digits usernamesubstring

            var token = fullTime + randomValue + usernameSubstring;
            user = new UserData( //create an object from userdata class which is exported as module 
                userData.username,
                userData.email,
                token,
                "", //socket ID
                userID
            );
        } catch (error) {
            console.log("EntryPoint-/auth-createToken: ERROR while creating authenticated user, error: " + error);
        }
        return user;
    }

// VERIFY IF USER EXISTS AND PW CORRECT.
//function verifyUserAsInstructor(username, email, password, postVerify)
//postVerify is setted inside the function with the res of database after authentication 

    verifyUserAsInstructor(
        userData.username,
        userData.email,
        userData.password,
        (recievedEnvylop) => {
            authenticationResult = recievedEnvylop.status == "SUCCESS" ? "AUTHENTICATED" : "UNAUTHENTICATED";
            postUserVerification(recievedEnvylop);
        }
    );

    function postUserVerification(recievedEnvylop) {
        if (authenticationResult == 'AUTHENTICATED') {
            //TODO: SETUP INITIAL CONFIGS & DIRECT USER TO THE MAIN PAGE OR ELSE IF EXISTED
            //NOTE: FOR NOW WE ONLY LET THE FRONT END DIRECT HIMSELF
            // 		WHAT SHOULD BE DONE IS BACK END DIRECTING ACCORDING TO THIS USER ACCISSIBILITY
            //NOTE: FOR NOW WE EXTRACT USERDATA RAW FROM REQ.BODY AS IT IS 
            //		BUT THIS MUST BE CHANGED IN TERMS OF VALIDATION & THE AUTHENTICATION PROCESS.
            var user = createAuthenticatedUser(userData, recievedEnvylop.userID);
            //** pushing user to connected users array
            /*connectedUsers.push(user);*/
            connectedUsers.set(user.username, user);
            console.log("Checked for id:" + recievedEnvylop.userID);
            var respond = {
                status: "AUTHENTICATED",
                userData: {
                    username: user.username,
                    email: user.email,
                    token: user.token,
                    userID:recievedEnvylop.userID
                    
                }
            };
            res.send(respond);
        } else {
            //TODO: SEND USER FAILED AUTHENTICATION RESPOND AND ALLOW TO RELOGIN 
            authenticationFailed("Authentication Fail: Wrong username &/or password", userData);
        }

        function authenticationFailed(reason, userData) {
            //TODO: IF DECIDED, LOG WRONG ACCESS TRIAL &/OR CHECK FOR BRUTE FORCE?DENY:.
            if (userData == undefined) userData = {};
            var respond = {
                status: "UNAUTHENTICATED",
                reason: reason,
                userData: {
                    username: userData.username,
                    email: userData.email,
                    password: userData.password
                }
            }
            res.send(respond);
        }
    }
});

/**
 * authenticate user from mobile request, & works with any
 * requires: {password, mobile},
 * gives: {result: 0/1, id}
 * @param  {[type]} '/mobile-signup' [description]
 * @param  {[type]} (req,          res           [description]
 * @return {[type]}                [description]
 */


app.post('/mobile-signup', (req, res) => {
var userData = req.body;
 studentSignup(userData.name,userData.mobile,userData.password).then(result=>
        res.send("CREATED")
       ).catch(err =>
         res.send("NOTCREATED") )

})


app.delete('/mobile-delete', (req, res) => {

    console.log("delete")

    var userData = req.body;
       
        console.log("2:"+userData.mobile);

        studentDeleteAccount(userData.mobile).then(result => res.send("DELETED")).catch(err => res.send("NOT DELETED"))

})

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webPush.setVapidDetails('mailto:omar.abossrie@roots.solutions', publicVapidKey, privateVapidKey);

/** 
 *NOTICE: THIS ARRAY FOR THE USERS THAT LOGGED IN THEN HOME SENT AUTH CHECK
 *TODO: CHECK FOR TIME OUTS
 *@constructor
 */

//const FrontMarshalRequester = new Cote.Requester({ name: 'Front Marshal', key: 'FrontMarshal' });
// INTRODUCING MOBILE AUTHENTICATION, REQUESTS AS USER.

/**
 * authenticate user from mobile request, & works with any
 * requires: {password, mobile},
 * gives: {result: 0/1, id}
 * @param  {[type]} '/mobile-auth' [description]
 * @param  {[type]} (req,          res           [description]
 * @return {[type]}                [description]
 */
app.post('/mobile-auth', (req, res) => {
    // todo: call loging files and return authentication if user can access // FROM STUDENTS 
    /*
    let credintials = JSON.parse(JSON.stringify(req.body))
    console.log ('user request login.....', credintials)
    studentAuth(credintials.mobile, credintials.password)
        .then (result => {
            if (result == null) {
                res.status(200).json({result: 0})
            } else {
                res.status(200).json({result: 1, id: result._id})
            }
        })
        .catch(err => {
            res.status(500).json({err: err})
        })
    */
    var authenticationResult = 'UNAUTHENTICATED';
   //[] is an array, {} is an object.
    var userData = {};
    //userData = JSON.parse(JSON.stringify(req.body[0]));
    //console.log(Array.isArray(req.body));

   // if in request body is array
    if (Array.isArray(req.body)) {
        userData = JSON.parse(JSON.stringify(req.body[0]));
        console.log("1:"+userData);
    } else {
        userData = req.body;
        console.log("2:"+userData);
    }

    //console.log(userData);
    if (userData.username == undefined || userData.password == undefined) {
        authenticationFailed(
            "Authentication Fail: missing username &/or password", userData
        );
    }
    /*TODO: IT'S BETTER TO MAKE CLASS THAT AUTHENTICATE USERS*/
    // CREATES USER TOKEN, AND RETURNS USER OBJECT
    function createAuthenticatedUser(userData, userID, deactivate) {
        console.log(deactivate);
        var user = "Couldn't be created due to error";
        try {
            //NOTE: FOR NOW WE ONLY CREATE EASY TOKEN BY TIME, USERNAME, & RANDOM#
            var fullTime = helpers.getfullTimeString(); //year to seconds no spaces

            var randomValue = helpers.getRandomNumber(100000); // five digit random

            var usernameSubstring = helpers.getFixedSubstring(
                (userData.username == undefined ? userData.email : userData.username),
                10
            ); // 10 digits usernamesubstring

            var token = fullTime + randomValue + usernameSubstring;

            user = new UserData(
                userData.username,
                userData.email,
                token,
                "", //socket ID
                userID,
                deactivate
            );

        } catch (error) {
            console.log(
                "EntryPoint-/auth-createToken: ERROR while creating authenticated user, error: " + error
            );
        }
        return user;
    }
    // VERIFY IF USER EXISTS AND PW CORRECT.
    /*
    verifyUser(
        userData.username,
        userData.email,
        userData.password,
        (recievedEnvylop) => {
            authenticationResult = recievedEnvylop.status == "SUCCESS" ? "AUTHENTICATED" : "UNAUTHENTICATED";
            postUserVerification(recievedEnvylop);
        }
    );
--*/
    studentAuth(userData.username || userData.email, userData.password)
        .then(async result => {
            let envelope = {}
            if (Array.isArray(req.body)) {
                if (result == null) {
                    authenticationResult = "MOBILE_NOT_FOUND";

                } else if (result.password !== userData.password) {
                    authenticationResult = "WRONG_PASSWORD";

                } else if (result.deactivate === true) {
                    authenticationResult = "BLOCKED";
                }
                else {
                    authenticationResult = "AUTHENTICATED"
                    envelope.userID = result._id;
                    envelope.deactivate = result.deactivate;

                }
                postUserVerification(envelope);
            } else {
                if (result == null) {
                    authenticationResult = "MOBILE_NOT_FOUND";

                } else if (result.password !== userData.password) {
                    authenticationResult = "WRONG_PASSWORD";

                } else if (result.deactivate === true) {
                    authenticationResult = "BLOCKED";

                } else if (!result.hasOwnProperty('deviceID')) {

                    await dbLoginHandler.EnterDeviceForStudent(userData.username || userData.email, userData.password, userData.deviceID).then(results => {
                        if (results) {
                            authenticationResult = "AUTHENTICATED"
                            envelope.userID = result._id;
                            envelope.deactivate = result.deactivate
                        } else {
                            authenticationResult = "UNAUTHENTICATED";
                        }
                    })

                } else if (result.hasOwnProperty('deviceID') && result.deviceID !== userData.deviceID) {
                    authenticationResult = "DIFFERENT_DEVICE";

                } else {
                    authenticationResult = "AUTHENTICATED"
                    envelope.userID = result._id;
                    envelope.deactivate = result.deactivate
                }
                postUserVerification(envelope);
            }
        })
        .catch(err => {
            postUserVerification({});
            //res.status(500).json({err: err})
        })

    function postUserVerification(recievedEnvylop) {
    
        switch(authenticationResult) {
            case "WRONG_PASSWORD":
                authenticationFailed("Authentication Fail: Wrong password", userData, authenticationResult);
                break;
            case "BLOCKED":
                authenticationFailed("Authentication Fail: Blocked User, Contact Administrator", userData, authenticationResult);
                break;
            case "MOBILE_NOT_FOUND":
                authenticationFailed("Authentication Fail: User Not Found", userData, authenticationResult);
                break;
            case "DIFFERENT_DEVICE":
                authenticationFailed("Authentication Fail: Logged in with different device", userData, authenticationResult);
                break;
            case 'AUTHENTICATED':
                //TODO: SETUP INITIAL CONFIGS & DIRECT USER TO THE MAIN PAGE OR ELSE IF EXISTED
            //NOTE: FOR NOW WE ONLY LET THE FRONT END DIRECT HIMSELF
            //      WHAT SHOULD BE DONE IS BACK END DIRECTING ACCORDING TO THIS USER ACCISSIBILITY
            //NOTE: FOR NOW WE EXTRACT USERDATA RAW FROM REQ.BODY AS IT IS 
            //      BUT THIS MUST BE CHANGED IN TERMS OF VALIDATION & THE AUTHENTICATION PROCESS.
            var user = createAuthenticatedUser(userData, recievedEnvylop.userID, recievedEnvylop.deactivate);
            //** pushing user to connected users array
            /*connectedUsers.push(user);*/
            connectedUsers.set(user.username, user);
            var respond = {
                status: authenticationResult,
                userData: {
                    username: user.username,
                    email: user.email,
                    token: user.token,
                    userID: user.userID,
                    deactivate: user.deactivate
                }
            };
            //console.log(respond);
            //console.log(authenticationResult);
            res.send(respond);
        }

        function authenticationFailed(reason, userData, authenticationResult) {
            //TODO: IF DECIDED, LOG WRONG ACCESS TRIAL &/OR CHECK FOR BRUTE FORCE?DENY:.
            if (userData == undefined) userData = {};
            var respond = {
                status: authenticationResult,
                reason: reason,
                userData: {
                    username: userData.username,
                    email: userData.email,
                    password: userData.password
                }
            }
            //console.log(respond);
            res.send(respond);
        }
    }
})

class Socket {
    /*
        CREATES SOCKET, DIRECT DATA TO FRONTMARSHAL, 
    */
    constructor(socket, disconnectUser) {
        this.socketIO = socket;
        this.okaty = "okaty";
        // NOTE: we store connected users as a reference for who're online.
        /**
         * [connectedSockets: contains user sockets array & types of connections (android, web)
         *     map <userID, map<socketID, socket> >
         * @type {Map}
         */
        this.connectedSockets = new Map();
        this.disconnectUser = disconnectUser;
    }

    /**
     * [pusher description]
     * @param  {[type]} envelope {users: [id, msg}]/'ALL', all: 1, msg} // if all = 1 then send same msg conent to all given users
     * {
     *     {
     *       users: [
     *         {
     *             id,
     *             endpoints: [{type: 'WP/WA/EM/IO', <type dependant field>}],
     *             msg // message should be constructed to the type requirements ex: for web push: {title, body, data}
     *         }, ..]/'ALL',
     *       app: 0, // default 1, to not send as a notification
     *       all: 1,
     *       endpoints: 'WP/WA/EM'/ALL ,
     *       msg
     *     }
     * }
     *
     * testing web push {
     *     subscription,
     *     msg
     * }
     * @return {[type]} [description]
     */
    pusher(envelope) {
        /*
            if (envelope.hasOwnProperty('all') && envelope.all == 1) {
                // TODO: send to all given user.
            }
            if (Array.isArray(envelope.users)) {
                // TODO: send to given users, send each user msg or if all=1 send envelope.msg
                for (let user of envelope.users) {
                    let msg = (envelope.all == 1)? envelope.msg: user.msg;
                    // send to all user connections
                    let connections = this.connectedSockets.get(user.id);
                    for (let [key, value] of connections) {
                        value.emit('Notification', msg);
                    }
                }
            } else if (envelope.users == 'ALL') {
                this.socketIO.broadcast.emit('Notification', envelope.msg);
            }
        */

        /*app.post('/subscribe', (req, res) => {
                const subscription = req.body
                res.status(201).json({});
                const payload = JSON.stringify({
                    title: 'Automated push notification',
                    body: '',
                    data: { hi: 'hi', pi: 'pi'}
                });
                console.log (subscription);
                webPush.sendNotification(subscription, payload)
                .catch(error => console.error(error));
            });*/

        const payload = JSON.stringify({
            title: 'Automated push notification',
            body: envelope.msg,
            requireInteraction: true
        });

        webPush.sendNotification(envelope.subscription, payload)
            .catch(error => console.error(error));

        /*
                // web push only 
                // EASY ISA
                // in case of FEEDBACK needed to actions then run callback for anyuser that will check this user setting if an action should be done in case of a feedback event, then send the other notification type
                let webPushErrors = []; // {user: 'userID', err: 'error catched'}
                for (let user of envelope.users) {
                    // web push payload
                    let wpPayload = JSON.stringify((envelope.hasOwnProperty('all') && envelope.all == 1)? envelope.msg: user.msg);
                    let socketMessage = (envelope.hasOwnProperty('all') && envelope.all == 1)? envelope.msg: user.msg;

                    for (let endpoint of user.endpoints) {
                        switch (endpoint.type) {

                            case 'WP': // web push
                                // send push notification to this endpoint for this user
                                webPush.sendNotification(endpoint.subscription, payload)
                                    .catch(err => { // some endpoint didn't reach
                                        console.log ('user endpoint webpush error');
                                        console.log (user);
                                        webPushErrors.push({
                                            user: user.id,
                                            err: err
                                        });
                                    });
                                break;

                            case 'EM': // EMAIL
                                // DO EMAIL
                                console.log ('email should be sent');
                                break;

                            case 'WA':
                                console.log ('Whatsapp msg should be sent');
                                break;
                            case 'IO':
                                console.log ('send to sockets');
                                // loop for all socket connections for this user and send him this msg
                                for (let [socketID, socket] of this.connectedSockets.get(user.id).entries()) {
                                     ('notification', socketMessage);
                                }
                                break;
                        }


                    }

                }


        // return promise 

        */
    }

    start() {
        this.socketIO.on("connect", (userSocket) => {
            // 
            // only for finger print test
            //console.log(userSocket);
            userSocket.on('finger_print', (data) => {
                if (data.hasOwnProperty('token') && data.token == '123456') {
                    userSocket.emit('finger_print_respond', { result: 'SUCCESS' });
                } else {
                    userSocket.emit('finger_print_respond', { result: 'FAILED', reason: 'token has not been sent/correctly, or wrong token' })
                }
            })
            // finger print test end

            // TODO CHECK AUTHENTICATION OF THIS USER. PROPOSAL: TOKEN IDENTIFIER
            //		NOTIFY CONCERNED LEVELS OF A NEW USER CONNECTED(COTE),
            //		MAINTAIN A BIDIRECTIONAL REFRENCE PROPOSAL: CALLBACK CHAINING.
            //dev.log("user connected with id: ", userSocket.id);
            //TODO: user user authenticiy will only be valid after login,
            //	THERE ARE SOME CASES THAT THIS USER WILL NOT BE AUTHENTIC
            //	LINK THE TIME OUT WITH THIS STATE 
            var userAuthentic = false;
            let userID = "NOT AUTHENTIC";

            userSocket.on("authenticate", (data) => {
                //console.log(data);
                var envylop = { socketID: userSocket.id, userData: data };
                console.log("envylop");
                console.log(envylop);
                //console.log();
                this.authenticateUserOnSocket(
                    envylop,
                    (sentUserID) => { // authenticated cb
                        //TODO: DECIDE ON THE SOCKET ID THAT MULTIPLE SOCKETS MADE FORM THE SAME USER
                        //NOTICE: HERE WE ADD THE USER TO THE CONNECTED USERS ARRAY
                        userAuthentic = true;
                        userSocket.emit("authentication result", { status: "SUCCESS" });
                        userID = sentUserID;

                        // create user connection item
                        let user = {};
                        let socketID = userSocket.id;
                        let socket = userSocket;

                        if (this.connectedSockets.has(sentUserID)) {
                            this.connectedSockets.get(sentUserID).set(socketID, socket);
                        } else {
                            let connectionMap = new Map();
                            connectionMap.set(socketID, socket);
                            this.connectedSockets.set(sentUserID, connectionMap);
                        }
                        // TODO: remove user socket on disconnection DONE
                    },
                    (reason) => { //unauthenticated cb
                        userSocket.emit("authentication result", { status: "FAILED", reason: reason });
                    }
                );
            })
            userSocket.on('mobile-check', (data) => {
                console.log('mobile-check', data);
                userSocket.emit('mobile-check', { msg: 'hello bro' })
            })

            /*let user = {};
            user.id = userSocket.id;
            user.timeConnected = new Date();
            user.token = '';

            this.connectedSockets.push(user);*/
            let studentID;
            let studentLoggedIn = false;
            userSocket.on('mobile-auth', (data) => {
                console.log('auth attemp: ', data);

                let credintials = data
                console.log('user request login.....', credintials)

                studentAuth(credintials.mobile, credintials.password)
                    .then(result => {
                        if (result == null) {
                            // wrong mobile number or/& password
                            userSocket.emit('mobile-auth-result', { result: 0 })
                        } else {
                            studentID = result._id;
                            studentLoggedIn = true;
                            userSocket.emit('mobile-auth-result', { result: 1, id: result._id })
                            //res.status(200).json({result: 1, id: result._id})

                        }
                    })
                    .catch(err => {
                        userSocket.emit('mobile-auth-result', { errMsg: err })
                        //res.status(500).json({err: err})
                    })

                //userSocket.emit('mobile-auth-result', "hello auth recived this is string only respond, next will be json");
                //userSocket.emit('mobile-auth-result', {result: 1, state: 'invalid'})
            })

            userSocket.on('my-courses', (data) => {
                console.log('soket my coruses', data);
                //console.log(data);
                // TODO: CALL SERVICE MY COURSES TO GET LIST OF COURSES
                if (!studentLoggedIn) {
                    userSocket.emit('my-courses-result', "LOGIN");
                    return;
                }

                ServicesMarshal.directReciever(
                    '00C.C.8',
                    data, {
                    requester: String(studentID),
                    timeStamp: helpers.nowTimeStamp(),
                },
                    (respond) => {
                        console.log('respond my courses');
                        //console.log(respond);
                        console.log('my-courses service responded: ', respond);
                        if (!Array.isArray(respond)) {
                            respond = []
                        }
                        userSocket.emit('my-courses-result', respond);
                    }
                )
            })

            userSocket.on('check', (dataSent) => {
                dev.log("check sent with data: ", JSON.stringify(dataSent));
                userSocket.emit('check respond', "Server check respond msg");
            });

            //NOTE: DIRECT DATA FROM FRONT END TO FRONT MARSHAL
            //		SEND BACK DATA TO CLIENT.
            //		NUETRAL CALL BACK 
            /* userSocket.on("action", (data) => {
                 if (data != undefined)
                     data.servicesRoutes = [];

                 this.directToFrontMarshal(
                     data,
                     (respond) => {
                         userSocket.emit('action respond', respond);
                     }
                 );

             });*/
            userSocket.on("services requests", (envelope) => {
                if (envelope != undefined)
                    envelope.servicesRoutes = [];

                envelope["attachedData"] = {
                    requester: String(userID),
                    time: helpers.getCurrentTime(),
                    timeStamp: helpers.nowTimeStamp()
                }
                //console.log('envelope');
                //console.log(envelope);
                //envelope.attachedUserID = userID;

                /**
                 * [description]
                 * send envelope next callback, & optional pusher for notifications
                 * @param  {[type]} envelope [description]
                 * @param  {[type]} (respond [description]
                 * @return {[type]}          [description]
                 */
                FrontMarshal.reciever(envelope, (respond) => {
                    

                    if(respond.servicesResponds[0].serviceID=='00N.1' ||respond.servicesResponds[0].serviceID=='00C.C.3'  ){
                        //console.log('d',respond.servicesResponds[0].data.target.internal.data);
                        this.socketIO.emit("notify", respond.servicesResponds[0].data)
                        userSocket.emit('services responds', respond);
                    }else if(respond.servicesResponds[0].serviceID=='00N.5'){
                        this.socketIO.emit("delete Notification", respond.servicesResponds[0].data)
                        userSocket.emit('services responds', respond);
                    }
                    else{
                        userSocket.emit('services responds', respond);
                    }
                    
                }, this.pusher);

                /* this.directToFrontMarshal (
                     envelope,
                     (respond) => {// HERE IS THE FINAL ROLL BACK FROM SERVICES TO PUSH TO THE USER.
                         
                         //A SERVICE MIGHT SEND A REQUEST TO NOTIFY SOME USERS THAT A LOCAL DATA THEY HAVE IS CHANGED AND NEEDS TO BE UPDATED, WE CHECK IF THE RESPOND SENT CONTAINS AN AFFECTED USERS ATTRIBUTE OR  NOT 
                         if (respond.hasOwnProperty('affectedUsersEnvelope')) { 
                             this.notifyAffectedUsers (respond.affectedUsersEnvelope);
                             delete respond.affectedUsersEnvelope;
                         }
                         

                         userSocket.emit('services responds', respond);
                     }
                 );*/
            })

            userSocket.on("cache", (data) => {
                //TODO PROPOSAL: THIS WILL ONLY SEND BACK IP OF THE CACHING SERVER
                //		THEN CLIENT OPENS SOCKET WITH IT AND TRANSMITS CACHE(TEMP SAVE)
            });

            userSocket.on('disconnect', () => {
                //dev.log('disconnected user: ', JSON.stringify(user));
                this.userDisconnected(userID);
                // remove this socket connection from this user.
                this.connectedSockets.has(userID) &&
                    this.connectedSockets.get(userID).delete(userSocket.id);
            });
        });
        console.log(SCRIPT_NAME + ": Server Started");
    }

    async notifyb(affectedUsersEnvelope) {
        // TODO: SEND EMIT MASSAGE TO NOTIFY USERS THAT A A SERVICE LOCAL DATA NEEDS TO BE UPDATED.
        console.log(SCRIPT_NAME + ". NOTIFY AFFECTED USERS CALLED, affectedUsersEnvelope: " + flatted.stringify(affectedUsersEnvelope));

        let affectedUsers = affectedUsersEnvelope.affectedUsers;
        let envelope = {
            serviceID: affectedUsersEnvelope.serviceID,
            data: {
                public: affectedUsersEnvelope.data,
                private: {}
            }
        }
        for (var affectedUser of affectedUsers) {
            for (var connectedUser of connectedUsers) { // TODO: **** CHANGE TO MAP
                if (connectedUser.userID == affectedUser.userID) {
                    //  emit the wanted request
                    envelope.data.private = affectedUser.data;
                    sIO.to(connectedUser.socketID).emit("data changed", envelope);
                }
            }
        }
    }

    // IMPORTANT NOTICE: ON ABSTRACTING THIS CLASS TO BE STAND ALONE FROM THIS SCRIPT
    // 					THIS FUNCTION NEEDS CONNECTED USERS WHICH CONTAINS USERNAME AND TOKEN
    authenticateUserOnSocket(recievedEnvylop, success, fail) {
        var valid = false;
        var usernameExists = false;

        /*for (let user of connectedUsers) {
            if (user.username === recievedEnvylop.userData.username) {
                usernameExists = true;
                if (user.token === recievedEnvylop.userData.token) {
                    valid = true;
                    user.socketID = recievedEnvylop.socketID;
                    success(user.userID);
                    break;
                }
            }
        }*/
        /*connectedUsers.forEach((user, userID) => {
            if (user.username === recievedEnvylop.userData.username) {
                usernameExists = true;
                if (user.token === recievedEnvylop.userData.token) {
                    valid = true;
                    user.socketID = recievedEnvylop.socketID;
                    success(user.userID);
                }
            }
        });*/

        let user = connectedUsers.get(recievedEnvylop.userData.username);
        //console.log(recievedEnvylop.userData.username);
        //console.log(user);
        if (typeof user != "undefined") {
            usernameExists = true;
            if (user.token === recievedEnvylop.userData.token) {
                valid = true;
                user.socketID = recievedEnvylop.socketID;
                success(user.userID);
            }
        }

        if (!valid) {
            fail(usernameExists ?
                "invalid authentication, username exists but wrong token" :
                "invalid authentication, username doesn't exist on connected users"
            );
        }
    }

    /*
    //NOTE: THIS METHOD SENDS DATA TO FRONTMARSHAL AND APPLYING NEXT CB
            THIS METHOD DOESN'T CARE FOR THE FAIL CALLBACK
            IT ONLY A MIDDLE WARE BETWEEN FRONTMARSHAL AND CLIENT'S SOCKET
            NUETRAL CALLBACK
    */
    async directToFrontMarshal(data, next) {
        if (data == null) { next('no data'); return; }
        //*devtrace
        if (dev.DEV_TRACE_ENABLED) {
            data.servicesRoutes.push("EntryPoint sending to FrontMarshal");
        }
        var envylop = { type: "actionRouting", data: data };

        /* ****************************** COTE ************************ */
        FrontMarshalRequester.send(
            envylop,
            (recievedEnvylop) => {
                // NOTE HERE THE FRONT MARSHAL RESPONDED AND RESPOND WILL BE SENT BACK
                //*devtrace
                if (dev.DEV_TRACE_ENABLED) {
                    recievedEnvylop.data.servicesRoutes.push('EntryPoint recieved FrontMarshal n');
                }
                next(recievedEnvylop.data);
            }
        );
    }
    userDisconnected(userID) {
        //TODO 	REMOVE USER FROM CONNECTED_USERS ARRAY
        //		NOTIFY RECIEVERS CONCERNED OF DISPATCHING A USER (COTE CALL)
    }

    broadcast(msg) { };
    emit(userID, msg) { };
    disconnectByUserID(userID) {
        //TODO ATTACH IT TO PROMISE, AS THIS CALL WILL BE FROM CHAIN PROMISES
        // NOTICE:THIS MIGHT NOT BE NEEDED, NEEDED FOR THE FORCING DISCONNECT
        //TODO LOOK FOR HOW TO GET SOCKET OF THIS USER AND DISCONNECT HIM
        /*
            if (this.socketIO.sockets.connected[userID]) {
                this.socketIO.connected[userID].disconnect();
            }
        */
        //TODO: REMOVE USER FROM THE ARRAY
    }
}

let socket = new Socket(sIO, disconnectUser);
socket.start();

function disconnectUser(userID) {
    //dev.log(JSON.stringify(sIO.sockets.sockets));
    //sIO.sockets.connected[userID].disconnect(true);
    /*
        TODO: DELETE user from connected users array
    */
}


function authenticator(req, res, next) {
    // auth then call next if auth fail
    // call the auth module via cote!!
    //res.send("ok you are auth.");
    //console.log("authenticator directing req.body: " + JSON.stringify(req.body));
    next();
}

let auth = () => { };

function frontPage(req, res, next) {
    //dev.log("home function");
    req.prevData = { hi: "hello" };
    res.sendFile(path.join(__dirname + '/public/login.html'));
}

function studentFrontPage(req, res, next) {
    res.sendFile(path.join(__dirname + '/public/student_login.html'));
}

function home(req, res, next) {
    res.sendFile(path.join(__dirname + "/public/home.html"));
}

/** 
 *@function preHomeAuth -HOME PAGE SERVING
 */
function preHomeAuth(req, res, next) {
    function isValidToken(userData) {
        // TODO: TO COORDINATE WITH THE INCOMING SOCKET FROM HOME
        //		WE NEED TO CHECK THE VALIDITY OF THE SENT TOKEN.

        // FOR NOW ASSUME VALIDITY CHECK TRUE;
        var isValid = false;
        /*for (user of connectedUsers) {
            if (user.username == userData.username && user.token == userData.token) {
                isValid = true;
            }
        }*/
        let user = connectedUsers.get(userData.username);

        if (typeof user != "undefined") {
            if (user.username == userData.username && user.token == userData.token) {
                isValid = true;
            }
        }
        return isValid;
    }

    var userData = req.body;
    if (!isValidToken(userData)) {
        //TODO: RESPOND WITH AN INVALID AUTHENTICATION ERROR
        res.sendFile(path.join(__dirname + "/public/login.html"));
    } else {
        next();
    }
}

function serveHomePage(req, res, next) {
    function isReadyForSocket(userData) {
        //TODO: JUST INCASE THERE ARE SOME ACTIONS NEEDED BEFORE USER REQUESTS SOCKET
        // 		CONNECTION FROM HOME PAGE.
        return true;
    }

    //NOTICE: THAT FOR NOW USER DATA IS EXTRACTED FROM REQ.BODY AS IT IS
    //			THIS MIGHT BE CHANGED IF THERE IS MORE DATA ORGANIZING
    var userData = req.body;

    if (!isReadyForSocket(userData)) {
        // TODO: RESPOND WITH A SERVER NOT READY ERROR
    } else {

        //The path.join() method joins the specified path segments into one path.
        res.sendFile(path.join(__dirname + "/public/home.html"));
    }
}



function serveInstructorHomePage(req, res, next) {
    function isReadyForSocket(userData) {
        //TODO: JUST INCASE THERE ARE SOME ACTIONS NEEDED BEFORE USER REQUESTS SOCKET
        // 		CONNECTION FROM HOME PAGE.
        return true;
    }

    //NOTICE: THAT FOR NOW USER DATA IS EXTRACTED FROM REQ.BODY AS IT IS
    //			THIS MIGHT BE CHANGED IF THERE IS MORE DATA ORGANIZING
    var userData = req.body;
    var instructorId=req.body.userID;
    console.log("here: "+ JSON.stringify(req.body))

    if (!isReadyForSocket(userData)) {
        // TODO: RESPOND WITH A SERVER NOT READY ERROR
    } else {
        //path.join: joining the strings of the path 
        //__dirname absolute path of project according to root of pc 

       // res.send(instructorId);
     //  res.render(__dirname + "/public/instructorHome.html", {instructorId:instructorId});
     var options = {
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true,
            'id': instructorId,
            'origin':'stackoverflow' 
        }
      };
        res.sendFile(path.join(__dirname + "/public/instructorHome.html"),options);
    }
}

function preInstructorHomeAuth(req, res, next) {
    function isValidToken(userData) {
        // TODO: TO COORDINATE WITH THE INCOMING SOCKET FROM HOME
        //		WE NEED TO CHECK THE VALIDITY OF THE SENT TOKEN.

        // FOR NOW ASSUME VALIDITY CHECK TRUE;
        var isValid = false;
        /*for (user of connectedUsers) {
            if (user.username == userData.username && user.token == userData.token) {
                isValid = true;
            }
        }*/
        let user = connectedUsers.get(userData.username);

        if (typeof user != "undefined") {
            if (user.username == userData.username && user.token == userData.token) {
                isValid = true;
            }
        }
        return isValid;
    }

    var userData = req.body;
   
    if (!isValidToken(userData)) {
        //TODO: RESPOND WITH AN INVALID AUTHENTICATION ERROR
        // __dirname is simply the string of the absolute path to the file’s location.
        //absolute path means the full link 
        // Node.js environment variable that specifies the absolute path for the directory which contains the currently executing file.
        res.sendFile(path.join(__dirname + "/public/instructor_login.html"));
    } else {
        next();
    }
}

app.post('/subscribe', (req, res) => {
    const subscription = req.body
    res.status(201).json({});
    const payload = JSON.stringify({
        title: 'Push notifications with Service Workers',
        body: 'Notifications has been send successfully',
        data: { hi: 'hi', pi: 'pi' }

    });
    console.log(subscription);
    webPush.sendNotification(subscription, payload)
        .catch(error => console.error(error));
});

/*
let Request = Require('Request'); //Bash: Npm Install Request
// URL For Request POST /Message
let Today = New Date();  
let Time = Today.GetHours() + ":0" + Today.GetMinutes();
let Token = 'Token String';
let InstanceId = 'Id String';
let Url = `Https://Api.Chat-Api.Com/Instance${InstanceId}/Message?Token=${Token}`;
let Data = {
    Phone: '+201111717808', // Receivers Phone
    Body: 'Alert! At Time: ' + Time, // Сообщение
};
// Send A Request
Request({
    Url: Url,
    Method: "POST",
    Json: Data
});
*/
http.listen(8080);


//new Cote.Sockend(sIO, {name: 'Main sockend server'});