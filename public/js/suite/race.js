var race_begun,
	race_over,
	race_start_time,
	race_win_time,
	race_winner,
	race_winner_color,
	racers = [],
	pre_race,
	tap_goal = 1;

var race = function() {
	ctx.globalCompositeOperation = "source-over";
	ctx.drawImage(images.g2_bg,0,0,W,H);
	
	for( var id in players ) {
		if(racers.indexOf(id) != -1) {
			var r = players[id].racer;
			r.draw();
		}
	}
	if(!race_begun) {
		pre_race.draw();
	}
	else if(race_over) {
		ctx.font = '100pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 4;
		ctx.strokeText(race_winner+' WINS!',W/2,H/2);
		ctx.fillStyle = race_winner_color;
		ctx.fillText(race_winner+' WINS!',W/2,H/2);
		if( Date.now() - race_win_time > 3000 && game_state == "race") {
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
	pre_race = new create_pre_race();
	race_start_time = Date.now();
	socket.emit('game_state_change','racing');
}

function create_racer(col,nam,pId) {
	var home_x;
	var home_y;
	var space_height;
	var target_image;
	var target_size;
	
	var tap_count = 0;
	
	var name = nam;
	var color = col;
	var id = pId;
	color.a = 1;
	
	var balls = [];
	
	this.is_pre = false;
	
	this.set_values = function(this_x,this_y,this_hig) {
		home_x = this_x;
		home_y = this_y;
		space_height = this_hig;
		target_size = (3*space_height)/4;

		var rand = Math.floor(Math.random()*5);
        switch(rand) {
                case 0:
                        target_image = images.g2_prop1;
                        break;
                case 1:
                        target_image = images.g2_prop2;
                        break;
                case 2:
                        target_image = images.g2_prop3;
                        break;
                case 3:
                        target_image = images.g2_prop4;
                        break;
                default:
                        target_image = images.g2_prop5;
                        break;
        }
		
		tap_count = 0;
		balls = [];
	}
	
	this.draw = function() {
		ctx.fillStyle="rgba(255,255,255,.75)";
		ctx.fillRect(home_x-(space_height/2),home_y-(space_height/2),space_height,space_height);
		ctx.drawImage(target_image,home_x-(target_size/2),home_y-(space_height/2),target_size,target_size);
		var perc = tap_count/tap_goal;
		ctx.drawImage(images.g2_snow_pile,0,0,300,225*perc,home_x-(space_height/2),home_y+(space_height/4)-(target_size*perc),space_height,target_size*perc);
		for(var i=balls.length-1;i>=0;i--) {
			balls[i].draw();
		}
		ctx.font = (space_height/5)+'px	 Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = space_height/32;
		ctx.strokeText(name,home_x,home_y+(space_height)/4);
		ctx.fillStyle = color.is();
		ctx.fillText(name,home_x,home_y+(space_height)/4);
	}
	
	this.tap = function() {
		if(race_begun || this.is_pre) {
			tap_count ++;
			if(tap_count>=tap_goal && !race_over) {
				race_over = true;
				race_winner = name;
				race_winner_color = color.is();
				race_win_time = Date.now();
				socket.emit('game_end',id);
			}
			var ball = new create_ball();
			balls.push(ball);
		}
	}
	function create_ball() {
		var rand_angle = Math.random()*(2*Math.PI);
		var start_x = home_x+((target_size/2)*Math.cos(rand_angle));
		var start_y = (home_y-(space_height/8)+((target_size/2)*Math.sin(rand_angle)));
		var create_time = Date.now();
		
		this.draw = function() {
			var t = (Date.now()-create_time)/500;
			if(t>=1) {
				var index = balls.indexOf(this);
				if(index != -1) {
					balls.splice(index,1);
				}
			}
			else {
				var x = xLerp(start_x,home_x,t);
				var y = xLerp(start_y,home_y-(space_height/4),t);
				var size = xLerp((space_height/4),(space_height/10),t);
				ctx.beginPath();
				ctx.drawImage(images.g1_ball,x-(size/2),y-(size/2),size,size);
			}
		}
	}
}

function create_pre_race() {
	var pre_racer = new create_racer(new RGBColor(0,0,255,1),'');
	pre_racer.set_values((3*W)/5,H/2,H/3);
	pre_racer.is_pre = true;
	var pre_perc = 0;
	var finger_offset = 0;
	var pre_title = 'Tap your phone to make coffee!';
	var pre_race_array = [
		new timed_func(1000, function(){}, function(t){})/*,
		new timed_func(1000, function(){}, function(t){
			finger_offset = xLerp(0,50,1-Math.pow((2*t)-1,2));
		}),
		new timed_func(1000, function(){
			pre_racer.tap();
		}, function(t){}),
		new timed_func(1000, function(){}, function(t){}),
		new timed_func(200, function(){
			pre_title = 'Tap faster to brew faster';
		}, function(t){
			pre_perc = xLerp(0,0.1,t);
			finger_offset = xLerp(0,50,1-Math.pow((2*t)-1,2));
		}),
		new timed_func(200, function(){
			pre_racer.tap();
		}, function(t){
			pre_perc = xLerp(0.1,0.2,t);
			finger_offset = xLerp(0,50,1-Math.pow((2*t)-1,2));
		}),
		new timed_func(200, function(){
			pre_racer.tap();
		}, function(t){
			pre_perc = xLerp(0.2,0.3,t);
			finger_offset = xLerp(0,50,1-Math.pow((2*t)-1,2));
		}),
		new timed_func(200, function(){
			pre_racer.tap();
		}, function(t){
			pre_perc = xLerp(0.3,0.4,t);
			finger_offset = xLerp(0,50,1-Math.pow((2*t)-1,2));
		}),
		new timed_func(200, function(){
			pre_racer.tap();
		}, function(t){
			pre_perc = xLerp(0.4,0.5,t);
			finger_offset = xLerp(0,50,1-Math.pow((2*t)-1,2));
		}),
		new timed_func(200, function(){
			pre_racer.tap();
		}, function(t){
			pre_perc = xLerp(0.5,0.6,t);
			finger_offset = xLerp(0,50,1-Math.pow((2*t)-1,2));
		}),
		new timed_func(200, function(){
			pre_racer.tap();
		}, function(t){
			pre_perc = xLerp(0.6,0.7,t);
			finger_offset = xLerp(0,50,1-Math.pow((2*t)-1,2));
		}),
		new timed_func(200, function(){
			pre_racer.tap();
		}, function(t){
			pre_perc = xLerp(0.7,0.8,t);
			finger_offset = xLerp(0,50,1-Math.pow((2*t)-1,2));
		}),
		new timed_func(200, function(){
			pre_racer.tap();
		}, function(t){
			pre_perc = xLerp(0.8,0.9,t);
			finger_offset = xLerp(0,50,1-Math.pow((2*t)-1,2));
		}),
		new timed_func(200, function(){
			pre_racer.tap();
		}, function(t){
			pre_perc = xLerp(0.9,1,t);
			finger_offset = xLerp(0,50,1-Math.pow((2*t)-1,2));
		}),
		new timed_func(1500, function(){}, function(t){}),
		new timed_func(3000, function(){
			pre_title = 'Fill your pot first to win!';
		}, function(t){}),
		new timed_func(2000, function(){
			pre_title = 'Ready?';
		}, function(t){}),
		new timed_func(1000, function(){
			pre_title = 'GO!';
		}, function(t){}),*/
];
	var pre_race_manager = new timed_manager(pre_race_array,function(){ 
			race_begun=true;
			socket.emit('game_start');
		});
	this.draw = function() {
		pre_race_manager.run();
		/*ctx.fillStyle="rgba(255,255,255,.95)";
		ctx.fillRect((W/4),(H/4),W/2,H/2);
		pre_racer.draw();
		ctx.drawImage(images.hand_tap_phone,(W/2)-(H/3),H/3,H/3,H/3);
		ctx.drawImage(images.hand_tap_finger,(W/2)-(H/3),H/3-finger_offset,H/3,H/3);
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