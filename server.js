var express = require('express');
var DB = require("./db.js").DB;

var db = new DB();
var app = express.createServer(express.logger());
app.enable("jsonp callback");
app.get('/', function(request, response) {
    response.send('Hello World!');
});

app.get('/:user/:repo', function(req, res){
  db.getScore(req.params.user+"/"+req.params.repo, function(err, value) {
    res.json({
      user: req.params.user,
      repo: req.params.repo,
      score: value
    });
  })
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Listening on " + port);
});