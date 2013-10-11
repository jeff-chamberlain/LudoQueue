var players = {},
	player_count = 0;

function player(new_name) {
	this.name = new_name;
	
	var r = Math.floor(Math.random()*155+100);
	var g = Math.floor(Math.random()*155+100);
	var b = Math.floor(Math.random()*155+100);
	this.color = new RGBColor(r,g,b,0.5);
	
	ctx.font = '15pt Calibri';
	var min_width = ctx.measureText(this.name).width;
	this.radius = Math.random()*20 + min_width + 2;
	
	this.tap_count = 0;
	this.tiltFB = 0;
	this.tiltLR = 0;
	
	this.surfer = new create_surfer(this.color, this.name, this.radius);
	this.balancer = new create_balancer(this.color, this.name, this.radius);
	this.racer = new create_racer(this.color, this.name, this.radius);
	
	var update_wait = function() {};
	
	var update_surf = function() {
		this.surfer.vx = (this.tiltLR / 5);
		this.surfer.vy = (-this.tiltFB / 5);
	}
	
	var update_balance = function() {
		this.balancer.angle += (this.tiltLR / 50);
	}
	
	var update_race = function() {
		this.racer.taps  = tap_count;
	}
	
	this.change_state = function(new_state) {
		switch(new_state) {
			case "surf":
				this.update = update_surf;
				break;
			case "balance":
				this.update = update_balance;
				break;
			case "race":
				this.update = update_race;
				break;
		}
	}
	
	if(game_state == "surf" ) {
		this.update = update_surf;
	}
	else {
		this.update = update_wait;
	}
}

function RGBColor(_r,_g,_b,_a) {
	this.r = _r;
	this.g = _g;
	this.b = _b;
	this.a = _a;
	this.is = function() {
		var ret = "rgba("+this.r+", "+this.g+", "+this.b+", "+this.a+")";
		return ret;
	}
}