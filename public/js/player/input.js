var tiltLR = 0, 
    tiltFB = 0,
    tiltQ = 0,
    taps = 0,
    driptime = 0,
    diff = 2,
    sent_tilt = {lr:0,fb:0},
    login_timeout;

function create_input() {
	
	this.init = function() {
		$('#start_form').submit(function(event){
			event.preventDefault();
			login( $('#start_name').val() );
		});
		
		window.addEventListener('deviceorientation', function(eventData) {
			tiltLR = eventData.gamma;
			tiltFB = eventData.beta;
			//tiltQ = eventData.alpha;
		});
		
		$('#touch_area').on('touchend mouseup touchcancel', function(e) {
			e.preventDefault();
			taps ++;
		});
		
		$('#start_name').on('touchstart mousedown', function(e) {
			if(!audio_loaded) {
				pAudio.load();
				audio_loaded = true;
			}
		});
	};
	
	this.play = function() { this.state() };
	
	this.change_state = function(new_state) {
		taps = 0;
		switch(new_state) {
			case "waiting":
				this.state = waiting;
				break;
			case "surfing":
				this.state = surfing;
				break;
			case "racing":
				this.state = racing;
				break;
			case "balancing":
				this.state = balancing;
				break;
		}
	};
	
	var waiting = function() {
		
	};
	
	var surfing = function() {
		if( judgeDiff(tiltLR,sent_tilt.lr) || judgeDiff(tiltFB,sent_tilt.fb) ) {
			sent_tilt.lr = tiltLR;
			sent_tilt.fb = tiltFB;
			socket.emit('tilt',sent_tilt);
		}
		if(taps > 0) {
			socket.emit('pulse');
			taps = 0;
			playAudio(audio.grinding);
		}
	};
	
	var racing = function() {
		if(game_running) {
			if(taps > 0) {
				socket.emit('tap');
				taps = 0;
				driptime = Date.now();
				if(pAudio.paused == true) {
					playAudio(audio.waterdripping,true);
				}
			}
			if( Date.now() - driptime >= 1000 ) {
				pAudio.pause();
			}
		}
	};
	
	var balancing = function() {
		if(game_running) {
			if( judgeDiff(tiltFB,sent_tilt.fb) ) {
				sent_tilt.fb = tiltFB;
				socket.emit('tilt',sent_tilt);
				if(pAudio.paused == true && tiltFB*(Math.PI/180)<0) {
					playAudio(audio.pouring,true);
				}
				else if(pAudio.paused != true && tiltFB*(Math.PI/180)>=0) {
					pAudio.pause();
				}
			}
			if(taps > 0) {
				socket.emit('pulse');
				playAudio(audio.changing_cup,false);
				taps = 0;
			}
		}
	};
	
	this.state = waiting;
}

function login(this_name, this_email) {
		$('#start_name').val(this_name);
		game.overlay.fadeOutOver();
		name = this_name;
		email = this_email;
		login_data = {
			name : name,
			email : email
		}
		socket.emit('enter',login_data);
		login_timeout = setTimeout(retryLogin,3000);
		game.draw.waiting_message = "Waiting for game server";
}

function retryLogin() {
	console.log('retrying');
	socket.emit('enter',name);
	login_timeout = setTimeout(retryLogin,3000);
}

function judgeDiff( a, b ) {
	var d = Math.abs( a - b );
	if( d >= diff ) {
		return true;
	}
	else {
		return false;
	}
}