var surfers = {},
	balls = [],
	ball_count = 20,
	snow_level = 0,
	snow_y = 0,
	snow_height = 0,
	prev_level = 0,
	next_level = 0,
	snow_time,
	snow_target = 10;
	
var surf = function() {
	ctx.globalCompositeOperation = "source-over";
	ctx.drawImage(images.g1_bg,0,0,W,H);
	ctx.save();
	//ctx.drawImage(images.hand_arrows,(W/2)-300,0,300,300);
	//ctx.drawImage(images.hand_tap,W/2,0,300,300);
	ctx.scale(W/1920,H/1080);
	if(snow_level < next_level) {
		var t = (Date.now()-ground_time)/1000;
		snow_level = xLerp(prev_level,next_level,t);
	}
	snow_y = xLerp(260,1080,snow_level/snow_target)
	ctx.drawImage(images.g1_bg_snow,0,0,1920,snow_y,0,1080-snow_y,1920,snow_y);
	ctx.drawImage(images.g1_scenery1,257,768);
	ctx.drawImage(images.g1_scenery2,1166,505);
	ctx.drawImage(images.g1_scenery3,655,768);
	ctx.restore();
	for(var i=balls.length-1;i>=0;i--)
	{
		balls[i].draw();
	}
	for(var id in players)
	{
		var s = players[id].surfer;
		s.draw();
	}
	var ballDiff = ball_count - balls.length;
	for(var i=0;i<ballDiff;i++) {
		var ball = new create_ball();
		balls.push(ball);
	}
	if(snow_level >= snow_target && game_state == 'surf') {
		change_state("race");
	}
}

var surf_init = function() {
	console.log('surf init');
	snow_level = 0;
	next_level = 0;
	prev_level = 0;
	snow_y = 260;
	//snow_height = (images.g1_bg_snow.height/images.g1_bg_snow.width)*W;
	for(var i=0;i<ball_count;i++) {
		var ball = new create_ball();
		balls.push(ball);
	}
	socket.emit('game_state_change','surfing');
}


function create_surfer(col,nam) {
	var x = Math.random()*W;
	var y = Math.random()*H;
	
	var surf_image;
	if( Math.random() < 0.5 ) {
		surf_image = images.g1_player1;
	}
	else {
		surf_image = images.g1_player2;
	}
	var width = surf_image.width;
	var height = surf_image.height;
	
	this.vx = 0;
	this.vy = 0;
	
	var name = nam;
	var color = col;
	color.a=1;
	
	var pulse_draw = false;
	var pulse_time = 0;
	
	this.pulse = function() {
		if(!pulse_draw) {
			pulse_draw = true;
			pulse_time = Date.now();
		}
	}
	
	this.draw = function() {
		if(pulse_draw) {
			ctx.save();
			ctx.translate(x,y);
			var timeDiff = Date.now()-pulse_time;
			var rot = (2*Math.PI) - ((timeDiff/0.5)%(2*Math.PI));
			ctx.rotate(rot);
			ctx.drawImage(surf_image,-(width/2),-(height/2),100,100);
			ctx.restore();
			if(timeDiff >= 1000) {
				pulse_draw = false;
			}
			for(var i=balls.length-1;i>=0;i--) {
				var ball = balls[i];
				if( !ball.finished ) {
					var dist = Math.pow(x-ball.x,2)+Math.pow(y-ball.y,2);
					if( dist < 2500) {
						ball.hit = true;
						break;
					}
				}
			}
		}
		else {
			ctx.drawImage(surf_image,x-(width/2),y-(height/2),100,100);
		}
		
		ctx.beginPath();
		ctx.arc(x,y,15,Math.PI*2,false);
		ctx.fillStyle = color.is();
		ctx.fill();
		
		ctx.font = '18pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 4;
		ctx.strokeText(name,x,y);
		ctx.fillStyle = 'white';
		ctx.fillText(name,x,y);
		
		x += this.vx;
		y += this.vy;
	
		if(x < -50) x = W+50;
		if(y < -50) y = H+50;
		if(x > W+50) x = -50;
		if(y > H+50) y = -50;
	}
	
}

function create_ball() {
	this.hit = false;
	this.finished = false;
	
	var create_time = Date.now();
	var ball_image = images.g1_ball;
	var total_width = ball_image.width;
	var total_height = ball_image.height;
	var start_width = total_width * 0.1;
	var start_height = total_height * 0.1;
	var width = start_width;
	var height = start_height;
	
	var start_x = Math.random()*W;
	var end_x = Math.random()*W;
	var start_y = Math.random()*(H-20);
	var end_y = Math.random()*(H-20);
	if(start_y < end_y ) {
		var apex = Math.random()*start_y;
	}
	else {
		var apex = Math.random()*end_y;
	}
	this.x = start_x;
	this.y = start_y;
	var life = 5000+(Math.random()*5000);
	
	var flakes = [];
	var flake_time = 0;
	
	var splat_width = images.g1_ball_splat.width;
	var splat_height = images.g1_ball_splat.height;
	var finish_time = 0;
	
	this.draw = function() {
		if(this.hit) {
			if(flakes.length==0) {
				flake_time = Date.now();
				prev_level = snow_level;
				next_level ++;
				ground_time = Date.now();
				for(var i=0;i<20;i++) {
					var flake = new create_flake(this.x,this.y);
					flakes.push(flake);
				}
			}
			for(var i=0;i<flakes.length;i++) {
				flakes[i].draw();
			}
			if(Date.now()-flake_time>2500) {
				this.remove();
			}
		}
		else if(this.finished) {
			var tx = (Date.now()-finish_time)/2000;
			if(tx>=1) {
				this.remove();
			}
			else {
				ctx.save();
				ctx.globalAlpha = xLerp(1,0,tx);
				ctx.drawImage(images.g1_ball_splat,this.x-(splat_width/2),this.y-(splat_height/2));
				ctx.restore();
			}
		}
		else {
			var t = (Date.now()-create_time)/life;
			this.x = xLerp(start_x,end_x,t);
			this.y = xLerp(xLerp(start_y,apex,t),xLerp(apex,end_y,t),t);
			width = xLerp(start_width,total_width,t);
			height = xLerp(start_height,total_height,t);
			ctx.drawImage(ball_image,this.x-(width/2),this.y-(height/2),width,height);
			if( t >= 1 ) {
				this.finished = true;
				finish_time = Date.now();
			}
		}
	}
	
	function create_flake(ball_x,ball_y){
		var flake_x = ball_x;
		var flake_y = ball_y;
		var dx = -1+(Math.random()*2);
		var dy = -1+(Math.random()*2);
	
		this.draw = function() {
			ctx.beginPath();
			ctx.fillStyle = 'rgb(255,255,255)';
			ctx.arc(flake_x, flake_y, 2.5, Math.PI*2, false);
			ctx.fill();
			flake_x += dx;
			flake_y += dy;
		}
	}
	
	this.remove = function() {
		var index = balls.indexOf(this);
		if(index != -1) {
			balls.splice(index,1);
		}
	}
}