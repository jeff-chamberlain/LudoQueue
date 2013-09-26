var socket;

jQuery(document).ready( function() {

	socket = io.connect('http://ludosuite.herokuapp.com/player');
	
	socket.on('fail', function(data) {
		var failMsg = data.message;
		$('#fail').text(failMsg);
	});

});