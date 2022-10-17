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
    tokens: (data, callback) => {
        let acceptableMethods = ['post', 'get', 'put', 'delete']
        if (acceptableMethods.indexOf(data.method) > -1){
            handlers._tokens[data.method](data, callback);
        }
        else{
            callback(405)
        }
    },
    _users: {
        /* GET */
        get: (data, callback) => {
            let phone = typeof(data.query.phone) == 'string' && data.query.phone.trim().length == 10 ? data.query.phone.trim() : false;
            if (phone){
                //Get the token from the headers
                let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                    if (tokenIsValid){
                        crud.read('users', phone, (err, data) => {
                            if(!err && data){
                                delete data.hashedPassword;
                                callback(200, data)
                            } else {
                                callback(404);
                            }
                        })
                    }else{
                        callback(403, {'Error':'Missing authentication token or token is invalid.'})
                    }
                })
            } else {
                callback(400,{'Error': 'Missing phone number'})
            }
        },
        /* POST */
        post: (data, callback) => {
            //Filter Incoming Data
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
        /* PUT */
        put: (data, callback) => {
            //Required Field
            let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
            //Check for Optional FIelds
            let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
            let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
            let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

            if (phone){
                if(firstName || lastName || password){
                    //Get the token from the headers
                    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                        if (tokenIsValid){ 
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
                        } else {
                            callback(403, {'Error':'Missing authentication token or token is invalid.'});   
                        }
                    });
                }
            } else {
                callback(400, {'Error':'Missing phone number.'})
            }
        },
        /* DELETE */
        delete: (data, callback) => {
            //Required Field
            let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
            if (phone){
                //Get the token from the headers
                let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                    if (tokenIsValid){ 
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
                        callback(403,{'Error' : 'TOken issues'})
                    }
                });
            } else {
                callback(400,{'Error': 'MIssing required field'})
            }
        }
    },
    _tokens : {
        verifyToken: (id, phone, callback) => {
            crud.read('tokens', id, (err, tokenData) => {
                if (!err && tokenData){
                    //Check that the token is for the given user and has not expired
                    if (tokenData.phone == phone && tokenData.expires > Date.now())
                        callback(true);
                    else
                        callback(false);
                } else {
                    callback(false);
                }
            })
        },
        /* GET */
        get: (data, callback) => {
            let id = typeof(data.query.id) == 'string' && data.query.id.trim().length == 20 ? data.query.id.trim() : false;
            if (id){
                crud.read('tokens', id, (err, tokenData) => {
                    if(!err && tokenData){
                        callback(200, tokenData)
                    } else {
                        callback(404);
                    }
                })
            } else {
                callback(400,{'Error': 'Missing token id.'})
            }           
        },
        /* POST */
        post: (data, callback) => {
            let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
            let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
            if (phone && password){
                crud.read('users', phone, (err, userData) => {
                    if (!err && userData){
                        //Hash the sent password and compare to the password stored in the user object.
                        let hashedPassword = helpers.hash(password)
                        if (hashedPassword == userData.hashedPassword){
                            //if valid , create a new token with random name. Expiration date 1 hour
                            let tokenId = helpers.createRandomString(20);
                            let expires = Date.now() + 1000 * 60 * 60;
                            let tokenObject = {
                                'phone' : phone,
                                'id': tokenId,
                                'expires': expires,
                            }
                            crud.create('tokens', tokenId, tokenObject, (err) => {
                                if(!err){
                                    callback(200,tokenObject);
                                } else {
                                    callback(500, {'Error': 'Could not create new token...'})
                                }
                            })
                        } else {
                            callback(400, {'Error' : 'Password did not match'})
                        }
                    } else {
                        callback(400, {'Error' : 'Could not find specified user'})
                    }
                })
            }
        },
        /* PUT */
        put: (data, callback) => {
            let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
            let extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? data.payload.extend : false;
            if (id && extend){
                crud.read('tokens', id, (err, tokenData) => {
                    if (!err && tokenData){
                        if (tokenData.expires > Date.now()){
                            //Set the expiration an hour from now
                            tokenData.expires = Date.now() + 1000 * 60 * 60;
                            crud.update('tokens', id, tokenData, (err) => {
                                if(!err){
                                    callback(200, {'Message':"Token refreshed"});
                                } else {
                                    callback(500, {'Error' : 'Could not update the tokens expiration'})
                                }
                            })
                        } else {
                            callback(400, {'Error' : 'The token has already expired, and cannot be extended'})
                        }
                    } else {
                        callback(400, {'Error' : 'Specified token does not exist'});
                    }
                })
            } else {
                callback(400, {'Error' : 'Missing required field(s) or field(s) are invalid.'})
            }
        },
        /* DELETE */
        delete: (data, callback) => {
            //Required Field
            let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
            if (id){
                crud.read('tokens', id, (err, data) => {
                    if(!err && data){
                        crud.delete('tokens', id, (err) => {
                            if (!err)
                                callback(200)
                            else
                                callback(500, {'Error' : 'Could not delete the specified token'})
                        })
                    } else {
                        callback(400, {'Error': 'Couldn\'t find/delete specified token(s).'})
                    }
                })
            } else {
                callback(400,{'Error': 'Missing required field'})
            }
        },
    }
}

module.exports = handlers