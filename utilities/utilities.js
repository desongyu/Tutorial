var session = require('repl').start({prompt: "", ignoreUndefined: true})
var mongodb = require('mongodb')
var yaml = require('js-yaml')
var readline = require('readline');

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


    var propipeline=
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

            ];

    session.context.aggregatePro = function(){

        db.collection('proposals').aggregate(
            propipeline
        ).toArray(function(err, result){
                if (err){
                    console.log(err)
                }
                else{
                    //console.log(result[0]);
                    //console.log(yaml.dump(result));
                    for (var i=0; i < result.length; i++){
                      //  console.log("DEBUG I is"+i+"/n" );
                        delete (result[i].pro[0].passwordHash);

                    }
                    //console.log(result)
                    console.log(yaml.dump(result));
                }
            }
        )
    }

    var requestpipeline = 
            
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
                from:"users",
                localField:"clientID",
                foreignField:"_id",as:"client"
            }
        }

    ];

     session.context.aggregateRequest = function(){

        db.collection('requests').aggregate(
           requestpipeline
        ).toArray(function(err, result){
                if (err){
                    console.log(err)
                }
                else{
                    console.log(result[0]);
                    //console.log(yaml.dump(result));
                    for (var i=0; i < result.length; i++){
                      //  console.log("DEBUG I is"+i+"/n" );
                      result[i].submissionDateTime = new Date(result[i].submissionTimestamp*1000).toString();
                      delete(result[i].submissionTimestamp);
                      delete(result[i].client[0].passwordHash);
                    }
                    console.log(result[0])
                   // console.log(yaml.dump(result));
                }
            }
        )
    }

    var proposalpipeline2 =
    [
    {
        $match:
        {
            status: 
            {
                $ne:"draft"
            },
            submissionTimestamp:
            {
                $gt:Date.now()/1000-24*3600*5
            }
        }
    },
    {
        $lookup:
        {
            from:"requests",
            localField:"requestID",
            foreignField:"_id",as:"request"
        }
    },
    {
        $lookup:
        {
            from:"users",localField:"proID",foreignField:"_id",as:"pro"
        }
    }
    ];

    session.context.aggregateProposal = function(){

        db.collection('proposals').aggregate(
           proposalpipeline2
        ).toArray(function(err, result){
                if (err){
                    console.log(err)
                }
                else{
                    console.log(result[0]);
                    //console.log(yaml.dump(result));
                    for (var i=0; i < result.length; i++){
                      //  console.log("DEBUG I is"+i+"/n" );
                      result[i].submissionDateTime = new Date(result[i].submissionTimestamp*1000).toString();
                      delete(result[i].submissionTimestamp);
                      result[i].request = result[i].request[0];
                      result[i].pro = result[i].pro[0];
                      delete (result[i].proID);
                    }
                    console.log(result[0])
                   // console.log(yaml.dump(result));
                }
            }
        )
    }

    session.context.deleteUser = function(userId){ 
        db.collection('users').findOne({
            _id: userId
        }, function(err, result){
            console.log(yaml.dump(result));

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('Are you sure? ', (answer) => {
                console.log('Your response is:', answer);

                //rl.close();                
            });
        });
    }


})
