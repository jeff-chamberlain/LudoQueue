var tiltLR = 0, 
    tiltFB = 0,
    taps = 0,
    diff = 2,
    sent_tilt = {lr:0,fb:0};

function create_input() {
	
	this.init = function() {
	
		$('#start_form').submit(function(event){
			event.preventDefault();
			game.overlay.fadeOutOver();
			game.change_state("waiting");
			name = $('#start_name').val();
			socket.emit('enter',name);
		});
		
		window.addEventListener('deviceorientation', function(eventData) {
			tiltLR = eventData.beta;
			tiltFB = eventData.gamma;
		});
		
		$('#touch_area').on('touchend mouseup touchcancel', function(e) {
			console.log('gen touch');
			if(game.state == "racing" ) {
				console.log('touch event');
				taps ++;
			}
		});
	};
	
	this.play = function() { this.state() };
	
	this.change_state = function(new_state) {
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
			console.log('tilting surf');
			socket.emit('tilt',sent_tilt);
		}
	};
	
	var racing = function() {
		if(taps >= 5) {
			console.log('sending tap');
			socket.emit('tap');
			taps = 0;
		}
	};
	
	var balancing = function() {
		if( judgeDiff(tiltLR,sent_tilt.lr) ) {
			sent_tilt.lr = tiltLR;
			console.log('tilting bal');
			socket.emit('tilt',sent_tilt);
		}
	};
	
	this.state = waiting;
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