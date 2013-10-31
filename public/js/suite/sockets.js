var socket;

function create_sockets() {

	socket = io.connect('https://ludosuite.jit.su/suite');
	
	socket.on('player_enter', function (data) {
		players[data.id] = new player(data.name);
		player_count ++;
		console.log("Player " + data.name + " connected on " + data.id + ". There are now " + player_count + " players");
		var player_state;
		var waiting_message;
		if(game_state == "surf") {
			player_state = "surfing";
			waiting_message = "";
		}
		else {
			player_state = "waiting";
			waiting_message = "Will connect after minigame completes";
		}
		socket.emit('player_in_game',{id:data.id, color:players[data.id].color, state:player_state, message:waiting_message});
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
		player_action(data.id,function() {
			var p = players[data.id];
			p.tiltFB = data.tilt.fb;
			p.tiltLR = data.tilt.lr;
			p.update();
		});
	});
	
	socket.on('player_tap', function(id) {
		player_action(id,function() {
			var p = players[id];
			p.update();
		});
	});
	
	socket.on('player_pulse', function(id) {
		player_action(id,function() {
			var p = players[id];
			p.send_pulse();
		});
	});
}

function player_action(id,callback) {
	if(players.hasOwnProperty(id)) {
		callback();
	}
	else {
		socket.emit('player_err',id);
	}
}