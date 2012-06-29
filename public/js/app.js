$(function() {
	var socket = io.connect('http://tcgdev.info');
	var form = $('form'),
		message = form.find('textarea'),
		name = form.find('input.username'),
		stream = $('.stream ul'),
		listUI = $('.app-list'),
		roomUI = $('.app-container'),
		roomList = listUI.find('ul');
	
	var currentRoom;

	//returns to the room list, clears the stream
	function backToList() {
		currentRoom = null;

		stream.html('');
		roomList.html('');

		getRooms();

		roomUI.hide();
		listUI.show();
	}


	//gets a list of rooms and renders them to the listUI
	function getRooms() {
		$.ajax({
			type: "GET",
			url: 'room/list'
		}).done(function( msg ) {
			msg.forEach(function(room){
				roomList.append('<li><a href="" data-id="'+room.id+'">'+room.id+'</a></li>')
			})
		});
	}

	//click event to trigger opening a room
	roomList.on('click', 'a',function() {
		initRoom($(this).attr('data-id'));
		return false;
	})
	roomUI.on('click','.backToList',function() {
		backToList();
		return false;
	})

	//form submit handler
	form.submit(function() {
		socket.emit('add', {
			message: message.val(),
			name: name.val(),
			room_id: currentRoom,
			img: 'https://si0.twimg.com/profile_images/2326165247/wulxf1wh0at7xo30km0a_reasonably_small.jpeg'
		})

		message.val('');
		name.val('');
		return false;
	});

	//kicks off polling for a specific room, handles the state for the room
	function initRoom(room) {
		currentRoom = room;
		listUI.hide();
		roomUI.show();
		var obj = {
			type: "POST",
			url: 'comment/list',
			data: {
				room_id: room,
			}
		};
		$.ajax(obj).done(function(room) {
			room.comments.forEach(renderMsg)
		});

		socket.emit('join', {room_id: currentRoom});
	}

	//renders a message
	function renderMsg(item) {
		stream.prepend('<li class="comment"><img src="'+item.img+'"><h3>'+item.name+'</h3><p>'+item.message+'</p></li>');
	}

	socket.on('comment',function(data) {
		renderMsg(data)
	})

	//get the list of rooms on page load
	getRooms();

})