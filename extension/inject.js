$(document).ready(function () {
  var port = chrome.extension.connect({name: "gitgib"});
  var anchors = $("a[href*='github.com']");
  var arr = jQuery.makeArray(anchors.map(function (i, v) {
    return {url: v.getAttribute("href"), index: i};
  }));
  port.postMessage({anchors: arr});

  port.onMessage.addListener(function (msg) {
    var element = anchors[msg.index],
      score = msg.score;
    GitGib.UI.scoreGitHubRepository(score, element);
  });

//    if (document.location.href.match("github.com")) {
//        if ($("a.js-current-repository")) {
//            var url = "https://github.com" + el.attr('href'),
//                anchor = el.parent().parent(),
//                loading = $("<img src='http://www.nzta.govt.nz/traffic/ui/img/loading.gif'/>");
//            anchor.append(loading);
//            chrome.extension.sendRequest({url: url}, function (response) {
//                console.log(response);
//            });
////        new GitGib(url).getScore().done(function(score) {
////            loading.remove();
////            score_github_repository(score, anchor);
////        });
//        }
//    }
});
