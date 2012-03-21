function GitGib(url, weights) {
    var me = this;

    if (!weights) {
        weights = {
            FW:0.08,
            FI:0.07,
            LCD:0.5,
            PR:0.35
        };
    }

    this.weights = weights;
    // this.FW = weights.FW;   // weight of forks/watchers
    // this.FI = weights.FI;   // weight of forks/issues(open)
    // this.LCD = weights.LCD;  // weight of last commit date
    this.MIN_DAY = 1;
    this.MAX_DAY = 30 * 2; //three years of inactivity

    this.url = url;
    this.repo = GitGib.getRepoFromUrl(this.url);
    this.dfd = new $.Deferred();
}

GitGib.prototype.getLCDRank = function () {
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
                user:user,
                name:name
            };
        }
    }
};

GitGib.prototype.getScore = function () {
    var me = this;
    var defer = new $.Deferred();
    if (me.repo) {
        $.when(me.getBasicInfo())
            .then(
                function () {
                    me.dfd.resolve();
                },
                function (xhr, response, type) {
                    if(type !== "Not Found") {
                        defer.reject();
                        me.dfd.reject();
                    }
            });
    }

    this.dfd.done(function () {
        var lcdRank = me.getLCDRank();
        // var diff = me.repo.closedIssues.length/(me.repo.openIssues.length+me.repo.closedIssues.length);
        var fw = (me.repo.watchers / (me.repo.watchers + me.repo.forks)) || 0;
        var fi = me.repo.forks / (me.repo.openIssues.length + me.repo.forks) || 0;
        var pr = 1;

        defer.resolve(Math.round((lcdRank * me.weights.LCD + fw * me.weights.FW + fi * me.weights.FI + pr * me.weights.PR) * 100));
    });
    return defer.promise();
};



GitGib.prototype.getBasicInfo = function () {
    var me = this;

    var promise = gh.repo(me.repo.user, me.repo.name).show();
    promise.done(function (data) {
            me.repo.forks = data.repository.forks - 1;
            me.repo.watchers = data.repository.watchers - 1;
            me.repo.ifFork = data.repository.fork;
            me.repo.pushedAt = data.repository.pushed_at;
            me.repo.openIssues = data.repository.open_issues;
            me.repo.lastCommitDate = data.repository.pushed_at;
        });
    return promise;
};