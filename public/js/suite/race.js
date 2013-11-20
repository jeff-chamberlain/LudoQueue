var race_begun,
	race_over,
	race_start_time,
	race_win_time,
	race_winner,
	race_winner_color,
	racers = [],
	race_countdown,
	tap_goal = 200;

var race = function() {
	ctx.globalCompositeOperation = "source-over";
	ctx.drawImage(images.bg,0,0,W,H);
	/*ctx.font = '30pt Calibri';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';
	ctx.fillStyle = 'rgb(203,140,129';
	ctx.fillText("lud.so", 10, 10);
	ctx.font = '50pt Lucida Grande';
	ctx.textAlign = 'center';
	ctx.fillText("LudoQueue", W/2, 10);*/
	
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
		ctx.font = '100pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = 'rgb(0,0,0)';
		//ctx.fillText('Drip!', W/2, H/2);
	}
	else {
		ctx.font = '50pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = "middle";
		ctx.fillStyle = 'rgb(0,0,0)';
		ctx.fillText(race_winner + " WINS!",W/2,H/2);
		if( Date.now() - race_start_time > 3000 && game_state == "race") {
			change_state("balance");
		}
	}
	if( (Date.now() - race_start_time > 240000 || player_count == 0) && game_state == "race") {
			change_state("surf");
	}
}

var race_init = function() {
	console.log('race init');
	var grid = new create_grid(W,H,player_count);
	var counter = 0;
	for( var id in players ) {
		racers.push(id);
		var r = players[id].racer;
		var vals = grid.getPos(counter);
		r.set_values(vals.x,vals.y,vals.max);
		counter++;
	}
	race_over = false;
	race_winner = "";
	race_begun = false;
	race_countdown = new create_race_countdown();
	race_start_time = Date.now();
	socket.emit('game_state_change','racing');
}

function create_racer(col,nam) {
	var home_x = 0;
	var home_y = 0;
	var rat = 0;
	
	var maker_x = 0;
	var maker_y = 0;
	var maker_wid = 0;
	var maker_hig = 0;
	var reflec_wid = 0;
	var reflec_hig = 0;
	
	var tap_count = 0;
	
	var name = nam;
	var color = col;
	color.a = 1;
	
	var drips = [];
	
	var time = Date.now();
	
	this.set_values = function(this_x,this_y,this_hig) {
		home_x = this_x;
		home_y = this_y;
		
		maker_hig = this_hig;
		maker_wid = maker_hig * (images.maker.width/images.maker.height);
		
		rat = maker_hig/images.maker.height;
		
		reflec_wid = images.reflec.width*rat;
		reflec_hig = images.reflec.height*rat;
		
		maker_x = home_x-(maker_wid/2);
		maker_y = home_y-(maker_hig/2);
		
		tap_count = 0;
		drips = [];
	}
	
	this.draw = function() {
		for(var i=drips.length-1;i>=0;i--) {
			drips[i].draw();
		}
		ctx.drawImage(images.maker,maker_x,maker_y,maker_wid,maker_hig);
		drawFill(tap_count/tap_goal);
		ctx.drawImage(images.reflec,maker_x+(37*rat),maker_y+(260*rat),reflec_wid,reflec_hig);
		if(Date.now()-time>1000) {
			this.tap();
			time = Date.now();
		}
		ctx.font = (40*rat)+'pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 6*rat;
		ctx.strokeText(name,home_x+(20*rat),home_y-(180*rat));
		ctx.fillStyle = color.is();
		ctx.fillText(name,home_x+(20*rat),home_y-(180*rat));
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
	function drawFill(perc) {
		if(perc>1) {
			perc=1;
		}
		ctx.save();
		ctx.transform(rat,0,0,rat,home_x-(445*rat),home_y-(325*rat));
		var grd = ctx.createLinearGradient(0,480,0,356);
		grd.addColorStop(0,"#4c2a0b");
		grd.addColorStop(perc,"#4c2a0b");
		grd.addColorStop(perc,"rgba(0,0,0,0)");
		grd.addColorStop(1,"rgba(0,0,0,0)");
		ctx.fillStyle = grd;
		ctx.beginPath();
		ctx.moveTo(335.61,360.293);
		ctx.bezierCurveTo(335.61,360.293,310.555,402.862,312.379,421.714);
		ctx.bezierCurveTo(314.204,440.567,319.074,473.946,381.103,480.67);
		ctx.bezierCurveTo(442.523,481.617,464.918,448.21500000000003,463.809,422.322);
		ctx.bezierCurveTo(462.69800000000004,396.43,441.079,360.293,441.079,360.293);
		ctx.lineTo(438.11400000000003,356.903);
		ctx.bezierCurveTo(438.11400000000003,356.903,433.77000000000004,367.558,389.235,367.558);
		ctx.bezierCurveTo(349.629,367.558,337.13100000000003,358.08,337.13100000000003,358.08);
		ctx.lineTo(335.61,360.293);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
	function create_drip() {
		var drip_x = home_x-(55*rat);
		var drip_y = home_y;
		var drip_rad = 4*rat;
		var drip_time = Date.now();
		
		this.draw = function() {
			ctx.beginPath();
			ctx.fillStyle = 'black';
			ctx.arc(drip_x, drip_y, drip_rad, Math.PI*2, false);
			ctx.fill();
			
			drip_y += ((Date.now()-drip_time)/5000)*(150*rat);
			
			if(drip_y >= home_y + (150*rat)) {
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
		ctx.font = '100pt Calibri';
		ctx.textAlign = 'middle';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = 'rgb(0,0,0)';
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
