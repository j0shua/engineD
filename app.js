// require libs
var express = require('express');
var http = require('http');
var io = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = io.listen(server);

// ==section== app configurations
app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.bodyParser());
});
server.listen(3000);

// ==section== vars
var sockets = {};
var rooms = [
    {
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
    }, 
];

// ==section==  helper functions
// check for existence of a room; if found return it's index
function roomIndex(id){
  for (var i=0; i<rooms.length; i+=1){
    if (rooms[i].id == id){
      return i;
    }
  }
}

// find a room in the array; if found return it
function findRoom(id){
  for (var i=0; i<rooms.length; i+=1){
    if (rooms[i].id == id){
      return rooms[i];
    }
  }
  return false;
}

// ==section== socket.io

// ==section== routing

// list rooms that exist
// returns an array of room_ids formatted like this:
// [
//    {id: room_id},
//    {id: room_id},
//    {id: room_id}
// ]
app.get('/room/list', function(req, res){
  var list = [];
  for (var i=0; i<rooms.length; i+=1){
    list.push({id: rooms[i].id});
  }
  res.json(list);
});

io.sockets.on('connection', function (socket) {
  socket.on('message', function (data) {
    socket.join(data.room_id);
  });
});

// todo add check for no room id
// add a comment to a room
app.post('/comment/add', function(req, res){
  var room_id = req.body.room_id;
  if (!room_id) { 
    res.send(404);
  }

  var room = findRoom(room_id);
  if (!room){
    res.send(404);
  }

  var room_index = roomIndex(room_id);
  req.body.ts = parseInt(req.body.ts);
  rooms[room_index].comments.push(req.body);

  socket.broadcast.to(room_id).emit(req.body);
  res.send({200: 'ok'});
});

app.post('/comment/list', function(req, res){
  var room_id = req.body.room_id;

  if (!room_id) { 
    res.send(404);
  }

  var room = findRoom(room_id);
  if (!room){
    res.send(404);
  }
   
  res.send(room);
});
