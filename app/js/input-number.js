;(function($) {
	$(document).ready(function() {
		$('.input-number').each(function() {
			var parent = $(this);
			var control = parent.find('.input-number-control');
			var input = parent.find('.input-number-input');
			control.click(function() {
				var el = $(this);
				var value = parseInt(el.data('value'));
				input.val(parseInt(input.val()) + value);
			});
		});
	});
})(jQuery);