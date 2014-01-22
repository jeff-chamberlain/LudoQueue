var images = {};
var sources = {
	g1_bg : '/images/dw/g1_bg.png',
	g1_bg_snow : '/images/dw/g1_bg_snow.png',
	g1_ball : '/images/dw/g1_ball.png',
	g1_ball_splat : '/images/dw/g1_ball_splat.png',
	g1_player : '/images/dw/g1_player.png',
	g2_bg : '/images/dw/g2_bg.jpg',
	g2_prop1 : '/images/dw/g2_prop1.png',
	g2_prop2 : '/images/dw/g2_prop2.png',
	g2_prop3 : '/images/dw/g2_prop3.png',
	g2_prop4 : '/images/dw/g2_prop4.png',
	g2_prop5 : '/images/dw/g2_prop5.png',
	g2_snow_pile : '/images/dw/g2_snow_pile.png',
	g3_bg : '/images/dw/g3_bg.png',
	g3_water_pot : '/images/dw/g3_water_pot.png',
	//OLD ASSETS
	/*bg : '/images/bg.jpg',
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
	hand_pour_tap : '/images/hand_pour_tap.png',*/
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