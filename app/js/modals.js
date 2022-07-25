;(function($) {
	function exit_modal() {
		$('.modal-win').css({'display':'none'});
		$('#modal-box').css({'display':'none'}).children().appendTo($('body'));
		$('html').css({'overflow':'auto','width':'auto'})
	}
	function open_modal(el) {
		el.appendTo($('#modal-box')).css({'display':'block'});
		$('html').css({'overflow':'hidden','width': $('html').outerWidth()});
		$('#modal-box').css({'overflow-y':'scroll', 'display':'block'});
	}
	$(document).ready(function() {
		//Модальные окна
		$('#modal-box').hide();
		$('.modal-win').hide();
		$('.modal-win').bind('click', function(e){
	      if (e.stopPropagation) {
	         e.stopPropagation();
	      }
	    });
	   	$('.open-modal').click(function() {
			var url = $(this).attr('href');
			var el = $(url);
			open_modal(el);
			return false;
		});
		$('#modal-box, .modal-close').click(function() {
			exit_modal();
			return false;
		});
	});
})(jQuery)