const repl = require('repl');
const util = require('util')


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

replServer.context.del = function () {
    console.log("-----------context.del----------")
  	yesHandlerToSet = function () {
  		console.log("deleted everything.")
  	}
	console.log("are you sure?? enter .y")
	return ""
}
