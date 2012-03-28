var DB = require("./db.js").db;
var GitHubAPI = require("github").GitHubApi;
var OrderedSet = require("./ordered_set.js").OrderedSet;

var db = new DB(true);
var github = new GitHubAPI();
var workSet = new OrderedSet();

function getScore(username, repo, callback) {

}


function runner() {

}

function getMoreWork() {

}

setInterval(getMoreWork, 1000);

