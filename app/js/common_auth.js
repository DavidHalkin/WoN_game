//Загрузка документа

function initTitle() {
	var browserWidth = document.documentElement.clientWidth,
		browserHeight = document.documentElement.clientHeight,
		s_x = 20, 
		s_y = -20,
		show_time = 15000,
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
                    
                    if (browserHeight - coordY < $('#title').height() ) {
						coordY = coordY - $('#title').height();
					}
					 
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
                    if (browserHeight - coordY < $('#title').height() ) {
						coordY = coordY - $('#title').height();
                        
                        if (  (coordY-$('#title').height()/2) <0  ) {
                            coordY = coordY + $('#title').height()/2;
                        }
					}
                    
                    
                    
                            
                            $('#title').css({left:(coordX + s_x) + 'px', top:(coordY + s_y) + 'px'})   
                            //$('#title').css({left:(evt.pageX+s_x)+'px', top:(evt.pageY+s_y)+'px'})   
                        });
                });
            function hide_title(){ clearTimeout(to); $('#title').hide(); }
        }
		 