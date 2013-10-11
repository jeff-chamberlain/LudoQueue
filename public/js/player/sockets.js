var socket;

function create_sockets() {
	socket = io.connect('http://localhost:10733/player');
	
	socket.on('game_entered',function(data) {
		color = data.color;
		game.change_state(data.state);
	});
	socket.on('player_state',function(new_state) {
		game.change_state(new_state);
	});
}