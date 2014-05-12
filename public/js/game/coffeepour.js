function coffeepour() {
	var ctx = queue_module.ctx,
		scaleW = queue_module.W/1920,
		scaleH = queue_module.H/1080,
		logo = queue_module.images.logo,
		bg = queue_module.images.bg_coffee2,
		pourers = [],
		game_players = 0,
		cup_img = queue_module.images.cup,
		pot_img = queue_module.images.pot,
		overflow_img = queue_module.images.overflow,
		game = this,
		game_over = false,
		f = new fadeIn(),
		instruc = new instructions(),
		winner = {},
		leaderboard = {};
		
		this.play = f.draw;
	
	init();
	
	function init() {
		queue_module.input_state = {
			tap : true,
			tiltFB: true,
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
		
		var pourer_count = pourers.length;
		if(pourer_count === 0) {
			game.endGame();
		}
		else {
			for(var i = pourer_count - 1; i >= 0; i--) {
				pourers[i].draw();
			}
		}
		
		ctx.restore();
	}
	
	function managePlayers() {
		game_players = queue_module.player_count;
		if(pourers.length !== game_players) {
			pourers = [];
			var grid = new create_grid(1920,1080,game_players);
			var counter = 0;
			for( var id in queue_module.players ) {
				var vals = grid.getPos(counter);
				var p = new pourer(id, vals.x, vals.y, vals.max);
				pourers.push(p);
				counter++;
			}
			queue_module.socket.emit('leaderboard',leaderboard);
		}
	}
	
	function pourer(id, x, y, max) {
		var fill = 0,
			angle = 0,
			hits = 0,
			pourer_scale = max/290,
			p = queue_module.players[id],
			color = p.color,
			name = p.name,
			perc_label = '',
			draw_time = Date.now(),
			spilled = false,
			module = this;
			
			leaderboard[id] = {name: name, color: color, score: 0};
		
		this.draw = function() {
			checkPlayer();
			ctx.save();
			ctx.transform(pourer_scale, 0, 0, pourer_scale, x, y);

			drawCup(fill);
			ctx.drawImage(cup_img,-132,27,99,103);
			if(fill>1) {
				perc_label = 'SPILL!';
			}
			else {
				var adj_perc = fill/.97;
				if(adj_perc > 1) {
					adj_perc = 1;
				}
				perc_label = parseInt(adj_perc*100)+'%';
			}
			ctx.font = '30pt Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.lineWidth = 4;
			ctx.strokeText(perc_label,-93,70);
			ctx.fillStyle = color;
			ctx.fillText(perc_label,-93,70);
			ctx.textAlign = 'left';
			ctx.textBaseline = 'bottom';
			ctx.lineWidth = 6;
			ctx.strokeText(name,-20,130);
			ctx.fillStyle = color;
			ctx.fillText(name,-20,130);
			ctx.translate(35,-35);
			if(fill>1) {
				ctx.drawImage(overflow_img,-177,60,89,110);
			}
			ctx.rotate(angle*(Math.PI/180));
			ctx.drawImage(pot_img,-97,-94);
			ctx.font = '60pt Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 4;
			ctx.strokeText(hits,-16,20);
			ctx.fillStyle = color;
			ctx.fillText(hits,-16,20);
			ctx.restore();
		}
		
		this.drawStatic = function() {
			ctx.save();
			ctx.transform(pourer_scale, 0, 0, pourer_scale, x, y);
			drawCup(0);
			ctx.drawImage(cup_img,-132,27,99,103);
			ctx.font = '30pt Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.lineWidth = 4;
			ctx.strokeText('0%',-93,70);
			ctx.fillStyle = color;
			ctx.fillText('0%',-93,70);
			ctx.textAlign = 'left';
			ctx.textBaseline = 'bottom';
			ctx.lineWidth = 6;
			ctx.strokeText(name,-20,130);
			ctx.fillStyle = color;
			ctx.fillText(name,-20,130);
			ctx.translate(35,-35);
			ctx.rotate(angle*(Math.PI/180));
			ctx.drawImage(pot_img,-97,-94);
			ctx.font = '60pt Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 4;
			ctx.strokeText(hits,-16,20);
			ctx.fillStyle = color;
			ctx.fillText(hits,-16,20);
			ctx.restore();
			draw_time = Date.now();
		}
		
		function drawCup(perc) {
			if(perc > 1) {
				perc = 1;
			}
			ctx.save();
			ctx.transform(.5,0,0,.5,-130,30);
			var grd = ctx.createLinearGradient(0,175,0,0);
			grd.addColorStop(0,"#4c2a0b");
			grd.addColorStop(perc,"#4c2a0b");
			grd.addColorStop(perc,"rgba(0,0,0,0)");
			grd.addColorStop(1,"rgba(0,0,0,0)");
			ctx.fillStyle = grd;
			ctx.beginPath();
			ctx.moveTo(2.561,9.953);
			ctx.bezierCurveTo(-1.6799999999999997,1.4719999999999995,9.727,0.4529999999999994,18.894,0.4529999999999994);
			ctx.lineTo(119.561,0.4529999999999994);
			ctx.bezierCurveTo(119.561,0.4529999999999994,138.352,5.786,138.352,5.786);
			ctx.lineTo(138.352,14.378);
			ctx.lineTo(133.674,30.609);
			ctx.lineTo(132.77,122.93799999999999);
			ctx.bezierCurveTo(132.77,122.93799999999999,121.543,168.362,95.43800000000002,174.754);
			ctx.bezierCurveTo(95.43800000000002,174.754,53.16300000000002,191.463,27.68900000000002,162.494);
			ctx.bezierCurveTo(27.68900000000002,162.494,11.698000000000022,145.502,13.46300000000002,101.81);
			ctx.bezierCurveTo(8.569,88.818,9.894,24.62,2.561,9.953);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
		
		function checkPlayer() {
			if(queue_module.players.hasOwnProperty(id)) {
				angle = p.tiltFB;
				if(angle<0 && angle>-90 ) {
					fill += ((Date.now()-draw_time)/4000)*(angle/-45);
				}
				
				draw_time = Date.now();
			
				if( p.taps > 0 ) {
					if(fill >0.97 && fill<=1) {
						hits ++;
						leaderboard[id].score = hits;
						if(hits >= 4) {
							if(!game_over) {
								winner.name = name;
								winner.color = color;
								game.endGame();
							}
							hits = 4;
						}
						if(!game_over) {
							queue_module.socket.emit('leaderboard',leaderboard);
						}
					}
					fill = 0;
					spilled = false;
					p.taps=0;
				}
			}
			else {
				var index = pourers.indexOf(module);
				if(index >= 0) {
					pourers.splice(index, 1);
				}
				if(leaderboard.hasOwnProperty(id)) {
					delete leaderboard[id];
					queue_module.socket.emit('leaderboard',leaderboard);
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
			if(!winner.name) {
				winner.name = 'No One';
				winner.color = 'rgb(100,100,100)';
			}
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
		tap = queue_module.images.anims.tap.playLoop(Date.now(), 1000),
			pour = queue_module.images.anims.pour.playLoop(Date.now(), 1000);
			
		this.draw = function() {
			var t = Date.now() - time;
			if(t >= 10000) {
				game.play = gameplay;
				gameplay();
				return;
			}
			managePlayers();
			ctx.save();
			ctx.scale(scaleW, scaleH);
			ctx.drawImage(bg, 0, 0, 1920, 1080);
			for(var i = pourers.length - 1; i >= 0; i--) {
				pourers[i].drawStatic();
			}
			ctx.save();
			ctx.translate(960, 300);
			ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
			roundRect(ctx, -725, -75, 1450, 150);
			ctx.font = '50pt Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = 'rgb(34,120,170)';
			ctx.fillText('GOAL',0,-35);
			ctx.font = '40pt Arial';
			ctx.fillText('Be the first to pour 4 cups of coffee without spilling!',0,35);
			ctx.translate(0, 400);
			ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
			roundRect(ctx, -725, -200, 1450, 400);
			ctx.font = '50pt Arial';
			ctx.fillStyle = 'rgb(34,120,170)';
			ctx.fillText('CONTROLS',0,-160);
			ctx.font = '30pt Arial';
			ctx.fillStyle = 'rgb(34,120,170)';
			ctx.fillText('Pour with your phone',-287.5,-90);
			ctx.drawImage(pour.play(),-575,-81);
			drawArrow(ctx, -287.5, -15, 12, 50);
			ctx.drawImage(tap.play(), 75,-83);
			ctx.fillText('Tap when 100% full',287.5, -90);
			ctx.fillText('or after spilling',287.5,-50);
			drawArrow(ctx, 287.5, 15, 12, 50);
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