let environments = {
    staging: {
        'port' : 3000,
        'httpsPort': 3001,
        'envName' : 'staging',
        'hashingSecret': 'thisIsASecret',
        'maxChecks' : 5,
    },
    production: {
        'port' : 5000,
        'httpsPort': 5001,
        'envName' : 'production',
        'hashingSecret': 'thisIsAnotherSecret',
        'maxChecks' : 5,
    }
}

//Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
//Check if environment is one of the abouve, otherwise default to staging
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging; 

module.exports = environmentToExport;