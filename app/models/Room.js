var Room = function(obj) {
	this.id = obj.id;
	this.name = obj.id;
	this.comments = [];
}
Room.prototype.addComment = function(obj) {
	this.comments.push(obj);
}

module.exports = Room;