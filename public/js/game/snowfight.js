function snowfight() {
	var n = 1,
		ctx = queue_module.ctx,
		scaleW = queue_module.W/1920,
		scaleH = queue_module.H/1080,
		bg = queue_module.images.bg_snowfight,
		duloc_images = queue_module.images.duloc,
		cannons = [],
		snowballs = [],
		lines = [
			new duloc_line(350,0.25,150,false,3),
			new duloc_line(500,0.5,125,true,2),
			new duloc_line(750,0.75,100,false,1)
		],
		counter = new game_counter(),
		instructions = new game_instructions(),
		game_over = false,
		input_state = {
			tap : true,
			tiltFB: true,
			tiltLR: false,
			swype: false,
		},
		map_img = queue_module.map.overlay,
		map_offset = queue_module.map.offset,
		game_players = [],
		game_module = this;
		
		window.addEventListener('keypress', function (e) {
			if(e.keyCode === 103) {
				advance_game();
			}	
		}, false);
		
// 	queue_module.socket.emit('new_input_state', input_state);
	
	var gameplay = function() {
		ctx.save();
		
		ctx.scale(scaleW, scaleH);
		
		ctx.save()
		ctx.translate(map_offset, 0);
		ctx.drawImage(bg, 0, 0);
		ctx.translate(360, 0);
		
		for(var i=0,j=lines.length; i<j; i++) {
			lines[i].draw();
		}
		
		for(var j=snowballs.length-1; j>=0; j--) {
			snowballs[j].draw();
		}
		
		if( queue_module.player_count !== game_players.length ) {
			standby_players();
		}
		
		for(var i=0,j=cannons.length; i<j; i++) {
			cannons[i].run();
		}
		
		counter.run();
		
		ctx.restore();
		
		ctx.drawImage(map_img, 0, 0, 1920, 1080);
		
		ctx.restore();
	}
	
	var pregame = function() {
		ctx.save();
		
		ctx.scale(scaleW, scaleH);
		
		ctx.save()
		ctx.translate(map_offset, 0);
		ctx.drawImage(bg, 0, 0);
		ctx.translate(360, 0);
		
		for(var j=snowballs.length-1; j>=0; j--) {
			snowballs[j].draw();
		}
					
		if( game_players.length !== queue_module.player_count ) {
			console.log(game_players.length);
			init_cannons(queue_module.player_count);
		}
		
		for(var i=0,j=cannons.length; i<j; i++) {
			cannons[i].run();
		}
		
		instructions.run();
		
		ctx.restore();
		
		ctx.drawImage(map_img, 0, 0, 1920, 1080);
		
		ctx.restore();
	}
	
	this.play = pregame;
	
	function init_cannons(new_count) {
		cannons = [],
		game_players = [];
		
		if(new_count > 5) {
			new_count = 5;
		}
		var omega_interval = (Math.PI/2)/(new_count+1);
		var counter = 0;
		
		for( var id in queue_module.players ) {
			var p = queue_module.players[id];
			if(counter < 5) {
				console.log('IN\t' + p.id);
				var can_omega = (-Math.PI/4) + (omega_interval * (counter + 1));
				var can = new cannon(can_omega, p.id, p.color, p.name);
				cannons.push(can);
				game_players.push(p.id);
			}
			else {
				console.log('standby\t' + p.id);
				queue_module.socket.emit('player_standby',p.id);
				game_players.push(p.id);
			}
			counter ++;
		}
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
			}
		}
	}
	
	function cannon(set_omega, id, set_color, set_name) {
		var omega = set_omega,
			x = 200 + (530*Math.cos(omega + (Math.PI/2))),
			y = 540 + (530*Math.sin(omega + (Math.PI/2))),
			player_id = id,
			font_size = 80,
			name_w = 0,
			angle = 0,
			timer = Date.now(),
			ob = this,
			fired = false,
			fire_time = 0,
			fire_meter = 1;
		
		adjust_font_size();
					
		this.score = 0;
		this.color = set_color;
		this.name = set_name;
			
		this.run = function() {
			check_player();
			ctx.save();
			ctx.translate(x,y);
			ctx.rotate(omega);
			ctx.scale(0.5,0.5);
			ctx.save();
			ctx.rotate(angle*(Math.PI/180));
			ctx.translate(-67.5,-401);
			ctx.save();
			var grd = ctx.createLinearGradient(0,0,0,401);
			grd.addColorStop(0, this.color);
			grd.addColorStop(1, 'rgb(0,0,0)');
			ctx.fillStyle = grd;
			draw_cannon();
			ctx.restore();
			ctx.drawImage(queue_module.images.cannon_over,0,0);
			var meter_grd = ctx.createLinearGradient(0,401,0,0);
			meter_grd.addColorStop(0, 'rgb(255,255,255)');
			meter_grd.addColorStop(fire_meter, this.color);
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
			ctx.strokeText(this.score,0,0);
			var score_grd = ctx.createLinearGradient(0,40,0,-40);
			score_grd.addColorStop(0, this.color);
			score_grd.addColorStop(1, 'rgb(255,255,255)');
			ctx.fillStyle = score_grd;
			ctx.fillText(this.score,0,0);
			ctx.restore();
			ctx.font = font_size + 'px Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'bottom';
			ctx.lineWidth = 10;
			ctx.strokeStyle = 'black';
			ctx.strokeText(this.name,0,-5);
			var name_grd = ctx.createLinearGradient(0,-font_size-5,0,-5);
			name_grd.addColorStop(1, this.color);
			name_grd.addColorStop(0, 'rgb(255,255,255)');
			ctx.fillStyle = name_grd;
			ctx.fillText(this.name,0,-5);
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
				var ball_dx = Math.cos((-angle*(Math.PI/180))-omega+(Math.PI/2)),
					ball_dy = Math.sin((-angle*(Math.PI/180))-omega+(Math.PI/2)),
					ball_x = x + (ball_dx*200);
					ball_y = y - (ball_dy*200);
				snowballs.push( new snowball(ball_x, ball_y, ball_dx, ball_dy, ob) );
				fire_time = Date.now();
				fired = true;
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
					var frame = Math.floor(xLerp(0,9,t/0.25));
					if(frame > 8) {
						frame = 8;
					}
					ctx.drawImage(queue_module.images.poofs[frame],0,0);
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
				cannon.score += score;
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
			var start_x = -250 - (250 * i);
			var dul = new duloc(start_x, line_y, scale, mirror, score);
			duloc_arr[i] = dul;
			if(start_x < -800/scale) {
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
				ctx.translate(400,0);
				ctx.scale(-scale,scale);
			}
			else {
				ctx.scale(scale,scale);
			}
			if(duloc_arr[0].x >= 525/scale) {
				duloc_arr.splice(0,1);
				var new_x = duloc_arr[num-2].x-250;
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
		
		var index = 1 + Math.floor(Math.random()*7),
			frame = 1,
			timer = Date.now() - (Math.random()*1000),
			angle = 0,
			width = duloc_images[index][1].width,
			height = duloc_images[index][1].height,
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
			ctx.drawImage(duloc_images[index][1], -(width/2), -height);
			ctx.restore();
			if(t >= 1) {
				timer = Date.now();
			}
			for(var j=snowballs.length-1; j>=0; j--) {
				var ball = snowballs[j];
				if( ball && check_point(ball.x,ball.y,x,y,width,true) ) {
					ball.destroy(score);
					fall.init(1,0,angle);
					action = fall.run;
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
			ctx.drawImage(duloc_images[index][1], -(width/2), -height - jump);
			ctx.restore();
			if(t >= 1) {
				timer = Date.now();
			}
			for(var j=snowballs.length-1; j>=0; j--) {
				var ball = snowballs[j];
				if( ball && check_point(ball.x, ball.y,x,y-jump,width,false) ) {
					ball.destroy(score);
					fall.init(1,jump,0);
					action = fall.run;
					break;
				}
			}
		}
		
		var spin = function(x) {
			var t = (Date.now() - timer)/1000;
			frame = Math.floor(t/(1/35)) % 35;
			if(frame < 0 || frame > 34) {
				frame = 0;
			}
			var frame_width = duloc_images[index][frame].width;
			ctx.save();
			ctx.translate(x,y);
			ctx.drawImage(duloc_images[index][frame], -(frame_width/2), -height);
			ctx.restore();
			if(t >= 1) {
				timer = Date.now();
			}
			for(var j=snowballs.length-1; j>=0; j--) {
				var ball = snowballs[j];
				if( ball && check_point(ball.x,ball.y,x,y,frame_width,false) ) {
					ball.destroy(score);
					fall.init(frame,0,0);
					action = fall.run;
					break;
				}
			}
		}
		
		var fall = new function() {
			var start_frame = 1,
				start_jump = 0,
				start_angle = 0,
				fallen = false,
				frame_change = 20+Math.floor(Math.random()*15),
				final_angle = 0,
				fall_timer = 0;

			this.init = function(mod_frame, mod_jump, mod_angle) {
				start_frame = mod_frame;
				start_jump = mod_jump;
				start_angle = mod_angle;
				if(start_angle < 0 ) {
					final_angle = -Math.PI/2;
				}
				else if( start_angle > 0 ) {
					final_angle = Math.PI/2;
				}
				else {
					final_angle = (Math.random() < 0.5) ? -Math.PI/2 : Math.PI/2;
				}
				frame_change *= (Math.random() < 0.5) ? -1 : 1;
				fall_timer = Date.now();
			}	
			
			this.run = function(x) {
				if(!fallen) {
					var t = (Date.now() - fall_timer)/500;
					var fall_jump = xLerp(start_jump,0,t);
					var fall_angle = xLerp(start_angle,final_angle,t);
					var fall_frame = start_frame+Math.floor(t/(1/frame_change));
					fall_frame = fall_frame % 35;
					if(fall_frame < 0 ) {
						fall_frame += 35;
					}
					frame = fall_frame;
					var frame_width = duloc_images[index][fall_frame].width;
					ctx.save();
					ctx.translate(x,y);
					ctx.rotate(fall_angle);
					ctx.drawImage(duloc_images[index][frame], -(frame_width/2), -height - fall_jump);
					ctx.restore();
					if(t >= 1) {
						fallen = true;
					}
				}
				else {
					ctx.save();
					ctx.translate(x,y);
					ctx.rotate(final_angle);
					var frame_width = duloc_images[index][frame].width;
					ctx.drawImage(duloc_images[index][frame], -(frame_width/2), -height );
					ctx.restore();
				}
			}
		}
		
		switch(act_rand) {
			case 1:
				action = spin;
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
				res.x = ((400-x)/scale);
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
			
		var countdown = function() {
			var d = Date.now() - start_time;
			rem_time = 60000-d;
			if( rem_time > 0 ) {
				var counter = msToTime(rem_time);
				ctx.font = '70px Calibri';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.lineWidth = 4;
				ctx.strokeStyle = 'black';
				ctx.strokeText(counter,200,120);
				ctx.fillStyle = 'white';
				ctx.fillText(counter,200,120);
			}
			else {
				game_over = true;
				final_standings = new standings();
				this.run = final_standings.display;
			}
		}
		
		this.run = countdown;
		
		function standings() {
			var standings_time = Date.now(),
				standings_list = [
					"1st",
					"2nd",
					"3rd",
					"4th",
					"5th",
				],
				standings_max = standings_list.length,
				standings_count = 0,
				standings_scale = 1,
				final_list = set_list(cannons);
											
			this.display = function() {
				ctx.save();
				ctx.translate(200,520);
				ctx.fillStyle= 'rgba(0,0,0,0.7)';
				ctx.fillRect(-200,-240,400,480);
				ctx.scale(standings_scale, standings_scale);
				var diff = ((60 * (standings_count - 1))/2) + 60;
				ctx.translate(0,-diff);
				for(var i=0; i<standings_count; i++) {
					ctx.translate(0,60);
					var item = final_list[i];
					ctx.font = '50px Calibri';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.lineWidth = 4;
					ctx.strokeStyle = 'black';
					//ctx.strokeText(item.line,0,0);
					var name_grd = ctx.createLinearGradient(0,-25,0,25);
					name_grd.addColorStop(0, item.color);
					name_grd.addColorStop(1, 'rgb(255,255,255)');
					ctx.fillStyle = name_grd;
					ctx.fillText(item.line,0,0);
				}
				ctx.restore();
			}
			
			function set_list(final_cannons) {
				var list = [],
				prev_score = null,
				standings_index = -1,
				standings_width = 0;
				
				final_cannons.sort(score_sort);
				
				ctx.font = '50px Calibri';
				for( var i=0, j=final_cannons.length; i<j; i++) {
					if(standings_index < standings_max) {
						var can = final_cannons[i];
						if(final_cannons[i].score == prev_score) {
							var line = 'T' + standings_list[standings_index] + ': ' + can.name + ' - ' + can.score;
						}
						else {
							standings_index ++;
							var line = standings_list[standings_index] + ': ' + can.name + ' - ' + can.score;
						}
						var w = ctx.measureText(line).width;
						if(w > standings_width) {
							standings_width = w;
						}
						prev_score = can.score;
						list[i] = { line: line, color: can.color };
					}
				}
				standings_count = list.length;
				var standings_height = standings_count * 60;
				standings_width += 40;
				if( standings_height > 480 || standings_width > 400 ) {
					var height_scale = 480/standings_height,
						width_scale = 400/standings_width;
					standings_scale = Math.min(height_scale, width_scale);
				}
				
				return list;
			}
		}
		
		function score_sort(a,b) {
			return b.score - a.score;
		}
	}
	
	function game_instructions() {
		var start_time = Date.now(),
			inst_images = [
				queue_module.images.tilt_1,
				queue_module.images.tilt_2,
				queue_module.images.tap_1,
				queue_module.images.tap_2
			],
			d1 = queue_module.images.duloc[1][0],
			d2 = queue_module.images.duloc[3][0],
			d3 = queue_module.images.duloc[4][0];
		
		this.run = function() {
			count_to_game();
			var frame = Math.floor((Date.now() - start_time) / 1500) % 4;
			ctx.save();
			ctx.translate(0,280);
			ctx.fillStyle = 'rgba(0,0,0,0.5)';
			ctx.fillRect(0,0,400,480);
			ctx.drawImage(inst_images[frame],0,0);
			ctx.translate(30,300);
			ctx.save();
			ctx.scale(0.75,0.75);
			ctx.drawImage(d1,0,0);
			ctx.restore();
			ctx.translate(125,25);
			ctx.save();
			ctx.scale(0.5,0.5);
			ctx.drawImage(d2,0,0);
			ctx.restore();
			ctx.translate(125,25);
			ctx.save();
			ctx.scale(0.25,0.25);
			ctx.drawImage(d3,0,0);
			ctx.restore();
			ctx.translate(-160,20);
			ctx.font = '40px Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.lineWidth = 4;
			ctx.strokeStyle = 'black';
			ctx.fillStyle = 'white';
			ctx.strokeText('= 1',0,0);
			ctx.fillText('= 1',0,0);
			ctx.translate(110,0);
			ctx.strokeText('= 2',0,0);
			ctx.fillText('= 2',0,0);
			ctx.translate(110,0);
			ctx.strokeText('= 3',0,0);
			ctx.fillText('= 3',0,0);
			ctx.translate(-140,70);
			ctx.font = '30px Calibri';
			ctx.fillStyle = 'rgb(76,171,69)';
			ctx.strokeText('Hit the Duloc puppets to score!',0,0);
			ctx.fillText('Hit the Duloc puppets to score!',0,0);
			ctx.translate(-380,65);
			ctx.strokeText('Scan the QR code',0,0);
			ctx.fillText('Scan the QR code',0,0);
			ctx.translate(760,0);
			ctx.strokeText('Go to the URL',0,0);
			ctx.fillText('Go to the URL',0,0);
			ctx.translate(-760,135);
			ctx.drawImage(queue_module.images.qr,-100,-100);
			ctx.translate(760,0);
			ctx.fillStyle = 'rgba(0,0,0,.7)';
			ctx.fillRect(-100,-100,200,200);
			ctx.fillStyle = 'white';
			ctx.font = '50px Calibri';
			ctx.strokeText('LUD.SO',0,0);
			ctx.fillText('LUD.SO',0,0);
			ctx.translate(-760,125);
			ctx.font = '30px Calibri';
			ctx.fillStyle = 'rgb(76,171,69)';
			ctx.strokeText('to play!',0,0);
			ctx.fillText('to play!',0,0);
			ctx.translate(760,0);
			ctx.strokeText('to play!',0,0);
			ctx.fillText('to play!',0,0);
			ctx.restore();
		}
	
		function count_to_game() {
			var d = Date.now() - start_time;
			rem_time = 60000-d;
			if( rem_time > 0 ) {
				var clock = msToTime(rem_time);
				ctx.save();
				ctx.translate(200,120);
				ctx.font = '70px Calibri';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.lineWidth = 4;
				ctx.strokeStyle = 'black';
				ctx.strokeText(clock,0,0);
				ctx.fillStyle = 'white';
				ctx.fillText(clock,0,0);
				ctx.translate(0,60);
				ctx.font = '28px Calibri';
				ctx.strokeStyle = 'black';
				ctx.strokeText('Time till next game',0,0);
				ctx.fillStyle = 'white';
				ctx.fillText('Time till next game',0,0);
				ctx.restore();
			}
			else {
				if( game_players > 0 ) {
					advance_game();
				}
				else {
					start_time = Date.now();
				}
			}
		}
	}
	
	function advance_game() {
		if( game_module.play === pregame ) {
			lines = [
				new duloc_line(350,0.25,150,false,3),
				new duloc_line(500,0.5,100,true,2),
				new duloc_line(750,0.75,50,false,1)
			];
			counter = new game_counter();
			game_module.play = gameplay;
		}
		else {
			instructions = new game_instructions();
			init_cannons(queue_module.player_count);
			queue_module.socket.emit('new_input_state', input_state);
			game_module.play = pregame;
		}
	}
}