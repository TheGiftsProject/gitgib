var express = require('express');
var io = require('socket.io');
var DB = require("./db.js").DB;
var url_helper = require('url');

var port = process.env.PORT || 3000;


var db = new DB(),
    app = express.createServer(express.logger());

io = io.listen(app);

io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
  io.set('log level', 1); // reduce logging
});

io.sockets.on('connection', function (socket) {
  db.publisher.subscribe("score");
  db.publisher.on("message", function(channel, data) {
    var info = data.split("|");
    if(info[1] !== '-1') {
      socket.emit(info[0], info[1]);
    }
  });
});



app.configure( function(){
  app.enable("jsonp callback");
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('view options', { layout: false });
});

app.get('/', function(request, response) {
  response.render(__dirname+'/views/index.jade', { port: port });
});

app.get('/:user/:repo', function(req, res){
  getScore(req.params.user, req.params.repo, res);
});

app.get('/getScore', function(req, res) {
  var hash = urlToHash(req.query.url);
  if(hash) {
    getScore(hash.user, hash.repo, res);
  }
});

app.get('/flushall', function(req, res) {
  db.client.flushall();
  res.json({
    done:'done flushing'
  })
});

function urlToHash(url) {
  var valid = url.match(/^(https|http)?\:\/\/(www.)?github.com\/[^\/]+\/[^\/]+\/?$/);
  var result = {};
  if (valid) {
    var info = url_helper.parse(url),
        path = info.pathname.split("/"),
        user = path[1],
        name = path[2];

    if (name.indexOf('.git') === -1 && name !== 'terms' && name !== 'privacy') {
      result = {
        user: user,
        repo: name
      };
    }
  }
  return result;
}

function getScore(user, repo, res) {
  db.getScore(db.hashToKey({name: user, repo: repo}), function(err, value) {
    res.json({
      user: user,
      repo: repo,
      repoHash: user + "/" + repo,
      score: value
    });
  })
}

app.listen(port, function() {
    console.log("Listening on " + port);
});