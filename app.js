var express = require('express'),
  app = express.createServer(),
  io = require("socket.io").listen(app);

app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
  app.set('views', __dirname + "/views");
  app.set('view engine', 'hbs');
});

io.configure(function() {
   io.set("transports", ["xhr-polling"]);
   io.set("pull duration", 10);
});


app.get('/', function(req, res) {
  res.render('index.hbs',{server: req.headers.host });
});

app.post("/hook", function (req, res) {
  io.sockets.emit(req.body.channel, req.body.payload);
  res.send({});
});

var port = process.env.PORT || 9191;
app.listen(port, function() {
  console.log("Listening on port:", port);         
});
