var GitGib = {};
GitGib.UI = {};

GitGib.UI.scoreGitHubRepository = function (score, anchor) {
  anchor.appendChild(GitGib.UI.createScoreFragment(score));
};

GitGib.UI.createScoreFragment = function (score) {
  var span = document.createElement ("div");
  span.setAttribute("title", "Score:"+score);
  span.classList.add("gitgib_score");
  span.innerText = "U";
  var color = GitGib.UI.calculateColor(score);
  span.style.color = "rgb("+color.R+","+color.G+","+color.B+")";
  return span;
};


GitGib.UI.calculateColor = function (score) {
  var R = Math.ceil((255*(100-score))/100);
  var G = Math.ceil((255*score)/100);
  var B = 0;
  return {R:R,G:G,B:B};
};