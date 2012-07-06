/*
  handles adding/removing users from dedicated socket rooms and
  handles commands sent over the socket

  exports: {
    bindRoutes: bindRoutes
  }

*/
var persist = require('./persist.js');

// error checking for adding a comment and uses roomManager to find the room
// and add the comment.  Broadcasts the new message over the socket room
function addComment(data,socket,roomManager){
  if (!data || !socket || !roomManager || !data.room_id) {return;}

  var room = roomManager.findRoom(data.room_id);
  if (room) {
    room.addComment(data);
    socket.broadcast.to(data.room_id).emit('comment', data);
    persist.save(roomManager.getAll());
  }
}

//checks the dummy data to see if a user is authed
var admin = {username: 'a', password: 'a'};
function authenticate(data) {
  if (admin.username === data.username && admin.password === data.password) {
    return true;
  }
  return false;
}

//binds the socket events
function bindRoutes(socket,roomManager) {
  //join a room
  socket.on('join', function (data) {
    socket.join(data.room_id);
  });

  //add a comment
  socket.on('add',function(data) {
    addComment(data,socket,roomManager);
  });

  //leave a room
  socket.on('leave',function(data){
    socket.leave(data.room_id);
  });

  //request to be authenticated
  socket.on('auth',function(data){
    if (authenticate(data)) {
      socket.set('auth', true, function () {
        socket.emit('authsuccess');
      });
    } else {
      socket.emit('authfail');
    }
  });

  socket.on('roomInfo',function(data){
    isAuthenticated({
      socket: socket,
      success: function() {
        socket.emit('roomInfo',roomManager.findRoom(data.room_id));
      },
      fail: function() {
        socket.emit('authfail');
      }
    });
  });

  socket.on('createRoom',function(data){
    isAuthenticated({
      socket: socket,
      success: function() {
        roomManager.addRoom(data);
        socket.emit('roomCreateSuccess',roomManager.findRoom(data.id));
      },
      fail: function() {
        socket.emit('authfail');
      }
    });
  });
}

//expose methods
module.exports = {
  bindRoutes: bindRoutes
};


//unused
//general purpose method to check if a user's socket is authenticated
//requires data.socket & data.success, data.fail methods
function isAuthenticated(data) {
  if (data.socket) {
    data.socket.get('auth',function(err,isAuth) {
      if (isAuth && data.success) {
        data.success();
      } else if(data.fail) {
        data.fail();
      }
    });
  }
}