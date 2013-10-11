var overlayElems = ["start","error"],
	over_div,
	last_over;

function create_overlay() {
	over_div = $('#overlay');
	last_over = "";
	this.init = function() {
		over_div.hide();
		for(var i = 0; i < overlayElems.length; i++) {
			var over_name = overlayElems[i];
			$('#'+over_name+'_over').hide();
		}
		this.fadeInOver("start");
	};
	
	this.fadeInOver = function(over_name) {
		last_over = over_name;
		var menu = $('#'+over_name+'_over');
		menu[0].style.top = H/2+'px';
		menu.show();
		over_div.fadeIn(3000);
	};
	this.fadeOutOver = function() {
		over_div.fadeOut(3000, function(){
			$('#'+last_over+'_menu').hide();
			last_over = "";
		});
	};
}
