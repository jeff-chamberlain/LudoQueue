function snowfall() {
	var ctx = queue_module.ctx,
		scaleW = queue_module.W/1920,
		scaleH = queue_module.H/1080,
		bg = queue_module.images.bg_snowfall,
		flake_img = queue_module.images.snowflake,
		snowflakes = [],
		input_state = {
			tap : false,
			tiltFB: false,
			tiltLR: false,
			swype: true,
		};
		
		queue_module.socket.emit('new_input_state', input_state);
		
		for(var i=0; i<50; i ++) {
			snowflakes[i] = new snowflake();
		}
		
	this.play = function() {
		ctx.save();
		ctx.scale(scaleW, scaleH);
		ctx.drawImage(bg, 0, 0, 1920, 1080);
		for(var i=0, j=snowflakes.length; i<j; i++) {
			snowflakes[i].draw();
		}
		check_players();
		ctx.restore();
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
			ctx.drawImage(flake_img,-rad/2,-rad/2,rad,rad);
			update_pos();
			ctx.restore();
		}
		
		this.push = function(push_angle, set_color) {
			console.log(push_angle);
			pushed = true;
			push_time = Date.now();
			push_color = set_color;
			trail_time = push_time;
			var r = 7;
			push_dx = r * Math.cos(push_angle);
			push_dy = r * Math.sin(push_angle);
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
			if( y > 1080 ) {
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
				snowflakes[rand].push(p.swype, p.color);
				p.swype = null;
			}
		}
	}
}