function GitGib() {
  this.socket = io.connect("localhost", { port : 3000 });
}

GitGib.prototype.getScore = function (url, cb) {
  var me = this;
  if(url) {
    $.ajax({
      type: "GET",
      url: "http://localhost:3000/getScore?url=" + encodeURIComponent(url)
    }).done(function(data) {
        if(data) { //We might not pass the whole server url parsing
          if(data.score === "-1"){
            me.socket.on(data.repoHash, function (score) {
              cb(score);
            });
          }
          else {
            cb(data.score);
          }
        }
      });
  }
};
