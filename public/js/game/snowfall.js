function snowfall() {
	var ctx = queue_module.ctx,
		scaleW = queue_module.W/1920,
		scaleH = queue_module.H/1080,
		logo = queue_module.images.logo,
		bg = queue_module.images.bg_snowfall,
		flake_img1 = queue_module.images.snowflake1,
		flake_img2 = queue_module.images.snowflake2
		snowflakes = [],
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
	
	for(var i=0; i<50; i ++) {
		snowflakes[i] = new snowflake();
	}
		
	var gameplay = function() {
		ctx.save();
		ctx.scale(scaleW, scaleH);
		ctx.drawImage(bg, 0, 0, 1920, 1080);
		for(var i=0, j=snowflakes.length; i<j; i++) {
			snowflakes[i].draw();
		}
		check_players();
		ctx.restore();
		
		if(Date.now() - start_time > 60000 && queue_module.timed_advance) {
			game.endGame();
		}
	}
	
	function snowflake() {
		var rad = 50 + (Math.random() * 50),
			x = Math.random() * 1920,
			y = -rad/2 -(Math.random() * 1080),
			angle = Math.random() * (2 * Math.PI),
			vel = 2 + (Math.random() * 3),
			rot = Math.PI / (20 + (Math.random() * 20)),
			dx = 0,
			dy = vel,
			img = Math.random() > 0.5 ? flake_img1 : flake_img2,
			timer = Date.now(),
			pushed = false,
			push_dx = 0,
			push_dy = 0,
			push_da = 0,
			push_time = 0,
			push_color = null,
			trail_time = 0,
			trails = [];
			
			rot *= (Math.random() < 0.5) ? -1 : 1;
			
			var da = rot;
			
		this.draw = function() {
			for(j=trails.length-1; j>=0; j--) {
				if(trails[j]) {
					trails[j].draw();
				}
			}
			ctx.save();
			ctx.translate(x,y);
			ctx.rotate(angle);
			ctx.drawImage(img,-rad/2,-rad/2,rad,rad);
			update_pos();
			ctx.restore();
		}
		
		this.push = function(push_angle, set_color) {
			pushed = true;
			push_time = Date.now();
			push_color = set_color;
			trail_time = push_time;
			var r = 7;
			push_dx = r * Math.cos(-push_angle);
			push_dy = r * Math.sin(-push_angle);
			push_da = rot * (2 + (Math.random() * 2));
		}
		
		function update_pos() {
			if(pushed) {
				var t = (Date.now() - push_time)/2000;
				if(Date.now()-trail_time >= 100) {
					trails.push( new trail(x,y) );
					trail_time = Date.now();
				}
				dx = xLerp(push_dx,0,t);
				dy = xLerp(push_dy,vel,t);
				da = xLerp(push_da,rot,t);
				if( t >= 1) {
					dx = 0;
					dy = vel;
					da = rot;
					pushed = false;
				}
			}
			x += dx;
			y += dy;
			angle += da;
			if( y > 1130 ) {
				y = -rad/2;
				x = Math.random() * 1920;
			}
		}
		
		function trail(trail_x,trail_y) {
			var start_time = Date.now(),
				rgb = push_color.split( ',' ),
				r=parseInt( rgb[0].substring(4) ), // skip rgb(
				g=parseInt( rgb[1] ), // this is just g
				b=parseInt( rgb[2] ), // parseInt scraps trailing )
				trans_col = 'rgba('+r+','+g+','+b+',0)';
						
			this.draw = function() {
				var t = (Date.now()-start_time)/1000;
				if(t >= 1) {
					var index = trails.indexOf(this);
					if(index != -1) {
						trails.splice(index,1);
					}
				}
				else {
					ctx.save();
					ctx.translate(trail_x,trail_y);
					var trail_grd = ctx.createRadialGradient(0,0,0,0,0,rad/2);
					trail_grd.addColorStop(0,push_color);
					trail_grd.addColorStop(1-t,trans_col);
					ctx.beginPath();
					ctx.arc(0,0,rad/2,0,2*Math.PI);
					ctx.closePath();
					ctx.fillStyle = trail_grd;
					ctx.fill();
					ctx.restore();
				}
			}
			
		}
	}
	
	function check_players() {
		for( var id in queue_module.players ) {
			var p = queue_module.players[id];
			if(p.swype != null) {
				var rand = Math.floor(Math.random() * snowflakes.length);
				snowflakes[rand].push(p.swype.angle, p.color);
				p.swype = null;
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
				queue_module.game_manager.nextGame();
			}
			else {
				ctx.globalAlpha = a;
				gameplay();
			}
		}
	}
}