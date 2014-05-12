function draw() {
	var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"),
	W = window.innerWidth,
	H = window.innerHeight,
	tran_timeout = null,
	player_logo = player_module.images.player_logo;
	
	window.addEventListener("resize", function() {
		W = window.innerWidth;
		H = window.innerHeight;	
		canvas.width = W;
		canvas.height = H;
		current_draw();
	}, false);	
	
	canvas.width = W;
	canvas.height = H;
	
	var spinner = new create_spinner(),
		waiting_message_time = Date.now(),
		game_display = new gameplay_draws();
				
	var waiting = function() {
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.fillRect(0, 0, W, H);
		ctx.font = '40px Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.lineWidth = 4;
		ctx.strokeStyle = 'white';
		ctx.fillStyle = 'black';
		wrapText('Please sign in', W/2, 50, W, 45);
	};
	
	var current_draw = waiting,
		next_draw = null,
		tran_time = 0;
	waiting();
	
	var logging_in = function() {
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
		ctx.fillRect(0, 0, W, H);
		ctx.font = '40px Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.lineWidth = 4;
		ctx.strokeStyle = 'white';
		ctx.fillStyle = 'black';
		wrapText('Attempting to connect...', W/2, 50, W, 45);
		spinner.draw(W/2,H/2);
		if(!tran_timeout) {
			setTimeout(logging_in,33);
		}
	}
	
	var standby = function() {
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
		ctx.fillRect(0, 0, W, H);
		ctx.font = '40px Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		ctx.lineWidth = 4;
		ctx.strokeStyle = 'white';
		ctx.fillStyle = 'black';
		wrapText('Please wait for next game...', W/2, 50, W, 45);
		spinner.draw(W/2,H/2);
		if(!tran_timeout) {
			setTimeout(standby,33);
		}
	}
	
	var gameplay = function() {
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.fillRect(0, 0, W, H);
		show_disp();
		game_display.draw();
		if(!tran_timeout) {
			setTimeout(gameplay,33);
		}
	};
	
	this.change_state = function(state_string) {
		console.log(state_string);
		if(tran_timeout != null) {
			clearTimeout(tran_timeout);
		}
		switch(state_string) {
			case 'gameplay':
				next_draw = gameplay;
				game_display.changeDisplay('blank');
				break;
			case 'login':
				next_draw = logging_in;
				break;
			case 'standby':
				next_draw = standby;
				break;
			default:
				next_draw = waiting;
				break;
		}
		tran_time = Date.now();
		transition();
	};
	
	function transition() {
		var t = (Date.now() - tran_time)/1500;
		ctx.globalAlpha = xLerp(0,1,t);
		if(t >= 1) {
			clearTimeout(tran_timeout);
			tran_timeout = null;
			current_draw = next_draw;
		}
		else {
			tran_timeout = setTimeout(transition,33);
		}
		next_draw();
	}

	function create_spinner() {
		var angle = Math.PI,
			rad = 8,
			last_time = Date.now();
	
		this.draw = function(X,Y) {
			ctx.globalCompositeOperation = "darker";
			ctx.beginPath();
			var spin_x = X + Math.cos(angle)*rad;
			var spin_y = Y + Math.sin(angle)*rad;
			var gradient = ctx.createRadialGradient(spin_x, spin_y, 0, spin_x, spin_y, rad);
			gradient.addColorStop(0, "rgb(0,83,149)");
			gradient.addColorStop(1, "white");
			ctx.fillStyle = gradient;
			ctx.arc(spin_x, spin_y, rad, Math.PI*2, false);
			ctx.fill();
			ctx.closePath();
			if( Date.now() - last_time < 500 ) {
				angle += ( ( Date.now() - last_time ) / 500 ) * Math.PI;
				if( angle > Math.PI*2 ) {
					angle -= Math.PI*2;
				}
			}
			last_time = Date.now();
		};
	}
	
	function gameplay_draws() {
		var blank = function() {};
		
		var drawValue = function() {
			ctx.save();
			ctx.translate(W/2,2);
			ctx.font = '40px Calibri';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.lineWidth = 4;
			ctx.strokeStyle = 'black';
			ctx.strokeText(this.value,0,0);
			ctx.fillStyle = 'black';
			ctx.fillText(this.value,0,0);
			ctx.restore();
		}
		
		
		this.changeDisplay = function(new_disp) {
			switch(new_disp) {
				case 'value':
					this.draw = drawValue;
					break;
				default:
					this.draw = blank;
					break;
			}
		}
		
		this.value = 0;
		this.draw = blank;
	}
	
	this.change_game_display = function(new_disp) {
		game_display.changeDisplay(new_disp);
	}
	
	this.set_value = function(new_value) {
		game_display.value = new_value;
	}
	
	function show_disp() {
		if( H > W ) {
			var logo_hig = W*(player_logo.height/player_logo.width);
			ctx.drawImage(player_logo,0,(H/2)-(logo_hig/2),W,logo_hig);
		}
		else {
			var logo_wid = H*(player_logo.width/player_logo.height);
			ctx.drawImage(player_logo,(W/2)-(logo_wid/2),0,logo_wid,H);
		}
		ctx.font = '40px Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';
		ctx.lineWidth = 4;
		ctx.strokeStyle = 'black';
		ctx.strokeText(player_module.config.name,W/2,H-2);
		ctx.fillStyle = player_module.config.color;
		ctx.fillText(player_module.config.name,W/2,H-2);
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
}