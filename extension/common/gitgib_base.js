function GitGib() {
  this.socket = io.connect("gitgib.herokuapp.com", { port : 80 });
}

GitGib.prototype.handleScore = function(data, cb) {
  var me = this;
  if(data) { //We might not pass the whole server url parsing
    if(data.score === "-1" || data.score === -1){
      this.socket.on(data.repoHash, function (score) {
        cb(score);
        me.socket.removeListener(data.repoHash, console.warn);
      });
    }
    else {
      cb(data.score);
    }
  }
}

GitGib.prototype.getScore = function (url, cb) {
  var me = this;
  if(url) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        me.handleScore(JSON.parse(xhr.responseText), cb);
      }
    };
    xhr.open("GET", "http://gitgib.herokuapp.com/getScore?url=" + encodeURIComponent(url), true);
    xhr.send();

  }
};
