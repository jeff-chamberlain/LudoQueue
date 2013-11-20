var surfers = {},
	beans = [],
	bean_count = 20,
	grounds_level = 0,
	grounds_target = 1;
	
var surf = function() {
	ctx.globalCompositeOperation = "source-over";
	ctx.drawImage(images.bg,0,0,W,H);
	
	var grounds_y = (grounds_level/grounds_target)*H;
	var grounds_height = (images.grounds.height/images.grounds.width)*W;
	ctx.drawImage(images.grounds,0,H-grounds_y,W,grounds_height);
	
	for(var id in players)
	{
		var s = players[id].surfer;
		s.draw();
	}
	for(var i=beans.length-1;i>=0;i--)
	{
		beans[i].draw();
	}
	var beanDiff = bean_count - beans.length;
	for(var i=0;i<beanDiff;i++) {
		var bean = new create_bean();
		beans.push(bean);
	}
	if(grounds_level >= grounds_target && game_state == 'surf') {
		change_state("race");
	}
}

var surf_init = function() {
	console.log('surf init');
	grounds_level = 0;
	for(var i=0;i<bean_count;i++) {
		var bean = new create_bean();
		beans.push(bean);
	}
	socket.emit('game_state_change','surfing');
}


function create_surfer(col,nam,rad) {
	var x = Math.random()*W;
	var y = Math.random()*H;
	var width = images.grinder.width;
	var height = images.grinder.height;
	
	this.vx = 0;
	this.vy = 0;
	
	var color = col;
	color.a=1;
	
	var pulse_draw = false;
	var pulse_time = 0;
	
	this.pulse = function() {
		if(!pulse_draw) {
			pulse_draw = true;
			pulse_time = Date.now();
		
			for(var i=beans.length-1;i>=0;i--) {
				var bean = beans[i];
				var dist = Math.abs(Math.sqrt(Math.pow(x-bean.x,2)+Math.pow(y-bean.y,2)));
				if( dist < 50) {
					bean.ground = true;
					break;
				}
			}
		}
	}
	
	this.draw = function() {
		if(pulse_draw) {
			ctx.save();
			ctx.translate(x,y);
			var timeDiff = Date.now()-pulse_time;
			var rot = (2*Math.PI) - ((timeDiff/0.5)%(2*Math.PI));
			ctx.rotate(rot);
			ctx.drawImage(images.grinder,-(width/2),-(height/2),100,100);
			ctx.restore();
			if(timeDiff >= 1000) {
				pulse_draw = false;
			}
		}
		else {
			ctx.drawImage(images.grinder,x-(width/2),y-(height/2),100,100);
		}
		
		ctx.beginPath();
		ctx.arc(x,y,15,Math.PI*2,false);
		ctx.fillStyle = color.is();
		ctx.fill();
		
		x += this.vx;
		y += this.vy;
	
		if(x < -50) x = W+50;
		if(y < -50) y = H+50;
		if(x > W+50) x = -50;
		if(y > H+50) y = -50;
	}
	
}

function create_bean() {
	this.ground = false;
	this.x = Math.random()*W;
	this.y = -30-(Math.random()*H);
	var drawTime = Date.now();
	var rand = Math.floor(Math.random()*4);
	var beanImg;
	switch(rand) {
		case 0:
			beanImg = images.bean1;
			break;
		case 1:
			beanImg = images.bean2;
			break;
		case 2:
			beanImg = images.bean3;
			break;
		default:
			beanImg = images.bean4;
			break;
	}
	var width = beanImg.width;
	var height = beanImg.height;
	
	var grinds = [];
	var grind_time = 0;
	
	this.draw = function() {
		if(this.ground) {
			if(grinds.length==0) {
				grind_time = Date.now();
				for(var i=0;i<20;i++) {
					var grind = new create_grind(this.x,this.y);
					grinds.push(grind);
				}
			}
			for(var i=0;i<grinds.length;i++) {
				grinds[i].draw();
			}
			if(Date.now()-grind_time>2500) {
				this.remove();
				grounds_level ++;
			}
		}
		else {
			ctx.drawImage(beanImg,this.x-(width/2),this.y-(height/2));
			this.y += ((Date.now() - drawTime)/1000) * 100;
			drawTime = Date.now();
			if( this.y >= H+30 ) {
				this.remove();
			}
		}
	}
	
	function create_grind(bean_x,bean_y){
		var grind_x = bean_x;
		var grind_y = bean_y;
		var dx = -1+(Math.random()*2);
		var dy = -1+(Math.random()*2);
	
		this.draw = function() {
			ctx.beginPath();
			ctx.fillStyle = 'rgb(124,88,82)';
			ctx.arc(grind_x, grind_y, 2.5, Math.PI*2, false);
			ctx.fill();
			grind_x += dx;
			grind_y += dy;
		}
	}
	
	this.remove = function() {
		var index = beans.indexOf(this);
		if(index != -1) {
			beans.splice(index,1);
		}
	}
}