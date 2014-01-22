window.onload = Init;

var W,
	H,
	ctx,
	drawInter,
	state,
	old_state,
	new_state,
	game_state;

//Lets create a simple particle system in HTML5 canvas and JS
function Init() {
	
	create_sockets();

	//Initializing the canvas
	var canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	W = window.innerWidth;
	H = window.innerHeight;
	console.log(W + ' ' + H);
	canvas.width = W;
	canvas.height = H;
	
	loadImages( function(){
		fake_players(5);
		game_state = "surf";
		state = surf;
		surf_init();
		drawInter = setInterval(draw, 33);
	});
}

function draw() {
	state();
}

function change_state(next_string) {
	game_state = next_string;
	old_state = state;
	switch(next_string) {
		case "race":
			new_state = race;
			break;
		
		case "balance":
			new_state = balance;
			break;
			
		case "surf":
			new_state = surf;
			break;
	}
	transition_time = Date.now();
	state = transition;
	for( var id in players ) {
		players[id].change_state(next_string);
	}
}

var transition_down = false;
var transition_alph = 0;
var transition_time;
	
var transition = function() {
	if( !transition_down ) {
		transition_alph += ( Date.now() - transition_time ) / 1500;
		old_state();
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = "rgba(0, 0, 0, "+transition_alph+")";
		ctx.fillRect(0, 0, W, H);
		if( transition_alph >= 1 ) {
			transition_alph = 1;
			transition_down = true;
			state_init(new_state);
		}
	}
	else {
		if( transition_alph <= 0 ) {
			state = new_state;
			transition_down = false;
			transition_alph = 0;
		}
		else {
			transition_alph -= ( Date.now() - transition_time ) / 1500;
			new_state();
			ctx.globalCompositeOperation = "source-over";
			ctx.fillStyle = "rgba(0, 0, 0, "+transition_alph+")";
			ctx.fillRect(0, 0, W, H);
		}
	}
	transition_time = Date.now();
};

function state_init(next_state) {
	switch(next_state) {
		case balance:
			balance_init();
			break;
		case race:
			race_init();
			break;
		case surf:
			surf_init();
			break;
	}
}
function fake_players(count) {
	for( var i=0;i<count;i++) {
		players[i] = new player('player'+i);
		player_count ++;
	}
}