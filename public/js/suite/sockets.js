var socket;

function create_sockets() {

	socket = io.connect('http://localhost:10733/suite');
	
	socket.on('player_enter', function (data) {
		players[data.id] = new player(data.name);
		player_count ++;
		console.log("Player " + data.name + " connected on " + data.id + ". There are now " + player_count + " players");
		var player_state;
		if(game_state == "surf") {
			player_state = "surfing";
		}
		else {
			player_state = "waiting";
		}
		socket.emit('player_in_game',{id:data.id, color:players[data.id].color, state:player_state});
	});
	
	
	socket.on('player_exit', function(id) {
		if( players.hasOwnProperty(id) ) {
			var exit_name = players[id].name;
			console.log("Player " + exit_name + " has disconnected");
			delete players[id];
			player_count --;
		}
	});
	
	socket.on('player_tilt', function(data) {
		var p = players[data.id];
		p.tiltFB = data.tilt.fb;
		p.tiltLR = data.tilt.lr;
		p.update();
	});
	
	socket.on('player_tap', function(data) {
		var p = players[data.id];
		p.tap_count ++;
		p.update();
	});
	
}