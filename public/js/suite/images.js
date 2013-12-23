var images = {};
var sources = {
	bg : '/images/bg.jpg',
	bean1 : '/images/bean1.png',
	bean2 : '/images/bean2.png',
	bean3 : '/images/bean3.png',
	bean4 : '/images/bean4.png',
	grounds: '/images/grounds.png',
	cup : '/images/cup.png',
	grinder : '/images/grinder.png',
	maker : '/images/maker.png',
	pot : '/images/pot.png',
	reflec : '/images/pot_reflection.png',
	overflow : '/images/overflow.png',
	hand_arrows : '/images/hand_arrows.png',
	hand_tap : '/images/hand_tap.png',
	hand_tap_phone : '/images/hand_tap_phone.png',
	hand_tap_finger : '/images/hand_tap_finger.png',
	hand_pour : '/images/hand_pour.png',
	hand_pour_tap : '/images/hand_pour_tap.png',
};

function loadImages(callback) {
	var loadedImages = 0;
	var numImages = 0;
	// get num of sources
	for(var src in sources) {
		numImages++;
	}
	for(var src in sources) {
		images[src] = new Image();
		images[src].onload = function() {
			if(++loadedImages >= numImages) {
				callback();
			}
		};
		images[src].src = sources[src];
	}
}