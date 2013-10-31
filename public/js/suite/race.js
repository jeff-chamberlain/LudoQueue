var race_begun,
	race_over,
	race_win_time,
	race_winner,
	racers = [],
	race_countdown,
	tap_goal = 200;

var race = function() {
	ctx.globalCompositeOperation = "source-over";
	ctx.drawImage(images.bg,0,0,W,H);
	ctx.font = '30pt Calibri';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';
	ctx.fillStyle = 'rgb(203,140,129';
	ctx.fillText("lud.so", 10, 10);
	ctx.font = '50pt Lucida Grande';
	ctx.textAlign = 'center';
	ctx.fillText("LudoQueue", W/2, 10);
	
	for( var id in players ) {
		if(racers.indexOf(id) != -1) {
			var r = players[id].racer;
			r.draw();
		}
	}
	if(!race_begun) {
		race_countdown.draw();
	}
	else if(!race_over) {
		ctx.font = '30pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = 'rgb(37,159,127)';
		ctx.fillText('Drip!', W/2, H/2);
	}
	else {
		ctx.font = '50pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = "middle";
		ctx.fillStyle = 'rgb(37,159,127)';
		ctx.fillText(race_winner + " WINS!",W/2,H/2);
		if( Date.now() - race_win_time > 3000 && game_state == "race") {
			change_state("balance");
		}
	}
}

var race_init = function() {
	console.log('race init');
	var race_space = (H/2)/((player_count/2)+1);
	var radius = (H/2)-(race_space/2);
	var angle_inc = (Math.PI*2)/player_count;
	var counter = 0;
	for( var id in players ) {
		var x_off = radius*Math.cos(counter*angle_inc);
		var y_off = radius*Math.sin(counter*angle_inc);
		racers.push(id);
		var r = players[id].racer;
		r.set_values((W/2)+x_off,(H/2)+y_off,race_space);;
		counter++;
	}
	race_over = false;
	race_winner = "";
	race_begun = false;
	race_countdown = new create_race_countdown();
	socket.emit('game_state_change','racing');
}

function create_racer(col,nam,rad) {
	var home_x = 0;
	var home_y = 0;
	var space = 0;
	
	var maker_x = 0;
	var maker_y = 0;
	
	var tap_count = 0;
	
	var name = nam;
	var color = col;
	color.a = 1;
	
	var drips = [];
	
	this.set_values = function(this_x,this_y,this_space) {
		home_x = this_x;
		home_y = this_y;
		space = this_space;
		
		maker_x = home_x-(space/2);
		maker_y = home_y-(space/2);
		
		tap_count = 0;
		drips = [];
	}
	
	this.draw = function() {
		ctx.drawImage(images.maker,maker_x,maker_y,space,space);
		for(var i=drips.length-1;i>=0;i--) {
			drips[i].draw();
		}
		var rect_fill_height = (tap_count/tap_goal)*((2*space)/7);
		ctx.fillStyle = 'black';
		ctx.fillRect(maker_x +(space/3.5),maker_y+((5*space)/6)-rect_fill_height,space/4,rect_fill_height);
		ctx.font = (space/10)+'pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.fillStyle = color.is();
		ctx.fillText(name,maker_x + (space/2),maker_y+space+10);
	}
	
	this.tap = function() {
		if(race_begun) {
			tap_count ++;
			if(tap_count>=tap_goal && !race_over) {
				race_over = true;
				race_winner = name;
				race_win_time = Date.now();
			}
			var drip = new create_drip();
			drips.push(drip);
		}
	}
	
	function create_drip() {
		var drip_x = maker_x+(0.4*space);
		var drip_y = maker_y+(0.4*space);
		var drip_rad = 0.01*space;
		var drip_time = Date.now();
		
		this.draw = function() {
			ctx.beginPath();
			ctx.fillStyle = 'rgb(83,47,36)';
			ctx.arc(drip_x, drip_y, drip_rad, Math.PI*2, false);
			ctx.fill();
			
			drip_y += ((Date.now()-drip_time)/500)*(0.5*space);
			
			if(drip_y >= maker_y +(0.9*space)) {
				var index = drips.indexOf(this);
				if(index != -1) {
					drips.splice(index,1);
				}
			}
		}
	}
}
function create_race_countdown() {
	var interval_time = Date.now();
	var count = 5;
	this.draw = function() {
		ctx.font = '30pt Calibri';
		ctx.textAlign = 'middle';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = 'rgb(37,159,127)';
		ctx.fillText(count, W/2, H/2);
		if(Date.now()-interval_time>=1000) {
			count--;
			interval_time = Date.now();
			if(count==0) {
				race_begun=true;
			}
		}
	}
}
