function taprhythm() {
	var ctx = queue_module.ctx,
		scaleW = queue_module.W/1920,
		scaleH = queue_module.H/1080,
		logo = queue_module.images.logo,
		robo_dj1 = queue_module.images.anims.robo_dance_1,
		robo_dj2 = queue_module.images.anims.robo_dance_2,
		robo_anim = null,
		game_players = [],
		loopTime = 0,
		intervalIndex = 0,
		intervalTime = 0,
		beats = [],
		eyeFlash = new flash(),
		song = queue_module.images.audio.tap_song,
		leaderboard = {},
		leader = null,
		winner = {},
		game = this,
		game_over = false,
		f = new fadeIn(Date.now());
		
		this.play = f.draw;
		
	queue_module.input_state = {
		tap : false,
		tiltFB : false,
		tiltLR : false,
		swype : false,
		rhythm : true
	};
	queue_module.socket.emit('new_input_state', queue_module.input_state);
	
	var staticGame = function() {
		ctx.save();
		
		ctx.scale(scaleW, scaleH);
		ctx.fillStyle = 'rgb(0,0,0)';
		ctx.fillRect(0,0,1920,1080);
		ctx.save();
		ctx.translate(590,200);
		ctx.drawImage(robo_dj1.frames[0],0,0);
		ctx.restore();
		ctx.save();
		ctx.translate(960,540);
		ctx.fillStyle = 'rgb(255,0,0)';
		ctx.beginPath();
		ctx.arc(0,0,100,0,2*Math.PI,false);
		ctx.fill();
		ctx.closePath();
		ctx.beginPath();
		ctx.strokeStyle ='rgb(255,255,255)';
		ctx.lineWidth = 5;
		ctx.arc(0,0,350,0,2*Math.PI,false);
		ctx.stroke();
		ctx.closePath();
		ctx.restore();
		
		ctx.restore();
	}
	var gameplay = function() {
		ctx.save();
		ctx.scale(scaleW, scaleH);
		ctx.fillStyle = 'rgb(0,0,0)';
		ctx.fillRect(0,0,1920,1080);
		ctx.save();
		ctx.translate(590,200);
		var frame = robo_anim.play();
		if(!frame) {
			if(Math.random() > 0.5) {
				robo_anim = robo_dj1.playOneShot(Date.now(),1000);
			}
			else {
				robo_anim = robo_dj2.playOneShot(Date.now(),1000);
			}
			frame = robo_anim.play();
		}
		ctx.drawImage(frame,0,0);
		ctx.restore();
		ctx.save();
		ctx.translate(960,540);
		drawBeats();
		ctx.fillStyle = 'rgb(255,0,0)';
		ctx.beginPath();
		ctx.arc(0,0,100,0,2*Math.PI,false);
		ctx.fill();
		ctx.closePath();
		ctx.beginPath();
		ctx.strokeStyle ='rgb(255,255,255)';
		ctx.lineWidth = 5;
		ctx.arc(0,0,350,0,2*Math.PI,false);
		ctx.stroke();
		ctx.closePath();
		eyeFlash.draw();
		ctx.restore();
		if(!game_over) {
			if(leader) {
				leaderboard[leader].time += Date.now()-loopTime;
			}
			if( queue_module.player_count !== game_players.length ) {
				managePlayers();
			}
			for(var i=game_players.length-1; i>=0; i--) {
				var id = game_players[i];
				if(queue_module.players.hasOwnProperty(id)) {
					var p = queue_module.players[id];
					leaderboard[id].ave = p.rhythm;
				}
				else {
					game_players.splice(i,1);
					if(leaderboard.hasOwnProperty(id)) {
						delete leaderboard[id];
					}
					if(leader = id) {
						leader = null;
					}
				}
			}
		}
		showScores();
		loopTime = Date.now();
		ctx.restore();
	}
	
	
	function managePlayers() {
		for( var id in queue_module.players ) {
			var p = queue_module.players[id];
			if(game_players.indexOf(id) < 0 ) {
				console.log('Adding new player ' + id );
				game_players.push(id);
				var new_rhythm = {
					index : intervalIndex,
					intervals : intervals,
				}
				p.rhythm = 'Calibrating...';
				leaderboard[id] = {name: p.name, color: p.color, ave: 'Calibrating...', time: 0};
				queue_module.socket.emit('player_init_rhythm', { id : id, rhythm : new_rhythm });
			}
		}
	}
	
	function showScores() {
		var score_arr = [],
			time_arr = [];
			
		for(var id in leaderboard) {
			var s = leaderboard[id];
			score_arr.push({id: id, name: s.name, color: s.color, value: s.ave, score:(isNaN(s.ave)) ? s.ave : Math.floor(s.ave) +'ms off'});
			time_arr.push({name: s.name, color: s.color, value: s.time, score:msToTime(s.time)});
		}
		score_arr.sort(scoreSort);
		if(score_arr.length > 0) {
			if(!isNaN(score_arr[0].value) && score_arr[0].id !==leader) {
				leader = score_arr[0].id;
			}
		}
		time_arr.sort(timeSort);
		
		drawLeaderboard(295,550,time_arr,'Time as Leader');
		drawLeaderboard(1625,550,score_arr,'Recent Average');
		
	}
	
	function determineWinner() {
		var time_arr = [];
		for(var id in leaderboard) {
			var s = leaderboard[id];
			time_arr.push({name: s.name, color: s.color, value: s.time});
		}
		time_arr.sort(timeSort);
		if(time_arr[0] && time_arr[0].value > 0) {
			var w = time_arr[0];
			winner.name = w.name;
			winner.color = w.color;
		}
		else {
			winner.name = 'No One';
			winner.color = 'rgb(100,100,100)';
		}
	}
	
	var scoreSort = function(a,b) {
		if(isNaN(a.value) || isNaN(b.value)) {
			console.log('NAN');
			if(isNaN(a.value) && isNaN(b.value)) {
				return 0;
			}
			else if(isNaN(a.value)) {
				return 1;
			}
			else {
				return -1;
			}
		}
		else {
			return a.value - b.value;
		}
	}
	
	var timeSort = function(a,b) {
		return b.value - a.value;
	}
	
	function drawBeats() {
		if( intervalTime - Date.now() <= 1000 ) {
			beats.push(new beat(intervalTime));
			intervalIndex ++;
			if(intervalIndex >= intervals.length) {
				game.endGame();
			}
			intervalTime += intervals[intervalIndex];
		}
		for(var i = beats.length - 1; i >= 0; i --) {
			beats[i].draw();
		}
	}
	
	function beat(hit) {
		var color = /*'rgba(0,255,0,.5)';*/'rgba('+(50+Math.floor(Math.random()*200))+','+(50+Math.floor(Math.random()*200))+','+(50+Math.floor(Math.random()*200))+',0.5)';
		this.draw = function() {
			var t = (1000 - (hit - Date.now())) / 1000;
			if( t < 1 ) {
				var rad  = xLerp(350,100,t);
				var wid = xLerp(5,15,t);
				ctx.beginPath();
				ctx.strokeStyle = color;
				ctx.lineWidth = wid;
				ctx.arc(0,0,rad,0,2*Math.PI,false);
				ctx.stroke();
				ctx.closePath();
			}
			else {
				eyeFlash.hit(color,hit);
				beats.splice(0,1);
			}
		}
	}
	
	function flash() {
		var hitTime = 0,
		hitColor = null;
		
		this.draw = function() {
			var t = (Date.now() - hitTime) / 250;
			if( t < 1 ) {
				var rad  = xLerp(200,100,t);
				var grd = ctx.createRadialGradient(0,0,100,0,0,rad);
				grd.addColorStop(0, hitColor);
				grd.addColorStop(1, 'rgba(0,0,0,0)');
				ctx.fillStyle = grd;
				ctx.beginPath();
				ctx.arc(0,0,rad,0,2*Math.PI,false);
				ctx.fill();
				ctx.closePath();
			}
		}
		this.hit = function(color,time) {
			hitTime = time;
			hitColor = 'rgb(255,0,0)';
		}
	}
	
	this.endGame = function() {
		if(!game_over) {
			game_over = true;
			determineWinner();
			queue_module.socket.emit('winner',winner);
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
				loopTime =  Date.now();
				intervalTime = Date.now() + intervals[0];
				song.play();
				song.currentTime = 0.0;
				song.oncanplaythrough = function() {
					robo_anim = (Math.random() > 0.5) ? robo_dj1.playOneShot(Date.now(),1000) : robo_dj2.playOneShot(Date.now(),1000);
					game.play = gameplay;
				}
			}
			else {
				ctx.globalAlpha = a;
			}
			staticGame();
		}
	}
	
	function fadeOut() {
		var time = Date.now(),
			winner_displayed = false;
		
		this.draw = function() {
			if(!winner_displayed) {
				var t = (Date.now() - time) / 4000;
				gameplay();
				drawWinner();
				if(t >= 1) {
					winner_displayed = true;
					time = Date.now();
					queue_module.socket.emit('advance_game');
				}
			}
			else {
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
					ctx.globalALpha = 1;
					song.pause();
					queue_module.game_manager.nextGame();
				}
				else {
					ctx.globalAlpha = a;
					gameplay();
					drawWinner();
				}
			}
		}
		
		function drawWinner() {
			ctx.save();
			ctx.scale(scaleW, scaleH);
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
	}
	
	function drawLeaderboard(x,max_width,scores,title) {
		var standings_list = [
			"1st",
			"2nd",
			"3rd",
			"4th",
			"5th",
			"6th",
			"7th",
			"8th",
			"9th",
			"10th"
			],
			standings_max = 10,
			start_diff = 0,
			width = 0,
			prev_score = null,
			standings_index = -1,
			display = [];
	
		ctx.font = '70px Calibri';
		for( var i=0, j=scores.length; i<j; i++) {
			if(standings_index < standings_max) {
				var s = scores[i];
				if(s.score === prev_score) {
					var line = 'T' + standings_list[standings_index] + ': ' + s.name + ' - ' + s.score;
				}
				else {
					standings_index ++;
					var line = standings_list[standings_index] + ': ' + s.name + ' - ' + s.score;
				}
				var w = ctx.measureText(line).width;
				if(w > width) {
					width = w;
				}
				prev_score = s.score;
				display[i] = { line: line, color: s.color };
			}
		}
	
		ctx.save();
		ctx.translate(x,540);
		var count = display.length;
		var height = count * 120;
		width += 200;
		if(height > 1000 || width > max_width) {
			var h_scale = 1000/(count*90),
				w_scale = max_width/width;
			var scale = h_scale;
			if(w_scale < h_scale) {
				scale = w_scale;
			}
			ctx.scale(scale,scale);
		}
		ctx.fillStyle= 'rgba(0,0,0,0.7)';
		ctx.fillRect(-width/2,-height/2,width,height);
		ctx.translate(0, -(90 * count)/2);
		ctx.font = '70px Calibri';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.lineWidth = 4;
		ctx.strokeStyle = 'black';
		ctx.strokeText(title,0,0);
		ctx.fillStyle = 'white';
		ctx.fillText(title,0,0);
		ctx.translate(0,90);
		for(var i=0; i<count; i++) {
			var item = display[i];
			ctx.strokeText(item.line,0,0);
			var name_grd = ctx.createLinearGradient(0,-50,0,50);
			name_grd.addColorStop(0, item.color);
			name_grd.addColorStop(1, 'rgb(255,255,255)');
			ctx.fillStyle = name_grd;
			ctx.fillText(item.line,0,0);
			ctx.translate(0,90);
		}
		ctx.restore();
	}

	intervals = [
			4036,
			1001,
			999,
			1000,
			250,
			751,
			998,
			1000,
			1001,
			248,
			750,
			1000,
			1001,
			998,
			250,
			750,
			750,
			2250,
			750,
			250,
			3999,
			750,
			2250,
			750,
			250,
			4001,
			374,
			375,
			1250,
			375,
			250,
			125,
			1250,
			375,
			375,
			1000,
			250,
			374,
			250,
			125,
			250,
			500,
			500,
			375,
			375,
			1000,
			250,
			375,
			250,
			125,
			1251,
			374,
			375,
			1000,
			250,
			375,
			250,
			125,
			250,
			499,
			500,
			500,
			500,
			500,
			250,
			250,
			499,
			500,
			500,
			498,
			501,
			500,
			249,
			250,
			250,
			248,
			251,
			250,
			250,
			250,
			2750,
			250,
			4001,
			249,
			250,
			250,
			250,
			3000,
			250,
			250,
			250,
			3250,
			750,
			750,
			750,
			750,
			500,
			2500,
			250,
			250,
			250,
			3251,
			248,
			250,
			250,
			5251,
			748,
			750,
			250,
			3250,
			250,
			250,
			250,
			251,
			6000,
			748,
			2251,
			748,
			250,
			4000,
			750,
			2250,
			750,
			251,
			3999,
		]
}