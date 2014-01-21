var	game,
	game_interval,
	game_running,
	name,
	email,
	id,
	logged_in;

jQuery(document).ready( function() {
	loadAssets(function() {
		game = new game_maker();
		game.init();
		game.change_state("waiting");
		game_interval = setInterval( play, 33 );
	});
});

function game_maker() {
	this.sockets = new create_sockets();
	this.input = new create_input();
	this.draw = new create_draw();
	this.overlay = new create_overlay();
	this.state = "new";
}

game_maker.prototype.init = function() {
	this.input.init();
	this.draw.init();
	this.overlay.init();
}

game_maker.prototype.change_state = function(new_state) {
	this.state = new_state;
	this.input.change_state(new_state);
	this.draw.change_state(new_state);
}

game_maker.prototype.play = function() {
	this.input.play();
	this.draw.play();
}


function play() {
	game.play();
}

function signinCallback(authResult) {
  if (authResult['status']['signed_in']) {
    // Update the app to reflect a signed in user
    // Hide the sign-in button now that the user is authorized, for example:
    document.getElementById('signinButton').setAttribute('style', 'display: none');
    gapi.client.load('plus','v1', function(){
	 var request = gapi.client.plus.people.get({
	   'userId': 'me'
	 });
	 request.execute(function(resp) {
	   console.log('Retrieved profile for:' + resp.name.givenName);
	   console.log ('Emails ' + resp.emails[0].value);
	   login(resp.name.givenName, resp.emails[0].value);
	 });
	});
  } else {
    // Update the app to reflect a signed out user
    // Possible error values:
    //   "user_signed_out" - User is signed-out
    //   "access_denied" - User denied access to your app
    //   "immediate_failed" - Could not automatically log in the user
    console.log('Sign-in state: ' + authResult['error']);
  }
}