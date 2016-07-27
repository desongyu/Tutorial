const repl = require('repl');
const util = require('util');
var fs = require('fs');
var mongodb = require('mongodb');
var yaml = require('js-yaml');


var yesHandlerToSet = null
var fileContent = [];

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

/////////////////////////////////////////////////////////////
// define commands here
queryUser = function(fileName){
    mongodb.MongoClient.connect(process.env.MONGODB_URL || "mongodb://localhost/lynedup", function (error, db) {
        if (error) {
            console.log(error)
            process.exit(0)            
        }

        // Read in file content
        var fileContentTmp = fs.readFileSync(fileName).toString().split("\n");        
               
        for (i in fileContentTmp) {            
            // Convert content to lower case and remove white spaces
            fileContent[i] = fileContentTmp[i].toLowerCase().trim();            
        }
     
        // Query on the Users collection for matching email addresses
        db.collection('users').find(
            {
                emailAddress: { $in: fileContent }
            })
            .toArray(function (error, results) {
            
             console.log("\nRequested to delete: " + fileContent.length);
             console.log("Found in DB: " + results.length);
             console.log("Are you sure?? enter .y")
        })   
})
}
  
deleteUser = function() {
    mongodb.MongoClient.connect(process.env.MONGODB_URL || "mongodb://localhost/lynedup", function (error, db) {      

        if (error) {
            console.log(error)
            process.exit(0)            
        }

        try {            
            db.collection('users').deleteMany(
                {
                    emailAddress: {$in: fileContent}
                }, 
                function(err, r){
                    
                    if (error) {
                        console.log(error)
                        process.exit(0)            
                    }
                    
                    console.log("Deleted " + r.deletedCount);
                });
            
        } catch (e) {
            console.log(e)
        }           

    })
}


replServer.context.del = function (fileName) {
  	yesHandlerToSet = function () {        
      deleteUser();        
    }
    
    queryUser(fileName);          
        
    return ""
}
