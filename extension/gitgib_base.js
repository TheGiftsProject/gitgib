function GitGib() {
  this.socket = io.connect("localhost", { port : 3000 });
}

/*
 parses a url
 @returns {user: repo user name, repo: the name of the repo, errors: array of parsing erros}
 */
GitGib.getRepoFromUrl = function getRepoFromUrl(url) {
  var valid = url.match(/^https?\:\/\/github.com\/[^\/]+\/[^\/]+\/?$/)
  if (valid) {
    var info = $.url(url),
      user = info.segment(1),
      name = info.segment(2);

    if (name.indexOf('.git') == -1 && name != 'terms' && name != 'privacy') {
      return {
        user: user,
        name: name
      };
    }
  }
};

GitGib.prototype.getScore = function (url, cb) {
  var repo = GitGib.getRepoFromUrl(url);
  var me = this;
  if(repo) {
    var repoHash = repo.user + "/" + repo.name;
    $.ajax({
      type: "GET",
      url: "http://localhost:3000/" + repoHash
    }).done(function(data) {
        if(data.score === -1){
          me.socket.on(repoHash, function (score) {
            console.log(repoHash, score);
            cb(score);
          });
        }
        else {
          cb(data.score);
        }
      });
  }
};
