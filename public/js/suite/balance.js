var balancers = [],
	game_over,
	balance_winner,
	balance_win_time,
	balance_begun,
	countdown;

var balance = function() {
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
		ctx.fillText('Pour!', W/2, H/2);
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
}

function balance_init() {
	console.log('bal init');
	balancers = [];
	var pour_space = (H/2)/((player_count/2)+1);
	var radius = (H/2)-(pour_space/2);
	var angle_inc = (Math.PI*2)/player_count;
	var counter = 0;
	for( var id in players ) {
		var x_off = radius*Math.cos(counter*angle_inc);
		var y_off = radius*Math.sin(counter*angle_inc);
		balancers.push(id);
		var b = players[id].balancer;
		b.set_values((W/2)+x_off,(H/2)+y_off,pour_space);;
		counter++;
	}
	game_over = false;
	balance_winner = "";
	balance_begun = false;
	countdown = new create_countdown();
	socket.emit('game_state_change','balancing');
}

function create_balancer(col,nam,rad) {
	var home_x = 0;
	var home_y = 0;
	var space = 0;
	var draw_time = 0;
	
	var pot_x = 0;
	var pot_y = 0;
	var cup_x = 0;
	var cup_y = 0;

	var pour_angle = 0;
	
	var pot_size = 0.65;
	var cup_size = 0.35;
	
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
	
	this.set_values = function(this_x,this_y,this_space) {
		home_x = this_x;
		home_y = this_y;
		space = this_space;
		fill_per = 0;
		cups_complete = 0;
		
		pot_size = 0.65*space;
		cup_size = 0.35*space;
		pot_x = (home_x + (space/2)) - pot_size;
		pot_y = home_y - (space/2);
		cup_x = home_x - (space/2);
		cup_y = (home_y + (space/2)) - cup_size;
	}
	
	this.draw = function() {
		ctx.save();
		ctx.translate(pot_x+(pot_size/2),pot_y+(pot_size/2));
		ctx.rotate(pour_angle*(Math.PI/180));
		ctx.drawImage(images.pot,-(pot_size/2),-(pot_size/2),pot_size,pot_size);
		ctx.restore();
		ctx.drawImage(images.cup,cup_x,cup_y,cup_size,cup_size);
		ctx.fillStyle = 'rgb(83,47,36)';
		ctx.fillRect(cup_x+(cup_size/4),(cup_y+cup_size)-(cup_size*fill_per),cup_size/2,cup_size*fill_per);
		if(balance_begun && pour_angle<0 && pour_angle>-90 ) {
			fill_per += ((Date.now()-draw_time)/4000)*(pour_angle/-45);
		}
		ctx.font = (cup_size/4)+'pt Calibri';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = color.is();
		ctx.fillText(name+' '+cups_complete, cup_x+cup_size+10, cup_y+(cup_size/2));
		draw_time = Date.now();
	}
}

function create_countdown() {
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
	}
}