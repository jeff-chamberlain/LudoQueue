window.onload = function() {
	console.log('INIT');
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
		players : {},
		player_count : 0,
		screen_count : 0,
		socket : socket(),
		game_manager : new game_manager(),
		images : {},
		input_state : {
			tap : true,
			tiltFB: true,
			tiltLR: false,
			swype: false,
			rhythm: false
		},
		timed_advance : false
	},
	
	/*Loads images then starts the game loop*/
	load_images( function(loaded_result){
// 		fake_players(5);
		queue_module.images = loaded_result;
		queue_module.game_manager.setGame(0);
		var loop_interval = setInterval(queue_module.game_manager.loop, 33);
		init_events();
	});
}

function init_events() {
	window.addEventListener('keypress', function (e) {
		console.log(e.keyCode);
		switch(e.keyCode) {
			case 110:
				queue_module.game_manager.game.endGame();
				break;
			case 116:
				queue_module.timed_advance = !queue_module.timed_advance;				
				break;
			default:
				break;
		}
	}, false);
}

function game_manager() {
	var gameset = [
		aquarium,
		coffeegrind,
		coffeemake,
		coffeepour,
		snowfight,
		snowfall,
		taprhythm,
	],
		mod = this;
	
	this.game = gameset[0];
	this.game_index = 0;
	this.game_count = gameset.length;
	
	this.setGame = function(index) {
		this.game_index = index;
		this.game = new gameset[index];
		queue_module.socket.emit('new_game_index', this.game_index);
	}
	
	this.loop = function() {
		mod.game.play();
	}
	
	this.nextGame = function() {
		this.game_index ++;
		if(this.game_index >= this.game_count) {
			this.game_index = 0;
		}
		this.game = new gameset[this.game_index];
		queue_module.socket.emit('new_game_index', this.game_index);
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
