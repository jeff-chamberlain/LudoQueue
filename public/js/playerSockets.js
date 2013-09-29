var socket;

jQuery(document).ready( function() {

	socket = io.connect('http://localhost:5000/player');
	
	socket.on('fail', function(data) {
		var failMsg = data.message;
		$('#fail').text(failMsg);
	});

});