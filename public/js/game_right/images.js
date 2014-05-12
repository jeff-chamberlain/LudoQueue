function load_images(callback) {
	var images = {},
		numImages = 0,
		loadedImages = 0,
		cdn = 'http://d3d4iuiu1jte8h.cloudfront.net';
	
	var sources = {
		logo : '/images/logo.png',
		//aquarium
		bg_aquarium : '/images/aquarium/bg_aquarium.png',
		fish_1 : '/images/aquarium/fish_1.png',
		fish_2 : '/images/aquarium/fish_2.png',
		fish_3 : '/images/aquarium/fish_3.png',
		rock_1 : '/images/aquarium/rock_1.png',
		rock_2 : '/images/aquarium/rock_2.png',
		rock_3 : '/images/aquarium/rock_3.png',
		ball : '/images/aquarium/ball.png',
		ring_back : '/images/aquarium/ring_back.png',
		ring_front : '/images/aquarium/ring_front.png',
		blue_net : '/images/aquarium/blue_net.png',
		//coffeegrind
		bg_coffee1 : '/images/coffeegrind/bg_coffee1.png',
		//coffeemake
		bg_coffee2 : '/images/coffeemake/bg_coffee2.png',
		//snowfight
		bg_snowfight : '/images/snowfight/bg_snowfight.png',
		//snowfall
		bg_snowfall : '/images/snowfall/bg_snowfall.png',
		//taprhythm
		
	};
	
	var anim_sources = {
		//instructions
		tilt : {src: '/images/instructions/Tilt/Tilt', frames: 84},
		tap : {src: '/images/instructions/Tap/Tap', frames: 36},
		back_forth : {src: '/images/instructions/Back_Forth/B_F', frames: 36},
		swipe : {src: '/images/instructions/Swipe/Swipe', frames: 60},
	};
	
	var sound_sources = {
		fish_drop : '/audio/fish_drop.wav'
	}
		
	// get num of sources
	for(var src in sources) {
		numImages++;
	}
	for(var anim in anim_sources) {
		numImages += anim_sources[anim].frames;
	}
	
	for(var src in sources) {
		images[src] = new Image();
		images[src].onload = function() {
			if(++loadedImages >= numImages) {
				callback(images);
			}
		};
		images[src].src = cdn + sources[src];
	}
	
	images.anims = {};
	
	for(var anim in anim_sources) {
		images.anims[anim] = new animation();
		anim_ob = anim_sources[anim];
		for(var i=0; i<anim_ob.frames; i++) {
			images.anims[anim].frames[i] = new Image();
			images.anims[anim].frames[i].onload = function() {
				if(++loadedImages >= numImages) {
					callback(images);
				}
			};
			images.anims[anim].frames[i].src = cdn + anim_ob.src+'_'+(i<10 ? '0'+i : i)+'.png';
		}
	}
	
	images.audio = {};
	
	for(var src in sound_sources) {
		images.audio[src] = new Audio();
		images.audio[src].src = cdn + sound_sources[src];
	}
}

function animation() {
	this.frames = []
		
	this.playLoop = function(start, length, start_frame) {return new loop(start, length, this.frames, start_frame)}
	
	this.playOneShot = function(start, length) {return new oneShot(start, length, this.frames)}
	
	function oneShot(start, length, frames) {
		var frame_count = frames.length;
		
		this.play = function() {
			var frame = Math.floor(((Date.now() - start) / length) * frame_count);
			if(frame >= frame_count) {
				return false;
			}
			else {
				return frames[frame];
			}
		}
	}
	
	function loop(start, length, frames, start_frame) {
		var frame_count = frames.length;
		if(start_frame) {
			start -= start_frame * (length / frame_count);
		}
		
		this.play = function() {
			this.frame = Math.floor((((Date.now() - start) % length) / length) * frame_count);
			return frames[this.frame];
		}
	}
}