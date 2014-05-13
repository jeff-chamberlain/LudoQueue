function aquarium() {
	var ctx = queue_module.ctx,
		scaleW = queue_module.W/1920,
		scaleH = queue_module.H/1080,
		logo = queue_module.images.logo,
		fishes = {},
		fish_count = 0,
		ball = new bounce_ball(),
		layers = [
			[new ring(true), new background()],
			[],
			[ball],
			[new ring(false)]
		],
		drop_sound = queue_module.images.audio.fish_drop,
		teams = [
			{score: 0, color: 'rgba(255,163,16,0.7)', image: queue_module.images.fish_1, name: 'Orange Fishes'},
			{score: 0, color: 'rgba(51,51,204,0.7)', image: queue_module.images.fish_2, name: 'Blue Fishes'},
			{score: 0, color: 'rgba(237,58,117,0.7)', image: queue_module.images.fish_3, name: 'Pink Fishes'}
		],
		game = this,
		game_over = false,
		f = new fadeIn(Date.now());
		
		this.play = f.draw;		
		
	var gameplay = function() {
		if(fish_count !== queue_module.screen_count) {
			addPlayers();
		}
		
		ctx.save();
		ctx.scale(scaleW, scaleH);
		
		for( var i=0; i<4; i ++ ) {
			var layer = layers[i];
			for( var j=layer.length-1; j>=0; j--) {
				layer[j].draw();
			}
		}
		
		ctx.restore();
	}
	
	function addPlayers() {
		for( var id in queue_module.players ) {
			if(!fishes.hasOwnProperty(id)) {
				console.log('ADDING PLAYER');
				fishes[id] = new fish(id);
				fish_count ++;
				drop_sound.play();
				drop_sound.currentTime = 0.0;
			}
		}
	}

	function background() {
		var bg = queue_module.images.bg_aquarium,
			blue_net = queue_module.images.blue_net,
			
			rock_1 = queue_module.images.rock_1,
			rock_2 = queue_module.images.rock_2,
			rock_3 = queue_module.images.rock_3;
		
		this.draw = function() {
			ctx.drawImage(bg, 0, 0, 1920, 1080);
			ctx.drawImage(blue_net, 0, 0);
			ctx.drawImage(rock_1, 300, 850);
			ctx.drawImage(rock_2, 910, 812);
			ctx.drawImage(rock_3, 1460, 792);
			ctx.font = '20pt Arial';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = 'rgba(3,85,116,0.7)';
			ctx.fillText('Swim to this net to',20,230);
			ctx.fillText('go to the center screen',20,255);
			ctx.font = '40pt Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillText('Put the ball in the hoop!',960,140);
			ctx.font = '30pt Arial';
			ctx.fillText('Swipe to move',960,200);
			ctx.textAlign = 'center';
			for(var i=0; i<3; i++) {
				var team = teams[i];
				var x = 580 + (380 * i);
				var y = 50;
				ctx.save();
				ctx.translate(x,y);
				var text = team.name + ' Score';
				ctx.fillStyle = team.color;
				ctx.strokeStyle = 'black';
				ctx.lineWidth = 1;
				ctx.font = '30pt Calibri';
				var box_width = ctx.measureText(text).width + 20;
				roundRect(ctx, -box_width/2, -20, box_width, 92.5, 10);
				ctx.lineWidth = 4;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillStyle = 'white';
				ctx.strokeText(text,0,0);
				ctx.fillText(text,0,0);
				ctx.font = '35pt Calibri';
				ctx.strokeText(team.score,0,50);
				ctx.fillText(team.score,0,50);
				
				ctx.restore();
			}
		}
	}
	
	function ring(back) {
		var back_img = queue_module.images.ring_back,
			front_img = queue_module.images.ring_front;
			
		if(back) {
			this.draw = function() {
				ctx.save();
				ctx.translate(960, 540);
				ctx.drawImage(back_img, -104, -141.5);
				ctx.restore();
			}
		}
		else {
			this.draw = function() {
				ctx.save();
				ctx.translate(960, 540);
				ctx.drawImage(front_img, -24, -141.5);
				ctx.restore();
			}
		}
	}
	
	function fish(id) {
		var x = 200 + (Math.random()*1320),
			y = 0,
			p = queue_module.players[id],
			color = addOpacity(p.color,0.7),
			name = p.name,
			team = p.team,
			img = teams[team].image,
			angle = Math.PI/2,
			vel = 500,
			drawTime = Date.now(),
			bubbles = [],
			bubble_color = addOpacity(p.color,0.2),
			bubble_time = Date.now(),
			score = 0,
			obj = this,
			screen_time = null;
			
			this.nose_x = 0;
			this.nose_y = 0;
			
			ctx.font = '18pt Calibri';
			var name_width = ctx.measureText(name).width;
			
			layers[1].push(this);
		
		var dropIn = function() {
			var t = (Date.now()-drawTime) / 1000,
				dx = vel * Math.cos(angle) * t,
				dy = vel * Math.sin(angle) * t;
			
			x += dx;
			y += dy;
			
			if( angle > 0 ) {
				angle -= Math.PI / 2 * t;
			}
			
			vel -= vel * t * 2;
			if(vel <= 5) {
				vel = 0;
				action = idle;
			}
		}
		
		var swim = function() {
			checkPlayer();
			var t = (Date.now()-drawTime) / 1000,
				dx = vel * Math.cos(angle) * t,
				dy = vel * Math.sin(angle) * t;
			
			x += dx;
			y += dy;
			if( x > 1920 ) {
				if(angle < Math.PI/2 && angle > -Math.PI/2) {
					if(angle > 0) {
						angle =  Math.PI - angle;
					}
					else {
						angle = -angle - Math.PI;
					}
				}
			}
			else if( x < 0) {
				if(angle > Math.PI/2 || angle < -Math.PI/2) {
					if(angle > 0) {
						angle =  Math.PI - angle;
					}
					else {
						angle = -angle - Math.PI;
					}
				}
			}
			else if ( y < 0) {
				if(angle < 0) {
					angle =  -angle;
				}
			}
			else if(y > 1080) {
				if(angle > 0) {
					angle =  -angle;
				}
			}
			vel -= vel * t * 2;
			if(vel <= 5) {
				console.log('idle');
				vel = 0;
				action = idle;
			}
		}
		
		var idle = function() {
			checkPlayer();
		}
		
		var action = dropIn;
		
		function drawFish() {
			
			ctx.save();
			ctx.translate(x,y);
			ctx.save();
			ctx.rotate(angle);
			if(angle > Math.PI/2 || angle < -Math.PI/2) {
				ctx.scale(1,-1);
			}
			
			ctx.drawImage(img, -75, -50);
			ctx.restore();
			ctx.translate(0,70);
			ctx.fillStyle = color;
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1;
			ctx.font = '18pt Calibri';
			var text = name + ' - ' + score;
			var name_width = ctx.measureText(text).width;
			roundRect(ctx, -(name_width/2)-10, -12.5, name_width + 20, 25, 5);
			ctx.lineWidth = 4;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			var text = name + ' - ' + score;
			ctx.strokeText(text,0,0);
			ctx.fillStyle = 'white';
			ctx.fillText(text,0,0);
			
			ctx.restore();
		}
		
		function drawBubbles(bub_x, bub_y) {
			var bubble_interval = 2000;
			if(vel > 50) {
				var t = (2000 - vel) / 2000;
				bubble_interval = xLerp(50, 500, Math.pow(t, 6) );
			}
			if(Date.now() - bubble_time >= bubble_interval) {
				bubble_time = Date.now();
				var bub_x = x + (65 * Math.cos(angle));
				bubbles.push(new bubble(bub_x, y+10));
			}
			for(var i = bubbles.length - 1; i >= 0; i--) {
				bubbles[i].draw();
			}
		}
		
		function checkPlayer() {
			if(queue_module.players.hasOwnProperty(id)) {
				if(p.swype != null) {
					angle = -p.swype.angle;
// 					console.log(angle * (180/Math.PI));
					vel = clamp(100, 2000, p.swype.vel * 600);
// 					console.log('VELOCITY: ' + vel);
					action = swim;
					p.swype = null;
				}
			}
			else {
				if(fishes.hasOwnProperty(id)) {
					removeFish();
				}
			}
		}
		
		function checkBall(x,y) {
			var dist = Math.pow(x-ball.x,2)+Math.pow(y-ball.y,2);
			if(dist <= 2500) {
				ball.hit(vel, angle, obj);
			}
		}
		
		function checkScreenEscape() {
			var dist = Math.pow(x-100,2)+Math.pow(y-142,2);
			if(screen_time === null) {
				if(dist <= 4225 ) {
					screen_time = Date.now();
				}
			}
			else {
				if(dist > 4225) {
					screen_time = null;
				}
				else {
					var t = (Date.now()-screen_time) / 1500;
					if(t >= 1) {
						queue_module.socket.emit('change_screen', {id: p.id});
						queue_module.screen_count --;
						if( queue_module.players.hasOwnProperty(id) ) {
							delete queue_module.players[id];
						}
						removeFish();
					}
					else {
						var progress = xLerp(0, Math.PI * 2, t);
						ctx.save();
						ctx.translate(x,y);
						ctx.strokeStyle = color;
						ctx.lineWidth = 25;
						ctx.beginPath();
						ctx.arc(0, 0, 50, 0, progress, false);
						ctx.stroke();
						ctx.restore();
					}
				}
			}
		}
		
		this.draw = function() {
// 			console.log(x + "\t" + y + "\t" + vel + "\t" + angle);
			action();
			this.nose_x = x + (70 * Math.cos(angle));
			this.nose_y = y + (70 * Math.sin(angle));		
			drawBubbles(this.nose_x, this.nose_y);
			drawFish();
			checkBall(this.nose_x, this.nose_y);
			checkScreenEscape();
			drawTime = Date.now();
		}
		
		function bubble(x,y) {
			var rad = 4 + (Math.random()*13),
				dir = -3 + (Math.random()*6);
			
			this.draw = function() {
				var t = (Date.now()-drawTime) / 1000;
				y -= xLerp(50, 350, rad/17) * t;
				x += (-100 + (Math.random()*200)) * t;
				dir += (-10 + (Math.random()*20)) * t;
				ctx.save();
				ctx.translate(x,y);
				grad = ctx.createRadialGradient(3,-3,2,0,0,rad);
				grad.addColorStop(0,'white');
				grad.addColorStop(1,bubble_color);
				
				ctx.strokeStyle = 'black';
				ctx.lineWidth = .1;
				ctx.beginPath();
				ctx.fillStyle = grad;
				ctx.arc(0, 0, rad, Math.PI*2, false);
				ctx.fill();
				ctx.closePath();
				ctx.stroke();
				ctx.restore();
			}
		}
		
		this.score = function() {
			score ++;
			teams[team].score ++;
		}
		
		function removeFish() {
			fish_index = layers[1].indexOf(fishes[id]);
			if(fish_index != -1) {
				layers[1].splice(fish_index,1);
			}
			delete fishes[id];
			fish_count --;
			teams[team].players--;
			console.log('REMOVING PLAYER');
		}
	}
	
	function bounce_ball() {
		var img = queue_module.images.ball,
			vel = 0,
			angle = 0,
			draw_time = 0,
			owner = null,
			ring_in_range = false,
			ring_start = 0,
			ring_scored = false;
		
		this.x = 960;
		this.y = 900;
		
		function drawBall(x,y) {
			ctx.save();
			ctx.translate(x,y);
			ctx.drawImage(img, -50, -50);
			
			ctx.restore();
		}
		
		function move() {
			var t = (Date.now()-draw_time) / 1000,
			dx = vel * Math.cos(angle) * t,
			dy = vel * Math.sin(angle) * t;
			vel -= vel * t * 1.5;
			if(vel <= 5) {
				vel = 0;
			}
			return {dx: dx, dy: dy}
		}
		
		function checkEdges(x,y) {
			if( x > 1870 ) {
				if(angle < Math.PI/2 && angle > -Math.PI/2) {
					if(angle > 0) {
						angle =  Math.PI - angle;
						if(vel < 200) {
							vel = 200;
						}
					}
					else {
						angle = -angle - Math.PI;
						if(vel < 200) {
							vel = 200;
						}
					}
				}
			}
			else if( x < 50) {
				if(angle > Math.PI/2 || angle < -Math.PI/2) {
					if(angle > 0) {
						angle =  Math.PI - angle;
						if(vel < 200) {
							vel = 200;
						}
					}
					else {
						angle = -angle - Math.PI;
						if(vel < 200) {
							vel = 200;
						}
					}
				}
			}
			else if ( y < 50) {
				if(angle < 0) {
					angle =  -angle;
					if(vel < 200) {
						vel = 200;
					}
				}
			}
			else if(y > 1030) {
				if(angle > 0) {
					angle =  -angle;
					if(vel < 200) {
						vel = 200;
					}
				}
			}
		}
		
		function checkRing(x,y) {
			var dist = Math.pow(x-960,2)+Math.pow(y-540,2)
			if(ring_in_range) {
				if(ring_scored) {
					if(dist >= 20022) {
						ring_in_range = false;
						ring_scored = false;
						ring_start = 0;
					}
				}
				else {
					if( dist >= 20022) {
						ring_in_range = false;
						ring_start = 0;
					}
					else if((x > 960 && ring_start === -1) || (x < 960 && ring_start === 1)) {
						owner.score();
						ring_scored = true;
					}
				}
			}
			else if(dist <= 20022) {
				ring_in_range = true;
				if( x > 960) {
					ring_start = 1;
				}
				else {
					ring_start = -1;
				}
			}
		}
		
		this.draw = function() {
			var d = move();
			this.x += d.dx;
			this.y += d.dy;
			checkEdges(this.x, this.y);
			checkRing(this.x, this.y);
			drawBall(this.x, this.y, false);
			draw_time = Date.now();
		}
		
		this.hit = function(fish_vel, fish_angle, fish) {
			vel = fish_vel * 2;
			angle = fish_angle;
			owner = fish;
		}
	}
	
	this.endGame = function() {
		if(!game_over) {
			game_over = true;
			var f = new fadeOut(Date.now());
			this.play = f.draw;
		}
	}
	
	function fadeIn(time) {
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
				game.play = gameplay;
			}
			else {
				ctx.globalAlpha = a;
			}
			gameplay();
		}
	}
	
	function fadeOut(time) {
		this.draw = function() {
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
				queue_module.game_manager.nextGame();
			}
			else {
				ctx.globalAlpha = a;
				gameplay();
			}
		}
	}
}