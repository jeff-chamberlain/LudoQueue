var images = {},
	audio = {
		bell_chime: {
			start: 0,
			length: 2,
		},
		changing_cup: {
			start: 5,
			length: 0.691,
		},
		coffee_done: {
			start: 6.5,
			length: 1.6,
		},
		grinding: {
			start: 3,
			length: 1.367,
		},
		pouring: {
			start: 9,
			length: 1.346,
		},
		spilling: {
			start: 11,
			length: 1.045,
		},
		waterdripping: {
			start: 12.5,
			length: 5.601,
		},
	},
	pAudio,
	audio_loop = false,
	audio_loaded = false,
	audio_fully_loaded = false;
	cur_audio = audio.bell_chime,
	iSources = {
		dw_logo: '/images/dw/dw_logo.png',
	};
	
var audio_handler = function() {
	/*if (this.currentTime >= cur_audio.start + cur_audio.length) {
		if(audio_loop) {
			this.currentTime = cur_audio.start;
		}
		else {
			this.pause();
		}
    }*/
}

function loadAssets(callback) {
	//pAudio = document.getElementById("pAudio");
	//pAudio.addEventListener('timeupdate', audio_handler, false);
	/*pAudio.addEventListener('canplaythrough', function() {
		audio_fully_loaded = true;
	}, false);*/
	var loadedImages = 0;
	var numImages = 0;
	// get num of sources
	for(var src in iSources) {
		numImages++;
	}
	for(var src in iSources) {
		images[src] = new Image();
		images[src].onload = function() {
			if(++loadedImages >= numImages) {
				callback();
			}
		};
		images[src].src = iSources[src];
	}
}
function playAudio(src,loop) {
	/*if(audio_fully_loaded) {
		cur_audio = src;
		pAudio.currentTime = cur_audio.start;
		pAudio.play();
		audio_loop = loop;
		console.log("Audio playable");
	}
	else {
		console.log( "Audio can't play" );
	}*/
}