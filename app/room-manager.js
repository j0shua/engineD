/*
	Hanldes creating, tracking, and returning info about rooms

	exports: {
		findRoom: findRoom,
		addRooms: addRooms,
		addRoom: addRooms,
		roomList: roomList
	}
*/

//require class
var Room = require('./models/Room.js');

//array to keep track of the active rooms
var rooms = [];

// find a room by id in the array; if found return it
function findRoom(id){
  for (var i=0; i<rooms.length; i+=1){
    if (rooms[i].id == id){
      return rooms[i];
    }
  }
  return false;
}

//adds an instance of a room to the rooms array for each
//room passed in.
//Accepts either an object or an array of objects
function addRooms(toAdd) {
	if (toAdd instanceof Array) {
		toAdd.forEach(function(room){
			rooms.push(new Room(room));
		});
	} else if (toAdd instanceof Object){
		rooms.push(new Room(toAdd));
	} else {
		return false;
	}
}

// list rooms that exist
// returns an array of room_ids formatted like this:
// [
//    {id: room_id},
//    {id: room_id}
// ]
function roomList() {
  var list = [];
  for (var i=0; i<rooms.length; i+=1){
    list.push({id: rooms[i].id});
  }
  return list;
}

function getAll() {
	return rooms;
}

//expose methods
module.exports = {
	findRoom: findRoom,
	addRooms: addRooms,
	addRoom: addRooms,
	roomList: roomList,
	getAll: getAll
};