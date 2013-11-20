function xLerp( v0, v1, t ) {
	return (v0*(1-t))+ (v1*t);
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