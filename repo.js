var GitHubApi = require("github");

var github = new GitHubApi({
  version: "3.0.0"
});

function getInfo(username, repo, callback){
  github.repos.get({
    user:username,
    repo: repo
  }, function(err, info) {
    if(err!==null) {
      callback({error:err});
      return;
    }
    callback({
      forks: info.forks - 1,
      watchers: info.watchers - 1,
      isFork: info.fork,
      pushedAt: info.pushed_at,
      openIssues: info.open_issues,
      lastCommitDate: new Date(info.pushed_at),
      description: info.description,
      homepage: info.homepage
    })
  });
}

exports.getInfo = getInfo;