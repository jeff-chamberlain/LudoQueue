jQuery(document).ready( function() {

	var socket = io.connect('http://ludosuite.herokuapp.com/surf');
	
	socket.on('newplayer', function (id) {
		create_particle(id);
		console.log("New player connection");
	});
	
	socket.on('fail', function(data) {
		surf_fail(data.message);
	});
	
	socket.on('playerleave', function(username) {
		lose_particle(username);
		console.log("Player disconnection");
	});
	
	socket.on('tilt', function(data) {
		update_particle_vel(data.username, data.tiltData);
	});
	
});