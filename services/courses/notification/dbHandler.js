let connector = require("./../../db/connector");
let ObjectID = require('mongodb').ObjectID;
const databaseName = "ERP";
const collection = {
    notifications: 'notifications',
    students: "students",
    courses: "courses"
}

const mainTaskAccessName = "tasks";
let helpers = require("./../../../utils/helpers"); // for date function.

const SCRIPT_NAME = "\nDB HANDLER NOTIFICATION SERVICE";


let database;

connector.connectDB(
    databaseName,
    (db) => {
        database = db;
    },
    (errMsg) => {
        database = undefined;
        console.log(SCRIPT_NAME + ": couldn't retrieve db: " + errMsg);
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


exports.newNotification = (requester, data, success, fail) => {
    if (database == undefined) {
        fail("Database undefined");
        console.log(SCRIPT_NAME + ".insertNewNotification: undefined db");
    } else {

        function getCourseData(notification) {
            // console.log('notification',notification.target.internal.data);
            database.collection(collection.courses)
                .findOne({ _id: ObjectID(String(notification.target.internal.data.courseID)) }).then(course => {
                    //console.log('course', JSON.stringify(course));
                    notification.target.internal.data = course
                    //console.log('after find course', notification);
                    return success(notification)
                })
        }

        database.collection(collection.notifications).insertOne(
            data, {},
            (err, result) => {
                //console.log(result);
                if (err) {
                    fail(err.message);
                    return;
                }
                if (result['insertedCount'] !== 1) {
                    fail("inserting new notification document doc failed: insertedCount=0, : " + JSON.stringify(result));
                    return;
                }

                let notification = {
                    message: result.ops[0].msg,
                    dateTime: result.ops[0].time,
                    _id: result.ops[0]._id,
                };
                let studentsStatus = result.ops[0].users.map(userObj => {
                    let obj = {}
                    for (let i in userObj) {
                        obj[i] = userObj[i]
                    };
                    return obj
                });
                notification.users = studentsStatus
                console.log(JSON.stringify(notification));
                if (result.ops[0].hasOwnProperty('target')) {
                    notification.target = result.ops[0].target
                }
                if (result.ops[0].hasOwnProperty('image')) {
                    notification.image = result.ops[0].image
                }

                console.log('notification after insert', notification);
                if (notification.hasOwnProperty('target') && notification.target.hasOwnProperty('internal')) {
                    //console.log('here internal');
                    getCourseData(notification)
                } else if (notification.hasOwnProperty('target') && notification.target.hasOwnProperty('external')) {
                    //console.log('here external');
                    return success(notification)
                } else if (!notification.hasOwnProperty('target')) {
                    return success(notification)
                }
            }
        )
    }
}

exports.notificationsForStudetn = (userID) => {
    //console.log(userID);
    let filter = {
        users: {
            $elemMatch: {
                "deleted.v": 0,
                'userID': String(userID)
            }
        }
    }

    return database.collection(collection.notifications)
        .find(filter).toArray()
};
//db.notifications.find({users:{$elemMatch:{"deleted.v": 0,'userID': '617554a23f57e21da0a6c3ab'}}}).pretty()
exports.allNotifications = (userID) => {
    //console.log(userID);
    let filter = {}

    return database.collection(collection.notifications)
        .find(filter).toArray()
};

exports.NotificationDelivered = (attachedData, data, success, fail) => {
    let filter = {
        '_id': { $in: [] },
        'users.userID': String(attachedData.requester)
    }
    for (let i of data.notificationsIDs) {
        filter._id.$in.push(ObjectID(String(i)))
    }

    let update = { $set: { 'users.$.delivered.v': 1, 'users.$.delivered.t': attachedData.timeStamp } }
    console.log('filter', filter);
    console.log(update);
    //console.log(data);
    database.collection(collection.notifications)
        .updateMany(filter, update,
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                success();
            }
        )
}

exports.NotificationRead = (attachedData, data, success, fail) => {
    let filter = {
        '_id': ObjectID(String(data.notificationID)),
        'users.userID': String(attachedData.requester)
    }

    let update = { $set: { 'users.$.read.v': 1, 'users.$.read.t': attachedData.timeStamp } }
    console.log('read', data);
    database.collection(collection.notifications)
        .updateOne(filter, update,
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                success();
            }
        )
}

exports.NotificationDeleteStatus = (attachedData, data, success, fail) => {
    let filter = {
        '_id': ObjectID(String(data.notificationID)),
        'users.userID': String(attachedData.requester)
    }

    let update = { $set: { 'users.$.deleteStatus.v': 1, 'users.$.deleteStatus.t': attachedData.timeStamp } };
    console.log(filter);
    database.collection(collection.notifications)
        .updateOne(filter, update,
            (err, result) => {
                console.log(result);
                if (err) {
                    fail(err.message);
                    return;
                }
                success();
            }
        )
}

exports.NotificationDelete = (attachedData, data, success, fail) => {
    let filter = {
        '_id': ObjectID(String(data.notificationID)),
        'users.userID': { $in: [] }
    }
    for (let i of data.usersID) {
        filter['users.userID'].$in.push(String(i))
    }
    let update = { $set: { 'users.$.deleted.v': data.deleted, 'users.$.deleted.t': attachedData.timeStamp } };
    console.log('g', filter);
    return database.collection(collection.notifications)
        .updateMany(filter, update, { multi: true },
            (err, result) => {
                if (err) {
                    fail(err.message);
                    return;
                }
                let notification = {
                    notificationID: data.notificationID,
                    usersIDs: data.usersID
                };

                console.log(notification);
                success(notification);
            }
        )
}

//db.notifications.updateOne({_id:ObjectId("61c841e7a04aed41ccc63949"),'users.userID':"618b8c227bf2cd0a788bb956"},{$set:{'users.$.delivered.v':1,'users.$.delivered.t':3234}})
//db.notifications.updateMany({_id:ObjectId("61c841e7a04aed41ccc63949"),'users.userID':{$in:["616b49131d481e18685c026f","617554a23f57e21da0a6c3ab","618b865953e52f2e2467e668"]}},{$set:{'users.$.deleted.v': 0, 'users.$.deleted.t': 'qwe'}})

/* db.notifications.updateMany({
    _id: ObjectId('61c9b2e2adda9c332424a454'),
    'users.userID': {
      '$in': [
        '616b49131d481e18685c026f',
        '617554a23f57e21da0a6c3ab',
        '618b865953e52f2e2467e668',
        '618b87e97bc4fb1cc418bae5',
        '618b883139b2733ce0a8603b',
        '618b8c227bf2cd0a788bb956'
      ]
    }
  },{$elemMatch:{}$set:{'users.$.v': 0}}) */