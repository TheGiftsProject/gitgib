var repoHelper = require("./repo.js");

const weights = {
  W: 0.45,
  FI: 0.2,
  LCD: 0.25
};

const MIN_DAY = 2;
const MAX_DAY = 30 * 2; //three years of inactivity
const WATCHERS_SCALE = 1000;

function getLCDRank(lastCommitDate) {
  function daysBetween(date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);
    // Convert back to days and return
    return difference_ms / ONE_DAY;

  }

  var dayDiff = daysBetween(new Date(), new Date((new Date()) - new Date((new Date()) - lastCommitDate)));
  console.log(dayDiff);
  if (dayDiff <= MIN_DAY) {
    return 1;
  }
  if (dayDiff < MAX_DAY) {
    return 1 - dayDiff / MAX_DAY;
  }
  return 0;
}

function getWatchersScore(watchers) {
    x = watchers/WATCHERS_SCALE;
    if(x > 10) score = 10;

    score = 10;
    if(x < 9 && x >= 5) score = 9;
    else if(x < 5 && x >= 1) score = 8;
    else if(x < 1 && x >= 0.8) score = 7;
    else if(x < 0.8 && x >= 0.5) score = 6;
    else score = 5/0.5*x;

    return score/10;
}

function getScore(username, repo, callback) {
  repoHelper.getInfo(username, repo, function (info) {
    if(info.error) {
      callback(-1);
      return;
    }
    var lcdRank = getLCDRank(info.lastCommitDate);
    var watchers = getWatchersScore(info.watchers) || 0;
    var fi = info.forks / (info.openIssues.length + info.forks) || 0;
    var rank = (lcdRank * weights.LCD + watchers * weights.W + fi * weights.FI);
    var rankInPercents = Math.round(rank * 100);
    if(rankInPercents>100) rankInPercents = 100;
    callback(rankInPercents);
  });
}

exports.getScore = getScore;


//getScore("joyent", "node", console.log);
//getScore("sproutcore", "sproutcore", console.log);
//getScore("senchalabs", "connect", console.log);
//getScore("yonbergman", "enumify", console.log);
//getScore("documentcloud", "underscore", console.log);
//getScore("rails", "rails", console.log);
//getScore("JuliaLang", "julia", console.log);
//getScore("jlong", "serve", console.log);
//getScore("mikechambers", "as3corelib", console.log);
