function socket() {
	var socket = io.connect('https://ludoqueue.jit.su/game=dwa1');//http://localhost:8080/game=dwa1');
	
	socket.on('player_enter', function (data) {
		if( !queue_module.players.hasOwnProperty(data.id) ) {
			queue_module.players[data.id] = new player(data.name, data.id);
			queue_module.player_count ++;
			console.log("Player " + data.name + " connected on " + data.id + " with the email " + data.email + ". There are now " + queue_module.player_count + " players");
			var player_input_state = {
				tap : true,
				tiltFB: true,
				tiltLR: false,
				swype: false,
			};
			socket.emit('player_in_game',{id:data.id, color:queue_module.players[data.id].color, input_state: player_input_state});
		}
	});
	
	
	socket.on('player_exit', function(id) {
		if( queue_module.players.hasOwnProperty(id) ) {
			var exit_name = queue_module.players[id].name;
			console.log("Player " + exit_name + " has disconnected");
			delete queue_module.players[id];
			queue_module.player_count --;
		}
	});
	
	socket.on('player_tilt', function(data) {
		player_action(data.id,function() {
			var p = queue_module.players[data.id];
			p.tiltFB = data.tilt.fb;
			p.tiltLR = data.tilt.lr;
		});
	});
	
	socket.on('player_tap', function(id) {
		player_action(id,function() {
			var p = queue_module.players[id];
			p.taps ++;
		});
	});
	
	socket.on('player_swype', function(data) {
		player_action(data.id,function() {
			var p = queue_module.players[data.id];
			p.swype = data.swype;
		});
	});
	
	return socket;
}

function player_action(id,callback) {
	if(queue_module.players.hasOwnProperty(id)) {
		callback();
	}
	else {
		console.log('Couldnt find ' + id);
		queue_module.socket.emit('player_err',id);
	}
}