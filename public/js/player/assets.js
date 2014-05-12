function loadImages(callback) {
	var images = {},
		iSources = {
			player_logo: '/images/player_logo.png',
		},
		sSources = {
			changing_cup : '/audio/changing_cup.wav',
			fish_whoosh : '/audio/fish_whoosh.wav',
			snowball_shoot : '/audio/snowball_shoot.wav'
		},
		loadedImages = 0,
		numImages = 0,
		cdn = 'http://d3d4iuiu1jte8h.cloudfront.net';
		
	for(var src in iSources) {
		numImages++;
	}
	
	for(var src in iSources) {
		images[src] = new Image();
		images[src].onload = function() {
			if(++loadedImages >= numImages) {
				callback(images);
			}
		};
		images[src].src = cdn + iSources[src];
	}
	
	images.audio = {};
	
	for(var src in sSources) {
		images.audio[src] = new Audio();
		images.audio[src].src = cdn + sSources[src];
	}
}