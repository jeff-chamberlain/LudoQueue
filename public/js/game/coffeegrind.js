function coffeegrind() {
	var ctx = queue_module.ctx,
		scaleW = queue_module.W/1920,
		scaleH = queue_module.H/1080,
		logo = queue_module.images.logo,
		bg = queue_module.images.bg_coffee1,
		target = 50,
		game_grounds = new grounds(target),
		grinders = {},
		grinder_count = 0,
		beans = [],
		bean_count = 20,
		grounds_target = 10,
		game = this,
		game_over = false,
		f = new fadeIn(Date.now());
		
		this.play = f.draw;
		
		queue_module.input_state = {
			tap : true,
			tiltFB: true,
			tiltLR: true,
			swype: false,
			rhythm: false
		};
		queue_module.socket.emit('new_input_state', queue_module.input_state);
		
	for(var i=0;i<bean_count;i++) {
		var bean = new createBean();
		beans.push(bean);
	}
		
	var gameplay = function() {
		ctx.save();
		ctx.scale(scaleW, scaleH);
		ctx.drawImage(bg, 0, 0, 1920, 1080);
		game_grounds.draw();
		
		if( grinder_count !== queue_module.player_count ) {
			addPlayers();
		}
		
		for( var id in grinders ) {
			grinders[id].draw();
		}
		
		for(var i=beans.length-1;i>=0;i--) {
			beans[i].draw();
		}
		var beanDiff = bean_count - beans.length;
		for(var i=0;i<beanDiff;i++) {
			var bean = new createBean();
			beans.push(bean);
		}
		
		ctx.restore();
	}
	
	 function grounds(hit_target) {
	 	var height = 0,
	 		hits = 0,
	 		target = hit_target,
	 		hit_time = 0,
	 		hit_height = 0;
			img = queue_module.images.grounds;
			
	 	this.draw = function() {
	 		ctx.save();
	 		checkHeight();
	 		ctx.translate(0, 1080-height);
	 		ctx.drawImage(img, 0, 0, 1920, 1080);
	 		ctx.restore();
	 	}
	 	
	 	function checkHeight() {
	 		if( height >= 1080 && !game_over) {
				game.endGame();
			}
			else {
				var target_height = Math.min(1,(hits/target)) * 1080;
				if( height < target_height ) {
					var t = (Date.now() - hit_time) / 1000;
					if( t >= 1 ) {
						height = target_height;
					}
					else {
						height = xLerp(hit_height, target_height, t);
					}
				}
	 		}
	 	}
	 	
	 	this.rise = function() {
	 		hits ++;
	 		hit_time = Date.now();
	 		hit_height = height;
	 	}
	 }

	function addPlayers() {
		for( var id in queue_module.players ) {
			if(!grinders.hasOwnProperty(id)) {
				console.log('ADDING PLAYER');
				grinders[id] = new createGrinder(id);
				grinder_count ++;
			}
		}
	}

	function createGrinder(id) {
		var x = Math.random()*1920,
			y = Math.random()*1080,
			img = queue_module.images.grinder,
			p = queue_module.players[id],
			color = p.color,
			name = p.name,
			pulse_draw = false,
			pulse_time = 0,	
			vx = 0,
			vy = 0;
	
		this.pulse = function() {
			if(!pulse_draw) {
				pulse_draw = true;
				pulse_time = Date.now();
			}
		}
	
		this.draw = function() {
			checkPlayer();
			ctx.save();
			ctx.translate(x,y);
			if(pulse_draw) {
				var timeDiff = Date.now()-pulse_time;
				var rot = (2*Math.PI) - ((timeDiff/0.5)%(2*Math.PI));
				ctx.save();
				ctx.rotate(rot);
				ctx.drawImage(img,-50,-50,100,100);
				ctx.restore();
				if(timeDiff >= 1000) {
					pulse_draw = false;
				}
				for(var i=beans.length-1;i>=0;i--) {
					var bean = beans[i];
					var dist = Math.pow(x-bean.x,2)+Math.pow(y-bean.y,2);
					if( dist < 2500) {
						bean.ground = true;
						break;
					}
				}
			}
			else {
				ctx.drawImage(img,-50,-50,100,100);
			}
		
			ctx.beginPath();
			ctx.arc(0,0,15,Math.PI*2,false);
			ctx.fillStyle = color;
			ctx.fill();
		
			ctx.font = '18pt Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 4;
			ctx.strokeText(name,0,0);
			ctx.fillStyle = 'white';
			ctx.fillText(name,0,0);
			
			ctx.restore();
		
			x += vx;
			y += vy;
	
			if(x < -50) x = 1970;
			if(y < -50) y = 1130;
			if(x > 1970) x = -50;
			if(y > 1130) y = -50;
		}
	
		function checkPlayer() {
			if(queue_module.players.hasOwnProperty(id)) {
				vx = (p.tiltFB / 5);
				vy = (-p.tiltLR / 5);
			
				if( p.taps > 0 ) {
					if(!pulse_draw) {
						pulse_draw = true;
						pulse_time = Date.now();
					}
					p.taps=0;
				}
			}
			else {
				if(grinders.hasOwnProperty(id)) {
					delete grinders[id];
					grinder_count --;
					console.log('REMOVING PLAYER');
				}
			}
		}
	}
	
	function createBean() {
		this.ground = false;
		this.x = Math.random()*1920;
		this.y = -30-(Math.random()*1080);
		var drawTime = Date.now();
		var rand = Math.floor(Math.random()*4);
		var beanImg;
		switch(rand) {
			case 0:
				beanImg = queue_module.images.bean1;
				break;
			case 1:
				beanImg = queue_module.images.bean2;
				break;
			case 2:
				beanImg = queue_module.images.bean3;
				break;
			default:
				beanImg = queue_module.images.bean4;
				break;
		}
		var width = beanImg.width;
		var height = beanImg.height;
	
		var grinds = [];
		var grind_time = 0;
	
		this.draw = function() {
			if(this.ground) {
				if(grinds.length==0) {
					game_grounds.rise();
					grind_time = Date.now();
					for(var i=0;i<20;i++) {
						var grind = new createGrind(this.x,this.y);
						grinds.push(grind);
					}
				}
				for(var i=0;i<grinds.length;i++) {
					grinds[i].draw();
				}
				if(Date.now()-grind_time>2500) {
					this.remove();
				}
			}
			else {
				ctx.drawImage(beanImg,this.x-(width/2),this.y-(height/2));
				this.y += ((Date.now() - drawTime)/1000) * 100;
				drawTime = Date.now();
				if( this.y >= 1110 ) {
					this.remove();
				}
			}
		}
	
		function createGrind(bean_x,bean_y) {
			var grind_x = bean_x;
			var grind_y = bean_y;
			var dx = -1+(Math.random()*2);
			var dy = -1+(Math.random()*2);
	
			this.draw = function() {
				ctx.beginPath();
				ctx.fillStyle = 'rgb(124,88,82)';
				ctx.arc(grind_x, grind_y, 2.5, Math.PI*2, false);
				ctx.fill();
				grind_x += dx;
				grind_y += dy;
			}
		}
	
		this.remove = function() {
			var index = beans.indexOf(this);
			if(index != -1) {
				beans.splice(index,1);
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

