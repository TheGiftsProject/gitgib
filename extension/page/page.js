//remove hard dependency on jquery...
document.addEventListener( "DOMContentLoaded", function () {
  var port = chrome.extension.connect({name: "gitgib"});
  var anchors = document.getElementsByTagName("a");
  var arr = [],
    filteredAnchors = [];
  var anchor = null,
    position = null,
    counter = 0,
    inGitHub = location.href.indexOf("github.com") >= 0;
  for(var i=0; i<anchors.length; i++) {
    anchor = anchors[i];
    if(githubSpecialCase(anchor) && globalCase(anchor)) {
      filteredAnchors.push(anchor);
      arr.push({url: anchor.href, index: counter++});
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

  function githubSpecialCase(anchor){
    var inGitHub = location.href.indexOf("github.com") >= 0;
    if (!inGitHub) return true;
    return !(anchor.classList.contains("minibutton") || anchor.href.indexOf("#readme") > 0 || anchor.hasAttribute("highlight"));
  }

  function globalCase(anchor){
      var position = window.getComputedStyle(anchor,null).getPropertyValue("position");
      return anchor.href.indexOf("github.com") >= 0 && position !== "absolute";
  }

}, false );
