var socket;

function create_sockets() {
	socket = io.connect('http://ludosuite.jit.su/player');
	
	socket.on('game_entered',function(data) {
		logged_in = true;
		$('#err_text').html('');
		color = "rgba("+data.color.r+","+data.color.g+","+data.color.b+",1)";
		game.change_state(data.state);
		clearTimeout(login_timeout);
		if(data.state == 'waiting') {
			game.draw.waiting_message = data.message;
		}
	});
	socket.on('player_state',function(new_state) {
		if(logged_in) {
			game.change_state(new_state);
		}
	});
	socket.on('race_start',function() {
		if(logged_in) {
			taps = 0;
		}
	});
	socket.on('err',function(message) {
		logged_in = false;
		$('#err_text').html(message);
		game.change_state('waiting');
		game.overlay.fadeInOver('start');
	});
}