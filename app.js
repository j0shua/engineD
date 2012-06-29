// require libs
var express = require('express');
var http = require('http');
var io = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = io.listen(server);

var admin = {username: 'a', password: 'a'};


// ==section== app configurations
app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.bodyParser());
});
server.listen(8000);

// ==section== vars
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
  socket.on('join', function (data) {
    socket.join(data.room_id);
    console.log(socket.id+' joined '+data.room_id);
  });

  socket.on('add',function(data) {
    authenticate({
      socket: socket,
      success: function() {
        console.log("USER SENT A MESSAGE AND IS AUTHED")  
      }
    });
    addComment(data,socket);
  })

  socket.on('leave',function(data){
    socket.leave(data.room_id);
  })

  socket.on('auth',function(data){
    if (admin.username === data.username && admin.password === data.password) {
      socket.set('auth', true, function () {
        socket.emit('authsuccess');
      });
    } else {
      socket.emit('authfail');
    }
  })
});

function authenticate(data) {
  if (data.socket) {
    data.socket.get('auth',function(err,isAuth) {
      if (isAuth && data.success) {
        data.success();
      } else if(data.fail) {
        data.fail();
      }
    })
  }
}

// todo add check for no room id
// add a comment to a room
function addComment(data,socket){
  var room_id = data.room_id;
  var room = findRoom(room_id);
  var room_index = roomIndex(room_id);
  rooms[room_index].comments.push(data);
  socket.broadcast.to(room_id).emit('comment', data);
}

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
