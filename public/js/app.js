$(function() {
	var form = $('form'),
		message = form.find('textarea'),
		name = form.find('input.username'),
		stream = $('.stream ul'),
		listUI = $('.app-list'),
		roomUI = $('.app-container'),
		roomList = listUI.find('ul');
	
	var currentRefresh;
	var currentRoom;
	var lastTime = null;

	//returns to the room list, clears the stream
	function backToList() {
		clearInterval(currentRefresh);
		currentRoom = null;
		lastTime = null;

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
		$.ajax({
			type: "POST",
			url: 'comment/add',
			data: {
				message: message.val(),
				name: name.val(),
				ts: (new Date).getTime(),
				room_id: currentRoom,
				img: 'https://si0.twimg.com/profile_images/2326165247/wulxf1wh0at7xo30km0a_reasonably_small.jpeg'
			}
		}).done(function( msg ) {
			alert('Saved!');
			message.val('');
			name.val('');
		});

		return false;
	});

	//kicks off polling for a specific room, handles the state for the room
	function initRoom(room) {
		currentRoom = room;
		listUI.hide();
		roomUI.show();

		function pollForPosts() {
			var obj = {
				type: "POST",
				url: 'comment/list',
				data: {
					room_id: room,
					ts: lastTime || ''
				}
			};
			$.ajax(obj).done(function( msg ) {
				console.log('got msgs',msg)
				lastTime = (new Date).getTime();
				msg.forEach(function(item){
					stream.prepend('<li class="comment"><img src="'+item.img+'"><h3>'+item.name+'</h3><p>'+item.message+'</p></li>')
				})
			});		
		}
		currentRefresh = setInterval(pollForPosts, 2000);
	}


	//get the list of rooms on page load
	getRooms();

})