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
//  io.enable('browser client etag');          // apply etag caching logic based on version number
 // io.enable('browser client gzip');          // gzip the file
  io.set('log level', 1);                    // reduce logging

  io.set('transports', ['websocket']);

  io.set('authorization', function (handshakeData, accept) {

    if (handshakeData.query.token && handshakeData.headers.origin === process.env.ORIGIN) {

      rest.get(process.env.ORIGIN + '/api/authorized', {query: {token: handshakeData.query.token}})
      .on('success', function () {
        accept(null, true)
      })
      .on('fail', function (data, response) {
        console.log("handshake" ,data ,response)
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

  rest.post(process.env.ORIGIN + '/api/site/webhook/issue', { data: req.body })
      .on('success', function () {
        res.send("success")
      })
      .on('fail', function (data, response) {
        console.log(data, response)
        res.send("fail")
      })
      .on('error', function () {
        res.send("error")
      });
});

app.post("/hook", function (req, res) {
  if(req.body.secret === process.env.SECRET) {
    delete req.body.secret;
    io.sockets.emit(req.body.meta.repo_full_name, req.body);
  } 
  res.send({});
});

