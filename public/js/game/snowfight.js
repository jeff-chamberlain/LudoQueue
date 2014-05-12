function snowfight() {
	var ctx = queue_module.ctx,
		scaleW = queue_module.W/1920,
		scaleH = queue_module.H/1080,
		logo = queue_module.images.logo,
		bg = queue_module.images.bg_snowfight,
		duloc_array = [
			queue_module.images.anims.snowman1,
			queue_module.images.anims.snowman2,
			queue_module.images.anims.snowman3,
			queue_module.images.anims.snowman4,
			queue_module.images.anims.snowman5,
			queue_module.images.anims.snowman6,
		],
		cannons = [],
		leaderboard = {},
		snowballs = [],
		lines = [
			new duloc_line(150,0.5,250,false,3),
			new duloc_line(450,1.0,200,true,2),
			new duloc_line(810,1.5,150,false,1)
		],
		counter = new game_counter(),
		input_state = {
			tap : true,
			tiltFB: true,
			tiltLR: false,
			swype: false,
		},
		game_players = [],
		game = this,
		game_over = false,
		f = new fadeIn(),
		instruc = new instructions(),
		winner = {name:null,color:null,score:0},
		leaderboard = {};
		
	this.play = f.draw;
		
	queue_module.input_state = {
		tap : true,
		tiltFB : true,
		tiltLR : false,
		swype : false,
		rhythm : false
	};
	queue_module.socket.emit('new_input_state', queue_module.input_state);
			
	var gameplay = function() {
		ctx.save();
		ctx.scale(scaleW, scaleH);
		ctx.drawImage(bg, 0, 0, 1920, 1080);
		
		for(var i=0,j=lines.length; i<j; i++) {
			lines[i].draw();
		}
		
		for(var j=snowballs.length-1; j>=0; j--) {
			snowballs[j].draw();
		}
		
		if( queue_module.player_count !== game_players.length ) {
			standby_players();
		}
		
		var cannon_count = cannons.length;
		if(cannon_count === 0) {
			game.endGame();
		}
		else {
			for(var i=0,j=cannons.length; i<j; i++) {
				cannons[i].run();
			}
		}
		
		counter.run();
		
		ctx.restore();
	}
	
	var pregame = function() {
		ctx.save();
		ctx.scale(scaleW, scaleH);
		ctx.drawImage(bg, 0, 0, 1920, 1080);
		
		for(var j=snowballs.length-1; j>=0; j--) {
			snowballs[j].draw();
		}
					
		if( game_players.length !== queue_module.player_count ) {
			console.log('Changing from '+game_players.length+' players to '+queue_module.player_count+' players');
			init_cannons(queue_module.player_count);
		}
		
		for(var i=0,j=cannons.length; i<j; i++) {
			cannons[i].run();
		}
				
		ctx.restore();
	}
		
	function init_cannons(new_count) {
		cannons = [],
		game_players = [];
		
		if(new_count > 10) {
			new_count = 10;
		}
		var x_interval = 1620/(new_count+1),
			player_counter = 0;
		
		for( var id in queue_module.players ) {
			var p = queue_module.players[id];
			if(player_counter < 10) {
				console.log('IN\t' + p.id);
				var can_x = 150 + (x_interval * (player_counter+1));
				var can = new cannon(can_x, p.id, p.color, p.name);
				cannons.push(can);
			}
			else {
				console.log('standby\t' + p.id);
				queue_module.socket.emit('player_standby',p.id);
			}
			game_players.push(p.id);
			player_counter ++;
		}
		queue_module.socket.emit('leaderboard',leaderboard);
	}
	
	function standby_players() {
		console.log('STANDBY');
		for( var id in queue_module.players ) {
			if(game_players.indexOf(id) < 0 ) {
				console.log('standing by ' + id );
				queue_module.socket.emit('player_standby',id);
				game_players.push(id);
			}
		}
		for( var i=game_players.length; i>=0; i-- ) {
			var id = game_players[i];
			if(!queue_module.players.hasOwnProperty(id)) {
				game_players.splice(i,1);
				if(leaderboard.hasOwnProperty(id)) {
					delete leaderboard[id];
					queue_module.socket.emit('leaderboard',leaderboard);
				}
			}
		}
	}
	
	function cannon(set_x, id, set_color, set_name) {
		var x = set_x,
			player_id = id,
			font_size = 80,
			name_w = 0,
			angle = 0,
			timer = Date.now(),
			ob = this,
			fired = false,
			fire_time = 0,
			fire_meter = 1,
			poof = null,
			poof_anim = queue_module.images.anims.poof,
			score = 0,
			color = set_color,
			name = set_name;
			
			leaderboard[id] = {name: name, color: color, score: 0};
		
		adjust_font_size();
					
		this.hit = function(added) {
			score += added;
			leaderboard[id].score = score;
			queue_module.socket.emit('leaderboard', leaderboard);
			if(score > winner.score) {
				winner.name = name;
				winner.color = color;
				winner.score = score;
			}
		}
			
		this.run = function() {
			check_player();
			ctx.save();
			ctx.translate(x,1080);
			ctx.scale(0.5,0.5);
			ctx.save();
			ctx.rotate(angle*(Math.PI/180));
			ctx.translate(-67.5,-401);
			ctx.save();
			var grd = ctx.createLinearGradient(0,0,0,401);
			grd.addColorStop(0, color);
			grd.addColorStop(1, 'rgb(0,0,0)');
			ctx.fillStyle = grd;
			draw_cannon();
			ctx.restore();
			ctx.drawImage(queue_module.images.cannon_over,0,0);
			var meter_grd = ctx.createLinearGradient(0,401,0,0);
			meter_grd.addColorStop(0, 'rgb(255,255,255)');
			meter_grd.addColorStop(fire_meter, color);
			meter_grd.addColorStop(fire_meter, 'rgb(0,0,0)');
			meter_grd.addColorStop(1, 'rgb(0,0,0)');
			ctx.fillStyle = meter_grd;
			ctx.fillRect(140,0,10,401);
			ctx.translate(-35,-250);
			run_fire();
			ctx.translate(102.5,450.5);
			ctx.font = '80px Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.lineWidth = 10;
			ctx.strokeStyle = 'black';
			ctx.strokeText(score,0,0);
			var score_grd = ctx.createLinearGradient(0,40,0,-40);
			score_grd.addColorStop(0, color);
			score_grd.addColorStop(1, 'rgb(255,255,255)');
			ctx.fillStyle = score_grd;
			ctx.fillText(score,0,0);
			ctx.restore();
			ctx.font = font_size + 'px Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'bottom';
			ctx.lineWidth = 10;
			ctx.strokeStyle = 'black';
			ctx.strokeText(name,0,-5);
			var name_grd = ctx.createLinearGradient(0,-font_size-5,0,-5);
			name_grd.addColorStop(1, color);
			name_grd.addColorStop(0, 'rgb(255,255,255)');
			ctx.fillStyle = name_grd;
			ctx.fillText(name,0,-5);
			ctx.restore();
			timer = Date.now();
		}
		
		function check_player() {
			if(queue_module.players.hasOwnProperty(player_id)) {
				var p = queue_module.players[player_id];
				input_angle = clamp(-45,45,p.tiltFB);
				if( angle !== input_angle ) {
					if(Math.abs(input_angle - angle) < 0.1) {
						angle = input_angle;
					}
					else {
						var t = (Date.now()-timer)/1000;
						angle = xLerp(angle,input_angle,t);
					}
				}
				if( p.taps > 0 ) {
					if(!fired) {
						fire();
					}
					p.taps=0;
				}
			}
		}
		
		function fire() {
			if(!fired) {
				var ball_dx = Math.cos((-angle*(Math.PI/180))+(Math.PI/2)),
					ball_dy = Math.sin((-angle*(Math.PI/180))+(Math.PI/2)),
					ball_x = x + (ball_dx*200);
					ball_y = 1080 - (ball_dy*200);
				snowballs.push( new snowball(ball_x, ball_y, ball_dx, ball_dy, ob) );
				fire_time = Date.now();
				fired = true;
				poof = poof_anim.playOneShot(fire_time, 500);
			}
		}
		
		function draw_cannon() {
			ctx.beginPath();
			ctx.moveTo(0,0);
			ctx.lineTo(135,0);
			ctx.lineTo(135,401);
			ctx.lineTo(0,401);
			ctx.closePath();
			ctx.clip();
			ctx.strokeStyle = 'rgba(0,0,0,0)';
			ctx.lineCap = 'butt';
			ctx.lineJoin = 'miter';
			ctx.miterLimit = 4;
			ctx.save();
			ctx.strokeStyle = 'rgba(0,0,0,0)';
			ctx.beginPath();
			ctx.moveTo(70.553,9.094);
			ctx.bezierCurveTo(70.553,9.094,100.636,7.0329999999999995,107.024,13.314);
			ctx.lineTo(106.56700000000001,20.572);
			ctx.bezierCurveTo(106.56700000000001,20.572,120.757,32.359,109.465,50.153);
			ctx.bezierCurveTo(98.172,67.945,108.682,117.52000000000001,108.736,118.96600000000001);
			ctx.bezierCurveTo(108.79,120.412,116.67500000000001,128.08800000000002,109.99000000000001,133.401);
			ctx.lineTo(114.95400000000001,199.473);
			ctx.bezierCurveTo(114.95400000000001,199.473,120.35000000000001,198.55,120.07700000000001,220.645);
			ctx.bezierCurveTo(119.80100000000002,242.74,132.30100000000002,346.834,132.30100000000002,346.834);
			ctx.bezierCurveTo(132.30100000000002,346.834,127.51700000000001,391.091,71.12200000000001,396.503);
			ctx.lineTo(66.78500000000001,396.223);
			ctx.bezierCurveTo(6.046,393.753,3.516,342.7,3.516,342.7);
			ctx.bezierCurveTo(3.516,342.7,15.806,243.617,15.224,221.528);
			ctx.bezierCurveTo(14.642,199.439,20.052,200.28799999999998,20.052,200.28799999999998);
			ctx.lineTo(24.093,134.15299999999996);
			ctx.bezierCurveTo(17.336,128.93299999999996,25.114,121.14899999999996,25.146,119.70199999999997);
			ctx.bezierCurveTo(25.179000000000002,118.25499999999997,34.999,68.53799999999997,23.459,50.90499999999997);
			ctx.bezierCurveTo(11.919,33.27099999999997,25.944,21.287999999999972,25.944,21.287999999999972);
			ctx.lineTo(25.386,14.03699999999997);
			ctx.bezierCurveTo(31.682,7.6669999999999705,68.567,8.86999999999997,68.567,8.86999999999997);
			ctx.lineTo(70.553,9.094);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.restore();
		}
		
		function run_fire() {
			if(fired) {
				var t = (Date.now() - fire_time) / 2000;
				fire_meter = t;
				if(t >= 1) {
					fire_meter = 1;
					fired = false;
				}
				else if( t < 0.25 ) {
					poof_frame = poof.play();
					if(poof_frame) {
						ctx.drawImage(poof_frame,0,0);
					}
				}
			}
		}
		
		function adjust_font_size() {
			ctx.font = font_size + 'px Calibri';
			var metrics = ctx.measureText(name);
			name_w = metrics.width;
			while( name_w > 135 ) {
				font_size -= 2;
				ctx.font = font_size + 'px Calibri';
				metrics = ctx.measureText(name);
				name_w = metrics.width;
			}
		}
	}
	
	function snowball(start_x,start_y,dx,dy,cannon) {
		var timer = Date.now(),
			vel = 500,
			image = queue_module.images.snowball;
				
		this.x = start_x,
		this.y = start_y;
		this.rad = 25;
		
		this.draw = function() {
			var t = Date.now
			if( check_off_screen(this.x, this.y, this.rad) ) {
				this.destroy(0);
			}
			else {
				var t = (Date.now() - timer)/1000;
				this.x += dx * t * vel;
				this.y -= dy * t * vel;
				this.rad = xLerp(25,5,(start_y-this.y)/start_y);
				ctx.drawImage(image,this.x-this.rad,this.y-this.rad,this.rad*2,this.rad*2);
				timer = Date.now();
			}
		}
		
		this.destroy = function(score) {
			if(!game_over) {
				cannon.hit(score);
			}
			var index = snowballs.indexOf(this);
			if(index != -1) {
				snowballs.splice(index,1);
			}
		}
		
		function check_off_screen(x,y,rad) {
			if( x < -rad*2 || x > 1920 + (rad*2) || y < -rad*2 ) {
				return true;
			}
			else {
				return false;
			}
		}
		
	}
	
	function duloc_line(y, set_scale, set_speed, mirror, set_score) {
		var duloc_arr = [],
			scale = set_scale,
			line_y = y/scale,
			speed = set_speed/scale,
			score = set_score,
			timer = Date.now(),
			line_built = false,
			i = 0;
			
		while(!line_built) {
			var start_x = -150 - (300 * i);
			var dul = new duloc(start_x, line_y, scale, mirror, score);
			duloc_arr[i] = dul;
			if(start_x < -2070/scale) {
				line_built = true;
			}
			else {
				i ++;
			}
			
			var num = duloc_arr.length;
		}
		
		this.draw = function() {
			ctx.save();
			if(mirror) {
				ctx.translate(1920,0);
				ctx.scale(-scale,scale);
			}
			else {
				ctx.scale(scale,scale);
			}
			if(duloc_arr[0].x >= 2070/scale) {
				duloc_arr.splice(0,1);
				var new_x = duloc_arr[num-2].x-300;
				duloc_arr.push(new duloc(new_x, line_y, scale, mirror, score));
			}
			var t = (Date.now()-timer)/1000;
			for(var i=0; i<num; i++) {
				var dul = duloc_arr[i];
				dul.x += t*speed;
				dul.draw();
			}
			timer = Date.now();
			ctx.restore();
		}
	}
	
	function duloc(set_x,set_y, set_scale, mirror, set_score) {
		this.x = set_x;
		
		var index = Math.floor(Math.random()*6),
			anim = duloc_array[index],
			img = anim.frames[0],
			loop = anim.playLoop(Date.now(), 1000),
			timer = Date.now() - (Math.random()*1000),
			angle = 0,
			width = duloc_array[index].frames[0].width,
			height = duloc_array[index].frames[0].height,
			act_rand = Math.floor(Math.random()*3),
			action = null,
			y = set_y,
			scale = set_scale,
			score = set_score,
			fallen = false,
			fall_time = 0;
						
		this.draw = function() {
			action(this.x);
		}
		
		var rock = function(x) {
			var t = (Date.now() - timer)/2500;
			angle = xLerp(0, Math.PI/4, Math.sin(2*Math.PI*t));
				
			ctx.save();
			ctx.translate(x,y);
			ctx.rotate(angle);
			ctx.drawImage(img, -(width/2), -height);
			ctx.restore();
			if(t >= 1) {
				timer = Date.now();
			}
			for(var j=snowballs.length-1; j>=0; j--) {
				var ball = snowballs[j];
				if( ball && check_point(ball.x,ball.y,x,y,width,true) ) {
					ball.destroy(score);
					var e = new explode(x,y,angle);
					action = e.run;
					break;
				}
			}
		}
		
		var jump = function(x) {
			var t = (Date.now() - timer)/2500,
				jump = 0;
				
			if(t < 0.5) {
				var f = t/0.5;
				jump = xLerp(0,height/2,(-4*Math.pow(f,2))+(4*f));
			}
			ctx.save();
			ctx.translate(x,y);
			ctx.drawImage(img, -(width/2), -height - jump);
			ctx.restore();
			if(t >= 1) {
				timer = Date.now();
			}
			for(var j=snowballs.length-1; j>=0; j--) {
				var ball = snowballs[j];
				if( ball && check_point(ball.x, ball.y,x,y-jump,width,false) ) {
					ball.destroy(score);
					var e = new explode(x,y-jump,0);
					action = e.run;
					break;
				}
			}
		}
		
		var shift = function(x) {
			var t = (Date.now() - timer)/2500,
				shift = xLerp(0,width/2,Math.sin(2*t*Math.PI));
				
			ctx.save();
			ctx.translate(x,y);
			ctx.drawImage(img, -(width/2)+shift, -height);
			ctx.restore();
			if(t >= 1) {
				timer = Date.now();
			}
			for(var j=snowballs.length-1; j>=0; j--) {
				var ball = snowballs[j];
				if( ball && check_point(ball.x, ball.y,x+shift,y,width,false) ) {
					ball.destroy(score);
					var e = new explode(x+shift,y,0);
					action = e.run;
					break;
				}
			}
		}
		
		function explode(x,y,angle) {
			var a = anim.playOneShot(Date.now(), 1000);
			
			this.run = function() {
				var frame = a.play();
				if(frame) {
					var frame_width = frame.width;
					var frame_height = frame.height;
					ctx.save();
					ctx.translate(x,y);
					ctx.rotate(angle);
					ctx.drawImage(frame, -(frame_width/2),-frame_height);
					ctx.restore();
				}
			}
		}
		
		switch(act_rand) {
			case 1:
				action = shift;
				break;
			case 2:
				action = jump;
				break;
			default:
				action = rock;
				break;
		}
		
		function check_point(x,y,dx,dy,width,rot) {
			var modified_point = transform_point(x,y);
			if(rot) {
				trans_x = modified_point.x - dx;
				trans_y = modified_point.y - dy;
				modified_point.x = ((trans_x*Math.cos(-angle))-(trans_y*Math.sin(-angle)))+dx;
				modified_point.y = ((trans_x*Math.sin(-angle))+(trans_y*Math.cos(-angle)))+dy;
			}
			
			if( modified_point.x > dx-(width/2) && modified_point.x < dx+(width/2) ) {
				if( modified_point.y > dy-height && modified_point.y < dy ) {
// 					console.log( 'snowball ' + modified_point.x + "\t" + modified_point.y + '\nduloc ' + dx + "\t" + dy );
					return true;
				}
				else {
					return false;
				}
			}
			else {
				return false;
			}
		}
		function transform_point(x,y) {
			var res = {
				x : 0,
				y : 0
			};
			
			if(mirror) {
				res.x = ((1920-x)/scale);
			}
			else {
				res.x = x/scale;
			}
			res.y = y/scale;
			
			return res;
		}
	}
	
	function game_counter() {
		var start_time = Date.now(),
			final_standings = null;
			
		this.run = function() {
			var d = Date.now() - start_time;
			rem_time = 60000-d;
			if( rem_time > 0 ) {
				var counter = msToTime(rem_time);
				ctx.font = '100px Calibri';
				ctx.textAlign = 'left';
				ctx.textBaseline = 'bottom';
				ctx.lineWidth = 4;
				ctx.strokeStyle = 'black';
				ctx.strokeText(counter,15,1080);
				ctx.fillStyle = 'white';
				ctx.fillText(counter,15,1080);
			}
			else if(!game_over) {
				game.endGame();
				queue_module.socket.emit('leaderboard',leaderboard);
			}
		}
				
	}
	
	
	this.endGame = function() {
		console.log('END');
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
		tap = queue_module.images.anims.tap.playLoop(Date.now(), 1000),
		tilt = queue_module.images.anims.tilt.playLoop(Date.now(), 2000);
			
		this.draw = function() {
			var t = Date.now() - time;
			if(t >= 10000) {
				lines = [
					new duloc_line(150,0.5,250,false,3),
					new duloc_line(450,1.0,200,true,2),
					new duloc_line(810,1.5,150,false,1)
				];
				counter = new game_counter();
				game.play = gameplay;
				gameplay();
				return;
			}
			ctx.save();
			ctx.scale(scaleW, scaleH);
			ctx.drawImage(bg, 0, 0, 1920, 1080);
		
			for(var j=snowballs.length-1; j>=0; j--) {
				snowballs[j].draw();
			}
					
			if( game_players.length !== queue_module.player_count ) {
				console.log('Changing from '+game_players.length+' players to '+queue_module.player_count+' players');
				init_cannons(queue_module.player_count);
			}
		
			for(var i=0,j=cannons.length; i<j; i++) {
				cannons[i].run();
			}
				
			ctx.translate(960, 300);
			ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
			roundRect(ctx, -725, -75, 1450, 150);
			ctx.font = '50pt Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = 'rgb(34,120,170)';
			ctx.fillText('GOAL',0,-35);
			ctx.font = '40pt Arial';
			ctx.fillText('Get the highest score by hitting the snowmen with snowballs!',0,35);
			ctx.translate(0, 400);
			ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
			roundRect(ctx, -725, -200, 1450, 400);
			ctx.font = '50pt Arial';
			ctx.fillStyle = 'rgb(34,120,170)';
			ctx.fillText('CONTROLS',0,-160);
			ctx.font = '30pt Arial';
			ctx.fillStyle = 'rgb(34,120,170)';
			ctx.fillText('Tilt to aim your snow cannon',-350,-90);
			ctx.drawImage(tilt.play(),-600,-44);
			drawArrow(ctx, -350, -15, 12, 50);
			ctx.drawImage(tap.play(), 150,-83);
			ctx.fillText('Tap to fire',350, -90);
			drawArrow(ctx, 350, -15, 12, 50);
			ctx.fillText('Smaller snowmen are',0, -20);
			ctx.fillText('worth more points!',0, 25);
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