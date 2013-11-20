var canvas,
	ctx,
	W,
	H,
	color,
	orien;

function create_draw() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	W = window.innerWidth;
	H = window.innerHeight;
	
	var anim_index = 0;
	var anim_switch = 0;
	var anim_check = 0;
	var surf_anim = [
		anim_set(images.neutral,0,0,images.grinder,0,0,1000),
		anim_set(images.tiltL,0,0,images.grinder,-50,0,1000),
		anim_set(images.neutral,0,0,images.grinder,-50,0,1000),
		anim_set(images.tiltR,0,0,images.grinder,0,0,1000),
		anim_set(images.neutral,0,0,images.grinder,0,0,1000),
		anim_set(images.tiltB,0,0,images.grinder,0,-50,1000),
		anim_set(images.neutral,0,0,images.grinder,0,-50,1000),
		anim_set(images.tiltF,0,0,images.grinder,0,0,1000),
		anim_set(images.neutral,0,0,images.grinder,0,0,1000),
		anim_set(images.tapU,0,0,images.grinderB,0,0,1000),
		anim_set(images.tapD,0,0,images.grinderG,0,0,1000),
		anim_set(images.tapU,0,0,images.grinderB,0,0,1000),
		anim_set(images.tapD,0,0,images.grinderG,0,0,1000),
	];
	var bal_anim = [
		anim_set(images.pourU,0,0,images.pour1,0,0,1000),
		anim_set(images.pourD,0,0,images.pour2,0,0,1000),
		anim_set(images.pourU,0,0,images.pour3,0,0,1000),
		anim_set(images.pourD,0,0,images.pour4,0,0,1000),
		anim_set(images.pourD,0,0,images.pour5,0,0,1000),
		anim_set(images.tapU,0,0,images.pour6,0,0,1000),
		anim_set(images.tapD,0,0,images.pourC,0,0,1000),
		anim_set(images.tapD,0,0,images.pourX1,0,0,1000),
		anim_set(images.tapD,0,0,images.pourX2,0,0,1000),
		anim_set(images.tapD,0,0,images.pourC,0,0,1000),
	];
	var race_anim = [
		anim_set(images.tapU,0,0,images.maker,0,0,1000),
		anim_set(images.tapD,0,0,images.race1,0,0,1000),
		anim_set(images.tapU,0,0,images.race1,0,0,1000),
		anim_set(images.tapD,0,0,images.race2,0,0,1000),
		anim_set(images.tapU,0,0,images.race2,0,0,125),
		anim_set(images.tapD,0,0,images.race2,0,0,125),
		anim_set(images.tapU,0,0,images.race2,0,0,125),
		anim_set(images.tapD,0,0,images.race3,0,0,125),
		anim_set(images.tapU,0,0,images.race3,0,0,125),
		anim_set(images.tapD,0,0,images.race3,0,0,125),
		anim_set(images.tapU,0,0,images.race3,0,0,125),
		anim_set(images.tapD,0,0,images.race4,0,0,125),
		anim_set(images.tapU,0,0,images.race4,0,0,125),
		anim_set(images.tapD,0,0,images.race4,0,0,125),
		anim_set(images.tapU,0,0,images.race4,0,0,125),
		anim_set(images.tapD,0,0,images.race5,0,0,1000),
	];
	
	window.addEventListener("resize", function() {
		W = window.innerWidth;
		H = window.innerHeight;	
		canvas.width = W;
		canvas.height = H;
		if(game.overlay.menu != null) {
			game.overlay.menu[0].style.top = H/2+'px';
		}
	}, false);
	window.addEventListener("orientationchange", function() {
		if(window.orientation == 0 || window.orientation == 180) {
			anim_switch = 0;
		}
		else {
			anim_switch = 1;
		}
	}, false);
	this.init = function() {
		canvas.width = W;
		canvas.height = H;
		if(window.orientation == 0 || window.orientation == 180) {
			anim_switch = 0;
		}
		else {
			anim_switch = 1;
		}
		anim_check = Date.now();
	};
	
	this.play = function() { 
		this.state();
	};
	
	this.temp_state = function() {};
	
	var new_state;
	var tran_start;
	
	this.change_state = function(new_state_string) {
		switch(new_state_string) {
			case "waiting":
				new_state = waiting;
				break;
			case "surfing":
				new_state = surfing;
				break;
			case "racing":
				new_state = racing;
				break;
			case "balancing":
				new_state = balancing;
				break;
		}
		if( this.state == transition ) {
			this.temp_state = function(){};
		}
		else {
			this.temp_state = this.state;
		}
		transition_time = Date.now();
		transition_down = false;
		transition_alph = 0;
		this.state = transition;
	};
	
	this.spinner = new create_spinner();
	
	this.waiting_message = 'Please enter your name';
	var waiting_message_time = Date.now();
	
	var waiting = function() {
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
		ctx.fillRect(0, 0, W, H);
		ctx.globalCompositeOperation = "lighter";
		this.spinner.draw(W/2, H-15);
		
		if(Date.now() - waiting_message_time < 2000 ) {
			ctx.font = '20pt Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = "top";
			ctx.fillStyle = 'white';
			ctx.fillText(this.waiting_message, W/2, 50);
		}
		else if(Date.now() - waiting_message_time > 4000 ) {
			waiting_message_time = Date.now();
		}

	};
	
	var surfing = function() {
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, W, H);
		animate(surf_anim);
	};
	
	var racing = function() {
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, W, H);
		animate(race_anim);
	};
	
	var balancing = function() {
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, W, H);
		animate(bal_anim);
	};
	
	var transition_down = false;
	var transition_alph = 0;
	var transition_time;
	
	var transition = function() {
		if( !transition_down ) {
			transition_alph += ( Date.now() - transition_time ) / 500;
			this.temp_state();
			ctx.globalCompositeOperation = "source-over";
			ctx.fillStyle = "rgba(0, 0, 0, "+transition_alph+")";
			ctx.fillRect(0, 0, W, H);
			if( transition_alph >= 1 ) {
				this.temp_state = new_state;
				transition_alph = 1;
				transition_down = true;
				anim_index = 0;
				anim_check = Date.now();
				waiting_message_time = Date.now();
			}
		}
		else {
			if( transition_alph <= 0 ) {
				this.state = new_state;
				transition_down = false;
				transition_alph = 0;
			}
			else {
				transition_alph -= ( Date.now() - transition_time ) / 500;
				this.temp_state();
				ctx.globalCompositeOperation = "source-over";
				ctx.fillStyle = "rgba(0, 0, 0, "+transition_alph+")";
				ctx.fillRect(0, 0, W, H);
			}
		}
		transition_time = Date.now();
	};
	
	this.state = function(){};
	
	function animate(anim_array) {
		var rat = (W/2)/400;
		var length = anim_array[anim_index]['length'];
		var t = (Date.now() - anim_check)/length;
		if(anim_switch == 1) {
			var cont_x = W/4;
			var cont_y = H/2;
			var res_x = (3*W)/4;
			var res_y = H/2;
		}
		else {
			var cont_x = W/2;
			var cont_y = (3*H)/4;
			var res_x = W/2;
			var res_y = H/4;
		}
		var cont = anim_array[anim_index]['cont'];
		var res = anim_array[anim_index]['res'];
		if(anim_index == 0) {
			var cont_xy = {'x': cont.x, 'y': cont.y };
			var res_xy = {'x': res.x, 'y': res.y };
		}
		else {
			var cont_prev = anim_array[anim_index-1]['cont'];
			var cont_xy = xyLerp(cont_prev.x,cont.x,cont_prev.y,cont.y,t);
			var res_prev = anim_array[anim_index-1]['res'];
			var res_xy = xyLerp(res_prev.x,res.x,res_prev.y,res.y,t);
		}
		var cont_hig = (cont.source.height/cont.source.width)*300;
		var res_hig = (res.source.height/res.source.width)*300;
		ctx.save();
		ctx.transform(rat,0,0,rat,cont_x,cont_y);
		ctx.drawImage(cont.source,cont_xy['x']-150,cont_xy['y']-(cont_hig/2),300,cont_hig);
		ctx.restore();
		ctx.save();
		ctx.transform(rat,0,0,rat,res_x,res_y);
		ctx.drawImage(res.source,res_xy['x']-150,res_xy['y']-(res_hig/2),300,res_hig);
		ctx.restore();
		if(t >= 1) {
			anim_index ++;
			if(anim_index >= anim_array.length) {
				anim_index = 0;
			}
			anim_check = Date.now();
		}
	}
}

