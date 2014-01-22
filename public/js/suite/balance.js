var balancers = [],
	game_over,
	balance_winner,
	balance_winner_color,
	balance_start_time,
	balance_win_time,
	balance_begun,
	pre_bal,
	wall_counter,
	wall;

var balance = function() {
	ctx.globalCompositeOperation = "source-over";
	ctx.drawImage(images.g3_bg,0,0,W,H);
	ctx.save();
	ctx.scale(W/1920,H/1080);
	ctx.drawImage(images.g3_scenery1,-143,506);
	ctx.drawImage(images.g3_scenery2,1224,341);
	ctx.drawImage(images.g3_scenery3,414,766);
	ctx.drawImage(images.g3_scenery4,1248,815);
	ctx.restore();
	for(var i=0;i<wall.length;i++) {
		wall[i].draw();
	}
	for( var id in players ) {
		if(balancers.indexOf(id) != -1) {
			var b = players[id].balancer;
			b.draw();
		}
	}
	if(!balance_begun) {
		pre_bal.draw();
	}
	else if(game_over) {
		ctx.font = '100pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 4;
		ctx.strokeText(balance_winner+' WINS!',W/2,H/2);
		ctx.fillStyle = balance_winner_color;
		ctx.fillText(balance_winner+' WINS!',W/2,H/2);
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
	
	wall_counter = 0;
	wall = [];

	game_over = false;
	balance_winner = "";
	balance_begun = false;
	balance_start_time = Date.now();
	pre_bal = new create_pre_bal();
	socket.emit('game_state_change','balancing');
}

function create_balancer(col,nam,pId) {
	var home_x = 0;
	var home_y = 0;
	var rat = 0;
	var space = 0;
	var draw_time = 0;
	var pour_angle = 0;
	var spilled = false;
	
	this.fill_per = 0;
	this.cubes_complete = 0;
	
	var color = col;
	color.a = 1;
	var name = nam;
	var id = pId;
	
	this.is_pre = false;
	
	this.anglize = function(new_angle) {
		if(balance_begun || this.is_pre) {
			pour_angle = new_angle;
		}
	}
	
	this.pulse = function() {
		if(this.fill_per >0.90 && this.fill_per<=1) {
			var wall_piece = new create_wall(home_x-(rat*155),home_y+(rat*40),rat*0.5*250);
			wall.push(wall_piece);
			this.cubes_complete ++;
			if(this.cubes_complete >= 4 && !game_over) {
				game_over = true;
				balance_winner = name;
				balance_winner_color = color.is();
				balance_win_time = Date.now();
				socket.emit('game_end',id);
			}
		}
		this.fill_per = 0;
		spilled = false;
	}
	
	this.set_values = function(this_x,this_y,this_hig) {
		home_x = this_x;
		home_y = this_y;
		
		rat = this_hig/269;
		
		pour_angle = 0;
		this.fill_per = 0;
		this.cubes_complete = 0;

	}
	
	this.draw = function() {
		ctx.save();
		ctx.transform(rat,0,0,rat,home_x,home_y);
		fill_cube(this.fill_per);
		var perc_label;
		if(this.fill_per>1) {
			perc_label = 'SPILL!';
		}
		else {
			var adj_perc = this.fill_per/.90;
			if(adj_perc > 1) {
				adj_perc = 1;
			}
			perc_label = parseInt(adj_perc*100)+'%';
		}
		ctx.font = '30pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.lineWidth = 4;
		ctx.strokeText(perc_label,-93,70);
		ctx.fillStyle = color.is();
		ctx.fillText(perc_label,-93,70);
		ctx.textAlign = 'left';
		ctx.textBaseline = 'bottom';
		ctx.lineWidth = 6;
		ctx.strokeText(name,-20,130);
		ctx.fillStyle = color.is();
		ctx.fillText(name,-20,130);
		ctx.translate(35,-35);
		if(this.fill_per>1) {
			if(!spilled && !this.is_pre) {
				socket.emit('spill',id);
				spilled = true;
			}
		}
		ctx.rotate(pour_angle*(Math.PI/180));
		ctx.drawImage(images.g3_water_pot,-97,-94);
		ctx.font = '60pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 4;
		ctx.strokeText(this.cubes_complete,-16,20);
		ctx.fillStyle = color.is();
		ctx.fillText(this.cubes_complete,-16,20);
		ctx.restore();
		if(balance_begun && pour_angle<0 && pour_angle>-90 ) {
			this.fill_per += ((Date.now()-draw_time)/4000)*(pour_angle/-45);
		}
		draw_time = Date.now();
	}
	
	function fill_cube(perc) {
		ctx.save();
		ctx.transform(.5,0,0,.5,-155,40);
		if(perc>1) {
			ctx.scale(2, 1);
			ctx.beginPath();
			ctx.fillStyle = 'rgba(71,199,239,1)';
			ctx.arc(60, 62, 40, Math.PI*2, false);
			ctx.fill();
		}
		else {
			var grd = ctx.createLinearGradient(0,125,0,0);
			grd.addColorStop(0,"rgba(71,199,239,.8)");
			grd.addColorStop(perc,"rgba(71,199,239,.8)");
			grd.addColorStop(perc,"rgba(0,0,0,0)");
			grd.addColorStop(1,"rgba(0,0,0,0)");
			ctx.fillStyle = grd;
			ctx.fillRect(0,0,250,125);
		}
		ctx.restore();
	}
}

function create_wall(start_x,start_y,start_size) {
	var create_time = Date.now();
	var in_place = false;
	
	var end_x = ((2*W)/7)+((wall_counter%6)*(W/15));
	var end_y = ((5*H)/6)-(Math.floor(wall_counter/6)*(W/30));
	var end_size = (W/15)-5;
	
	wall_counter ++;
	
	this.draw = function() {
		if(in_place) {
			ctx.fillStyle = "rgba(71,199,239,.65)";
			ctx.fillRect(end_x,end_y,end_size,end_size/2);
		}
		else {
			var t = (Date.now()-create_time)/1000;
			var mid_x = xLerp(start_x,end_x,t);
			var mid_y = xLerp(start_y,end_y,t);
			var mid_size = xLerp(start_size,end_size,t);
			ctx.fillStyle = "rgba(71,199,239,.65)";
			ctx.fillRect(mid_x,mid_y,mid_size,mid_size/2);
			if(t>=1) {
				in_place=true;
			}
		}
	}
}

function create_pre_bal() {
	var pre_bal = new create_balancer(new RGBColor(0,0,255,1),'');
	pre_bal.set_values((3*W)/5,H/2,H/3);
	pre_bal.is_pre = true;
	var pre_perc = 0;
	var pre_hand_rot = 0;
	var pre_pot_rot = 0;
	var finger_offset = 0;
	var hand_image_pour = true;
	var pre_title = 'Fill the cup to 100%!';
	var pre_bal_array = [
		new timed_func(1000, function(){}, function(t){}),
		/*new timed_func(3000, function(){}, function(t){
			pre_pot_rot = xLerp(0,-45,t);
			pre_hand_rot = xLerp(0,-45*(Math.PI/180),t);
			pre_perc = xLerp(0,.5,Math.pow(t,2));
		}),
		new timed_func(3000, function(){}, function(t){
			pre_pot_rot = xLerp(-45,0,t);
			pre_hand_rot = xLerp(-45*(Math.PI/180),0,t);
			pre_perc = xLerp(.5,.95,-Math.pow(t-1,2)+1);
		}),
		new timed_func(2000, function(){
			pre_perc = 1;
		}, function(t){}),
		new timed_func(1000, function(){
			pre_title = 'Then tap to get a new cup';
			hand_image_pour = false;
		}, function(t){
			finger_offset = xLerp(0,50,1-Math.pow((2*t)-1,2));
		}),
		new timed_func(2500, function(){
			pre_bal.cups_complete = 1;
			pre_perc = 0;
		}, function(t){}),
		new timed_func(5000, function(){
			pre_title = 'Make sure not to spill!';
			hand_image_pour = true;
		}, function(t){
			pre_pot_rot = xLerp(0,-75,t);
			pre_hand_rot = xLerp(0,-75*(Math.PI/180),t);
			pre_perc = xLerp(0,1.2,Math.pow(t,2));
		}),
		new timed_func(2000, function(){}, function(t){}),
		new timed_func(1000, function(){
			pre_title = 'But if you do, you can still tap for another cup';
			pre_hand_rot = 0;
			hand_image_pour = false;
		}, function(t){
			finger_offset = xLerp(0,50,1-Math.pow((2*t)-1,2));
			pre_pot_rot = xLerp(-75,0,t);
		}),
		new timed_func(2500, function(){
			pre_perc = 0;
		}, function(t){}),
		new timed_func(3000, function(){
			hand_image_pour = true;
			pre_title = 'First to 4 correctly filled cups wins!';
		}, function(t){}),
		new timed_func(2000, function(){
			pre_title = 'Ready?';
		}, function(t){}),
		new timed_func(1000, function(){
			pre_title = 'GO!';
		}, function(t){}),*/
];
	var pre_bal_manager = new timed_manager(pre_bal_array,function(){ 
			balance_begun=true;
			socket.emit('game_start');
		});
	this.draw = function() {
		pre_bal_manager.run();
		/*ctx.fillStyle="rgba(255,255,255,.95)";
		ctx.fillRect((W/4),(H/4),W/2,H/2);
		pre_bal.fill_per = pre_perc;
		pre_bal.anglize(pre_pot_rot);
		pre_bal.draw();
		ctx.save();
		ctx.translate((W/2)-(H/6),H/2);
		ctx.rotate(pre_hand_rot);
		if(hand_image_pour) {
			ctx.drawImage(images.hand_pour,-H/6,-H/6,H/3,H/3);
		}
		else {
			ctx.drawImage(images.hand_tap_phone,-H/6,-H/6,H/3,H/3);
			ctx.drawImage(images.hand_tap_finger,-H/6,-H/6-finger_offset,H/3,H/3);
		}
		ctx.restore();
		ctx.font = '40pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 6;
		ctx.strokeText(pre_title,W/2,H/4+10);
		ctx.fillStyle = 'white';
		ctx.fillText(pre_title,W/2,H/4+10);*/
	}
}