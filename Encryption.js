const Cote = require('cote');
const dev = require("./utils/dev");


console.log("hi I'm Encryption.js this msg from myself");


/** 
*NOTICE 	RECIEVE ENCRYPTED MSG TO  DECRYPT
		*SEND BACK TO CALLER THE STATUS AND THE RESULT
		*FAILED STATUS OR SUCCESS STATUS

		*RECIEVE MSG TO ENCRYPT
		*SEND BACK STATUS AND RESULT
		*FAILED OR SUCCESS

		*IT RECIEVES ENVYLOP THAT CONTAINS USELESS COTE CONFIGS
		*AND DATA ATTRIBUTE
		*DATA IS THE MSG TO ENCRYPT AND DECRYPT

		*SEND BACK AN ENVYLOP CONTAINS THE PROCESS STATUS & DATA
@event
*/


const EncryptionResponder = new Cote.Responder({ name: 'Encryption', key: 'Encryption' });


EncryptionResponder.on(
    'decrypt',
    (recievedEnvylop, next) => {
        var data = recievedEnvylop.data;

        // NOTICE: 	HERE WE TELL CALLER THAT DECRYPTION SUCCESS
        //			LEFT FOR FUTURE ENCRYPTION IMPLEMENTATION..
        var envylop = { status: 'SUCCESS', data: data };

        dev.logTrace(data, 'Encryption recieved for decrypting');

        dev.logTrace(data, 'Encryption sending back decrypt');

        next(envylop);

    }

);


EncryptionResponder.on(
    'encrypt',
    (recievedEnvylop, next) => {
        var data = recievedEnvylop.data;

        // NOTICE: HERE DATA NEEDS TO BE ENCRYPTED TO BE SENT BACK TO USER CYPHERED.
        var envylop = { status: 'SUCCESS', data: data };

        dev.logTrace(data, 'Encryption recieved for encrypting');

        dev.logTrace(data, 'Encryption sending back encrypt');

        next(envylop);

    }
);