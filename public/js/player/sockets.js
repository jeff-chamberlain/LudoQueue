var socket;

function create_sockets() {
	socket = io.connect('192.168.2.9:10733/player');
	
	socket.on('game_entered',function(data) {
		logged_in = true;
		color = "rgba("+data.color.r+","+data.color.g+","+data.color.b+",1)";
		game.change_state(data.state);
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
}