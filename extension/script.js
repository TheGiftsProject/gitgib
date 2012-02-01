function GitGib(url) {
  var me = this;
  
  this.FW = 0.25;   // weight of forks/watchers
  this.FI = 0.25;   // weight of forks/issues(open)
  this.LCD = 0.50;  // weight of last commit date
  this.MIN_DAY = 1;
  this.MAX_DAY = 365*2; //three years of inactivity
  
  this.url = url;
  this.repo = GitGib.getRepoFromUrl(this.url);
  this.dfd = new $.Deferred();
  if (this.repo) {

      $.when(this.getBasicInfo(), this.getIssuesInfo(), this.getCommitsInfo()).done(function() {
        me.dfd.resolve();
      });
  }
}

GitGib.prototype.getLCDRank = function() {
  function daysBetween(date1, date2) {

      // The number of milliseconds in one day
      var ONE_DAY = 1000 * 60 * 60 * 24;

      // Convert both dates to milliseconds
      var date1_ms = date1.getTime();
      var date2_ms = date2.getTime();

      // Calculate the difference in milliseconds
      var difference_ms = Math.abs(date1_ms - date2_ms);
      
      // Convert back to days and return
      return difference_ms/ONE_DAY;

  }
  var dayDiff = daysBetween(new Date(), new Date((new Date()) - new Date((new Date()) - this.repo.lastCommitDate)));
  if (dayDiff <= this.MIN_DAY) {
    return 1;
  }
  else if (dayDiff < this.MAX_DAY) {
    return 1-dayDiff/this.MAX_DAY;
  }
  return 0;
};

/*
  parses a url
  @returns {user: repo user name, repo: the name of the repo, errors: array of parsing erros}
*/
GitGib.getRepoFromUrl = function getRepoFromUrl(url) {
  var valid = url.match(/^(https?:\/\/)github\.com\/(.+?)\/(?!.+\.git)(.+)$/);
  if (valid) {
      var info = $.url(url),
          user = info.segment(1),
          name = info.segment(2);

      return {user: user, name: name};
  }
};

GitGib.prototype.getScore = function() {
  var me = this;
  var defer = new $.Deferred();

  this.dfd.done(function() {
    var lcdRank = me.getLCDRank();
    // var diff = me.repo.closedIssues.length/(me.repo.openIssues.length+me.repo.closedIssues.length);
    var fw = me.repo.watchers/(me.repo.watchers+me.repo.forks);
    var fi = me.repo.forks/(me.repo.openIssues.length+me.repo.forks)||0;
    defer.resolve(Math.round((lcdRank*0.5+fw*0.25+fi*0.25)*100));
  });
  return defer.promise();
};

GitGib.prototype.getCommitsInfo = function() {
  var dfd = new jQuery.Deferred(),
      me  = this;

  gh.commit.forBranch(me.repo.user, me.repo.name, "master", function(data) {
    me.repo.lastCommitDate = new Date(data.commits[0].committed_date);
    dfd.resolve();
  });

  return dfd.promise();
};

GitGib.prototype.getIssuesInfo = function() {
  var dfd = new jQuery.Deferred(),
      me  = this;
  function getOpenIssues() {
    var dfd = new jQuery.Deferred();
    gh.issue.list(me.repo.user, me.repo.name,"open",function (data) {
        me.repo.openIssues = data.issues;
        dfd.resolve();
    });
    return dfd.promise();
  }

  function getClosedIssues() {
    var dfd = new jQuery.Deferred();
    gh.issue.list(me.repo.user, me.repo.name,"closed",function (data) {
        me.repo.closedIssues = data.issues;
        dfd.resolve();
    });
    return dfd.promise();
  }

  $.when(getOpenIssues(), getClosedIssues()).done(function() {
    dfd.resolve();
  });
  return dfd.promise();
};

GitGib.prototype.getBasicInfo = function() {
  var dfd = new jQuery.Deferred(),
      me  = this;

  gh.repo(me.repo.user, me.repo.name).show(function (data) {
      me.repo.forks = data.repository.forks;
      me.repo.watchers = data.repository.watchers;
      me.repo.ifFork = data.repository.fork;
      me.repo.pushedAt = data.repository.pushed_at;
      dfd.resolve();
   });
   return dfd.promise();
};



$(document).ready(function() {
    $("a[href*='github.com']").each(function() {
        var anchor = $(this);
        new GitGib(anchor.prop("href")).getScore().done(function(result) {
            anchor.after(result);
        });
    });
  //new GitGib("https://github.com/joyent/node").getScore().done(function(result) {
    //console.log(result);
  //});
  //new GitGib("https://github.com/emberjs/ember.js").getScore().done(function(result) {
    //console.log(result);
  //});
});
