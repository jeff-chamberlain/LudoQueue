function snowfight() {
	var ctx = queue_module.ctx,
		scaleW = queue_module.W/1920,
		scaleH = queue_module.H/1080,
		logo = queue_module.images.logo,
		bg = queue_module.images.bg_snowfight,
		tilt = queue_module.images.anims.tilt.playLoop(Date.now(), 2000),
		tap = queue_module.images.anims.tap.playLoop(Date.now(), 1000),
		game = this,
		game_over = false,
		f = new fadeIn(Date.now());
		
		this.play = f.draw;
		
			
	var gameplay = function() {
		ctx.save();
		ctx.scale(scaleW, scaleH);
		ctx.drawImage(bg, 0, 0, 1920, 1080);
		if(queue_module.winner) {
			var winner = queue_module.winner;
			ctx.save();
			ctx.translate(960,540);
			var text = winner.name + ' Wins!';
			ctx.fillStyle = winner.color;
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1;
			ctx.font = '150pt Calibri';
			var box_width = ctx.measureText(text).width + 50;
			roundRect(ctx, -box_width/2, -100, box_width, 200, 40);
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = 'white';
			ctx.fillText(text,0,0);
			ctx.restore();
		}
		else {
			ctx.save();
			ctx.translate(960, 300);
			ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
			roundRect(ctx, -725, -75, 1450, 150);
			ctx.font = '50pt Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = 'rgb(34,120,170)';
			ctx.fillText('GOAL',0,-35);
			ctx.font = '40pt Arial';
			ctx.fillText('Get the highest score by hitting the snowmen with snowballs!',0,35);
			ctx.translate(0, 400);
			ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
			roundRect(ctx, -725, -200, 1450, 400);
			ctx.font = '50pt Arial';
			ctx.fillStyle = 'rgb(34,120,170)';
			ctx.fillText('CONTROLS',0,-160);
			ctx.font = '30pt Arial';
			ctx.fillStyle = 'rgb(34,120,170)';
			ctx.fillText('Tilt to aim your snow cannon',-350,-90);
			ctx.drawImage(tilt.play(),-600,-44);
			drawArrow(ctx, -350, -15, 12, 50);
			ctx.drawImage(tap.play(), 150,-83);
			ctx.fillText('Tap to fire',350, -90);
			drawArrow(ctx, 350, -15, 12, 50);
			ctx.fillText('Smaller snowmen are',0, -20);
			ctx.fillText('worth more points!',0, 25);
			ctx.fillStyle = 'rgb(209,32,39)';
			drawArrow(ctx, 450, -587.5, 87.5, 900, -Math.PI/2);
			ctx.restore();
		}
		ctx.restore();
	}
	
	this.endGame = function() {
		if(!game_over) {
			game_over = true;
			var f = new fadeOut(Date.now());
			this.play = f.draw;
		}
	}
	
	function fadeIn(time) {
		this.draw = function() {
			var t = (Date.now() - time) / 2500;
			var a = xLerp(0,1,t);
			ctx.save();
			ctx.scale(scaleW, scaleH);
			ctx.globalAlpha = 1;
			ctx.fillStyle = 'white';
			ctx.fillRect(0,0,1920,1080);
			ctx.drawImage(logo,0,0);
			ctx.restore();
			if(t >= 1) {
				ctx.globalAlpha = 1;
				game.play = gameplay;
			}
			else {
				ctx.globalAlpha = a;
			}
			gameplay();
		}
	}
	
	function fadeOut() {
		var time = Date.now(),
			winner_displayed = false;
		
		this.draw = function() {
			var t = (Date.now() - time) / 2500;
			var a = xLerp(1,0,t);
			ctx.save();
			ctx.scale(scaleW, scaleH);
			ctx.globalAlpha = 1;
			ctx.fillStyle = 'white';
			ctx.fillRect(0,0,1920,1080);
			ctx.drawImage(logo,0,0);
			ctx.restore();
			if(t >= 1) {
				ctx.globalAlpha = 1;
				queue_module.game_manager.nextGame();
			}
			else {
				ctx.globalAlpha = a;
				gameplay();
			}
		}
	}
}