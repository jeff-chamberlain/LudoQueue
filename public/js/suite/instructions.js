var anim_index = 0,
    anim_check = 0,
    surf_anim,
    bal_anim,
    race_anim;

function instructions_init() {
	anim_check = Date.now();
	surf_anim = [
		anim_set(images.neutral,0,0,images.grinder,0,0,1000),
		anim_set(images.tiltL,0,0,images.grinder,-50,0,1000),
		anim_set(images.neutral,0,0,images.grinder,-50,0,1000),
		anim_set(images.tiltR,0,0,images.grinder,0,0,1000),
		anim_set(images.neutral,0,0,images.grinder,0,0,1000),
		anim_set(images.tiltB,0,0,images.grinder,0,-50,1000),
		anim_set(images.neutral,0,0,images.grinder,0,-50,1000),
		anim_set(images.tiltF,0,0,images.grinder,0,0,1000),
		anim_set(images.neutral,0,0,images.grinder,0,0,1000),
		anim_set(images.tapU,0,0,images.grinderB,0,0,1000),
		anim_set(images.tapD,0,0,images.grinderG,0,0,1000),
		anim_set(images.tapU,0,0,images.grinderB,0,0,1000),
		anim_set(images.tapD,0,0,images.grinderG,0,0,1000),
	];
	bal_anim = [
		anim_set(images.pourU,0,0,images.pour1,0,0,1000),
		anim_set(images.pourD,0,0,images.pour2,0,0,1000),
		anim_set(images.pourU,0,0,images.pour3,0,0,1000),
		anim_set(images.pourD,0,0,images.pour4,0,0,1000),
		anim_set(images.pourD,0,0,images.pour5,0,0,1000),
		anim_set(images.tapU,0,0,images.pour6,0,0,1000),
		anim_set(images.tapD,0,0,images.pourC,0,0,1000),
		anim_set(images.tapD,0,0,images.pourX1,0,0,1000),
		anim_set(images.tapD,0,0,images.pourX2,0,0,1000),
		anim_set(images.tapD,0,0,images.pourC,0,0,1000),
	];
	race_anim = [
		anim_set(images.tapU,0,0,images.maker,0,0,1000),
		anim_set(images.tapD,0,0,images.race1,0,0,1000),
		anim_set(images.tapU,0,0,images.race1,0,0,1000),
		anim_set(images.tapD,0,0,images.race2,0,0,1000),
		anim_set(images.tapU,0,0,images.race2,0,0,125),
		anim_set(images.tapD,0,0,images.race2,0,0,125),
		anim_set(images.tapU,0,0,images.race2,0,0,125),
		anim_set(images.tapD,0,0,images.race3,0,0,125),
		anim_set(images.tapU,0,0,images.race3,0,0,125),
		anim_set(images.tapD,0,0,images.race3,0,0,125),
		anim_set(images.tapU,0,0,images.race3,0,0,125),
		anim_set(images.tapD,0,0,images.race4,0,0,125),
		anim_set(images.tapU,0,0,images.race4,0,0,125),
		anim_set(images.tapD,0,0,images.race4,0,0,125),
		anim_set(images.tapU,0,0,images.race4,0,0,125),
		anim_set(images.tapD,0,0,images.race5,0,0,1000),
	];
}

function animate(anim_array) {
	var rat = (W/8)/400;
	var length = anim_array[anim_index]['length'];
	var t = (Date.now() - anim_check)/length;
	var cont_x = (1*W)/16;
	var cont_y = (7*H)/8;
	var res_x = (3*W)/16;
	var res_y = (7*H)/8;
	var cont = anim_array[anim_index]['cont'];
	var res = anim_array[anim_index]['res'];
	if(anim_index == 0) {
		var cont_xy = {'x': cont.x, 'y': cont.y };
		var res_xy = {'x': res.x, 'y': res.y };
	}
	else {
		var cont_prev = anim_array[anim_index-1]['cont'];
		var cont_xy = xyLerp(cont_prev.x,cont.x,cont_prev.y,cont.y,t);
		var res_prev = anim_array[anim_index-1]['res'];
		var res_xy = xyLerp(res_prev.x,res.x,res_prev.y,res.y,t);
	}
	var cont_hig = (cont.source.height/cont.source.width)*300;
	var res_hig = (res.source.height/res.source.width)*300;
	ctx.save();
	ctx.transform(rat,0,0,rat,cont_x,cont_y);
	ctx.fillStyle="rgba(255,255,255,.5)";
	ctx.fillRect(-200,-205,800,405);
	ctx.drawImage(cont.source,cont_xy['x']-150,cont_xy['y']-(cont_hig/2),300,cont_hig);
	ctx.restore();
	ctx.save();
	ctx.transform(rat,0,0,rat,res_x,res_y);
	ctx.drawImage(res.source,res_xy['x']-150,res_xy['y']-(res_hig/2),300,res_hig);
	ctx.restore();
	if(t >= 1) {
		anim_index ++;
		if(anim_index >= anim_array.length) {
			anim_index = 0;
		}
		anim_check = Date.now();
	}
}

function anim_set(cont_source,cont_x,cont_y,res_source,res_x,res_y,length) {
	return { 'cont': new anim(cont_source,cont_x,cont_y), 'res': new anim(res_source,res_x,res_y), 'length': length };
}
function anim(this_source,this_x,this_y) {
	this.x = this_x;
	this.y = this_y;
	this.source = this_source;
}