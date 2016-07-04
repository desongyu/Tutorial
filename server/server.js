const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient
app.set('view engin','ejs');
app.use(express.static('public'));
app.use(bodyParser.json());

MongoClient.connect('mongodb://172.17.0.1/test', function (err, database){
  if (err) return console.log(err);
    db = database;
    app.listen(3000, function(){
        console.log('with mongodb, listening on 3000')
    })
})

app.use(bodyParser.urlencoded({extended:true}));
//app.listen(3000,function(){
//    console.log('static listening on 3000, this is listening lines');
//});

app.get('/',getcbk);

function getcbk (req, res){
    //res.send('Hello world');
//    res.sendFile(__dirname+'/index.html');
    var cursor = db.collection('quotes').find();
    db.collection('quotes').find().toArray(function(err,results){
        console.log(results);
        res.render('index.ejs',{quotes:results});    
    })
    
}

app.post('/quotes', postcbk);

function postcbk (req,res){
    console.log('Hellooooooooooooooo, i am post call back');
    console.log(req.body);
    db.collection('quotes').save(req.body,function(err,result){
        if (err) return console.log(err);
        console.log('saved to database');
        res.redirect('/');
    })
    
}

app.put('/quotes',function(req,res){
 db.collection('quotes').findOneAndUpdate({name: 'yoda'}, {
    $set: {
      name: req.body.name,
      quote: req.body.quote
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})
