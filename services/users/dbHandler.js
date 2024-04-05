let connector = require("./../db/connector");
const databaseName = "ERP";
const collectionName = "users"
const SCRIPT_NAME = "\nDB HANDLER USERS SERVICE";


let database;

connector.connectDB(
    databaseName,
    (db) => {
        database = db;
    },
    (errMsg) => {
        database = undefined;
        //console.log(SCRIPT_NAME + ": couldn't retrieve db: " + errMsg);
    }
)

/*if (database != undefined) {return;}
 */
connector.getDB(
    databaseName,
    (recievedDB) => { // success callback
        database = recievedDB;
    },
    (errMsg) => {
        //console.log(SCRIPT_NAME + ": couldn't retrieve db: " + errMsg);
        database = undefined;
    }
);



/**
 * - RETURNS SIMPLE USERS IDENTIFIERS LIST (id, visualName)
 * @function getUsersIdentifiers
 * @param {*} successCB 
 * @param {*} failedCB 
 */
exports.getUsersIdentifiers = (successCB, failedCB) => {
    if (database == undefined) {
        fail("Database undefined");
        console.log(SCRIPT_NAME + ".insertTask: undefined db");
    } else {
        function postFind(err, result) {
            if (err) {
                console.log(SCRIPT_NAME + ": error: " + JSON.stringify(err));
                failedCB(err);
                throw err;
            } else {
                // console.log("sucessssss");
                // console.log(JSON.stringify(result));
                successCB(result);
            }
        }
        database.collection(collectionName).find({}, { _id: 1, visualName: 1 }).toArray(postFind);

    }
}