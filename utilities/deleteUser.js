const repl = require('repl');
const util = require('util');
var fs = require('fs');
var mongodb = require('mongodb');
var yaml = require('js-yaml');


var yesHandlerToSet = null

var replServer = repl.start({prompt: '> ', useColors: true, writer: function (x) {
    console.log("-----------repl start writer----------")	
	return x
}});

replServer.defineCommand('y', function() {
    console.log("----------defineCommand y----------")
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

replServer.context.del = function (fileName) {
    console.log("-----------context.del----------")
  	yesHandlerToSet = function () {      
        
  		console.log("deleted everything in " + fileName);
  	}
    
    mongodb.MongoClient.connect(process.env.MONGODB_URL || "mongodb://localhost/lynedup", function (error, db) {
        if (error) {
            console.log(error)
            process.exit(0)            
        }

        // Read in file content
        var fileContentTmp = fs.readFileSync(fileName).toString().split("\n");
        var fileContent = [];
        var queryContent = "[";
        for (i in fileContentTmp) {            
            // Remove any line feeds
            fileContent[i] = fileContentTmp[i].replace(/\n|\r/g,"");
            console.log("\n"+JSON.stringify(fileContent[i])+"!");        
            //queryContent = queryContent +
        }
        
        var cond={$regex: fileContent, $options: "i"};
         db.collection('users').find({emailAddress: {$in:
            fileContent}}).toArray(function (error, results) {
             console.log(results);
        })
        
        console.log("finding ---- " + JSON.stringify(fileContent[0]) + "!")
        
         console.log("are you sure?? enter .y")
        return ""
    })
}
