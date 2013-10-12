var canvas,
	ctx,
	W,
	H,
	color;

function create_draw() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	W = window.innerWidth;
	H = window.innerHeight;
	window.addEventListener("resize", function() {
		W = window.innerWidth;
		H = window.innerHeight;	
		canvas.width = W;
		canvas.height = H;
	}, false);
	
	this.init = function() {
		canvas.width = W;
		canvas.height = H;
	};
	
	this.play = function() { this.state(); };
	
	this.temp_state = function() {};
	
	var new_state;
	var tran_start;
	
	this.change_state = function(new_state_string) {
		this.temp_state = this.state;
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
		if( this.temp_state != transition ) {
			this.state = transition;
			transition_time = Date.now();
		}
		else {
			var transition_down = false;
			var transition_alph = 0;
			this.state = new_state;
		}
	};
	
	this.spinner = new create_spinner();
	
	var waiting = function() {
		this.spinner.draw(W/2, H*4/5);
	};
	
	var surfing = function() {
		ctx.beginPath();
		var gradient = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 100);
		gradient.addColorStop(0, "white");
		gradient.addColorStop(0.5, color);
		gradient.addColorStop(1, "black");
	
		ctx.fillStyle = gradient;
		ctx.arc(W/2, H/2, 100, Math.PI*2, false);
		ctx.fill();
	};
	
	var racing = function() {
		ctx.font = '15pt Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = "middle";
		ctx.fillStyle = "white";
		ctx.fillText("Racing", W/2, H/2);
	};
	
	var balancing = function() {
		ctx.beginPath();
		ctx.strokeStyle = "white";
		ctx.lineWidth = "10";
		ctx.moveTo(W/4,H/2);
		ctx.lineTo(3*W/4,H/2);
		ctx.stroke();
	};
	
	var transition_down = false;
	var transition_alph = 0;
	var transition_time;
	
	var transition = function() {
		if( !transition_down ) {
			transition_alph += ( Date.now() - transition_time ) / 1500;
			this.temp_state();
			ctx.globalCompositeOperation = "source-over";
			ctx.fillStyle = "rgba(0, 0, 0, "+transition_alph+")";
			ctx.fillRect(0, 0, W, H);
			if( transition_alph >= 1 ) {
				this.temp_state = new_state;
				transition_alph = 1;
				transition_down = true;
			}
		}
		else {
			if( transition_alph <= 0 ) {
				this.state = new_state;
				transition_down = false;
				transition_alph = 0;
			}
			else {
				transition_alph -= ( Date.now() - transition_time ) / 1500;
				this.temp_state();
				ctx.globalCompositeOperation = "source-over";
				ctx.fillStyle = "rgba(0, 0, 0, "+transition_alph+")";
				ctx.fillRect(0, 0, W, H);
			}
		}
		transition_time = Date.now();
	};
	
	this.state = function(){};
	
}

function create_spinner() {
	this.angle = 0;
	this.rad = 5;
	this.last_time = Date.now();
	
	this.draw = function(X,Y) {
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
		ctx.fillRect(0, 0, W, H);
		ctx.globalCompositeOperation = "lighter";
		
		ctx.beginPath();
		var spin_x = X + Math.cos(this.angle)*this.rad;
		var spin_y = Y + Math.sin(this.angle)*this.rad;
		var gradient = ctx.createRadialGradient(spin_x, spin_y, 0, spin_x, spin_y, this.rad);
		gradient.addColorStop(0, color);
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