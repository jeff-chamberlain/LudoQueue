var socket;

function create_sockets() {
	socket = io.connect('http://192.168.2.9:8080/player');//https://ludosuite.jit.su/player');
	
	socket.on('game_entered',function(data) {
		logged_in = true;
		id = data.id;
		playAudio(audio.bell_chime);
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
	socket.on('game_start',function() {
		if(logged_in) {
			taps = 0;
			game_running = true;
		}
	});
	socket.on('game_end',function(winner) {
		if(logged_in) {
			game_running = false;
			if(winner == id) {
				if(game.state == "racing") {
					playAudio(audio.coffee_done,false);
				}
				else {
					console.log('balance won!');
				}
			}
		}
	});
	socket.on('spill',function() {
		if(logged_in) {
			playAudio(audio.spilling,false);
		}
	});
	socket.on('err',function(message) {
		logged_in = false;
		clearTimeout(login_timeout);
		$('#err_text').html(message);
		game.change_state('waiting');
		game.overlay.fadeInOver('start');
	});
}