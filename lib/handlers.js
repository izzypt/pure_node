const crud = require('./data')
const helpers = require('./helpers')

let handlers = {
    sample: (data, callback) => {
        callback(406, {'name' : 'sample handler'});
    },
    notFound: (data, callback) => {
        callback(404, {});
    },
    users : (data, callback) => {
        let acceptableMethods = ['post', 'get', 'put', 'delete']
        if (acceptableMethods.indexOf(data.method) > -1){
            handlers._users[data.method](data, callback);
        }
        else{
            callback(405)
        }
    },
    _users: {
        get: (data, callback) => {
            let phone = typeof(data.query.phone) == 'string' && data.query.phone.trim().length == 10 ? data.query.phone.trim() : false;
            if (phone){
                crud.read('users', phone, (err, data) => {
                    if(!err && data){
                        delete data.hashedPassword;
                        callback(200, data)
                    } else {
                        callback(404);
                    }
                })
            } else {
                callback(400,{'Error': 'Missing phone number'})
            }
        },
        post: (data, callback) => {
            //FIlter Incoming Data
            let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
            let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
            let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
            let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
            let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
            //Check if we have all the required fields
            if(firstName && lastName && phone && password && tosAgreement){
                crud.read('users', phone, (err, data) => {
                    if (err){
                        // Hash the password
                        console.log("pw", password)
                        let hashedPassword = helpers.hash(password)
                        console.log("hashedPW", hashedPassword)
                        if(hashedPassword){
                            //Create the User object
                            let userObject = {
                                'firstName': firstName,
                                'lastName': lastName,
                                'phone': phone,
                                'hashedPassword': hashedPassword,
                                'tosAgreement': true
                            }
                            //Store the user
                            crud.create('users', phone, userObject, (err) => {
                                if(!err){
                                    callback(200, "Created user sucessfully");
                                } else {
                                    console.log(err);
                                    callback(500,{'Error': 'Could not create new user.'})
                                }
                            })
                        } else 
                            callback(500, {'Error': 'Could not hash the user\'s password'});
                    } else {
                    //A user already exists.
                    callback(400, {'Error': 'A user with that phone already exists.'});
                }
                })
            } else {
                callback(400, {'Error': 'Missing required fields.'})
            }
        },
        put: (data, callback) => {
            //Required Field
            let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
            //Check for Optional FIelds
            let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
            let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
            let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

            if (phone){
                if(firstName || lastName || password){
                    crud.read('users', phone, (err, userData) => {
                        if(!err && userData){
                            if(firstName)
                                userData.firstName = firstName
                            if(lastName)
                                userData.lastName = lastName
                            if (password)
                                userData.hashedPassword = helpers.hash(password)

                            //store the new updates
                            crud.update('users', phone,userData, (err) => {
                                if (!err){
                                    callback(200);
                                } else {
                                    console.log(err)
                                    callback(500, {'Error': 'Could not update the user'})
                                }
                            })
                        } else{
                            callback(400,{'Error': 'Specified user does not exist.'})
                        }
                    })
                }
            } else {
                callback(400, {'Error':'Missing phone number.'})
            }
        },
        delete: (data, callback) => {
            //Required Field
            let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
            if (phone){
                crud.read('users', phone, (err, data) => {
                    if(!err && data){
                        crud.delete('users', phone, (err, data) => {
                            if (!err)
                                callback(200)
                            else
                                callback(500, {'Error' : 'Could not delete the specified user'})
                        })
                    } else {
                        callback(400, {'Error': 'Couldn\'t find/delete specified user(s).'})
                    }
                })
            } else {
                callback(400,{'Error': 'MIssing required field'})
            }
        }
    }
}

module.exports = handlers