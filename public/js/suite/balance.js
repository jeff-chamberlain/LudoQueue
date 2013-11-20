var balancers = [],
	game_over,
	balance_winner,
	balance_winner_color,
	balance_start_time,
	balance_win_time,
	balance_begun,
	countdown;

var balance = function() {
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
		if(balancers.indexOf(id) != -1) {
			var b = players[id].balancer;
			b.draw();
		}
	}
	if(!balance_begun) {
		countdown.draw();
	}
	else if(!game_over) {
		ctx.font = '30pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = 'rgb(37,159,127)';
		//ctx.fillText('Pour!', W/2, H/2);
	}
	else {
		ctx.font = '50pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = "middle";
		ctx.fillStyle = 'rgb(37,159,127)';
		ctx.fillText(balance_winner + " WINS!",W/2,H/2);
		if( Date.now() - balance_win_time > 3000 && game_state == "balance") {
			change_state("surf");
		}
	}
	if( (Date.now() - balance_start_time > 240000 || player_count == 0) && game_state == "balance") {
			change_state("surf");
	}
}

function balance_init() {
	console.log('bal init');
	balancers = [];
	var grid = new create_grid(W,H,player_count);
	var counter = 0;
	for( var id in players ) {
		balancers.push(id);
		var b = players[id].balancer;
		var vals = grid.getPos(counter);
		b.set_values(vals.x,vals.y,vals.max);
		counter++;
	}
	game_over = false;
	balance_winner = "";
	balance_begun = false;
	balance_start_time = Date.now();
	countdown = new create_countdown();
	socket.emit('game_state_change','balancing');
}

function create_balancer(col,nam) {
	var home_x = 0;
	var home_y = 0;
	var rat = 0;
	var space = 0;
	var draw_time = 0;
	var pour_angle = 0;
	
	var fill_per = 0;
	var cups_complete = 0;
	
	var color = col;
	color.a = 1;
	var name = nam;
	
	this.anglize = function(new_angle) {
		if(balance_begun) {
			pour_angle = new_angle;
		}
	}
	
	this.pulse = function() {
		if(fill_per >0.9 && fill_per<=1) {
			cups_complete ++;
			if(cups_complete >= 4 && !game_over) {
				game_over = true;
				balance_winner = name;
				balance_win_time = Date.now();
			}
		}
		fill_per = 0;
	}
	
	this.set_values = function(this_x,this_y,this_hig) {
		home_x = this_x;
		home_y = this_y;
		
		rat = this_hig/269;
		
		fill_per = 0;
		cups_complete = 0;

	}
	
	this.draw = function() {
		ctx.save();
		ctx.transform(rat,0,0,rat,home_x,home_y);
		fill_cup(fill_per);
		ctx.drawImage(images.cup,-132,27,99,103);
		ctx.translate(35,-35);
		ctx.font = '40pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 6;
		ctx.strokeText(name,0,0);
		ctx.fillStyle = color.is();
		ctx.fillText(name,0,0);
		ctx.rotate(pour_angle*(Math.PI/180));
		ctx.drawImage(images.pot,-97,-94);
		ctx.restore();
		if(balance_begun && pour_angle<0 && pour_angle>-90 ) {
			fill_per += ((Date.now()-draw_time)/4000)*(pour_angle/-45);
		}
		draw_time = Date.now();
	}
	
	function fill_cup(perc) {
		if(perc>1) {
			perc=1;
		}
		ctx.save();
		ctx.transform(.5,0,0,.5,-130,30);
		var grd = ctx.createLinearGradient(0,175,0,0);
		grd.addColorStop(0,"#663f17");
		grd.addColorStop(perc,"#663f17");
		grd.addColorStop(perc,"rgba(0,0,0,0)");
		grd.addColorStop(1,"rgba(0,0,0,0)");
		ctx.fillStyle = grd;
		ctx.beginPath();
		ctx.moveTo(2.561,9.953);
		ctx.bezierCurveTo(-1.6799999999999997,1.4719999999999995,9.727,0.4529999999999994,18.894,0.4529999999999994);
		ctx.lineTo(119.561,0.4529999999999994);
		ctx.bezierCurveTo(119.561,0.4529999999999994,138.352,5.786,138.352,5.786);
		ctx.lineTo(138.352,14.378);
		ctx.lineTo(133.674,30.609);
		ctx.lineTo(132.77,122.93799999999999);
		ctx.bezierCurveTo(132.77,122.93799999999999,121.543,168.362,95.43800000000002,174.754);
		ctx.bezierCurveTo(95.43800000000002,174.754,53.16300000000002,191.463,27.68900000000002,162.494);
		ctx.bezierCurveTo(27.68900000000002,162.494,11.698000000000022,145.502,13.46300000000002,101.81);
		ctx.bezierCurveTo(8.569,88.818,9.894,24.62,2.561,9.953);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
}

function create_countdown() {
balance_begun=true;
/*
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
				balance_begun=true;
			}
		}
	}*/
}