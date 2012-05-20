var GitGib = {};
GitGib.UI = {
    characters: {
        regular: "",
        small: ""
    }
};

GitGib.UI.scoreGitHubRepository = function (score, anchor) {
  anchor.appendChild(GitGib.UI.createScoreFragment(score,anchor));
};

GitGib.UI.createScoreFragment = function (score, anchor) {
  var span = document.createElement("div");
  span.setAttribute("title", "score: " + score);
  span.classList.add("gitgib_score");
  span.innerText = GitGib.UI.characters.regular;
  if (GitGib.UI.isSmallText(anchor)){
      span.innerText = GitGib.UI.characters.small;
  }
  var color = GitGib.UI.calculateColor(score);
  span.style.color = "rgb("+color.R+","+color.G+","+color.B+")";
  return span;
};

GitGib.UI.isSmallText = function(anchor) {
    try{
        return parseInt(document.defaultView.getComputedStyle(anchor, null).fontSize) < 17;
    } catch(e) {
        return false;
    }
};

GitGib.UI.calculateColor = function (score) {
  var R = Math.ceil((255*(100-score))/100);
  var G = Math.ceil((255*score)/100);
  var B = 0;
  return {R:R,G:G,B:B};
};