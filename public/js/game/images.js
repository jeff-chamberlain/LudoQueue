function load_images(callback) {
	var images = {},
		numImages = 0,
		loadedImages = 0;
	
	var sources = {
		bg_snowfight : 'images/bg_00.png',
		bg_snowfall : 'images/bg_01.png',
		snowball : 'images/snowball.png',
		snowflake : 'images/snowflake.png',
		cannon_over: 'images/cannon_overlay.png',
		map_1: 'images/map_1.png',
		map_2: 'images/map_2.png',
		tap_1: 'images/Tap1.png',
		tap_2: 'images/Tap2.png',
		tilt_1: 'images/TiltLeft.png',
		tilt_2: 'images/TiltRight.png',
		qr: 'images/qr.png',
	};
		
	// get num of sources
	for(var src in sources) {
		numImages++;
	}
	numImages += 9;
	numImages += (7*35);
	
	images.duloc = [];
	
	for(var i=1; i<8; i++) {
		images.duloc[i] = [];
		for( var n=0; n<35; n++) {
			images.duloc[i][n] = new Image();
			images.duloc[i][n].onload = function() {
				if(++loadedImages >= numImages) {
					callback(images);
				}
			};
			images.duloc[i][n].src = '/images/dulocs/duloc'+i+'_'+(n<10 ? '0'+n : n)+'.png';
		}
	}
	
	images.poofs = [];
	
	for(var i=0;i<9;i++) {
		images.poofs[i] = new Image();
		images.poofs[i].onload = function() {
			if(++loadedImages >= numImages) {
				callback(images);
			}
		};
		images.poofs[i].src = '/images/poofs/poof'+i+'.png';
	}
	
	for(var src in sources) {
		images[src] = new Image();
		images[src].onload = function() {
			if(++loadedImages >= numImages) {
				callback(images);
			}
		};
		images[src].src = sources[src];
	}
}