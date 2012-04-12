$(document).ready(function () {
  var port = chrome.extension.connect({name: "gitgib"});
  var anchors = $("a").filter(function (index) {
    return this.href.indexOf("github.com") >= 0
  });

  var arr = jQuery.makeArray(anchors.map(function (i, v) {
    return {url: v.href, index: i};
  }));

  console.dir(arr);

  bindListenerForResults(port, anchors);

  port.postMessage({anchors: arr});


  function bindListenerForResults(port, anchors) {
    port.onMessage.addListener(function (msg) {
      var element = anchors[msg.index],
        score = msg.score;
      $('#gitgib_repo_spinner').remove();
      GitGib.UI.scoreGitHubRepository(score, $(element));
    });
  }

  function _insideGitHub() {
    return document.location.href.match("github.com");
  }
});
