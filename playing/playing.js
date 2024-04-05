var Cote = require("cote");

const flatted = require("flatted");


const responder = new Cote.Responder({ name: 'playing', key: 'key' });
const requester = new Cote.Requester({ name: 'Encryption' });

const requesterFM = new Cote.Requester({ name: 'playing', key: 'playing' });


responder.on('actionRouting', (err, cb) => {
    console.log("playing.js cote reponded");
    cb("args from playing.js, arg1", "arg2");

});

responder.on('')


var envylop = { type: 'decrypt', data: 'data content' };

/**
 * @function requestFromEncryption - playing.js
 */
async function requestFromEncryption() {
    console.log("playing.js started countdown to call Encryption cote");
    setTimeout(() => {
        requester.send(
            envylop,
            (arg) => {
                console.log('responder responded to playing.js request');
            },
        );
    }, 2000);


}

/**
 * 
 * @function requestFromFrontMarshal - 
 */
async function requestFromFrontMarshal() {
    console.log("playing.js started countdown requesting from marshal");
    var mEnvylop = { type: 'actionRouting', data: 'data content' };
    setTimeout(
        () => {
            requesterFM.send(
                mEnvylop,
                (msg) => { console.log('msg sent from FM to playing.js: ' + msg) });
        }, 2000
    );
}

/**
 * @function play
 */
exports.play = () => {
    console.log('play in playing.js called');
    requestFromEncryption();
    requestFromFrontMarshal();
}