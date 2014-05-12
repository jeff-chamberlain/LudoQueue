function xLerp( v0, v1, t ) {
	return (v0*(1-t))+ (v1*t);
}

function xyLerp( x0, x1, y0, y1, t ) {
	var x00 = (x0*(1-t))+ (x1*t);
	var y00 = (y0*(1-t))+ (y1*t);
	return {'x': x00, 'y':y00};
}

function clamp(min, max, val) {
	return Math.max(min, Math.min(max, val));
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

function create_grid( w, h, num ) {
	var wid = w;
	var hig = h;
	
	var sr_num = Math.sqrt(num);
	
	var rows = Math.round(sr_num);
	var cols = Math.ceil(sr_num);
	
	var bot_row = num % cols;
	var bot_cut = num - bot_row;
	
	var space_hig = (hig/rows);
	var space_wid = (wid/cols);
	var ent_hig = space_hig/2;
	var ent_wid = space_wid/2;
	
	this.getPos = function(pos) {
		
		var ent_col = pos%cols;
		var ent_row = Math.floor(pos/cols);
		var y = (ent_row * space_hig) + ent_hig;
		if(pos < bot_cut) {
			var x = (ent_col * space_wid) + ent_wid;
		}
		else {
			var x = ((ent_col * space_wid) + ent_wid) + ((cols-bot_row)*ent_wid);
		}
		var ret = { 'x':x, 'y':y, 'max':space_hig-10 };
		return ret;
	}
}
function timed_manager(this_func_array,callback) {
	var func_array = this_func_array;
	var interim_time = 0;
	var index = -1;
	var cur_length;
	var cur_interim;
	this.run = function() {
		if(index == -1) {
			interim_time = Date.now();
			index = 0;
			func_array[0].start();
			cur_length = func_array[0].length;
			cur_interim = func_array[0].interim;
		}
		var t = (Date.now() - interim_time)/cur_length;
		if(t>1) {
			index++;
			if(index >= func_array.length) {
				callback();
			}
			else {
				interim_time = Date.now();
				func_array[index].start();
				cur_length = func_array[index].length;
				cur_interim = func_array[index].interim;
			}
		}
		else {
			cur_interim(t);
		}
	}
}
function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  if( secs < 10 ) {
  	secs = '0'+secs;
  }
  
  return mins + ':' + secs;
}

function timed_func(this_length,this_start,this_interim) {
	this.length = this_length;
	this.start = this_start;
	this.interim = this_interim;
}

function roundRect(ctx, x, y, width, height, radius) {
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function addOpacity(color_string,opac) {
	var colors_only = color_string.substring(color_string.indexOf('(') + 1, color_string.lastIndexOf(')')).split(/,\s*/);
	var final_color = 'rgba('+colors_only[0]+','+colors_only[1]+','+colors_only[2]+','+opac+')';
	return final_color;
}

function drawArrow(ctx,x,y,width,height,angle) {
	ctx.save();
	ctx.translate(x,y);
	ctx.rotate(angle);
	ctx.beginPath();
	var tri_height = width * Math.sqrt(3);
	ctx.moveTo(0,0);
	ctx.lineTo(-width, -tri_height);
	ctx.lineTo(width, -tri_height);
	ctx.closePath();
	ctx.fill();
	ctx.fillRect(-width/2, -height, width, height - tri_height);
	ctx.restore();
}