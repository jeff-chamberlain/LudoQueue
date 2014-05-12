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
		castle : '/images/aquarium/castle.png',
		crown : '/images/aquarium/crown.png',
		blue_net : '/images/aquarium/blue_net.png',
		red_net : '/images/aquarium/red_net.png',
		//coffeegrind
		bg_coffee1 : '/images/coffeegrind/bg_coffee1.png',
		bean1 : '/images/coffeegrind/bean1.png',
		bean2 : '/images/coffeegrind/bean2.png',
		bean3 : '/images/coffeegrind/bean3.png',
		bean4 : '/images/coffeegrind/bean4.png',
		grounds: '/images/coffeegrind/grounds.png',
		grinder : '/images/coffeegrind/grinder.png',
		//coffeemake
		bg_coffee2 : '/images/coffeemake/bg_coffee2.png',
		reflec : '/images/coffeemake/pot_reflection.png',
		maker : '/images/coffeemake/maker.png',
		//coffeepour
		cup : '/images/coffeepour/cup.png',
		pot : '/images/coffeepour/pot.png',		
		overflow : '/images/coffeepour/overflow.png',
		//snowfight
		bg_snowfight : '/images/snowfight/bg_snowfight.png',
		snowball : '/images/snowfight/snowball.png',
		cannon_over: '/images/snowfight/cannon_overlay.png',
		//snowfall
		bg_snowfall : '/images/snowfall/bg_snowfall.png',
		snowflake1 : '/images/snowfall/snowflake1.png',
		snowflake2 : '/images/snowfall/snowflake2.png'
		//taprhythm
	};
	
	var anim_sources = {
		//instructions
		tilt : {src: '/images/instructions/Tilt/Tilt', frames: 84},
		pour : {src: '/images/instructions/Pour/Pour', frames: 48},
		tap : {src: '/images/instructions/Tap/Tap', frames: 36},
		
		//snowfight
		snowman1 : {src: '/images/snowfight/snowman1/Snowman1', frames: 12},
		snowman2 : {src: '/images/snowfight/snowman2/Snowman2', frames: 12},
		snowman3 : {src: '/images/snowfight/snowman3/Snowman3', frames: 12},
		snowman4 : {src: '/images/snowfight/snowman4/Snowman4', frames: 24},
		snowman5 : {src: '/images/snowfight/snowman5/Snowman5', frames: 24},
		snowman6 : {src: '/images/snowfight/snowman6/Snowman6', frames: 24},
		poof : {src: '/images/snowfight/poofs/poof', frames: 9},
		
		//taprhythm
		robo_dance_1 : {src: '/images/taprhythm/RoboDance1/ROBODJ', frames: 58},
		robo_dance_2 : {src: '/images/taprhythm/RoboDance2/ROBODJ2', frames: 58},
	}
	
	var sound_sources = {
		tap_song : '/audio/rhythm_song1.mp3',
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
// 				console.log(loadedImages + '\t' + numImages);
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