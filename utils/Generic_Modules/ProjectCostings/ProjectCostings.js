// dependencies
// constants
// definitions




class Costing {


	constructor (collectionName) {
		this.collectionName = collectionName;

	}

	async newItem (data, options) {
		/*return new Promise((res, rej) => {

		})*/
		let preparedData = data;
		// validation
		
		return dbHandler.newItem(preparedData);
		
	}

	//async 

}