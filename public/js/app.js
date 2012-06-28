$(function() {
	var form = $('form'),
		message = form.find('textarea'),
		name = form.find('input.username'),
		stream = $('.stream ul');

	form.submit(function() {
		$.ajax({
			type: "POST",
			url: 'comment/add',
			data: {
				message: message.val(),
				name: name.val(),
				ts: (new Date).getTime()
			}
		}).done(function( msg ) {
			console.log( "Data Saved: " + msg );
		});

		return false;
	});

	var lastTime = null;
	function pollForPosts() {
		var obj = {
			type: "GET",
			url: 'comment/list',
		};
		if (lastTime) {
			obj.url += '/'+lastTime;
		}
		$.ajax(obj).done(function( msg ) {
			lastTime = (new Date).getTime();
			msg.forEach(function(item){
				stream.prepend('<li class="comment"><img src="https://si0.twimg.com/profile_images/2326165247/wulxf1wh0at7xo30km0a_reasonably_small.jpeg"><p>'+item.message+'</p></li>')
			})
		});		
	}


	setInterval(pollForPosts, 2000);
})