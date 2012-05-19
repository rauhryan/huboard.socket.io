var express = require('express'),
app = express.createServer(),
io = require("socket.io").listen(app);

app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
});

io.configure(function() {
   io.set("transports", ["xhr-polling"]);
   io.set("pull duration", 10);
});


app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.post("/hook", function (req, res) {
  io.sockets.emit(req.body.channel, req.body.payload);
  res.send({});
});

app.listen(80);
