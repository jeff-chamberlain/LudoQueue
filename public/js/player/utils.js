function xLerp( v0, v1, t ) {
	return (v0*(1-t))+ (v1*t);
}

function xyLerp( x0, x1, y0, y1, t ) {
	var x00 = (x0*(1-t))+ (x1*t);
	var y00 = (y0*(1-t))+ (y1*t);
	return {'x': x00, 'y':y00};
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