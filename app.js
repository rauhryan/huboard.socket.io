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

app.post("issues/webhook", function(req,res) {
   var issue = req.body.payload.issue;

   issue._data = {};
   issue.repo = req.body.payload.repository;
   issue.other_labels = [];
   
   process.stdout.write("webhook:action " + req.body.payload.repository.full_name + " " + " " + req.body.payload.action);

   switch(req.body.payload.action){
      case "opened":
        process.stdout.write("webhook:opened " + req.body.payload.repository.full_name);
        io.sockets.emit(req.body.payload.repository.full_name, {payload:issue,event:"Opened.0"});
        break;
      case "closed":
        process.stdout.write("webhook:closed " + req.body.payload.repository.full_name);
        io.sockets.emit(req.body.payload.repository.full_name, {payload:issue,event:"Closed." + issue.number});
        break;

   }
});

app.post("/hook", function (req, res) {
  req.body.secret === process.env.SECRET && io.sockets.emit(req.body.channel, req.body.payload);
  res.send({});
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on port:", port);         
});
