var surfers = {},
	change_timeout,
	surf_message;

var surf = function() {
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
	ctx.fillRect(0, 0, W, H);
	surf_message.draw();
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
	var next_check = 5000;//Math.random() * 60000 + 20000;
	change_timeout = setTimeout(change_check,next_check);
	surf_message = new create_surf_message();
	socket.emit('game_state_change','surfing');
}

function create_surf_message() {
	var next_index = 0;
	var messages = [
	"Go to ludoqueue.com",
	"Hold your phone with the screen facing the ceiling",
	"Tilt it to move",
	"Go nuts"
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
	//Random position on the canvas
	this.x = Math.random()*W;
	this.y = Math.random()*H;
	
	this.vx = 0;
	this.vy = 0;
	
	this.color = col;
	this.name = nam;
	
	//Random size
	this.radius = rad;
}

function change_check() {
	console.log('Checking to change');
	if( player_count > 0 ) {
		if( Math.random() < 0.5 ) {
			change_state("balance");
		}
		else {
			change_state("race");
		}
	}
	else {
		var next_check = 5000;//Math.random() * 60000 + 20000;
		change_timeout = setTimeout(change_check,next_check);
	}
}