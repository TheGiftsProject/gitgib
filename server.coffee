express = require('express')
app = express.createServer()



app.configure ->
  app.use express.logger()
  app.use express.methodOverride()
  app.use express.bodyParser()
  app.use app.router
  app.use express.static(__dirname + '/public')
  app.use express.errorHandler({ dumpExceptions: true, showStack: true })


app.get '/', (req, res) -> res.send('Hello World')

app.listen(3030)
console.log('Express server started on port %s', app.address().port)