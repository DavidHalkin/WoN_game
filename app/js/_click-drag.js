;(function($) {
	$(document).ready(function() {
		var browserWidth = document.documentElement.clientWidth;
		var browserHeight = document.documentElement.clientHeight;
		var field = document.getElementById('field');

		$('.click-drag a').click(function(e) {
			var el = $(this);
			var className = el.attr('class');
			var icon = document.createElement('div');
			$(icon).addClass('tools-icon ' + className);
			var cursorX = e.clientX - 30;
			var cursorY = e.clientY - 30;
			$(icon).attr('style', 'left: ' + cursorX + 'px; top: ' + cursorY + 'px;');
			document.body.appendChild(icon);
			$(document).bind('mousemove', function(e) {
				icon.style.left = e.clientX - 30 + "px";
				icon.style.top = e.clientY - 30 + "px";
			});
			$(document).bind('click', function(e) {
				var coordX = e.clientX;
				var coordY = e.clientY;
				if (coordY < browserHeight - 165) {
					var fieldCoordX = -(field.offsetLeft);
					var fieldCoordY = -(field.offsetTop);
					console.log(fieldCoordX + e.clientX, fieldCoordY + e.clientY);
				}
				$(document).unbind('mousemove');
				$(document).unbind('click');
				document.body.removeChild(icon);
			});
			return false;
		});
	});
})(jQuery);
