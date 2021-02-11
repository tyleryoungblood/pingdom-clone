/*
 * library used for storing and editing data
 *
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers')

// Container for module (to be exported)
let lib = {};

// Define base dir of data folder
lib.baseDir = path.join(__dirname,'/../.data/'); // __dirname is the current directory of this file, traverse up one level and into .data (/../.data)

// CREATE - Write data to a file
lib.create = function(dir,file,data,callback) {
    // Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(err,fileDescriptor) {
        if(!err && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // write to file and close it
            fs.writeFile(fileDescriptor,stringData, function(err) {
                if(!err)  {
                    fs.close(fileDescriptor, function(err) {
                        if(!err) {
                            callback(false); // look up the ErrorBack pattern. It expects an error, so if there isn't an error, we need to callback false.
                        } else {
                            callback('Error closing new file.');
                        }   
                    });
                } else {
                    callback('Error writing to new file.');
                }
            });
        } else {
            callback('Could not create new file. It may already exist.');   
        }
    });
}

// READ - read data from a file
lib.read = function(dir,file,callback) {
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', function(err,data) {
        if(!err && data) {
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData)
        } else {
            callback(err,data);
        }
        
    })
}

// UPDATE - update file with new data
lib.update = function(dir,file,data,callback) {
    // open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            // convert data to string
            const stringData = JSON.stringify(data);

            // truncate the file before writing new data to it
            fs.ftruncate(fileDescriptor, function(err){
                if(!err) {
                    fs.writeFile(fileDescriptor,stringData, function(err){
                        if(!err) {
                            fs.close(fileDescriptor, function(err) {
                                if(!err) {
                                    callback(false); // no error
                                } else {
                                    callback('there was an error closing the file.');
                                }
                            })
                        } else {
                            callback('Error writing to existing file.')
                        }
                    })
                } else {
                    callback('Error truncating file');
                }
            })
        } else {
            callback('Could not open the file for updating. It may not exist');
        }
    })
}

// DELETE - delete file
lib.delete = function(dir, file, callback) {
    // unlink - remove file from filesystem
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
        if(!err) {
            callback(false);
        } else {
            callback('There was an error deleting the file.')
        }
    })
}


// Export module
module.exports = lib;