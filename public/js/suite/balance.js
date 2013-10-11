var start_time;

var balance = function() {
	for( var id in players ) {
		var b = players[id].balancer;
		b.slide += (b.angle/10) * ((Date.now() - start_time)/10000);
		b.draw();
	}
}

function balance_init() {
	var counter = 0;
	var screen_x_interval = W/5;
	var screen_y_interval = H/6;
	for( var id in players ) {
		var b = players[id].balancer;
		b.dropped = false;
		b.angle = 0;
		b.homeX = ((counter % 4)+ 1) * screen_x_interval;
		b.homeY = (Math.floor(counter/5) + 1) * screen_y_interval;
		counter ++;
	}
	start_time = Date.now();
	socket.emit('game_state_change','balancing');
}

function create_balancer(col,nam,rad) {
	this.homeX = 0;
	this.homeY = 0;
	this.dropX = 0;
	this.dropY = 0;
	this.radius = 40;
	this.angle = 0;
	this.slide = 0;
	this.line_rad = 50;
	this.color = col;
	this.name = nam;
	this.dropped = false;
	
	this.draw = function() {
		var right_x = this.homeX + Math.cos(this.angle) * this.line_rad;
		var right_y = this.homeY + Math.sin(this.angle) * this.line_rad;
		var left_x = this.homeX + Math.cos(this.angle + Math.PI) * this.line_rad;
		var left_y = this.homeY + Math.sin(this.angle + Math.PI) * this.line_rad;
		
		var slide_x = this.homeX + Math.cos(this.angle) * this.slide;
		var slide_y = this.homeY + Math.sin(this.angle) * this.slide;
		
		var bal_x = slide_x + Math.cos(this.angle + (Math.PI/2) * this.radius;
		var bal_y = slide_y + Math.sin(this.angle + (Math.PI/2) * this.radius;
		
		ctx.beginPath();
		ctx.strokeStyle = "white";
		ctx.lineWidth = "5";
		ctx.moveTo(left_x,left_y);
		ctx.lineTo(right_x,right_y);
		ctx.stroke();
		
		if( this.slide > this.line_rad || this.slide < -this.line_rad ) {
			this.dropped = true;
		}
		ctx.beginPath();
		ctx.arc(bal_x, bal_y, this.radius, Math.PI*2, false);
		ctx.fillStyle = 'black';
		ctx.fill()
		
		ctx.font = '15pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = "middle";
		ctx.fillStyle = 'black';
		ctx.fillText(this.name, s.x, s.y);
	}
}