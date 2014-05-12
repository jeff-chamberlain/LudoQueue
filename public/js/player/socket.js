function socket() {
	var socket = io.connect('https://ludoqueue.jit.su/player'),//http://10.10.52.138:8080/player'),//
	logged_in = false,
	input_off = {
    	tap : false,
    	tiltFB: false,
    	tiltLR: false,
    	swype: false,
    };
	
	socket.on('game_entered',function(data) {
		logged_in = true;
		player_module.config.id = data.id;
		$('#err_text').html('');
		player_module.config.color = data.color;
		if(data.input_state){
			player_module.draw.change_state('gameplay');
			player_module.input.change_input(data.input_state);
		}
		else {
			player_module.draw.change_state('standby');
		}
		player_module.input.login_result();
	});
	
	socket.on('input_state',function(new_state) {
		if(logged_in) {
			player_module.draw.change_state('gameplay');
			player_module.input.change_input(new_state);
		}
	});
	
	socket.on('standby',function() {
		if(logged_in) {
			player_module.draw.change_state('standby');
			player_module.input.change_input(input_off);
		}
	});
	
	socket.on('game_index',function(data) {
		if(logged_in) {
			player_module.input.game_index = data;
		}
	});
	
	socket.on('init_rhythm',function(new_rhythm) {
		if(logged_in) {
			player_module.input.set_rhythm(new_rhythm);
		}
	});
	
	socket.on('err',function(message) {
		console.log( message );
		logged_in = false;
		player_module.input.login_result();
		$('#err_text').html(message);
		player_module.input.change_input(input_off);
		player_module.draw.change_state('waiting');
		player_module.overlay.fade_in_overlay();
	});
	
	return socket;
}