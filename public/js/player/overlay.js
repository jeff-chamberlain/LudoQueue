function overlay() {
	var over_div = $('#overlay'),
	menu_div = $('#start_over');
	over_showing = false,
	fading = false,
	H = window.innerHeight;
	
	menu_div[0].style.top = (H/2-50)+'px';
	window.addEventListener("resize", function() {
		if(over_showing) {
			H = window.innerHeight;	
			menu_div[0].style.top = (H/2-50)+'px';
			$('#start_name').focus();
		}
	}, false);
	
	over_div.hide();
	menu_div.hide();
	
	this.fade_in_overlay = function(over_name) {
		if(fading) {
			over_div.stop();
		}
		over_div.show();
		menu_div.show();
		H = window.innerHeight;	
		menu_div[0].style.top = (H/2-50)+'px';
		fading = true;
		over_showing = true;
		over_div.animate({opacity:1}, 1000, function(){
			fading = false;
		});
	};
	this.fade_out_overlay = function() {
		if(fading) {
			over_div.stop();
		}
		fading = true;
		over_div.animate({opacity:0}, 1000, function(){
			over_showing = false;
			fading = false;
			over_div.hide();
			menu_div.hide();
		});
	};
	
	this.fade_in_overlay();
}
