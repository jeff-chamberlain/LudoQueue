window.onload = function() {
	var canvas = document.getElementById("canvas"),
		winW = window.innerWidth,
		winH = window.innerHeight,
		start_map = 1;

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
		socket : socket(),
		game_manager : new game_manager(),
		images : {},
		map : {},
	};
	
	/*Loads images then starts the game loop*/
	load_images( function(loaded_result){
// 		fake_players(3);
		queue_module.images = loaded_result;
		queue_module.map = pixel_map(start_map);
		queue_module.game_manager.setGame(0);
		var loop_interval = setInterval(queue_module.game_manager.loop, 33);
		init_events();
	});
}

function init_events() {
	window.addEventListener('keypress', function (e) {
		switch(e.keyCode) {
			case 109:
				if(queue_module.map.version === 1) {
					queue_module.map = pixel_map(2);
					queue_module.game_manager.setGame(0);
				}
				else {
					queue_module.map = pixel_map(1);
					queue_module.game_manager.setGame(0);
				}
				break;
			default:
				break;
		}
	}, false);
}

function game_manager() {
	var gameset = [
		snowfight,
	],
	game = null;
	
	this.game_index = null;
	
	this.setGame = function(index) {
		this.game_index = index;
		game = new gameset[index];
	}
	
	this.loop = function() {
		game.play();
	}
}

function pixel_map(version) {
	if(version === 1) {
		var map = {
			overlay: queue_module.images.map_1,
			offset: 800,
			version: 1,
		}
	}
	else {
		var map = {
			overlay: queue_module.images.map_2,
			offset: 440,
			version: 2,
		}
	}
	return map;
}

function fake_players(count) {
	for( var i=0;i<count;i++) {
		queue_module.players[i] = new player('player'+i,i);
		queue_module.player_count ++;
		console.log('Fake Player ' + i + ' created' );
	}
}
