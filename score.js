var repoHelper = require("./repo.js");

const weights = {
  FW: 0.25,
  FI: 0.25,
  LCD: 0.5
};

const MIN_DAY = 1;
const MAX_DAY = 30 * 2; //three years of inactivity


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

function getScore(username, repo, callback) {
  repoHelper.getInfo(username, repo, function (info) {
    var lcdRank = getLCDRank(info.lastCommitDate);
    var fw = (info.watchers / (info.watchers + info.forks)) || 0;
    var fi = info.forks / (info.openIssues.length + info.forks) || 0;
    var rank = (lcdRank * weights.LCD + fw * weights.FW + fi * weights.FI);
    var rankInPrecents = Math.round(rank * 100);
    callback(rankInPrecents);
  });
}

exports.getScore = getScore;


//getScore("joyent", "node", console.log);
//getScore("sproutcore", "sproutcore", console.log);
//getScore("senchalabs", "connect", console.log);