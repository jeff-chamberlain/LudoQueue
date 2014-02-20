function input() {
    var taps = 0,
    tilt_diff = 2,
    raw_tilt = {
    	lr:0,
    	fb:0
	},
    sent_tilt = {
    	lr:0,
    	fb:0
	},
    input_interval = setInterval(input_loop,33),
	login_timeout = null,
	mousePos = {
		x: 0,
		y: 0,
	}
	input_state = {
    	tap : false,
    	tiltFB: false,
    	tiltLR: false,
    	swype: false,
    },
    tap_timer = 0,
    shoot_audio = document.getElementById('shoot_audio');
    
    this.change_input = function(new_state) {
    	taps = 0;
    	input_state = new_state;
    }
    
    this.login_result = function() {
    	clearTimeout(login_timeout);
    }
	
	$('#start_form').submit(function(event){
		event.preventDefault();
		login( $('#start_name').val(), 'noemail' );
	});
	
	window.addEventListener('deviceorientation', function(eventData) {
		raw_tilt.lr = eventData.gamma;
		raw_tilt.fb = eventData.beta;
	});
	
	$('#touch_area').on('touchend mouseup touchcancel', function(e) {
		e.preventDefault();
		if(input_state.tap) {
			taps ++;
			if(Date.now() - tap_timer >= 2000) {
				shoot_audio.play();
				tap_timer = Date.now();
			}
		}
		/*if(input_state.swype) {
			var finalX = e.originalEvent.changedTouches[0].pageX,
				finalY = e.originalEvent.changedTouches[0].pageY,
				angle = Math.atan2(mousePos.y-finalY, finalX-mousePos.x);
			player_module.socket.emit('swype', angle);
		}*/
	});
	
	$('#touch_area').on('touchstart mousedown', function(e) {
		e.preventDefault();
		/*mousePos.x = e.originalEvent.touches[0].pageX;
		mousePos.y = e.originalEvent.touches[0].pageY;*/
	});
	
	function input_loop() {
		if(input_state.tap) {
			if(taps > 0) {
				player_module.socket.emit('tap');
				taps--;
			}
		}
		var update_tilt = false;
		if(input_state.tiltFB) {
			if( judgeTilt(raw_tilt.fb, sent_tilt.fb) ) {
				update_tilt = true;
			}
		}
		if(input_state.tiltLR) {
			if( judgeTilt(raw_tilt.lr, sent_tilt.lr) ) {
				update_tilt = true;
			}
		}
		if(update_tilt) {
			sent_tilt.lr = raw_tilt.lr;
			sent_tilt.fb = raw_tilt.fb;
			player_module.socket.emit('tilt',sent_tilt);
		}
	}
	function login(this_name, this_email) {
		player_module.overlay.fade_out_overlay();
		$('#start_name').val(this_name);
		player_module.config.name = this_name;
		player_module.config.email = this_email;
		login_data = {
			name : this_name,
			email : this_email
		}
		player_module.socket.emit('enter',login_data);
		login_timeout = setTimeout(retryLogin,3000);
		player_module.draw.change_state('login');
	}

	function retryLogin() {
		console.log('retrying');
		player_module.socket.emit('enter',name);
		login_timeout = setTimeout(retryLogin,3000);
	}

	function judgeTilt( a, b ) {
		var d = Math.abs( a - b );
		if( d >= tilt_diff ) {
			return true;
		}
		else {
			return false;
		}
	}
}