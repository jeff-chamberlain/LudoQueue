var tiltLR = 0, 
    tiltFB = 0;
    
var diff = 2;

jQuery(document).ready( function() {
	if (window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', function(eventData) {
			// gamma is the left-to-right tilt in degrees, where right is positive
			// beta is the front-to-back tilt in degrees, where front is positive
			
			if( judgeDiff(eventData.gamma, tiltLR) || judgeDiff(eventData.beta, tiltFB) ) {
				tiltLR = eventData.gamma;
				tiltFB = eventData.beta;
				socket.emit('tilt',{lr: tiltLR, fb: tiltFB});
			}

		});
	}
	else {
		$('#fail').text("no device orientation");
	}
});

function judgeDiff( a, b ) {
	var d = Math.abs( a - b );
	if( d >= diff ) {
		return true;
	}
	else {
		return false;
	}
}