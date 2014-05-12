function socket() {
	var socket = io.connect('https://ludoqueue.jit.su/game_right');//http://192.168.2.9:8080/game_right');//
	
	socket.on('player_swype', function(data) {
		player_action(data.id,function() {
			var p = queue_module.players[data.id];
			p.swype = data.swype;
		});
	});
	
	socket.on('screen_add', function(data) {
		if( !queue_module.players.hasOwnProperty(data.id) ) {
			queue_module.players[data.id] = new player(data);
			queue_module.screen_count ++;
		}
	});
	
	socket.on('screen_exit', function(id) {
		if(queue_module.players.hasOwnProperty(id)) {
			queue_module.screen_count --;
			delete queue_module.players[id];
		}
	});
	
	socket.on('set_game', function(index) {
		if(queue_module.game_started) {
			queue_module.game_manager.setGame(index);
		}
		else {
			queue_module.game_index = index;
		}
	});
	
	socket.on('winner', function(data) {
		queue_module.winner = data;
	});
	
	socket.on('leaderboard', function(data) {
		queue_module.leaderboard = data;
	});
	
	socket.on('advance_game', function() {
		console.log('ADVANCE');
		queue_module.game_manager.game.endGame();
	});
	
	socket.on('err', function() {
		queue_module.game_manager.gameError();
	});
	
	return socket;
}

function player_action(id,callback) {
	if(queue_module.players.hasOwnProperty(id)) {
		callback();
	}
	else {
		console.log('Couldnt find ' + id);
		queue_module.socket.emit('change_screen',{id: id});
	}
}
function player_action(id,callback) {
	if(queue_module.players.hasOwnProperty(id)) {
		callback();
	}
	else {
		console.log('Couldnt find ' + id);
		queue_module.socket.emit('change_screen',{id: id});
	}
}