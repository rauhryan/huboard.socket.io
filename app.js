var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var rest = require('restler');

var base64 = require('./base64');

var port = process.env.PORT || 8080;

server.listen(port, function() {
  console.log("Listening on port:", port);         
});


app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
});

io.configure('production', function(){

  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('log level', 1);                    // reduce logging

  io.set('transports', ['websocket']);

  io.set('authorization', function (handshakeData, accept) {

    if (handshakeData.query.token && handshakeData.headers.origin === process.env.ORIGIN) {

      rest.get(process.env.ORIGIN + '/api/authorized', {query: {token: handshakeData.query.token}})
      .on('success', function () {
        accept(null, true)
      })
      .on('fail', function () {
        accept("Failed auth", false)
      })
      .on('error', function () {
        accept("Error during auth", false)
      });

    } else {
      accept("Token not provided", false)
      return;
    } 

  });

});

io.configure('development', function(){
  io.set('transports', ['websocket']);
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

