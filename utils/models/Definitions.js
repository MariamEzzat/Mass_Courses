/*
	HERE WE DEFINE CLASSES THAT WILL BE USED IN MORE THAN ONE MODULE

	USER DATA CLASS.

*/


class UserData {
	constructor (username, email, token, socketID, userID) {
		try {
			this.username = username;
			this.token = token;
			this.email = email;
			this.socketID = socketID;
			this.userID = userID;
		} catch (err) {
			console.log("DEFINITIONS: creating userData object failed due to arguments in constructor");
		}

	}
};



/**
*	Class for document (document is the main object contains FIELDs objects) mainly made for toString().
*/
class Document {

	/**
	*	constructor.
	*	@param {Field[]} fields - fields array, all objects of type Field, each should contain name as property.
	*	@param {Array[]} others - other non Field properties, array of arrays, each array MUST BE [key, value] pair, where key is the property name (for mongodb the key will be field name)
	*/
	constructor (fields, others) {
		this.fields = fields;
		this.others = others;
	}


	/**
	*	add. add a single property to this document field or other[key, value]
	*	@param {(Field|other)} property - recieves either field or other, where other has to be array length 2 [key, value].
	*
	*/
	add (property) {
		if (property instanceof Field) {
			this.fields.push(property);
		} else {
			this.others.push(property);
		}
	}


	/**
	*	toJSON. acts as toString function, converts this document to JSON to be able to be stored in mongoDB.
	* 	this function traverse the given fields list and calls toJSON in each of them.
	*	if two or more names are equal (fields & othere) the first name will be assigned and the others are included with the incrementation of int name (0, 1, 2, ..), fields prioritized.
	*	@return {Object} - json object contains given fields & others, all fields will be converted to 
	*/
	toJSON () {
		let json = {};

		let strayCounter = 0;// incremental variable in case any values passed without name or field that doesn't contain name property in the object
		for (let field of fields) {
			if (! field.hasOwnProperty('name') ) { // case field.name not found
				json[strayCounter++] = field.toJSON();
				continue;
			}
			if ( json.hasOwnProperty(field.name) ) { // case field.name exists
				json[strayCounter++] = field.toJSON();
				continue;
			}
			json[field.name] = field.toJSON();
		}

		for (let other of others) { 
			if (other.length < 2) { // case it's not key value
				json[strayCounter++] = other[0];
				continue;
			}
			if ( json.hasOwnProperty(other[0]) ) { // case the same name exists -> incremented key
				json[strayCounter++] = other[1];
				continue;
			}
			json[other[0]] = other[1];
		}

		return json;
	}
}



/** Class for FIELD schema */
class Field {

	/**
	*	Constructor.
	*	@param {string} name - the field name that will be linked as the key of the created object, mainly for Document class. *it will not be converted in toJSON function*
	*	@param {string} _id - Mongo objectID for this field level.
	*	@param {string} by - Mongo objectID representing the user created this field.
	*	@param {Object[]} val - Array of events (edit history, value history) events: (delete, restore, edit), there is a val in every event, this val can be list ref or another field.
	*	@param {*} others - Any other object to be added in the current level.
	*/
	constructor (name, _id, by, val, others) {
		this.name = name;
		this._id = _id;
		this.by = by;

		if (!Array.isArray(val)) {
			this.val = [];
			this.val.push(val);
		} else {
			this.val = val;
		}

		this.others = others;
	}


	/**
	* 	addDeleteEvent. create and push event of delete {delete: 1, _id:_id, by, _id}.
	* 	@param {string} _id - Mongo objectID created for this event.
	* 	@param {string} by - Mongo ObjectID user connected and requested this event.
	*/
	addDeleteEvent (_id, by) {
		this.val.push({
			delete: 1,
			_id: _id,
			by: by
		});
	}


	/**
	* 	addRestoreEvent. create and push event of restore {restore, _id, by}.
	* 	@param {string} _id - Mongo objectID created for this event.
	* 	@param {string} by - Mongo ObjectID user connected and requested this event.
	*/
	addRestoreEvent (_id, by) {
		this.val.push({
			restore: 1,
			_id: _id,
			by: by
		});
	}



	/**
	* 	addEditEvent. create and push event of edit {_id, by, val}.
	* 	@param {string} _id - Mongo objectID created for this event.
	* 	@param {string} by - Mongo ObjectID user connected and requested this event.
	*	@param {string} type - String that identifies the type of val object, added in the object as is to enable future adding new types if empty string then it's automatic edit
	*/
	addEditEvent (_id, by, type, val) {
		let event = {
			_id: _id,
			by: by,
			val: val
		};

		if (type.length != 0) { // because if none exists then it's direct value.
			event[type] = 1;
		}

		this.val.push(event);
	}


	async getFieldAsync(next) { // just in case if happened to be a blockage in a nested FIELDS
		// 
	}


	/**
	*	toJSON. convert field from object to json data object that can be stored directly to mongo
	*	@param {boolean} includeName - true to include this field name to returned json
	*	@return {Object} converted object can be stored in mongo 
	*/
	toJSON(includeName) { // this function convert this object to JSON object.
		let result = {
			_id: this._id,
			by: this.by,
			others: this.others,
			val: []
		}

		for (let event of val) {
			let eventForResult = {};

			if ( event.hasOwnProperty("field") ) {//if it's field then it's an object of the same class.

				eventForResult.val = event.val.getField();

				for (let prop of event) {
					if (prop != 'val') {
						event[prop] = event[prop];
					}
				}

			} else {
				eventForResult = event;
			}
			result.val.push(eventForResult);
		}

		return result;
	}



}









//NOTICE: HERE YOU ADD CLASSES TO EXPORT IN A {} WAY ( CONST {CLASS1, CLASS2} = REQUIRE("DEF..");)
module.exports = {
	UserData,
	Field
};