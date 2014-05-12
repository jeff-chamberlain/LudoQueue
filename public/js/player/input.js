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
	rhythm_intervals = [],
	rhythm_targets = {
		current:null,
		next:null
	},
	rhythm_index = 0,
	rhythm_hits = [],
	rhythm_tried = false,
	rhythm_received = true,
    input_interval = setInterval(input_loop,33),
	login_timeout = null,
	mousePos = {
		x: 0,
		y: 0,
	},
	swype_start = 0,
	swype_max = (window.innerWidth > window.innerHeight ? Math.pow(window.innerWidth, 2) : Math.pow(window.innerHeight, 2)),
	input_state = {
    	tap : false,
    	tiltFB: false,
    	tiltLR: false,
    	swype: false,
    	rhythm: false
    },
    fish_sound = player_module.images.audio.fish_whoosh,
    cup_sound = player_module.images.audio.changing_cup,
    snow_sound = player_module.images.audio.snowball_shoot,
    tap_timer = 0,
    mod = this;
    
    this.change_input = function(new_state) {
    	taps = 0;
    	rhythm_targets.current = null;
    	rhythm_hits = [];
    	input_state = new_state;
    }
    
    this.set_rhythm = function(new_rhythm) {
    	rhythm_intervals = new_rhythm.intervals;
    	rhythm_index = new_rhythm.index+1;
    	rhythm_received = Date.now();
    }
    
    this.login_result = function() {
    	clearTimeout(login_timeout);
    }
    
    this.game_index = 0;
	
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
			switch(mod.game_index) {
				case 3:
					cup_sound.play();
					cup_sound.currentTime = 0.0;
					break;
				case 4:
					if(Date.now() - tap_timer >= 2000) {
						snow_sound.play();
						snow_sound.currentTime = 0.0;
						tap_timer = Date.now();
					}
					break;
				default:
					break;
			}
		}
		if(input_state.rhythm) {
			if(rhythm_targets.current) {
				rhythm_tried = true;
				var diff = Math.abs(Date.now() - rhythm_targets.current);
				rhythm_hits.push(diff);
				if(rhythm_hits.length > 10 ) {
					rhythm_hits.splice(0,1);
				}
				var ave = averageRhythm();
				player_module.socket.emit('rhythm', ave);
				//player_module.draw.set_value(Math.floor(diff)+'  '+Math.floor(ave));
			}
			else {
				rhythm_hits.push(Date.now());
				if(rhythm_hits.length >= 4) {
					if(!tryRhythmCalibrate()) {
						rhythm_hits = [];
						if(rhythm_index + 1 < rhythm_intervals.length) {
							while(rhythm_received + rhythm_intervals[rhythm_index + 1] < Date.now()) {
								rhythm_index ++;
								rhythm_received += rhythm_intervals[rhythm_index];
							}
						}
					}
				}
			}
		}
		if(input_state.swype) {
			var finalX = e.originalEvent.changedTouches[0].pageX,
				finalY = e.originalEvent.changedTouches[0].pageY,
				angle = Math.atan2(mousePos.y-finalY, finalX-mousePos.x),
				dist = Math.pow(finalX-mousePos.x,2)+Math.pow(finalY-mousePos.y,2),
				vel = (dist / swype_max) / ((Date.now() - swype_start)/1000);
			player_module.socket.emit('swype', {angle : angle, vel : vel});
			if(mod.game_index === 0 && vel > 4) {
				fish_sound.play();
				fish_sound.currentTime = 0.0;
			}
		}
	});
	
	$('#touch_area').on('touchstart mousedown', function(e) {
		e.preventDefault();
		if(input_state.swype) {
			mousePos.x = e.originalEvent.touches[0].pageX;
			mousePos.y = e.originalEvent.touches[0].pageY;
			swype_start = Date.now();
		}
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
		if(input_state.rhythm && rhythm_targets.current) {
			var current_diff = Date.now() - rhythm_targets.current;
			var next_diff = rhythm_targets.next - Date.now();
			if(next_diff < current_diff) {
				rhythm_index ++;
				if(rhythm_index >= rhythm_intervals.length) {
					rhythm_index = 0;
				}
				if(!rhythm_tried) {
					console.log('MISS ' + rhythm_index);
					player_module.socket.emit('rhythm', 100);
				}
				rhythm_tried = false;
				rhythm_targets.current = rhythm_targets.next;
				rhythm_targets.next = rhythm_targets.current + rhythm_intervals[rhythm_index];
			}
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
	
	function averageRhythm() {
		var sum = 0;
		for(var i=0,j=rhythm_hits.length; i<j; i++) {
			sum += rhythm_hits[i];
		}
		return sum/rhythm_hits.length;
	}
	
	function tryRhythmCalibrate() {
		var calib_intervals = [];
		var test_num = rhythm_hits.length-1;
// 		console.log('Starting calibration at ' + rhythm_index);
		for( var i=0; i<test_num; i++ ) {
			calib_intervals[i] = rhythm_hits[i+1]-rhythm_hits[i];	
		}
		var calibrated = false;
		for( var i=rhythm_index, j=i+3; i<j; i++ ) {
			var ave_diff = 0,
				offset = 0,
				diffs = [];
			for( var k=0; k<test_num; k++) {
				var test_interval = i+k;
				if(test_interval >= j) {
					test_interval -= j;
				}
// 				console.log('Testing ' + rhythm_intervals[test_interval] + ' Calibrating ' + calib_intervals[k]);
				var d = rhythm_intervals[test_interval] - calib_intervals[k];
				ave_diff += Math.abs(d);
				offset += d;
				diffs[k] = d;
			}
			ave_diff /= test_num;
// 			console.log('Average difference' + ave_diff);
			if(ave_diff < 50) {
				var current_index = i + test_num;
				if(current_index >= rhythm_intervals.length) {
					current_index -= rhythm_intervals.length;
				}
				rhythm_targets.current = (rhythm_hits[test_num] + offset) + rhythm_intervals[current_index];
				rhythm_index = current_index + 1;
				rhythm_targets.next = rhythm_targets.current + rhythm_intervals[rhythm_index];
				rhythm_hits = diffs;
				calibrated = true;
				break;
			}
		}
		return calibrated;
	}
}