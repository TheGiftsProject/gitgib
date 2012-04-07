function GitGib(url) {
    var me = this;
    this.repo = GitGib.getRepoFromUrl(url);
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
                user:user,
                name:name
            };
        }
    }
};

GitGib.prototype.getScore = function () {

};
