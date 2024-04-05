let connector = require("./../db/connector");
let ObjectID = require('mongodb').ObjectID;
const databaseName = "ERP";
const separateListdbName = 'constants';
const collections = {
    benchMark: 'benckMarkCollection',
    cost: {
        categories: 'constants.projects.cost.categories'
    }
}
const accessName = "constants";
let helpers = require("./../../utils/helpers"); // for date function.

const SCRIPT_NAME = "\nDB HANDLER CONSTANTS SERVICE";


let database;
let constantsDatabase;

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
connector.connectDB(
    separateListdbName,
    (db) => {
        constantsDatabase = db;
    },
    (errMsg) => {
        constantsDatabase = undefined;
        console.log(SCRIPT_NAME + ": couldn't retrieve db: " + errMsg);
    }
)





function updateCallback(success, fail) {
    return (err, result) => {
        if (err) {
            fail(err.message);
            return;
        }
        let modified = 1;
        if (result.result.nModified == 0) {
            modified = 0;
        }
        success({
            modified: modified
        })
    }
}



exports.costCategories = () => {
    return database.collection(collections.cost.categories)
            .find()
            .toArray()
}


exports.costCategoryVIDExists = vID => {
    let filter = {
        vID: String(vID)
    }

    let options = {
        projection: {
            vID: 1,
            _id: 0
        }
    }

    return database.collection(collections.cost.categories)
            .findOne(filter, options)
}


exports.newCostCategory = (categoryDocument) => {

    return database.collection (collections.cost.categories)
            .insertOne (categoryDocument)
}


exports.costSubcategoryVIDExists = (categoryVID, vID) => {
    let filter = {
        vID: String(categoryVID),
        'subcategories.vID': String(vID)
    }

    return database.collection (collections.cost.categories)
            .findOne(filter)
}

exports.newCostSubcategory = (categoryVID, subcategory) => {
    subcategory._id = new ObjectID();
    let filter = {
        vID: String(categoryVID)
    }

    let update = {
        $push: {
            subcategories: subcategory
        }
    }

    return database.collection (collections.cost.categories)
            .updateOne(filter, update)
}



exports.getListByName = (name) => {
    if (constantsDatabase == undefined) {
        console.log ('cant connect to lists database');
        
        throw 'database undefined'
    }
    return constantsDatabase.collection(String(name))
            .find()
            .toArray()
}







