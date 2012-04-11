$(document).ready(function () {
  var port = chrome.extension.connect({name: "gitgib"});
  var anchors = $("a[href*='github.com'], a.js-current-repository");
  var el = function() {
      if(anchors.length-1 < 0) return null;

      var temp = anchors.map(function(i,v) {
          if(v.className === 'js-current-repository' && v.nodeName === "A") {
            return {item: $(v), index: i};
          }
      });
      if(temp.length) {
          return temp;
      } else {
          return [null];
      }
  }()[0];


  var arr = jQuery.makeArray(anchors.map(function (i, v) {
    return {url: v.getAttribute("href"), index: i};
  }));
  port.postMessage({anchors: arr});

  port.onMessage.addListener(function (msg) {
    var element = anchors[msg.index],
        score = msg.score;
    if(msg.isRepo){
        $('#gitgib_repo_spinner').remove();
        element = $(element).parent().parent();
    }

    GitGib.UI.scoreGitHubRepository(score, element);
  });

    if (document.location.href.match("github.com")) {
        if (el && el.item) {
            var url = "https://github.com" + el.item.attr('href'),
                loading = $("<img id='gitgib_repo_spinner' src='http://www.nzta.govt.nz/traffic/ui/img/loading.gif'/>");
            el.item.append(loading);
            port.postMessage({anchors: [{url:url, index: el.index}], isRepo: true});
        }
    }
});
