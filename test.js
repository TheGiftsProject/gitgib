var GitHubApi = require("github").GitHubApi;
var async = require('asyncjs');

var github = new GitHubApi(true);

function getNumberOfForks(user, repo, cb) {
  github.getRepoApi().getRepoNetwork(user, repo, function(err, networks) {
    cb(networks.length);
  });  
}

function getNumberOfWatchers(user, repo, cb) {
  github.getRepoApi().getRepoWatchers(user, repo, function(err, watchers) {
    cb(watchers.length);
  });  
}

function getNumberOfIssues(user, repo, state, cb) {
  github.getIssueApi().getList(user, repo, state, function(err, issues) {
    cb(issues.length);
  });
}

function getLastCommitDate(user, repo, cb) {
  github.getCommitApi().getBranchCommits(user, repo, 'master', function(err, commits) {
      cb(new Date(commits[0].committed_date));
  });
}

function lcdRank(lastCommitDate, minDay, maxDay) {
  var dayDiff = (new Date((new Date()) - lastCommitDate)).getDay();
  if (dayDiff <= minDay)
  {
    return 1;
  }
  else if (dayDiff < maxDay)
  {
    return (1 - (dayDiff - minDay) / (maxDay - minDay));
  }
  return 0;
}

function getRank(user, repo, cb) {
  var  FW       = 0.25 // weight of forks/watchers
      ,FI       = 0.25 // weight of forks/issues(open)
      ,LCD      = 0.50 // weight of last commit date
      ,MIN_DAY  = 1
      ,MAX_DAY  = 7;

  getLastCommitDate('emberjs', 'ember.js', function(date) {
    console.log(lcdRank(date, MIN_DAY, MAX_DAY));
  });

  getLastCommitDate('edwardhotchkiss', 'github3', function(date) {
    console.log(lcdRank(date, MIN_DAY, MAX_DAY));
  });
}

getRank('','','');