const flatted = require("flatted"); // for cyclic json objects 
let connector = require("./connector");
const databaseName = "ERP";
const collections = {
	students: 'students',
}

exports.signup=(name,mobile,password) => {
    console.log(name+ " " + mobile + " " + password)
    const doc={name:name, primaryMobile:mobile ,password:password }
    return connector.getDB(databaseName)
    .then(db => {
         db.collection(collections.students).insertOne(doc)
            .then(result=>{
                console.log("res from db:" +result);
               
            })
    }) .catch(err=> {throw err})
}
