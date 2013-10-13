var start_line,
	finish_line,
	race_begun,
	race_calls,
	race_won,
	race_win_time,
	race_winner,
	racers = [];

var race = function() {
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
	ctx.fillRect(0, 0, W, H);
	ctx.fillStyle = "red";
	ctx.fillRect(start_line-2.5, 0, 5, H);
	ctx.fillRect(finish_line-2.5, 0, 5, H);
	if(!race_won) {
		race_calls.draw();
	}
	else {
		ctx.font = '30pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = "top";
		ctx.fillStyle = 'rgb(50,250,50)';
		ctx.fillText(race_winner, W/2, H/2);
		if( Date.now() - race_win_time >= 4000 && game_state == "race") {
			change_state("surf");
		}
	}
	ctx.globalCompositeOperation = "lighter";
	var live_count = 0;
	for(var i=0;i<racers.length;i++) {
		var id = racers[i];
		if(players.hasOwnProperty(id)) {
			live_count ++;
			var r = players[id].racer;
			r.move();
			if(r.finished && !race_won) {
				race_won = true;
				race_win_time = Date.now();
				race_winner = r.name + " has WON!!!";
			}
		}
	}
	if(live_count == 0 && game_state == "race") {
		change_state("surf");
	}
}

var race_init = function() {
	console.log('race init');
	start_line = 200;
	finish_line = W - 200;
	race_begun = false;
	race_won = false;
	race_winner = "";
	race_calls = new create_race_calls();
	
	racers = [];
	var y_interval = (H-200)/(player_count+1);
	var count = 1;
	for( var id in players ) {
		racers.push(id);
		var r = players[id].racer;
		var y = 200 + (y_interval*count);
		r.prepare(y,start_line,finish_line);
		count ++;
	}
	socket.emit('game_state_change','racing');
}

function create_racer(col,nam,rad) {

	this.tap_count = 0;
	this.homeY = 0;
	this.homeX = 0;
	this.dest = 0;
	this.finished = false;
	this.name = nam;

	var color = col;
	var radius = 40;
	var tap_time;
	var cur_x;
	var last_x;
	var moving;
	
	this.move = function() {
		
		ctx.font = '15pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = "middle";
		ctx.fillStyle = "white";
		ctx.fillText(this.name, this.homeX-100, this.homeY);
		if( moving ) {
			var t = (Date.now() - tap_time)/1000;
			if( t <= 1 ) {
				var dest_x = xLerp(this.homeX,this.dest,this.tap_count/40);
				cur_x = xLerp(last_x,dest_x,t);
			}
			else {
				moving = false;
			}
		}
		ctx.beginPath();
		var gradient = ctx.createRadialGradient(cur_x, this.homeY, 0, cur_x, this.homeY, radius);
		gradient.addColorStop(0, color.is());
		gradient.addColorStop(1, "black");
	
		ctx.fillStyle = gradient;
		ctx.arc(cur_x, this.homeY, radius, Math.PI*2, false);
		ctx.fill();
		
		if(cur_x >= this.dest) {
			this.finished = true;
		}
	}
	
	this.tap = function() {
		if(race_begun) {
			this.tap_count ++;
			tap_time = Date.now();
			last_x = cur_x;
			moving = true;
		}
	}
	
	this.prepare = function(y, start, finish) {
		this.tap_count = 0;
		this.homeY = y;
		this.homeX = start;
		this.dest = finish;
		this.finished = false;
		
		cur_x = start;
		last_x = start;
		moving = false;
	}
}

function create_race_calls() {
	var race_messages = [
		{txt:"It's racing time!",length:2000},
		{txt:"On the count of three, tap on your phone as fast as you can", length:2000},
		{txt:"Tap fastest to win the race",length:2000},
		{txt:"Ready?",length:500},
		{txt:"3",length:500},
		{txt:"2",length:500},
		{txt:"1",length:500},
		{txt:"GO!",length:5000}
		];
	var next_index = 0;
		
	function new_race_message() {
		this.text = race_messages[next_index].txt;
		this.length = race_messages[next_index].length;
		if(next_index == race_messages.length - 1) {
			if(!race_begun) {
				console.log('beginning race!');
				socket.emit('begin_race');
				race_begun = true;
			}
		}
		else {
			next_index ++;
		}
		this.time = Date.now();
		this.done = false;
	}
	
	var race_message = new new_race_message();
	
	this.draw = function() {
		if(!race_message.done) {
			ctx.font = '30pt Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = "top";
			ctx.fillStyle = 'yellow';
			ctx.fillText(race_message.text, W/2, 100);
			if(Date.now() - race_message.time >= race_message.length) {
				if( next_index < race_message.length-1 && !race_begun) {
					race_message.done = true;
				}
				race_message.time = Date.now();
			}
		}
		else {
			if(Date.now() - race_message.time >= race_message.length) {
				race_message = new new_race_message();
			}
		}
	}
}