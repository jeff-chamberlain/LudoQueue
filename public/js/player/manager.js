window.onload = function() { 
	player_module = {
		config : {
			name : 'Player1',
			id : null,
			color : 'rgb(255,0,0)',
		},
		socket : socket(),
		input : new input(),
		draw : new draw(),
		overlay : new overlay
	}
};
/*function signinCallback(authResult) {
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
}*/