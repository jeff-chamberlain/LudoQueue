function coffeemake() {
	var ctx = queue_module.ctx,
		scaleW = queue_module.W/1920,
		scaleH = queue_module.H/1080,
		logo = queue_module.images.logo,
		bg = queue_module.images.bg_coffee2,
		makers = [],
		tap_goal = 200,
		game_players = 0,
		maker_img = queue_module.images.maker,
		reflec_img = queue_module.images.reflec,
		game = this,
		game_over = false,
		f = new fadeIn(),
		instruc = new instructions(),
		winner = {},
		leaderboard = {},
		board_update = 0;
		
		this.play = f.draw;
	
	init();
	
	function init() {
		queue_module.input_state = {
			tap : true,
			tiltFB: false,
			tiltLR: false,
			swype: false,
			rhythm: false
		};
		queue_module.socket.emit('new_input_state', queue_module.input_state);
		
		managePlayers();
		queue_module.socket.emit('leaderboard',leaderboard);
	}
	
	var gameplay = function() {
		ctx.save();
		ctx.scale(scaleW, scaleH);
		ctx.drawImage(bg, 0, 0, 1920, 1080);
		
		var maker_count = makers.length;
		if(maker_count === 0) {
			game.endGame();
		}
		else {
			for(var i = makers.length - 1; i >= 0; i--) {
				makers[i].draw();
			}
		}
		if(Date.now() - board_update >= 1000 && !game_over) {
			board_update = Date.now();
			queue_module.socket.emit('leaderboard',leaderboard);
		}
		
		ctx.restore();
	}
	
	function managePlayers() {
		game_players = queue_module.player_count;
		if(makers.length !== game_players) {
			makers = [];
			var grid = new create_grid(1920,1080,game_players);
			var counter = 0;
			for( var id in queue_module.players ) {
				var vals = grid.getPos(counter);
				var m = new maker(id, vals.x, vals.y, vals.max);
				makers.push(m);
				counter++;
			}
			queue_module.socket.emit('leaderboard',leaderboard);
		}
	}
	
	function maker(id, x, y, max) {
		var tap_count = 0,
			drips = [],
			maker_scale = max/467,
			p = queue_module.players[id],
			color = p.color,
			name = p.name,
			module = this;
			
			leaderboard[id] = {name: name, color: color, score: 0};
		
		this.draw = function() {
			checkPlayer();
			ctx.save();
			ctx.transform(maker_scale, 0, 0, maker_scale, x, y);
			for(var i=drips.length-1;i>=0;i--) {
				drips[i].draw();
			}
			ctx.drawImage(maker_img, -173, -233.5);
			drawFill(tap_count/tap_goal);
			ctx.drawImage(reflec_img,-136,25.5);
			ctx.font = '40pt Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 6;
			ctx.strokeText(name,20,-180);
			ctx.fillStyle = color;
			ctx.fillText(name,20,-180);
			ctx.restore();
		}
		
		this.drawStatic = function() {
			ctx.save();
			ctx.transform(maker_scale, 0, 0, maker_scale, x, y);
			ctx.drawImage(maker_img, -173, -233.5);
			ctx.drawImage(reflec_img,-136,25.5);
			ctx.font = '40pt Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 6;
			ctx.strokeText(name,20,-180);
			ctx.fillStyle = color;
			ctx.fillText(name,20,-180);
			ctx.restore();
		}
		
		function drawFill(perc) {
			if(perc>1) {
				perc=1;
			}
			ctx.save();
			ctx.translate(-445,-325);
			var grd = ctx.createLinearGradient(0,480,0,356);
			grd.addColorStop(0,"#4c2a0b");
			grd.addColorStop(perc,"#4c2a0b");
			grd.addColorStop(perc,"rgba(0,0,0,0)");
			grd.addColorStop(1,"rgba(0,0,0,0)");
			ctx.fillStyle = grd;
			ctx.beginPath();
			ctx.moveTo(335.61,360.293);
			ctx.bezierCurveTo(335.61,360.293,310.555,402.862,312.379,421.714);
			ctx.bezierCurveTo(314.204,440.567,319.074,473.946,381.103,480.67);
			ctx.bezierCurveTo(442.523,481.617,464.918,448.21500000000003,463.809,422.322);
			ctx.bezierCurveTo(462.69800000000004,396.43,441.079,360.293,441.079,360.293);
			ctx.lineTo(438.11400000000003,356.903);
			ctx.bezierCurveTo(438.11400000000003,356.903,433.77000000000004,367.558,389.235,367.558);
			ctx.bezierCurveTo(349.629,367.558,337.13100000000003,358.08,337.13100000000003,358.08);
			ctx.lineTo(335.61,360.293);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
		
		function checkPlayer() {
			if(queue_module.players.hasOwnProperty(id)) {		
				if( p.taps > 0 ) {
					drips.push(new drip());
					if(tap_count >= tap_goal) {
						if(!game_over) {
							winner.name = name;
							winner.color = color;
							game.endGame();
							queue_module.socket.emit('leaderboard',leaderboard);
						}
						tap_count = tap_goal;
					}
					leaderboard[id].score = (tap_count/tap_goal) * 100;
					p.taps=0;
				}
			}
			else {
				var index = makers.indexOf(module);
				if(index >= 0) {
					makers.splice(index, 1);
					if(leaderboard.hasOwnProperty(id)) {
						delete leaderboard[id];
						queue_module.socket.emit('leaderboard',leaderboard);
					}
				}
			}
		}
		
		function drip() {
			var drip_y = 0,
				drip_time = Date.now();
	
			this.draw = function() {
				drip_y += ((Date.now()-drip_time)/5000)*150;
				ctx.beginPath();
				ctx.fillStyle = 'black';
				ctx.arc(-55, drip_y, 4, Math.PI*2, false);
				ctx.fill();
				
				if(drip_y >= 150) {
					tap_count ++;
					var index = drips.indexOf(this);
					if(index != -1) {
						drips.splice(index,1);
					}
				}
			}
		}
	}
	
	this.endGame = function() {
		if(!game_over) {
			game_over = true;
			if(!winner.name) {
				winner.name = 'No One';
				winner.color = 'rgb(100,100,100)';
			}
			queue_module.socket.emit('winner', winner);
			var f = new fadeOut(Date.now());
			this.play = f.draw;
		}
	}
	
	function fadeIn() {
		var time = Date.now();
		
		this.draw = function() {
			var t = (Date.now() - time) / 2500;
			var a = xLerp(0,1,t);
			ctx.save();
			ctx.scale(scaleW, scaleH);
			ctx.globalAlpha = 1;
			ctx.fillStyle = 'white';
			ctx.fillRect(0,0,1920,1080);
			ctx.drawImage(logo,0,0);
			ctx.restore();
			if(t >= 1) {
				ctx.globalAlpha = 1;
				game.play = instruc.draw;
			}
			else {
				ctx.globalAlpha = a;
			}
			instruc.draw();
		}
	}
	
	function fadeOut() {
		var time = Date.now(),
			winner_displayed = false;
		
		this.draw = function() {
			if(!winner_displayed) {
				var t = (Date.now() - time) / 4000;
				gameplay();
				drawWinner();
				if(t >= 1) {
					winner_displayed = true;
					time = Date.now();
					queue_module.socket.emit('advance_game');
				}
			}
			else {
				var t = (Date.now() - time) / 2500;
				var a = xLerp(1,0,t);
				ctx.save();
				ctx.scale(scaleW, scaleH);
				ctx.globalAlpha = 1;
				ctx.fillStyle = 'white';
				ctx.fillRect(0,0,1920,1080);
				ctx.drawImage(logo,0,0);
				ctx.restore();
				if(t >= 1) {
					ctx.globalALpha = 1;
					queue_module.game_manager.nextGame();
				}
				else {
					ctx.globalAlpha = a;
					gameplay();
					drawWinner();
				}
			}
		}
		
		function drawWinner() {
			ctx.save();
			ctx.scale(scaleW, scaleH);
			ctx.translate(960,540);
			var text = winner.name + ' Wins!';
			ctx.fillStyle = winner.color;
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1;
			ctx.font = '150pt Calibri';
			var box_width = ctx.measureText(text).width + 50;
			roundRect(ctx, -box_width/2, -100, box_width, 200, 40);
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = 'white';
			ctx.fillText(text,0,0);
			
			ctx.restore();
		}
	}
	
	function instructions() {
		var time = Date.now(),
			tap = queue_module.images.anims.tap.playLoop(Date.now(), 1000);
			
		this.draw = function() {
			var t = Date.now() - time;
			if(t >= 10000) {
				game.play = gameplay;
				gameplay();
				board_update = Date.now();
				return;
			}
			managePlayers();
			ctx.save();
			ctx.scale(scaleW, scaleH);
			ctx.drawImage(bg, 0, 0, 1920, 1080);
			for(var i = makers.length - 1; i >= 0; i--) {
				makers[i].drawStatic();
			}
			ctx.save();
			ctx.translate(960, 300);
			ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
			roundRect(ctx, -400, -75, 800, 150);
			ctx.font = '50pt Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = 'rgb(34,120,170)';
			ctx.fillText('GOAL',0,-35);
			ctx.font = '40pt Arial';
			ctx.fillText('Fill your coffee pot first to WIN!',0,35);
			ctx.translate(0, 400);
			ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
			roundRect(ctx, -400, -200, 800, 400);
			ctx.font = '50pt Arial';
			ctx.fillStyle = 'rgb(34,120,170)';
			ctx.fillText('CONTROLS',0,-160);
			ctx.font = '30pt Arial';
			ctx.fillStyle = 'rgb(34,120,170)';
			ctx.fillText('Tap to make coffee',0,-90);
			ctx.drawImage(tap.play(),-250,-83);
			drawArrow(ctx, 0, -15, 12, 50);
			var sec = 10 - Math.floor(t/1000);
			if( sec > 3) {
				ctx.font = '25pt Arial';
				ctx.textBaseline = 'bottom';
				ctx.fillStyle = 'black';
				ctx.fillText(sec,0,195);
			}
			else {
				ctx.font = '300pt Arial';
				ctx.fillStyle = 'rgb(209,32,39)';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(sec,0,-160);
			}
			ctx.restore();
		
			ctx.restore();
		}
	}
}