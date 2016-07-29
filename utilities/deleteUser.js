const repl = require('repl');
const util = require('util');
var fs = require('fs');
var mongodb = require('mongodb');
var yaml = require('js-yaml');


var yesHandlerToSet = null
var fileContent = [];
var foundDocuments = [];
var foundEmailIDs = [];

var replServer = repl.start({prompt: '> ', useColors: true, writer: function (x) {
	return x
}});

replServer.defineCommand('y', function() {
	if (yesHandlerToSet) {
		yesHandlerToSet()
	} else {
		console.log("Nothing to confirm")
	}
	yesHandlerToSet = null
    this.lineParser.reset();
    this.bufferedCommand = '';
    this.displayPrompt();
})

queryUser = function(fileName){
    mongodb.MongoClient.connect(process.env.MONGODB_URL || "mongodb://localhost/lynedup", function (err, db) {
        if (err) {
            console.log(err)
            process.exit(0)            
        }

        // Read in file content
        var fileContentTmp = fs.readFileSync(fileName).toString().split("\n");        
      
        // Remove white space and convert to lower case  
        fileContent = fileContentTmp.map(function(x){return x.toLowerCase().trim();});
             
        // Query on the Users collection for matching email addresses
        db.collection('users').find({

            emailAddress: { $in: fileContent }

        }).toArray(function (err, found) {

            if (err) {
                console.log(err)
                process.exit(0)            
            }

            // Find only the emailAddress property from the found emails
            var foundEmails = found.map(function(x) {return x.emailAddress;});                    
            // Find emails that do not appear in the found emails
            missing = fileContent.filter(function(x) { return foundEmails.indexOf(x)<0});

            // Save the list of found emails
            foundDocuments = found;

             // Find only the _id property from the found emails
            foundEmailIDs = found.map(function(x) {return x._id;});   
                
            console.log("\nRequested to delete: " + fileContent.length);
            console.log("Matched in DB: " + found.length);
            console.log("Missing in DB: " + missing.length);
            console.log(yaml.dump(missing));
            console.log("Are you sure?? enter .y")     
        })   
})
}
  
deleteUser = function() {
    mongodb.MongoClient.connect(process.env.MONGODB_URL || "mongodb://localhost/lynedup", function (err, db) {      

        if (err) {
            console.log(err)
            process.exit(0)            
        }

        // Save the list of matching documents first before try to delete
        var seconds = new Date().getTime() / 1000;
        fs.writeFile("foundDocs_"+seconds, JSON.stringify(foundDocuments), function(err){
            if(err) {
                console.log("Failed to save matched documents to disk: " + err);
                process.exit(0);
            }

            try {            
                db.collection('users').deleteMany({

                    _id: {$in: foundEmailIDs}

                }, function(err, r){
                    
                    if (err) {
                        console.log(err)
                        process.exit(0)            
                    }
                    
                    console.log("Deleted " + r.deletedCount);
                });
            } catch (e) {
                console.log(e)
            }          

        })      

    })
}


replServer.context.del = function (fileName) {
  	yesHandlerToSet = function () {        
      deleteUser();        
    }
    
    queryUser(fileName);          
        
    return ""
}
