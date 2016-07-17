db.proposals.aggregate(
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
).toArray()[0]


db.requests.aggregate(
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
    ]).toArray().map(
    (x)=>{
        x.submissionDateTime = new Date(x.submissionTimestamp*1000).toString(); 
        delete x.submissionTimestamp; 
        x.client.map(
            (y)=>{
            delete y.passwordHash; 
            return y
        }
        ); 
        return x
    }
)


db.proposals.aggregate(
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
]).toArray().map(
    (x)=>{
        x.submissionDateTime = new Date(x.submissionTimestamp*1000).toString(); 
        delete x.submissionTimestamp; 
        x.request=x.request[0]; 
        x.pro=x.pro[0];
        delete x.proID; 
        return x
    }
)