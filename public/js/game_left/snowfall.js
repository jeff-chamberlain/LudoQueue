function snowfall() {
	var ctx = queue_module.ctx,
		scaleW = queue_module.W/1920,
		scaleH = queue_module.H/1080,
		logo = queue_module.images.logo,
		swipe = queue_module.images.anims.swipe.playLoop(Date.now(), 1000),
		bg = queue_module.images.bg_snowfall,
		game = this,
		game_over = false,
		f = new fadeIn(Date.now());
		
		this.play = f.draw;

	var gameplay = function() {
		ctx.save();
		ctx.scale(scaleW, scaleH);
		ctx.drawImage(bg, 0, 0, 1920, 1080);
		ctx.save();
		ctx.translate(960, 300);
		ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
		roundRect(ctx, -400, -75, 800, 150, 50);
		ctx.font = '50pt Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = 'rgb(34,120,170)';
		ctx.fillText('GOAL',0,-35);
		ctx.font = '40pt Arial';
		ctx.fillText('Move the snowflakes!',0,35);
		ctx.translate(0, 400);
		ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
		roundRect(ctx, -400, -200, 800, 400, 50);
		ctx.font = '50pt Arial';
		ctx.fillStyle = 'rgb(34,120,170)';
		ctx.fillText('CONTROLS',0,-160);
		ctx.font = '30pt Arial';
		ctx.fillStyle = 'rgb(34,120,170)';
		ctx.fillText('Swipe to blow a snowflake',0,-90);
		ctx.drawImage(swipe.play(),-250,-86);
		drawArrow(ctx, 0, -15, 12, 50);
		ctx.fillStyle = 'rgb(209,32,39)';
		drawArrow(ctx, 450, -587.5, 87.5, 900, -Math.PI/2);
		ctx.restore();
		
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
	
	function fadeOut(time) {
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
				queue_module.game_manager.nextGame();
			}
			else {
				ctx.globalAlpha = a;
				gameplay();
			}
		}
	}
}