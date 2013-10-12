var start_time
var balancers = [],
	game_over,
	balance_winner,
	balance_win_time;

var balance = function() {
	var diff = (Date.now() - start_time) / 60000;
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, W, H);
	var alive_array = [];
	for( var id in players ) {
		if(balancers.indexOf(id) != -1) {
			var b = players[id].balancer;
			b.slide += (b.angle/2);
			b.angle += (Math.random()) * diff - (diff/2)
			b.draw();
			if(!b.dropped) {
				alive_array.push(id);
			}
		}
	}
	if(!game_over) {
		if(alive_array.length == 1) {
			balance_winner = players[alive_array[0]].name
			balance_win_time = Date.now();
			game_over = true;
		}
		else if(alive_array.length < 1 && game_state == "balance") {
			change_state("surf");
		}
	}
	else {
		ctx.font = '50pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = "middle";
		ctx.fillStyle = "white";
		ctx.fillText(balance_winner + " WINS!",W/2,H/2);
		if( Date.now() - balance_win_time > 3000 && game_state == "balance") {
			change_state("surf");
		}
	}
}

function balance_init() {
	console.log('bal init');
	var counter = 0;
	var screen_x_interval = W/5;
	var screen_y_interval = H/6;
	balancers = [];
	for( var id in players ) {
		balancers.push(id);
		var b = players[id].balancer;
		b.dropped = false;
		b.angle = 0;
		b.slide = 0;
		b.homeX = ((counter % 4)+ 1) * screen_x_interval;
		b.homeY = (Math.floor(counter/5) + 1) * screen_y_interval;
		counter ++;
	}
	start_time = Date.now();
	game_over = false;
	balance_winner = "";
	socket.emit('game_state_change','balancing');
}

function create_balancer(col,nam,rad) {
	this.homeX = 0;
	this.homeY = 0;
	this.angle = 0;
	this.slide = 0;
	this.dropped = false;
	
	var dropX = 0;
	var dropY = 0;
	var radius = 40;
	var line_rad = 50;
	var color = new RGBColor(col.r,col.g,col.b,1);
	var name = nam;
	var drop_time;
	
	
	this.draw = function() {
	
		var right_x = this.homeX + Math.cos(this.angle) * line_rad;
		var right_y = this.homeY + Math.sin(this.angle) * line_rad;
		var left_x = this.homeX + Math.cos(this.angle + Math.PI) * line_rad;
		var left_y = this.homeY + Math.sin(this.angle + Math.PI) * line_rad;
		
		var slide_x = this.homeX + Math.cos(this.angle) * this.slide;
		var slide_y = this.homeY + Math.sin(this.angle) * this.slide;
		
		var bal_x = slide_x + Math.cos(this.angle - (Math.PI/2)) * (radius + 5);
		var bal_y = slide_y + Math.sin(this.angle - (Math.PI/2)) * (radius + 5);
		
		ctx.beginPath();
		ctx.strokeStyle = "white";
		ctx.lineWidth = "10";
		ctx.moveTo(left_x,left_y);
		ctx.lineTo(right_x,right_y);
		ctx.stroke();
		
		if( !this.dropped ) {
			ctx.beginPath();
			ctx.arc(bal_x, bal_y, radius, Math.PI*2, false);
			ctx.fillStyle = color.is();
			ctx.fill()
		}
		else {
			if(dropY < H + (radius/2)) {
				dropY += (( Date.now() - drop_time ) / 1000) * 40;
				drop_time = Date.now();
				ctx.beginPath();
				ctx.arc(dropX, dropY, radius, Math.PI*2, false);
				ctx.fillStyle = color.is();
				ctx.fill();
			}
		}
		
		ctx.font = '15pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = "middle";
		ctx.fillStyle = "white";
		ctx.fillText(name, this.homeX, this.homeY - 80);
		
		
		if( !this.dropped && (this.slide > line_rad || this.slide < -line_rad || this.angle > Math.PI/2 || this.angle < -Math.PI/2) ) {
			this.dropped = true;
			dropX = bal_x;
			dropY = bal_y;
			drop_time = Date.now();
		}
	}
}