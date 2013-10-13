var surfers = {},
	change_timeout,
	surf_message,
	minigame_switch = 0;

var surf = function() {
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
	ctx.fillRect(0, 0, W, H);
	surf_message.draw();
	ctx.font = '30pt Calibri';
	ctx.textAlign = 'center';
	ctx.textBaseline = "bottom";
	ctx.fillStyle = 'white';
	ctx.fillText("Go to ludoqueue.com on your mobile phone", W/2, H-50);
	ctx.globalCompositeOperation = "lighter";
	
	//Lets draw particles from the array now
	for(var id in players)
	{
		var s = players[id].surfer;
		
		ctx.beginPath();
		
		var gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius);
		gradient.addColorStop(0, s.color.is());
		gradient.addColorStop(1, "black");
	
		ctx.fillStyle = gradient;
		ctx.arc(s.x, s.y, s.radius, Math.PI*2, false);
		ctx.fill();
		
		if(s.pulse_draw) {
			var t = ( Date.now() - s.pulse_time ) / 2000;
			var rad = xLerp(s.radius,s.radius*5,t);
			var line = xLerp(5,0.1,t);
			var alph = xLerp(1,0,t);
						
			ctx.beginPath();
			ctx.arc(s.pulse_x, s.pulse_y, rad, Math.PI*2, false);
			ctx.strokeStyle = 'rgba(255,255,255,'+alph+')';
			ctx.lineWidth=line;
			ctx.stroke();
			if(t>=1) {
				s.pulse_draw = false;
			}
		}
		
		/*ctx.globalCompositeOperation = "source-over";
		ctx.font = '15pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = "middle";
		ctx.fillStyle = 'black';
		ctx.fillText(s.name, s.x, s.y);*/
		
		s.x += s.vx;
		s.y += s.vy;
	
		if(s.x < -50) s.x = W+50;
		if(s.y < -50) s.y = H+50;
		if(s.x > W+50) s.x = -50;
		if(s.y > H+50) s.y = -50;
	}
}

var surf_init = function() {
	console.log('surf init');
	var next_check = Math.random() * 60000 + 20000;
	change_timeout = setTimeout(change_check,next_check);
	surf_message = new create_surf_message();
	socket.emit('game_state_change','surfing');
}

function create_surf_message() {
	var next_index = 0;
	var messages = [
	"Go to ludoqueue.com",
	"Hold your phone with the screen facing the ceiling",
	"Tilt your phone to move!",
	];
	
	function new_message() {
		this.text = messages[next_index];
		next_index ++;
		if(next_index >= messages.length) {
			next_index = 0;
		}
		this.time = Date.now();
		this.done = false;
	}
	
	var message = new new_message();
	
	this.draw = function() {
		if(!message.done) {
			ctx.font = '30pt Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = "top";
			ctx.fillStyle = 'white';
			ctx.fillText(message.text, W/2, 50);
			if(Date.now() - message.time >= 4000) {
				message.done = true;
				message.time = Date.now();
			}
		}
		else {
			if(Date.now() - message.time >= 4000) {
				message = new new_message();
			}
		}
	}
	
}

function create_surfer(col,nam,rad) {
	this.x = Math.random()*W;
	this.y = Math.random()*H;
	
	this.vx = 0;
	this.vy = 0;
	
	this.color = col;
	this.name = nam;
	
	//Random size
	this.radius = rad;
	
	this.pulse_draw = false;
	this.pulse_time;
	this.pulse_x = 0;
	this.pulse_y = 0;
	
	this.pulse = function() {
		if(!this.pulse_draw) {
			console.log('pulse true');
			this.pulse_draw = true;
			this.pulse_time = Date.now();
			this.pulse_x = this.x;
			this.pulse_y = this.y;
		}
	}
	
}

function change_check() {
	console.log('Checking to change');
	if( player_count > 1 ) {
		if( minigame_switch == 1 ) {
			change_state("balance");
			minigame_switch = 0;
		}
		else {
			change_state("race");
			minigame_switch = 1;
		}
	}
	else {
		var next_check = Math.random() * 60000 + 20000;
		change_timeout = setTimeout(change_check,next_check);
	}
}