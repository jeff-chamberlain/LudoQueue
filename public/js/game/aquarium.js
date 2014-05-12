function aquarium() {
	var ctx = queue_module.ctx,
		scaleW = queue_module.W/1920,
		scaleH = queue_module.H/1080,
		logo = queue_module.images.logo,
		fishes = {},
		fish_count = 0,
		fish_img_array = [
			queue_module.images.fish_1,
			queue_module.images.fish_2,
			queue_module.images.fish_3
		],
		cas = new castle(),
		layers = [
			[new background()],
			[],
			[cas, new crown()]
		],
		drop_sound = queue_module.images.audio.fish_drop,
		teams = [
			{score: 0, color: 'rgba(255,163,16,0.7)', image: queue_module.images.fish_1, name: 'Orange Fishes'},
			{score: 0, color: 'rgba(51,51,204,0.7)', image: queue_module.images.fish_2, name: 'Blue Fishes'},
			{score: 0, color: 'rgba(237,58,117,0.7)', image: queue_module.images.fish_3, name: 'Pink Fishes'}
		],
		team_ids = {},
		king = null,
		start_time = Date.now(),
		game = this,
		game_over = false,
		f = new fadeIn(Date.now());
		
		this.play = f.draw;
		
		queue_module.input_state = {
			tap : false,
			tiltFB: false,
			tiltLR: false,
			swype: true,
			rhythm: false
		};
		queue_module.socket.emit('new_input_state', queue_module.input_state);
		
	var gameplay = function() {
		if( fish_count !== queue_module.screen_count ) {
			addPlayers();
		}
		
		ctx.save();
		ctx.scale(scaleW, scaleH);
		
		for( var i=0; i<3; i ++ ) {
			var layer = layers[i];
			for( var j=layer.length-1; j>=0; j--) {
				layer[j].draw();
			}
		}
		
		if(Date.now() - start_time >= 150000 && queue_module.timed_advance) {
			game.endGame();
		}
		ctx.restore();
	}

	function addPlayers() {
		for( var id in queue_module.players ) {
			if(!fishes.hasOwnProperty(id) && queue_module.players[id].screen === 0) {
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
			red_net = queue_module.images.red_net,
			draw_time = Date.now();
		
		this.draw = function() {
			ctx.drawImage(bg, 0, 0, 1920, 1080);
			ctx.drawImage(blue_net, 0, 0);
			ctx.drawImage(red_net, 1724, 0);
			ctx.font = '20pt Arial';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = 'rgba(3,85,116,0.7)';
			ctx.fillText('Swim to this net to',20,230);
			ctx.fillText('go to the left screen',20,255);
			ctx.textAlign = 'right';
			ctx.fillText('Swim to this net to',1900,230);
			ctx.fillText('go to the right screen',1900,255);
			ctx.font = '40pt Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillText('Steal the crown!',960,140);
			ctx.font = '30pt Arial';
			ctx.fillText('Swipe to move',960,200);
			ctx.textAlign = 'center';
			if(king !== null) {
				teams[king].score += Date.now() - draw_time;
			}
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
				ctx.strokeText(msToTime(team.score),0,50);
				ctx.fillText(msToTime(team.score),0,50);
				
				ctx.restore();
			}
			draw_time = Date.now();
		}
	}
	
	function castle() {
		var img = queue_module.images.castle,
			layer = 2,
			next_layer,
			ob = this;
		
		var baseDraw = function() {
			ctx.drawImage(img, 645, 501);
		}
		
		var change = function() {
			var fishes_away = true;
			for( var id in fishes ) {
				var fish = fishes[id];
				var dist = Math.pow(960-fish.nose_x,2)+Math.pow(790.5-fish.nose_y,2);
				if(dist < 225625) {
					fishes_away = false;
					break;
				}
			}
			if(fishes_away) {
				var layer_index = layers[layer].indexOf(this);
				if(layer_index != -1) {
					layers[layer].splice(layer_index,1);
				}
				layer = next_layer;
				layers[layer].unshift(this);
				ob.draw = baseDraw;
			}
			baseDraw();
		}
		
		this.changeLayer = function(new_layer) {
			if(layer != new_layer) {
				next_layer = new_layer;
				this.draw = change;
			}
			else {
				this.draw = baseDraw;
			}
		}
		
		this.draw = baseDraw;
	}

	function fish(id) {
		var x = 200 + (Math.random()*1320),
			y = 0,
			p = queue_module.players[id],
			color = addOpacity(p.color,0.7),
			name = p.name,
			angle = Math.PI/2,
			vel = 500,
			drawTime = Date.now(),
			bubbles = [],
			bubble_color = addOpacity(p.color,0.2),
			bubble_time = Date.now(),
			crowned = false,
			crown = queue_module.images.crown,
			screen_time = null,
			next_screen = 0;
			
			if(team_ids.hasOwnProperty(id)) {
				var team = team_ids[id];
			}
			else {
				var team = findTeam();
				team_ids[id] = team;
			}
			var img = teams[team].image;
			
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
			if(crowned) {
				ctx.save();
				ctx.translate(50, -45);
				ctx.scale(0.4, 0.4);
				ctx.drawImage(crown, 0, 0);
				ctx.restore();
			}
			ctx.restore();
			ctx.translate(0,70);
			ctx.fillStyle = color;
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1;
			roundRect(ctx, -(name_width/2)-10, -12.5, name_width + 20, 25, 5);
			ctx.font = '18pt Calibri';
			ctx.lineWidth = 4;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.strokeText(name,0,0);
			ctx.fillStyle = 'white';
			ctx.fillText(name,0,0);
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
			if(queue_module.players.hasOwnProperty(id) && p.screen === 0) {
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
		this.crownFish = function(value) { 
			crowned = value;
			if(crowned) {
				king = team;
			}
		}
		
		this.draw = function() {
// 			console.log(x + "\t" + y + "\t" + vel + "\t" + angle);
			action();
			var nose_angle = Math.PI/12;
			if(angle > Math.PI/2 || angle < -Math.PI/2) {
				nose_angle = -Math.PI/12;
			}
			this.nose_x = x + (70 * Math.cos(angle + nose_angle));
			this.nose_y = y + (70 * Math.sin(angle + nose_angle));		
			drawBubbles(this.nose_x, this.nose_y);
			drawFish();
			checkScreenEscape();
			drawTime = Date.now();
		}
		
		function checkScreenEscape() {
			if(screen_time === null) {
				var dist1 = Math.pow(x-100,2)+Math.pow(y-142,2);
				var dist2 = Math.pow(x-1820,2)+Math.pow(y-142,2);
				if(dist1 <= 4225 ) {
					screen_time = Date.now();
					next_screen = -1;
				}
				else if(dist2 <= 4225) {
					screen_time = Date.now();
					next_screen = 1;
				}
			}
			else {
				if(next_screen === -1) {
					var dist = Math.pow(x-100,2)+Math.pow(y-142,2);
				}
				else {
					var dist = Math.pow(x-1820,2)+Math.pow(y-142,2);
				}
				if(dist > 4225) {
					console.log('LOST');
					screen_time = null;
					next_screen = 0;
				}
				else {
					var t = (Date.now()-screen_time) / 3000;
					if(t >= 1) {
						queue_module.screen_count --;
						p.screen = next_screen;
						queue_module.socket.emit('change_screen', {player: {name: name, color: color, id: id, team: team}, screen: next_screen});
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
		
		function removeFish() {
			fish_index = layers[1].indexOf(fishes[id]);
			if(fish_index != -1) {
				layers[1].splice(fish_index,1);
			}
			delete fishes[id];
			fish_count --;
			if(crowned) {
				king = null;
			}
			console.log('REMOVING PLAYER');
		}
	}
	
	function crown() {
		var img = queue_module.images.crown,
			home_x = 966.5,
			home_y = 985,
			x = home_x,
			y = home_y,
			owner = null,
			owner_id = null,
			capture_time = 0,
			test_dist = 2500;
			
		this.draw = function() {
			if(owner !== null) {
				if(fishes.hasOwnProperty(owner_id)) {
					x = owner.nose_x;
					y = owner.nose_y;
				}
				else {
					owner = null;
					x = home_x;
					y = home_y;
					cas.changeLayer(2);
				}
			}
			else {
				ctx.save();
				ctx.translate(x, y)
				ctx.drawImage(img, -36.5, -45);
				ctx.restore();
			}
			if(capture_time !== 0) {
				if( Date.now() - capture_time > 1000 ) {
					capture_time = 0;
				}
			}
			else {
				var new_owner = null;
				for( var id in fishes ) {
					var fish = fishes[id];
					var loop_dist = test_dist;
					if( fish !== owner ) {
						var dist = Math.pow(x-fish.nose_x,2)+Math.pow(y-fish.nose_y,2);
						if(dist < loop_dist) {
							new_owner = id;
							loop_dist = dist;
						}
					}
				}
				if( new_owner !== null) {
					if(owner !== null) {
						owner.crownFish(false);
					}
					else {
						cas.changeLayer(0);
					}
					owner_id = new_owner;
					owner = fishes[owner_id];
					owner.crownFish(true);
					capture_time = Date.now();
				}
			}
		}
	}
	
	this.endGame = function() {
		queue_module.socket.emit('advance_game');
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
				queue_module.socket.emit('reset_screens');
				queue_module.game_manager.nextGame();
			}
			else {
				ctx.globalAlpha = a;
				gameplay();
			}
		}
	}
	
	function findTeam() {
		var team_players = [0,0,0];
		for(var id in team_ids) {
			if(queue_module.players.hasOwnProperty(id)) {
				team_players[team_ids[id]] ++;
			}
			else {
				delete team_ids[id];
			}
		}
		var smallest = Math.min(team_players[0], team_players[1], team_players[2]);
		var indexes = [];
		for( var i=0; i<3; i++) {
			if(team_players[i] === smallest) {
				indexes.push(i);
			}
		}
		var rand = Math.floor(Math.random() * indexes.length);
		var team = indexes[rand];
		teams[team].players ++;
		return team;
	}
}