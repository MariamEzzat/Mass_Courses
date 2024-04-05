/*
	CONTAINS constants and definitions of classes or data types that can be used in different objects.
*/


/** Document class that contains othere & fields object */
class Document {

	/**
	*	Constructor.
	*	
	*	@param {Document} docJson - Document json for sdk classes conversion document & field.
	* 	document json must be in this schema: {fields: [{name:"fieldName",...},..], others: [{key: {value}},..]}
	*/
	constructor (docJson) {

		let strayCounter = 0; // for fields without names.

		if ( docJson.hasOwnProperty("fields") ) {

			for (let field of fields) {

				if (field.hasOwnProperty("name")) {
					this[field.name] = new Field(field);
					continue;
				} else {
					this[strayCounter++] = new Field(field);
				}

			}
		}

		if (docJson.hasOwnProperty("others")) {

			for (let prop of docJson.others) {
				this[Object.keys(prop)[0]] = prop;
			}

		}



	}
}


/** Field class */
class Field {

	
	constructor (fieldJson) {
		for (let prop of fieldJson) {
			let key = Object.keys(prop)[0];
			if (key == "val") {
				for (let i=0; i<prop; i++) {
					if (prop[i].hasOwnProperty("field")) {
						prop[i].val = new Field(prop[i].val);
					}
				}
			}
			this[Object.keys(prop)[0]] = prop;
		}
	}
	
	

}
