var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert');

var db = new Db('test', new Server('localhost', 27017));
  // Establish connection to db
  db.open(function(err, db) {
    // Some docs for insertion
    var docs = [{
        title : "this is my title", author : "bob", posted : new Date() ,
        pageViews : 5, tags : [ "fun" , "good" , "fun" ], other : { foo : 5 },
        comments : [
          { author :"joe", text : "this is cool" }, { author :"sam", text : "this is bad" }
        ]}];

    // Create a collection
    var collection = db.collection('shouldCorrectlyExecuteSimpleAggregationPipelineUsingArray');
    // Insert the docs
    collection.insert(docs, {w: 1}, function(err, result) {

      // Execute aggregate, notice the pipeline is expressed as an Array
      collection.aggregate([
          { $project : {
            author : 1,
            tags : 1
          }},
          { $unwind : "$tags" },
          { $group : {
            _id : {tags : "$tags"},
            authors : { $addToSet : "$author" }
          }}
        ], function(err, result) {
          assert.equal(null, err);
          assert.equal('good', result[0]._id.tags);
          assert.deepEqual(['bob'], result[0].authors);
          assert.equal('fun', result[1]._id.tags);
          assert.deepEqual(['bob'], result[1].authors);

          db.close();
      });
    });
  });