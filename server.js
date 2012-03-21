var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
    response.send('Hello World!');
});

app.get('/:user/:repo', function(req, res){
    res.send('user ' + req.params.user + ' repo: ' + req.params.repo);
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Listening on " + port);
});