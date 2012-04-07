var DB = require("./db.js").DB;
var score = require("./score.js");
var OrderedSet = require("./ordered_set.js").OrderedSet;
var _ = require('underscore')._;

var db = new DB();
var workSet = new OrderedSet();

var processed = 0;
var recieved = 0;
var getMoreWorkTimeout = 0;

function _getScore(username, repo, callback) {
  score.getScore(username, repo, callback);
}

var getScore = _.throttle(_getScore, 1000);

function getMoreWork() {
  function processResults(res) {
    recieved = res.length;
    if(recieved === 0) {
      console.log("recieved 0");
      getMoreWorkTimeout = setTimeout(getMoreWork, 1000);
    } else {
      clearTimeout(getMoreWorkTimeout);
      console.log("queue",res);
    }
    res.map(function(item) {
      repoInfo = db.keyToHash(item);
      getScore(repoInfo.name, repoInfo.repo, function(score) {
        gotScore(db.hashToKey({name:repoInfo.name, repo:repoInfo.repo}), score);
      });
    });
  }

  function gotScore(repo, score) {
    db.setScore(repo, score, function(err, res) {
      processed += 1;
      if(processed === recieved) {
        processed = 0;
        recieved = 0;
        console.log("calling getmorework");
        getMoreWork();
      }
    });

  }
  db.getNextProcessingChunk(60, processResults);
}



getMoreWork(); //this should be triggers from redis


