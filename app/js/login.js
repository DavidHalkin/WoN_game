;(function($) {
	$(document).ready(function() {
		$('.rsContent a').click(function() {
			var el = $(this);
			var src = el.attr('href');
			$('.slider').find('.img img').attr('src', src);
			return false;
		});
	});
})(jQuery);