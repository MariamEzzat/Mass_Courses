const flatted = require("flatted"); // for cyclic json objects 
let connector = require("./connector");
const databaseName = "ERP";
const collections = {
	students: 'students',
}

exports.delete=(mobile) => {
    console.log("Mobile number for deletion : "+ mobile )
    const doc={primaryMobile:mobile}
    return connector.getDB(databaseName)
    .then(db => {
        return db.collection(collections.students).deleteOne(doc)
            .then(result=>{
                console.log("res from db:" +result);
              
            }).catch(err=> {throw err})
    })
}