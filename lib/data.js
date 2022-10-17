/* Library for Storing and editing data */

/* Dependecias */
const fs = require('fs')
const path = require('path')
const helpers = require('./helpers')
/* Container for the module */
const lib = {
    
    baseDir: path.join(__dirname, '../.data/'),

    create: (dir,file, data, callback) => {
        fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor){
                let stringData = JSON.stringify(data)
                fs.writeFile(fileDescriptor, stringData, (err) => {
                    if(err)
                    {                      
                        console.log(err)
                    }
                    else{
                        callback(false)
                        fs.close(fileDescriptor)
                    }
                        
                })
            } else {
                callback('Could not create new file.It may already exist.')
            }
        })
    },

    read: (dir, file, callback) => {
        fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', (err, data) => {
            if(!err && data){
                let parsedData = helpers.parseJsonToObject(data);
                callback(false, parsedData)
            } else {
                callback(err, data)
            }
        })
    },

    update: (dir,file,data,callback) => {
        fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err, fileDescriptor) => {
            if (!err && fileDescriptor){
                let stringData = JSON.stringify(data)
                fs.truncate(fileDescriptor, (err) => {
                    if (!err){
                        fs.writeFile(fileDescriptor, stringData, (err) => {
                            if (!err){
                                callback(false)
                                fs.close(fileDescriptor)
                            } else {
                                console.log("error writing to existing file: ", err)
                            }
                        })
                    } else {
                        callback('Error truncating file')
                    }
                })
            } else {
                callback('Could not open the file for updating, it may not exist yet.')
            }
        })
    },

    delete: (dir, file, callback) => {
        fs.unlink(lib.baseDir+dir+'/'+file+'.json', (err) => {
            if (!err){
                callback(false)
            } else {
                callback('Error deleting file')
            }
        })
    }
}

/* Export it */
module.exports = lib;