var express = require('express');
var io = require('socket.io');
var DB = require("./db.js").DB;
var url_helper = require('url');

var port = process.env.PORT || 3000;


var db = new DB(),
    app = express.createServer(express.logger());

io = io.listen(app);

io.configure(function () {
  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('log level', 1);                    // reduce logging
  io.set('transports', [
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
  ]);
});

io.sockets.on('connection', function (socket) {
  db.publisher.subscribe("score");
  db.publisher.on("message", function(channel, data) {
    switch(channel) {
      case "score":
        var info = data.split("|");
        if(info[1] !== '-1') {
          socket.emit(info[0], info[1]);
        }
        break;
    }
  });
});



app.configure( function(){
  app.enable("jsonp callback");
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('view engine', 'jade');
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

app.get('/stats', function(req, res) {
  getWorkQueue(function(queue) {
      getTotalKeys(function(totalKeys) {
        res.render(__dirname+'/views/statistics.jade', {
          queue: queue,
          totalKeys: totalKeys
        });
      });
  })

});

app.get('/flushall', function(req, res) {
  db.client.flushall();
  res.json({
    done:'done flushing'
  });
});



app.listen(port, function() {
    console.log("Listening on " + port);
});




//====================================PRIVATE FUNCS=================================================
function getWorkQueue(cb) {
  db.client.zrangebyscore(db.queue_name, "-inf", "+inf", function (err, res) {
    cb(res);
  });
}

function getTotalKeys(cb) {
  db.client.dbsize(function(err, res) {
    cb(res);
  });
}

function isValid(url) {
  var info = url_helper.parse(url);
  var path = info.pathname.split("/");

  return url.match(/^(https|http)?\:\/\/(www.)?github.com\/[^\/]+\/[^\/]+\/?$/) &&
    path.length === 3 &&
    path[2].indexOf('.git') === -1 &&
    path[2] !== 'terms' &&
    path[2] !== 'privacy'
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

function urlToHash(url) {

  var result = {};
  if (isValid(url)) {
    var info = url_helper.parse(url),
      path = info.pathname.split("/"),
      user = path[1],
      name = path[2];

    if (name.indexOf('.git') === -1 && name !== 'terms' && name !== 'privacy') {
      console.log(user, name);
      result = {
        user: user,
        repo: name
      };
    }
  }
  return result;
}
