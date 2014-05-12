window.onload = function() {
	var canvas = document.getElementById("canvas"),
		winW = window.innerWidth,
		winH = window.innerHeight;

	console.log(winW + ' ' + winH);	
	canvas.width = winW;
	canvas.height = winH;
	queue_module = {
		W : winW,
		H : winH,
		ctx : canvas.getContext("2d"),
		canvas : canvas,
		game_manager : new game_manager(),
		socket : socket(),
		images : {},
		players : {},
		screen_count : 0,
		winner : null,
		game_index : 0,
		game_started : false
	},
	
	/*Loads images then starts the game loop*/
	load_images( function(loaded_result){
// 		fake_players(5);
		queue_module.images = loaded_result;
		queue_module.game_manager.setGame(queue_module.game_index);
		queue_module.game_started = true;
		var loop_interval = setInterval(queue_module.game_manager.loop, 33);
	});
}

function game_manager() {
	var gameset = [
		aquarium,
		coffeegrind,
		coffeemake,
		coffeepour,
		snowfight,
		snowfall,
		taprhythm
	],
		mod = this;
	
	this.game = gameset[0];
	this.game_index = 0;
	this.game_count = gameset.length;
	
	this.setGame = function(index) {
		console.log('CHANGING GAME ' + index);
		this.game_index = index;
		this.game = new gameset[index];
	}
	
	this.nextGame = function() {
		this.game_index ++;
		if(this.game_index >= this.game_count) {
			this.game_index = 0;
		}
		this.game = new gameset[this.game_index];
		queue_module.screen_count = 0;
		queue_module.players = {};
		queue_module.winner = null;
	}
	
	this.loop = function() {
		mod.game.play();
	}
	
	this.gameError = function() {
		mod.loop = function(){};
		queue_module.ctx.fillStyle = 'black';
		queue_module.ctx.fillRect(0,0,queue_module.W,queue_module.H);
		queue_module.ctx.translate(queue_module.W/2, queue_module.H/2);
		queue_module.ctx.font = '50pt Arial';
		queue_module.ctx.textAlign = 'center';
		queue_module.ctx.textBaseline = 'middle';
		queue_module.ctx.fillStyle = 'red';
		queue_module.ctx.fillText('FATAL GAME ERROR',0,0);
	}
}


function fake_players(count) {
	for( var i=0;i<count;i++) {
		queue_module.players[i] = new player('player'+i,i);
		queue_module.player_count ++;
		console.log('Fake Player ' + i + ' created' );
	}
}