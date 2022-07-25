;(function($) {
	$(document).ready(function() {
		$('.scroll-pane').jScrollPane({
			showArrows: true,
			verticalDragMinHeight: 15,
			verticalDragMaxHeight: 15,
			horizontalDragMinWidth: 16,
			horizontalDragMaxWidth: 16
		});
		$('.royalSlider').royalSlider({
			arrowsNav: true,
			loop: false,
			keyboardNavEnabled: true,
			controlsInside: false,
			arrowsNavAutoHide: false,
			autoScaleSlider: false,
			thumbsFitInViewport: false,
			navigateByClick: true,
			startSlideId: 0,
			autoPlay: false,
			transitionType:'move',
			globalCaption: false,
			deeplinking: {
				enabled: true,
				change: false
			},
		});
	});
})(jQuery);

		