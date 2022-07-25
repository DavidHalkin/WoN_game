;(function($) {
	$(document).ready(function() {
		$('.input-file').each(function() {
			var parent = $(this);
			var label = parent.find('.input-file-label');
			var button = parent.find('.input-file-btn');
			var text = parent.find('.input-file-text');
			button.change(function() {
				var el = $(this);
				text.val(el.val());
			});
		});
	});
})(jQuery);