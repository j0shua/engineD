// require libs
var express = require('express');
var http = require('http');
var io = require('socket.io');

// require our custom libs
var roomManager = require('./app/room-manager.js');
var socketHandler = require('./app/socket-handler.js');
var httpHandler = require('./app/http-handler.js');
console.log(roomManager,socketHandler,httpHandler);

//create express server
var app = express();
var server = http.createServer(app);
//bind socket.io to the server
var io = io.listen(server);

// configure http server
app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.bodyParser());
});

//listen to port
server.listen(8000);

// setup http routes
httpHandler.bindRoutes(app,roomManager);

// bind on each socket connection
io.sockets.on('connection', function (socket) {
  socketHandler.bindRoutes(socket,roomManager);
});

// room setup DEV
roomManager.addRooms([{
      id: 'roomOne',
      comments: []
    },
    {
      id: 'roomTwo',
      comments: []
    },
    {
      id: 'roomThree',
      comments: []
    }
]);