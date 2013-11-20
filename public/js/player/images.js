var images = {};
var sources = {
	cup : '/images/cup.png',
	grinder : '/images/grinder.png',
	grinderB : '/images/grinderB.png',
	grinderG : '/images/grinderG.png',
	maker : '/images/maker.png',
	pot : '/images/pot.png',
	neutral : '/images/handN.png',
	tiltL : '/images/handTiltL.png',
	tiltR : '/images/handTiltR.png',
	tiltF : '/images/handTiltF.png',
	tiltB : '/images/handTiltB.png',
	pourD : '/images/handPourD.png',
	pourU : '/images/handPourU.png',
	pour1 : '/images/pour1.png',
	pour2 : '/images/pour2.png',
	pour3 : '/images/pour3.png',
	pour4 : '/images/pour4.png',
	pour5 : '/images/pour5.png',
	pour6 : '/images/pour6.png',
	pourC : '/images/pourC.png',
	pourX1 : '/images/pourX1.png',
	pourX2 : '/images/pourX2.png',
	race1 : '/images/race1.png',
	race2 : '/images/race2.png',
	race3 : '/images/race3.png',
	race4 : '/images/race4.png',
	race5 : '/images/race5.png',
	tapD : '/images/handTapD.png',
	tapU : '/images/handTapU.png',
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