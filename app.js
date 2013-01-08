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

app.get("/issues/webhook",function(req,res){
  res.send(req.body);

});

app.post("/issues/webhook", function(req, res) {
  var body = req.body,
    payload = JSON.parse(body.payload),
    issue = payload.issue
    repository = payload.repository,
    action = payload.action;

   issue.repo = repository;
   issue._data = {};
   issue.other_labels = [];
   

   switch(action){
      case "opened":
        io.sockets.emit(repository.full_name, {payload:issue,event:"Opened.0"});
        break;
      case "closed":
        io.sockets.emit(repository.full_name, {payload:issue,event:"Closed." + issue.number});
        break;

   }
  res.send({message:"hi"});
});

app.post("/hook", function (req, res) {
  req.body.secret === process.env.SECRET && io.sockets.emit(req.body.channel, req.body.payload);
  res.send({});
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on port:", port);         
});
