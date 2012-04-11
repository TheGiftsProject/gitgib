var DB = require("./db.js").DB;
var score = require("./score.js");
var OrderedSet = require("./ordered_set.js").OrderedSet;
var _ = require('underscore')._;

var db = new DB();
var workSet = new OrderedSet();

var processed = 0;
var recieved = 0;
var getMoreWorkTimeout = 0;
var queue = [];

setInterval(function() {
  var item = queue.pop();
  if(item) {
    item.function(item.user,item.repo,item.callback);
  }
}, 1000);

function getScore(username, repo, callback) {
  queue.push({function:score.getScore, user:username, repo:repo,callback:function(score) {
    callback(username, repo, score);
  }});
}


function getMoreWork() {
  function processResults(res) {
    recieved = res.length;
    if (recieved === 0) {
      getMoreWorkTimeout = setTimeout(getMoreWork, 1000);
    } else {
      clearTimeout(getMoreWorkTimeout);
    }
    res.map(function (item) {
      repoInfo = db.keyToHash(item);
      getScore(repoInfo.name, repoInfo.repo, function (user,repo,score) {
        gotScore(db.hashToKey({name: user, repo: repo}), score);
      });
    });
  }

  function gotScore(repo, score) {
    db.setScore(repo, score, function (err, res) {
      processed += 1;
      if (processed === recieved) {
        processed = 0;
        recieved = 0;
        getMoreWork();
      }
    });

  }

  db.getNextProcessingChunk(60, processResults);
}


getMoreWork(); //this should be triggers from redis


