function moveToCenter() {
	var browserWidth = document.documentElement.clientWidth,
		browserHeight = document.documentElement.clientHeight,
		field = document.getElementById('field'),
		fieldWidth = field.offsetWidth,
		fieldHeight = field.offsetHeight,
		coordX = (browserWidth - fieldWidth) / 2,
		coordY = (browserHeight - fieldHeight) / 2;
	$(field).attr('style', 'left: ' + coordX + 'px; top: ' + coordY + 'px;');
}
function hideOnLoad() {
	$('.hide-on-load').hide();
}
function initTextareaEnter() {
	$('textarea').off().keypress(function(e) {
		if (e.keyCode == 13) {
			alert('Enter');
			e.preventDefault();
		}
	});
} 
function initSwitchBottomPanel() {
	$('.top-right-process-button').off().click(function() {
		var el = $(this);
		var panel = $('.top-right-process-panel');
		if (el.hasClass('active')) {
			el.removeClass('active');
			panel.css('display', 'none');
		}
		else {
			el.addClass('active');
			panel.css('display', 'block');
		}
	});
}
function initSwitchSidePanel() {
	$('.middle-left-panel a, .middle-right-panel a').off().click(function() {
		var el = $(this);
		var href = el.attr('href');
		var parent = el.parent();
		if (el.hasClass('active')) {
			var toClose = parent.find('.active').removeClass('active').attr('href');
			$(toClose).css('display', 'none');
		}
		else {
			var toClose = parent.find('.active').removeClass('active').attr('href');
			$(toClose).css('display', 'none');
			$(href).css('display', 'block');
			el.addClass('active');
			return false;
		}
		console.log('asdasd');
	});
}
function initNiceSelect() {
    
	$('.custom-select-list li').off().click(function() {
		var el = $(this);
		var val = el.attr('data-val');
        
		var parent = el.closest('.custom-select');
		parent.find('.custom-select-input').val(val);
		parent.find('.custom-select-check')[0].checked = false;
        
	});
}
function initScrollPane() {
	var apis = [];
	if (apis.length) {
		$.each(
			apis,
			function(i) {
				this.destroy();
			}
		)
		apis = [];
	}
	$('.scroll-pane').each(
		function()
		{
			apis.push($(this).jScrollPane({
				showArrows: true,
				verticalDragMinHeight: 15,
				verticalDragMaxHeight: 15,
				horizontalDragMinWidth: 16,
				horizontalDragMaxWidth: 16
			}).data().jsp);
		}
	);
}
function initTitle() {
	var browserWidth = document.documentElement.clientWidth,
		browserHeight = document.documentElement.clientHeight,
		s_x = 20, 
		s_y = 20,
		show_time = 5000,
		to;
		$('#title').remove();
		$('<span id=title></span>').appendTo('body').hide()

		$('[title]').each(function(i,e){
			e._title = $(this).attr('title').replace(/\\n/gim,'<br>');
			$(this).removeAttr('title')
				.off()
				.mouseover(function(evt){
					if (browserWidth - evt.pageX < 100 ) {
						var coordX = evt.pageX - 100;
					}
					else {
						var coordX = evt.pageX;
					}
					var coordY = evt.pageY;
					$('#title')
						.html($(this).get(0)._title)
						.fadeIn('slow').css({left:(coordX+s_x)+'px', top:(coordY+s_y)+'px'})
						if(show_time) to = setTimeout(hide_title, show_time)
				})
				.mouseout( hide_title )
				.mousemove(function(evt){
					if (browserWidth - evt.pageX < 100 ) {
						var coordX = evt.pageX - 100;
					}
					else {
						var coordX = evt.pageX;
					}
					var coordY = evt.pageY;
				   	$('#title').css({left:(coordX + s_x) + 'px', top:(coordY + s_y) + 'px'})   
				    //$('#title').css({left:(evt.pageX+s_x)+'px', top:(evt.pageY+s_y)+'px'})   
				});
		});
	function hide_title(){ clearTimeout(to); $('#title').hide(); }
}
function clickToDrag() {
	var browserWidth = document.documentElement.clientWidth;
	var browserHeight = document.documentElement.clientHeight;
	var field = document.getElementById('field');
	$('.click-drag a').off().click(function(e) {
		var el = $(this);
		//var className = el.attr('class');
		var icon = document.createElement('div');
		var img = document.createElement('img');
		img.setAttribute('src', el.find('img').attr('src'));
		icon.appendChild(img);
		$(icon).addClass('tools-icon');
		document.body.appendChild(icon);
		var halfWidth = $(icon).outerWidth()/2;
		var halfHeight = $(icon).outerHeight()/2;
		console.log(halfWidth, halfHeight);
		var cursorX = e.clientX - halfWidth;
		var cursorY = e.clientY - halfHeight;
		$(icon).attr('style', 'left: ' + cursorX + 'px; top: ' + cursorY + 'px;');
		$(document).bind('mousemove', function(e) {
			icon.style.left = e.clientX - halfWidth + "px";
			icon.style.top = e.clientY - halfHeight + "px";
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
}
function init() {
	//Scroll-pane
	initScrollPane();
	//Красивый селект
	initNiceSelect();
	//Переключение боковых окошек
	initSwitchBottomPanel();
	initSwitchSidePanel();
	//Отправка сообщений
	initTextareaEnter();
	//Тайтлы
	initTitle();
	//Клик драг
	clickToDrag();
	//Скрываем блоки (display: none, но чтобы успел отработать scroll-pane)
	hideOnLoad();

	console.log('Интерфейс проинициализирован');
}
 