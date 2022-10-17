const crypto = require('crypto')
const config = require('../config')

let helpers = {
    /*****************/
    /* --- HASH --- */
    /***************/
    hash: (str) => {
        //SHA256 is built-in to node
        if(typeof(str) == 'string' && str.length > 0){
            let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
            console.log("hash", hash)
            return hash
        } else {
            return false;
        }
    },
    /**************************/
    /* --- INT TO OBJECT --- */
    /************************/
    parseJsonToObject : (str) => {
        try {
            let obj = JSON.parse(str)
            return obj
        }catch(e) {
            return {}
        }
    },
    createRandomString : (strLength) => {
        strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
        if (strLength){
            //Define all the possible characters that could go into a string.
            let possibleChars = 'abcdefghijklmnopqrstuvxyz0123456789'
            let str = '';
            for(i = 1; i <= strLength; i++){
                //Get a random chracter from the possible chracters tring
                let randomChracter = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
                str +=randomChracter
            }
            return str;
        } else {
            return false;
        }
    },

}


//Export the module
module.exports = helpers