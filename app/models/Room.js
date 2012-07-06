var Room = function(obj) {
	this.id = obj.id;
	this.name = obj.name;
	this.comments = obj.comments || [];
};
Room.prototype.addComment = function(obj) {
	if (!obj.message) {return;}
	this.comments.push(obj);
};

module.exports = Room;