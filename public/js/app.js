$(function() {
	var socket = io.connect('http://localhost');
	var form = $('form.post'),
		message = form.find('textarea'),
		name = form.find('input.username'),
		stream = $('.stream ul'),
		listUI = $('.app-list'),
		roomUI = $('.app-container'),
		roomList = listUI.find('ul'),
		roomName = $('h1 span'),
		loginForm = $('form.login'),
		loginButton = $('.login-button'),
		loginError = loginForm.find('span.error');
	
	var currentRoom;
	var user = {
		username: null,
		password: null
	};

	//returns to the room list, clears the stream
	function backToList() {
		socket.emit('leave',{room: room_id})
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
	loginForm.on('click','.close',function(){
		loginForm.hide();
	})
	loginButton.click(function(){
		loginForm.show();	
	})


	//form submit handler
	form.submit(function() {
		var data = {
			message: message.val(),
			name: name.val(),
			room_id: currentRoom,
			img: 'https://si0.twimg.com/profile_images/2326165247/wulxf1wh0at7xo30km0a_reasonably_small.jpeg'
		}
		renderMsg(data);
		socket.emit('add', data)

		message.val('');
		name.val('');
		return false;
	});

	loginForm.submit(function(){
		loginError.html('');
		user.username = loginForm.find('.username').val();
		user.password = loginForm.find('.password').val();
		socket.emit('auth',user)
		return false;
	})

	//kicks off polling for a specific room, handles the state for the room
	function initRoom(room) {
		currentRoom = room;
		roomName.html(room);
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
			console.log(room);
			room.comments.forEach(renderMsg)
		});
		socket.emit('join', {room_id: currentRoom});
	}

	//renders a message
	function renderMsg(item) {
		if (!item) {return;}
		stream.prepend('<li class="comment"><img src="'+item.img+'"><h3>'+item.name+'</h3><p>'+item.message+'</p></li>');
	}

	function renderAdmin() {
		alert('You are now an admin');
		loginForm.hide();
		loginButton.remove();
	}

	socket.on('comment',function(data) {
		renderMsg(data)
	})
	socket.on('authsuccess',function(data){
		renderAdmin();
	})
	socket.on('authfail',function(data){
		loginError.html('Error, please try again.')
	})

	//get the list of rooms on page load
	getRooms();

})