function socket() {
	var socket = io.connect('https://ludoqueue.jit.su/player=dwa1'),//http://192.168.2.10:8080/player=dwa1'),
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
			player_module.input.change_input(data.input_state);
			player_module.draw.change_state('gameplay');
		}
		else {
			player_module.draw.change_state('standby');
		}
		player_module.input.login_result();
	});
	
	socket.on('input_state',function(new_state) {
		if(logged_in) {
			player_module.input.change_input(new_state);
			player_module.draw.change_state('gameplay');
		}
	});
	
	socket.on('standby',function() {
		if(logged_in) {
			player_module.draw.change_state('standby');
			player_module.input.change_input(input_off);
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