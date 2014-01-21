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
	
	window.addEventListener("resize", function() {
		W = window.innerWidth;
		H = window.innerHeight;	
		canvas.width = W;
		canvas.height = H;
		if(game.overlay.menu != null) {
			game.overlay.menu[0].style.top = H/2+'px';
		}
	}, false);
	this.init = function() {
		canvas.width = W;
		canvas.height = H;
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
	
	this.waiting_message = 'Please sign in';
	var waiting_message_time = Date.now();
	
	var waiting = function() {
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
		ctx.fillRect(0, 0, W, H);
		ctx.globalCompositeOperation = "lighter";
		this.spinner.draw(W/2, H-15);
		
		if(Date.now() - waiting_message_time < 2000 ) {
			ctx.font = '40px Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.lineWidth = 4;
			ctx.strokeStyle = 'black';
			ctx.fillStyle = 'white';
			wrapText(this.waiting_message, W/2, 50, W, 45);
		}
		else if(Date.now() - waiting_message_time > 4000 ) {
			waiting_message_time = Date.now();
		}

	};
	
	var surfing = function() {
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, W, H);
		show_disp();
	};
	
	var racing = function() {
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, W, H);
		show_disp();
	};
	
	var balancing = function() {
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, W, H);
		show_disp();
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
function show_disp() {
	if( H > W ) {
		var logo_hig = W*(images.logo.height/images.logo.width);
		ctx.drawImage(images.logo,0,(H/2)-(logo_hig/2),W,logo_hig);
	}
	else {
		var logo_wid = H*(images.logo.width/images.logo.height);
		ctx.drawImage(images.logo,(W/2)-(logo_wid/2),0,logo_wid,H);
	}
	ctx.font = '40px Calibri';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'top';
	ctx.lineWidth = 4;
	ctx.strokeStyle = 'black';
	ctx.strokeText(name,W/2,H/2-20);
	ctx.fillStyle = 'white';
	ctx.fillText(name,W/2,H/2-20);
	//wrapText("Turn your volume up!",W/2,0,W,45);
}

function wrapText(text, x, y, maxWidth, lineHeight) {
	var words = text.split(' ');
	var line = '';

	for(var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + ' ';
		var metrics = ctx.measureText(testLine);
		var testWidth = metrics.width;
		if (testWidth > maxWidth && n > 0) {
			ctx.strokeText(line, x, y);
			ctx.fillText(line, x, y);
			line = words[n] + ' ';
			y += lineHeight;
		}
		else {
			line = testLine;
		}
	}
	ctx.strokeText(line, x, y);
	ctx.fillText(line, x, y);
}