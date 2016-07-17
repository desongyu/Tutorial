var fs=require('fs')
var x = fs.readFileSync(process.argv[2])
var y = JSON.parse(x)

var output='';
for (var i=0; i<y.length; i++){
//console.log(JSON.stringify(y[i]))
output+=JSON.stringify(y[i]) + "\n";
}

fs.writeFile("requests.input", output)
