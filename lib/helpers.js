const crypto = require('crypto')
const config = require('../config')

/* Helpers for various tasks */
let helpers = {
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
    parseJsonToObject : (str) => {
        try {
            let obj = JSON.parse(str)
            return obj
        }catch(e) {
            return {}
        }
    }
}


//Export the module
module.exports = helpers