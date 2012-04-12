var GitGib = {};
GitGib.UI = {};

GitGib.UI.scoreGitHubRepository = function (score, anchor) {
  console.log(anchor);
  $(anchor).append(GitGib.UI.createScoreFragment(score));
};

GitGib.UI.createScoreFragment = function (score) {
  var spanFragment = $("<span title='Score:"+score+"'>");
  spanFragment.addClass("gitgib_score");
  spanFragment.text("U");

  var color = GitGib.UI.calculateColor(score);
  spanFragment.css({
    "color": "rgb("+color.R+","+color.G+","+color.B+")"
  });
  console.log("rgb("+color.R+","+color.G+","+color.B+");");

  return spanFragment;
};


GitGib.UI.calculateColor = function (score) {
  var R=Math.ceil((255*(100-score))/100);
  var G=Math.ceil((255*score)/100);
  var B=0;
  return {R:R,G:G,B:B};
};