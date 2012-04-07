var express = require('express');
var io = require('socket.io');
var DB = require("./db.js").DB;

var port = process.env.PORT || 3000;


var db = new DB(),
    app = express.createServer(express.logger());

io = io.listen(app);
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

io.sockets.on('connection', function (socket) {
  db.publisher.subscribe("score");
  db.publisher.on("message", function(channel, data) {
    var info = data.split("|");
    socket.emit(info[0], info[1]);
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
  db.getScore(db.hashToKey({name:req.params.user,repo:req.params.repo}), function(err, value) {
    res.json({
      user: req.params.user,
      repo: req.params.repo,
      score: value
    });
  })
});


app.listen(port, function() {
    console.log("Listening on " + port);
});