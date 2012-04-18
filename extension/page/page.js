//remove hard dependency on jquery...
document.addEventListener( "DOMContentLoaded", function () {
  var port = chrome.extension.connect({name: "gitgib"});
  var anchors = document.getElementsByTagName("a");
  var arr = [],
    filteredAnchors = [];
  var anchor = null,
    position = null,
    counter = 0;
  for(var i=0; i<anchors.length; i++) {
    anchor = anchors[i];
    position = window.getComputedStyle(anchor,null).getPropertyValue("position");
    if(anchor.href.indexOf("github.com") >= 0 && position!=="absolute") {
      filteredAnchors.push(anchor);
      arr.push({url: anchor.href, index: counter++});
    }
  }
  console.dir(arr);

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