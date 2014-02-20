function loadImages(callback) {
	var images = {},
		iSources = {
			dw_logo: '/images/dw_logo.png',
		},
		loadedImages = 0;
		numImages = 0;
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
		images[src].src = iSources[src];
	}
}