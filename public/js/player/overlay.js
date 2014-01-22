var overlayElems = ["start"],
	over_div,
	last_over,
	over_showing;

function create_overlay() {
	over_div = $('#overlay');
	last_over = "";
	this.menu = null;
	
	this.init = function() {
		over_div.hide();
		for(var i = 0; i < overlayElems.length; i++) {
			var over_name = overlayElems[i];
			$('#'+over_name+'_over').hide();
		}
		this.fadeInOver("start");
	};
	
	this.fadeInOver = function(over_name) {
		over_showing = true;
		last_over = over_name;
		this.menu = $('#'+over_name+'_over');
		this.menu[0].style.top = H/2+'px';
		this.menu.show();
		over_div.fadeIn(1000);
		game.draw.waiting_message = "Please sign in";
	};
	this.fadeOutOver = function() {
		over_showing = false;
		if(this.menu != null && last_over != '' ) {
			over_div.fadeOut(1000, function(){
				$('#'+last_over+'_menu').hide();
				last_over = "";
			});
			this.menu == null;
		}
	};
}
