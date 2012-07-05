/*
	Handles communication over http

	expoorts: {
		bindRoutes: bindRoutes
	}

*/
function bindRoutes(app,roomManager) {
	//gets the list of rooms
	app.get('/room/list', function(req, res){
		var list = roomManager.roomList();
		res.json(list);
	});

	//returns info about a room based on id
	app.post('/comment/list', function(req, res){
		var room = roomManager.findRoom(req.body.room_id);
		if (!room){
			res.send(404);
		}
		res.send(room);
	});
}

//expose methods
module.exports = {
	bindRoutes: bindRoutes
};