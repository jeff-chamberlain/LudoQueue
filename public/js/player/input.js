var tiltLR = 0, 
    tiltFB = 0,
    taps = 0,
    diff = 2,
    sent_tilt = {lr:0,fb:0},
    login_timeout;

function create_input() {
	
	this.init = function() {
	
		$('#start_form').submit(function(event){
			event.preventDefault();
			game.overlay.fadeOutOver();
			name = $('#start_name').val();
			socket.emit('enter',name);
			login_timeout = setTimeout(retryLogin,3000);
			game.draw.waiting_message = "Waiting for game server";
		});
		
		window.addEventListener('deviceorientation', function(eventData) {
			tiltLR = eventData.gamma;
			tiltFB = eventData.beta;
		});
		
		$('#touch_area').on('touchend mouseup touchcancel', function(e) {
			if(game.state == "racing" || game.state == 'surfing') {
				e.preventDefault();
				taps ++;
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
		}
	};
	
	var racing = function() {
		if(taps >= 5) {
			socket.emit('tap');
			taps = 0;
		}
	};
	
	var balancing = function() {
		if( judgeDiff(tiltLR,sent_tilt.lr) ) {
			sent_tilt.lr = tiltLR;
			socket.emit('tilt',sent_tilt);
		}
	};
	
	this.state = waiting;
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