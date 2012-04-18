var DB = require("./db.js").DB;
var score = require("./score.js");

var db = new DB();

var processed = 0;
var received = 0;
var getMoreWorkTimeout = 0;
var queue = [];

setInterval(function() {
  var item = queue.pop();
  if(item) {
    item.func(item.user,item.repo,item.callback);
  }
}, 1000);

function getScore(username, repo, callback) {
  queue.push({func:score.getScore, user:username, repo:repo,callback:function(score) {
    callback(username, repo, score);
  }});
}


function getMoreWork() {
  function processResults(res) {
    received = res.length;
    if (received === 0) {
      getMoreWorkTimeout = setTimeout(getMoreWork, 500);
    } else {
      clearTimeout(getMoreWorkTimeout);
    }
    var repoInfo = null;
    res.map(function (item) {
      repoInfo = db.keyToHash(item);
      getScore(repoInfo.name, repoInfo.repo, function (user, repo, score) {
        gotScore(db.hashToKey({name: user, repo: repo}), score);
      });
    });
  }

  function gotScore(repo, score) {
    db.setScore(repo, score, function (err, res) {
      if(err) {console.error("error in gotScore:", err, res);}
      processed += 1;
      if (processed === received) {
        processed = 0;
        received = 0;
        getMoreWork();
      }
    });

  }

  db.getNextProcessingChunk(5, processResults);
}


getMoreWork(); //this should be triggers from redis