function create_spinner() {
	this.angle = 0;
	this.rad = 5;
	this.last_time = Date.now();
	
	this.draw = function(X,Y) {
		ctx.beginPath();
		var spin_x = X + Math.cos(this.angle)*this.rad;
		var spin_y = Y + Math.sin(this.angle)*this.rad;
		var gradient = ctx.createRadialGradient(spin_x, spin_y, 0, spin_x, spin_y, this.rad);
		gradient.addColorStop(0, "white");
		gradient.addColorStop(1, "black");
		ctx.fillStyle = gradient;
		ctx.arc(spin_x, spin_y, this.rad, Math.PI*2, false);
		ctx.fill();
		ctx.closePath();
		this.angle += ( ( Date.now() - this.last_time ) / 500 ) * Math.PI;
		if( this.angle > Math.PI*2 ) {
			this.angle -= Math.PI*2;
		}
		this.last_time = Date.now();
	};
}

function anim_set(cont_source,cont_x,cont_y,res_source,res_x,res_y,length) {
	return { 'cont': new anim(cont_source,cont_x,cont_y), 'res': new anim(res_source,res_x,res_y), 'length': length };
}
function anim(this_source,this_x,this_y) {
	this.x = this_x;
	this.y = this_y;
	this.source = this_source;
}

function xyLerp( x0, x1, y0, y1, t ) {
	var x00 = (x0*(1-t))+ (x1*t);
	var y00 = (y0*(1-t))+ (y1*t);
	return {'x': x00, 'y':y00};
}