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

    
    session.context.test = function() {
        db.collection('proposals').aggregate(
    [
         {
            $match:{}
         },
         {
            $lookup:
            {
             from:"users",
             localField:"proID",
             foreignField:"_id", as:"pro"
            }
         }
    ]
            
/*            
    [
        {
            $match:
            {
                submissionTimestamp:
                {
                    $gt:Date.now()/1000-24*3600*5
                }
            }
        },
        {
            $lookup:
            {
                from: "users",
                localField: "clientID",
                foreignField: "_id",
                as: "client"                    
            }
                   
        }
    ]
    */
    ).toArray(function(error, results){
        if (error) {
              console.log(error);
          } 
        else {     
                          
              for (var i=0; i<results.length; ++i) {
//                  results[i].submissionDateTime = new Date(results[i].submissionTimestamp*1000).toString();
//                  delete results[i].submissionTimestamp;
//                  delete results[i].client.passwordHash;                   
                  delete(results[i].pro[0].passwordHash);                  
                }
                
              console.log(yaml.dump(results));                  
          }
          
    
    })
    };
          
})