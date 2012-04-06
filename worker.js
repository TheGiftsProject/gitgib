var DB = require("./db.js").DB;
var GitHubAPI = require("./score.js");
var OrderedSet = require("./ordered_set.js").OrderedSet;
var _ = require('underscore')._;

var db = new DB();
var workSet = new OrderedSet();



function _getScore(username, repo, callback) {
  GitHubAPI.getScore(username, repo, callback);
}

var getScore = _.throttle(_getScore, 1000);

function getMoreWork() {
  function processResults(res) {
    console.log(res);
    res.map(function(item) {
      var name = item.split("/")[0];
      var repo = item.split("/")[1];
      getScore(name, repo, function(score) {
        gotScore(name+"/"+repo, score);
      });
    });
  }

  function gotScore(repo, score) {
    db.setScore(repo, score);
  }
  db.getNextProcessingChunk(60, processResults);
}



setInterval(getMoreWork, 1000); //this should be triggers from redis


