var	game,
	game_interval,
	name;

jQuery(document).ready( function() {
	game = new game_maker();
	game.init();
	game_interval = setInterval( play, 33 );
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

