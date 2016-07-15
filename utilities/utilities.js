var session = require('repl').start({prompt: "", ignoreUndefined: true})
var mongodb = require('mongodb')
var yaml = require('js-yaml')

mongodb.MongoClient.connect(process.env.MONGODB_URL || "mongodb://localhost/lynedup", function (error, db) {
    if (error) {
        console.log(error)
        process.exit(0)
    }
    
    session.context.listUsers = function () {
        db.collection('users').find({}).toArray(function (error, results) {
            if (error) {
                console.log(error)
            } else {
                console.log(JSON.stringify(results, null, 2))
            }
        })
    }
    
    session.context.findUser = function (text) {
        var cond={$regex: text, $options: "i"};
        db.collection('users').find(
            {
                $or: [
                    { firstName:cond },
                    { lastName:cond },
                    { emailAddress: cond }
                ]
            }
        ).toArray(function (error, results) {
            if (error) {
                console.log(error)
            } else {
                console.log(yaml.dump(results))
            }
        })
    }
    
    
})

