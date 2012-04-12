//remove hard dependency on jquery...
document.addEventListener( "DOMContentLoaded", function () {
  var port = chrome.extension.connect({name: "gitgib"});
  var anchors = document.getElementsByTagName("a");
  var filteredAnchors = [];
  var arr = [];
  for(var i=0; i<anchors.length; i++) {
    if(anchors[i].href.indexOf("github.com") >= 0) {
      filteredAnchors.push(anchors[i]);
      arr.push({url: anchors[i].href, index: i});
    }
  }

  bindListenerForResults(port, filteredAnchors);
  port.postMessage({anchors: arr});

  function bindListenerForResults(port, anchors) {
    port.onMessage.addListener(function (msg) {
      var element = anchors[msg.index];
      var score = msg.score;
      GitGib.UI.scoreGitHubRepository(score, element);
    });
  }

}, false );
