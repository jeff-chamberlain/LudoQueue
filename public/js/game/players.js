function player(new_name,new_id) {
	this.name = new_name;
	this.id = new_id;
	
	var r = Math.floor(Math.random()*225+20);
	var g = Math.floor(Math.random()*225+20);
	var b = Math.floor(Math.random()*225+20);
	this.color = 'rgb('+r+','+g+','+b+')';
	
	this.tiltFB = 0;
	this.tiltLR = 0;
	this.taps = 0;
	this.swype = null;
}