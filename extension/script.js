function GitGib(url, weights) {
  var me = this;

  if (!weights){
    weights = {
      FW: 0.25,
      FI: 0.25,
      LCD: 0.5
    };
  }

  this.weights = weights;
  // this.FW = weights.FW;   // weight of forks/watchers
  // this.FI = weights.FI;   // weight of forks/issues(open)
  // this.LCD = weights.LCD;  // weight of last commit date
  this.MIN_DAY = 1;
  this.MAX_DAY = 30*2; //three years of inactivity
  
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
        return difference_ms / ONE_DAY;

    }
    var dayDiff = daysBetween(new Date(), new Date((new Date()) - new Date((new Date()) - this.repo.lastCommitDate)));
    if (dayDiff <= this.MIN_DAY) {
        return 1;
    }
    else if (dayDiff < this.MAX_DAY) {
        return 1 - dayDiff / this.MAX_DAY;
    }
    return 0;
};

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

GitGib.prototype.getScore = function() {
  var me = this;
  var defer = new $.Deferred();

  this.dfd.done(function() {
    var lcdRank = me.getLCDRank();
    // var diff = me.repo.closedIssues.length/(me.repo.openIssues.length+me.repo.closedIssues.length);
    var fw = (me.repo.watchers / (me.repo.watchers+me.repo.forks)) || 0; 
    var fi = me.repo.forks / (me.repo.openIssues.length+me.repo.forks) || 0;
    defer.resolve(Math.round((lcdRank*me.weights.LCD+fw*me.weights.FW+fi*me.weights.FI)*100));
  });
  return defer.promise();
};

GitGib.prototype.getCommitsInfo = function() {
    var dfd = new jQuery.Deferred(),
    me = this;

    gh.commit.forBranch(me.repo.user, me.repo.name, "master", function(data) {
        me.repo.lastCommitDate = new Date(data.commits[0].committed_date);
        dfd.resolve();
    });

    return dfd.promise();
};

GitGib.prototype.getIssuesInfo = function() {
    var dfd = new jQuery.Deferred(),
    me = this;
    function getOpenIssues() {
        var dfd = new jQuery.Deferred();
        gh.issue.list(me.repo.user, me.repo.name, "open", function(data) {
            me.repo.openIssues = data.issues;
            dfd.resolve();
        });
        return dfd.promise();
    }

    function getClosedIssues() {
        var dfd = new jQuery.Deferred();
        gh.issue.list(me.repo.user, me.repo.name, "closed", function(data) {
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
      me.repo.forks = data.repository.forks - 1;
      me.repo.watchers = data.repository.watchers - 1;
      me.repo.ifFork = data.repository.fork;
      me.repo.pushedAt = data.repository.pushed_at;
      dfd.resolve();
   });
   return dfd.promise();
};

function score_github_repository(score, anchor){
    var span = create_score_fragment(score);
    anchor.append(span);
}

function create_score_fragment(score){
    var span_fragment = $("<span>");
    span_fragment.attr("title", score);
    span_fragment.css({
        display: "inline-block",
        width: "16px",
        height: "16px",
        "vertical-align": "middle",
        "background-repeat": "no-repeat",
        "background-image": "url(data:image/png;base64,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)"
    });

    span_fragment.css({
        "background-position": calculate_icon_position(score)
    });

    return span_fragment;
}

function calculate_icon_position(score) {
    return ["-32px -32px", "-16px -32px", "-0px -32px",
        "-32px -16px", "-16px -16px", "0px -16px",
        "-32px 0px", "-16px 0px", "0px 0px"][Math.ceil(score/10)];
}

function score(url, anchor){
  var loading = $("<img src='http://www.nzta.govt.nz/traffic/ui/img/loading.gif'/>");
  anchor.append(loading);
  new GitGib(url).getScore().done(function(score) {
    loading.remove();
    score_github_repository(score, anchor);
  });
}

$(document).ready(function() {
    $("a[href*='github.com']").each(function() {
        var anchor = $(this);
        new GitGib(anchor.prop("href")).getScore().done(function(score) {
            score_github_repository(score, anchor);
        });
    });
    if (document.location.href.match("github.com")){
      var el = $("a.js-current-repository");
      if (el){
        var url = "https://github.com" + el.attr('href');
        var anchor = el.parent().parent();
        var loading = $("<img src='http://www.nzta.govt.nz/traffic/ui/img/loading.gif'/>");
        anchor.append(loading);
        new GitGib(url).getScore().done(function(score) {
            loading.remove();
            score_github_repository(score, anchor);
        });
      }
    }
});
