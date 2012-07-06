$(function() {
	var socket = io.connect('http://localhost');
	var form = $('form.post'),
		message = form.find('textarea'),
		name = form.find('input.username'),
		stream = $('.stream ul'),
		listUI = $('.app-list'),
		roomUI = $('.app-room'),
		roomList = listUI.find('ul'),
		roomName = $('h1 span'),
		loginContainer = $('.login-container'),
		loginForm = $('form.login'),
		loginButton = $('.login-button'),
		loginError = loginForm.find('div.alert'),
		adminButton = $('.admin-button'),
		adminUI = $('.app-admin');
		adminRooms = $('.app-admin.rooms'),
		adminRoomsList = adminRooms.find('.nav.list'),
		adminRoomInfo = adminUI.find('.info'),
		adminError = adminUI.find('div.alert'),
		adminAddRoom = adminUI.find('.add-room'),
		adminRoomInfoSave = adminUI.find('.save-info');
	
	var currentRoom;
	var awaitingCreate = false;
	var user = {
		username: null,
		password: null
	};

	//used when switching screens, clears/hides pretty much everything
	function hideAll() {
		stream.html('');
		roomList.html('');
		roomName.html('');

		roomUI.hide();
		listUI.hide();
		adminUI.hide();
	}

	//returns to the room list, clears the stream
	function showList() {
		socket.emit('leave',{room: currentRoom});
		currentRoom = null;
		hideAll();
		getRooms();
		listUI.show();
	}


	//gets a list of rooms and renders them to the listUI
	function getRooms(roomEl, prefix) {
		prefix = prefix || '#room/';
		roomEl = roomEl || roomList;
		$.ajax({
			type: "GET",
			url: 'room/list'
		}).done(function( msg ) {
			msg.forEach(function(room){
				roomEl.append('<li><a href="'+prefix+room.id+'" data-id="'+room.id+'"><i class="icon-align-justify"></i> '+room.id+'</a></li>');
			});
		});
	}

	//login form open
	loginButton.click(function(){
		loginContainer.modal();
	});
	//login form submit
	loginForm.submit(function(){
		loginError.html('').hide();
		adminError.html('').hide();
		loginForm.removeClass('error');
		user.username = loginForm.find('.username').val();
		user.password = loginForm.find('.password').val();
		socket.emit('auth',user);
		return false;
	});

	adminAddRoom.click(function(){
		adminRoomInfo.find('.name').html('<input class="name input-xlarge" type="text" placeholder="name"/>');
		adminRoomInfo.find('.id').html('');
		adminRoomInfoSave.show();
		return false;
	});

	adminRoomInfo.on('keyup','.name input',function() {
		adminRoomInfo.find('.id').html($(this).val().replace(/\s/g,''));
	});

	adminRoomInfoSave.click(function(){
		awaitingCreate = true;
		socket.emit('createRoom',{
			name: adminRoomInfo.find('.name input').val(),
			id: adminRoomInfo.find('.id').html()
		});
	});


	//comment form submit handler
	form.submit(function() {
		if (!message.val()) {return false;}
		var data = {
			message: message.val(),
			name: name.val(),
			room_id: currentRoom,
			img: 'https://si0.twimg.com/profile_images/2326165247/wulxf1wh0at7xo30km0a_reasonably_small.jpeg'
		};
		//render instantly for the user
		renderMsg(data);
		socket.emit('add', data);
		message.val('');
		return false;
	});


	//changes UI to join a room
	//makes the ajax request for the room
	//emits the socket join event
	function initRoom(room) {
		hideAll();
		currentRoom = room;
		roomName.html(room);
		roomUI.show();
		var obj = {
			type: "POST",
			url: 'comment/list',
			data: {
				room_id: room
			}
		};
		$.ajax(obj).done(function(room) {
			room.comments.forEach(renderMsg);
			socket.emit('join', {room_id: currentRoom});
            $('.draggable').draggable();
		}).error(function() {
			showList();
			$('.app-list .alert').html('Invalid Room Name').fadeIn().fadeOut(6000);
		});
	}

	//renders a message to a room
	function renderMsg(item) {
		if (!item) {return;}
		stream.prepend('<li class="comment draggable"><img src="'+item.img+'"><p><strong>'+item.name+'</strong>'+item.message+'</p></li>');
	}

	//shows the administrator tools
	function renderAdmin() {
		loginContainer.modal('hide');
		loginButton.remove();
		adminButton.show();
	}

	function getAdminRoomList() {
		adminRoomsList.html('');
		adminRoomsList.append('<li class="nav-header">Rooms</li>');
		adminRooms.show();

		getRooms(adminRoomsList,'#admin/room/');
	}
	//renders the admin
	function showAdmin(tool) {
		hideAll();
		adminRoomInfoSave.hide();
		roomName.html('Admin');
		if (tool == 'rooms') {
			adminRoomInfo.find('.name').html('');
			adminRoomInfo.find('.id').html('');
			getAdminRoomList();
			return;
		}
		if (tool.indexOf('room/') != -1) {
			adminRooms.show();
			var room = tool.replace('room/','');
			socket.emit('roomInfo', {room_id: room});
		}
	}

	//bind socket events
	socket.on('comment',function(data) {
		renderMsg(data);
	});
	socket.on('authsuccess',function(data){
		renderAdmin();
		window.location = '#admin/rooms';
	});
	socket.on('authfail',function(data){
		loginError.html('Error, please try again.').show();
		adminError.html('You are not authorized').show();
		loginForm.addClass('error');
	});
	socket.on('roomInfo',function(data){
		adminRooms.show();
		adminRoomsList.find('a').parent().removeClass('active');
		adminRoomInfo.find('.name').html(data.name);
		adminRoomInfo.find('.id').html(data.id);
		adminRoomsList.find('a[data-id="'+data.id+'"]').parent().addClass('active');
		adminRoomInfo.show();
	});
	socket.on('roomCreateSuccess',function(data){
		adminRoomsList.append('<li><a href="#admin/room/'+data.id+'" data-id="'+data.id+'"><i class="icon-align-justify"></i> '+data.name+'</a></li>');
		if (awaitingCreate) {
			socket.emit('roomInfo', {room_id: data.id});
			awaitingCreate = false;
		}
	});


	//we use hashchange to trigger events so that back buttons work
	$(window).hashchange( function(){
		var location = window.location.hash;

		if (location.indexOf('#room/') != -1) {
			var room = location.replace('#room/','');
			initRoom(room);
			return;
		}
		if (location.indexOf('#admin/') != -1) {
			var tool = location.replace('#admin/','');
			showAdmin(tool);
			return;
		}
		//default to the list
		showList();
	});

	// Trigger the event on page load
	$(window).hashchange();


	$('.sortable').sortable();
    $('.droppable').droppable({
        drop: function( event, ui ) {
            $(this).find("li.placeholder" ).remove();
            var dragged = ui.draggable.remove();
            $(this).append(dragged.css({position: 'relative', top: 0, left: 0}));
        }
    });

});
