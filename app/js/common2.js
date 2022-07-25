almaz_use=0;
canvas_zoom=1;

//включаем прокрутку мыши
function add_whell(elem,fun)
{
	if (elem===null) return;
	if (elem.addEventListener) {
	  if ('onwheel' in document) {
		// IE9+, FF17+, Ch31+
		elem.addEventListener("wheel", fun);
	  } else if ('onmousewheel' in document) {
		// устаревший вариант события
		elem.addEventListener("mousewheel", fun);
	  } else {
		// Firefox < 17
		elem.addEventListener("MozMousePixelScroll", fun);
	  }
	} else { // IE8-
	  elem.attachEvent("onmousewheel", fun);
	}
}

function EscapeString(text)
{
	text=encodeURIComponent(text);
    return text
        .replace("\\",  "\u005c")  // Because it JS string escape character
        .replace("\"",  "\u0022")  // Because it may be string delimiter
        .replace("'",  "\u0027")   // Because it may be string delimiter
        .replace("&",  "\u0026")   // Because it may interfere with HTML parsing
        .replace("<",  "\u003c")   // Because it may interfere with HTML parsing
		.replace("+",  "\+")
        .replace(">",  "\u003e");  // Because it may interfere with HTML parsing
}

function renew_zoom()
{
	var zdan_span=$('.zdan_span');
	zdan_span.each(function(i,elem) {
		var t = $(this).attr('top');
		var l = $(this).attr('left');
		$(this).css('top', t*canvas_zoom);
		$(this).css('left', l*canvas_zoom); 
	});
	zdan_span.css('width', 40*canvas_zoom);
	zdan_span.css('height',40*canvas_zoom);
	zdan_span.children('img').css('width', 40*canvas_zoom);
	zdan_span.children('img').css('height',40*canvas_zoom);
	
	var zdan_span_timer=$('.zdan_span_timer');
	zdan_span_timer.each(function(i,elem) {
		var t = $(this).attr('top');
		var l = $(this).attr('left');
		$(this).css('top', t*canvas_zoom);
		$(this).css('left', l*canvas_zoom); 
	});
	zdan_span_timer.css('width', 53*canvas_zoom);
	zdan_span_timer.css('height',22*canvas_zoom);
	zdan_span_timer.css('font-size',14*canvas_zoom);
}

function setzoom(new_zoom,allzoom=0)
{
	if (new_zoom>1 ) new_zoom=1;
	if (new_zoom<0.3) new_zoom=0.3;
	var oldzoom=canvas_zoom;
	canvas_zoom=new_zoom;
	var browserWidth = document.documentElement.clientWidth,
		browserHeight = document.documentElement.clientHeight;
		
	if (allzoom==0)
	{
		var l = field.offsetLeft;
		var t = field.offsetTop; 
		$(field).attr('style', 'left: ' +  (((l-window.clientX)/oldzoom)*canvas_zoom+window.clientX) + 'px; top: ' + (((t-window.clientY)/oldzoom)*canvas_zoom+window.clientY) + 'px; width:'+(3200*canvas_zoom)+'px !important;height:'+(2000*canvas_zoom)+'px !important; ');
		$(field).css("background-size", (150*canvas_zoom)+"px " + (150*canvas_zoom) + "px");	 
		var fon=$('#fon1'); 
		fon.width(3200*canvas_zoom);
		fon.height(2000*canvas_zoom);
		fon.css("background-size", (3200*canvas_zoom)+"px " + (2000*canvas_zoom) + "px");
		
		var wall_b=$('#wall_b'); 
		if (wall_b)
		{
			wall_b.width(3200*canvas_zoom);
			wall_b.height(2000*canvas_zoom);
			wall_b.css("background-size", (3200*canvas_zoom)+"px " + (2000*canvas_zoom) + "px");
		}
		
		
		var wall_f=$('#wall_f'); 
		if (wall_f)
		{
			wall_f.width(3200*canvas_zoom);
			wall_f.height(2000*canvas_zoom);
			wall_f.css("background-size", (3200*canvas_zoom)+"px " + (2000*canvas_zoom) + "px"); 
		}
		
		$('.rayon').each(function(i,elem) {
			var t = $(this).attr('top');
			var l = $(this).attr('left');
			$(this).css('top', t*canvas_zoom);
			$(this).css('left', l*canvas_zoom);
			$(this).css('width', 640*canvas_zoom);
			$(this).css('height', 320*canvas_zoom);
		});
		
		$('.canvas_zdan').each(function(i,elem) {
			var t = $(this).attr('top');
			var l = $(this).attr('left');
			$(this).css('top', t*canvas_zoom);
			$(this).css('left', l*canvas_zoom);
			$(this).css('width', 1600*canvas_zoom);
			$(this).css('height',900*canvas_zoom);
		});
		var city_klet=$('#city_klet');
		city_klet.width(64*canvas_zoom);
		city_klet.height(32*canvas_zoom);
		city_klet.css("background-size", (64*canvas_zoom)+"px " + (32*canvas_zoom) + "px");
	}		
	
	renew_zoom();
	 
}

function renew_zoom_map( )
{
	$('canvas').each(function(i,elem) {
		var t = $(this).attr('top');
		var l = $(this).attr('left');
		var w = $(this).attr('width2');
		var h = $(this).attr('height2');
		$(this).css('top', t  *canvas_zoom);
		$(this).css('left', l  *canvas_zoom);
		$(this).css('width', w  *canvas_zoom);
		$(this).css('height',h  *canvas_zoom);
	});
	setzoom_map_cityblock();
	
	//$('.city_title_back').css('height',20*canvas_zoom);
}

function setzoom_map_cityblock()
{
	if (canvas_zoom<=0.3) $('.city_title_back').hide();
	else {
		$('.city_title_back').show();
		
		$('.city_title_back').each(function(i,elem) {
			var t = $(this).attr('top');
			var l = $(this).attr('left'); 
			$(this).css('top', t*canvas_zoom);
			$(this).css('left', l*canvas_zoom); 
		});
		$('.city_title_back').css('min-width', 100*canvas_zoom);
	}
}
 
zooming_timer2=null;
function setzoom_map(new_zoom )
{ 
	var marker = $('.marker-select');
	clearTimeout(zooming_timer2); 
	//отключаем или включаем разные функции карты
	if (new_zoom>=0.15)
	{
		map_loader.show();
		zooming_timer2=setTimeout(function(){   
			var browserWidth = document.documentElement.clientWidth,
			browserHeight = document.documentElement.clientHeight;
			var coordX=(field_2.offsetLeft-browserWidth/2)*(-1);
			var coordY=64-field_2.offsetTop-(browserHeight-64)/2 ;   
			load_map(coordX,coordY,2 ); 
		},500);
		if (canvas_zoom<0.15) {
			$('canvas').show();
			marker.show();
			$('#coords_panel').show();
			
			$('.politic_map').hide();
		}
	}
	else {
		map_loader.hide();
		if (canvas_zoom>=0.15) {
			$('canvas').hide();
			$('.politic_map').show();
			marker.hide();
			$('#coords_panel').hide();
		}
	}
	if (new_zoom<=0.01 && canvas_zoom>0.01) $('#worldmap').show();
	else if (new_zoom>0.01 && canvas_zoom<=0.01) $('#worldmap').hide();
	
	if (new_zoom>1 ) new_zoom=1;
	if (new_zoom<0.01) new_zoom=0.01;
	var oldzoom=canvas_zoom;
	canvas_zoom=new_zoom;
	var browserWidth = document.documentElement.clientWidth,
		browserHeight = document.documentElement.clientHeight;
		var f_width= 224400;
		var f_height= 110800;
		var l = field_2.offsetLeft;
		var t = field_2.offsetTop; 
		coordX=(l-browserWidth/2)*(-1);
        coordY=64-t-(browserHeight-64)/2 ;      
        //if ($('canvas').attr('width')*canvas_zoom<browserWidth) return load_map(coordX,coordY,1);
		//console.log($('canvas').attr('width')*canvas_zoom,browserWidth);
		//var coordX=($(field2).offset().left-browserWidth/2)*(-1);
       // var coordY=64-$(field2).offset().top-(browserHeight-64)/2 ; 
		
		if (!window.clientX) window.clientX=browserWidth/2;
		if (!window.clientY) window.clientY=(browserHeight-64)/2;
		
		//console.log((((l-window.clientX)/oldzoom)*canvas_zoom+window.clientX),window.clientY,l,t,oldzoom);	
		$(field_2).attr('style', 'left: ' +  (((l-window.clientX)/oldzoom)*canvas_zoom+window.clientX) + 'px; top: ' + (((t-window.clientY)/oldzoom)*canvas_zoom+window.clientY) + 'px; width:'+(f_width*canvas_zoom)+'px !important;height:'+(f_height*canvas_zoom)+'px !important;cursor: move; position: relative;  ');
		$(field_2).css('background-size',224400*canvas_zoom+'px '+110800*canvas_zoom+'px');
	 
		if (canvas_zoom>=0.15) {
			
			marker.css('width', 100*canvas_zoom);
			marker.css('height',100*canvas_zoom);
			
			renew_zoom_map( );	
		}
		  
		
		   
   
}

function moveToCenter() {
	var browserWidth = document.documentElement.clientWidth,
		browserHeight = document.documentElement.clientHeight;
	 
    if (field)
    {
        var	fieldWidth = field.offsetWidth,
		fieldHeight = field.offsetHeight,
		coordX = (browserWidth - 3200*canvas_zoom) / 2-300,
		coordY = (browserHeight - 2000*canvas_zoom) / 2-300;
		$(field).attr('style', 'left: ' + coordX + 'px; top: ' + coordY + 'px; width:'+(3200*canvas_zoom)+'px !important;height:'+(2000*canvas_zoom)+'px !important; ');
		 
    }  
	
}

 
function moveToXY(x,y) {
	x=x* canvas_zoom;
	y=y* canvas_zoom;
	var browserWidth = document.documentElement.clientWidth,
		browserHeight = document.documentElement.clientHeight;
	field = document.getElementById('field'); 
    if (field)
    {
        var	fieldWidth = field.offsetWidth,
		fieldHeight = field.offsetHeight,
		coordX = (browserWidth - fieldWidth)/2 -x +1600* canvas_zoom-100   ,
		coordY = (browserHeight - fieldHeight)/2 -y  +800* canvas_zoom-100 ;
		$(field).attr('style', 'left: ' + coordX + 'px; top: ' + coordY + 'px; width:'+(3200*canvas_zoom)+'px !important;height:'+(2000*canvas_zoom)+'px !important; ');
		
		$('#city_klet').hide();
    }
	
	
}
                        
  function moveToMap(coordX,coordY) {
                var browserWidth = document.documentElement.clientWidth,
                browserHeight = document.documentElement.clientHeight;
                var	field2 = document.getElementById('field_2');
                if (field2)
                { 
            
             

                    coordX=0-parseInt(coordX)+browserWidth/2;
                    coordY=64-parseInt(coordY)+(browserHeight-64)/2;
                    
                     
                     
                    $(field2).offset({left:coordX});
                    $(field2).offset({top:coordY});
                    
                   
                       
                     $(field2).mouseup();
                    /*
                    var	fieldWidth = field.offsetWidth;
                    var fieldHeight = field.offsetHeight;
                    var coordX = coordX-browserWidth/2;
                    var coordX = coordY-browserHeight/2;
                    $(field2).attr('style', 'left: ' + coordX + 'px; top: ' + coordY + 'px;');
                    */
                }
                
            }                 
                   




function hideOnLoad() {
	$('.hide-on-load').hide();
}
function initTextareaEnter() {
	$('#win-chat_text').off().keypress(function(e) {
		if (e.keyCode == 13) {
			
             ajax('ajax.php','do=chat_send&gos='+chat_type+'&text='+EscapeString($('#win-chat_text').val()),'#win-chat_ajax');
            $('#win-chat_text').val('');
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
			
			if($(href).is('[class ^= middle-left]')){
				$(href).css('left', 50);
			}
			
			if($(href).is('[class ^= middle-right]')){
				$(href).css('right', 50);
			
			}
			el.addClass('active');
			return false;
		}
		console.log('asdasd');
	});
}
 

function AjaxReinScroll()
{
	
	var apis = [];
	if (apis.length) {
		$.each(
			apis,
			function(i) {
				//this.destroy();
				this.reinitialise();
			}
		)
		apis = [];
	}
	
	initForms();
}


function initScrollPane() {
	var apis = [];
	if (apis.length) {
		$.each(
			apis,
			function(i) {
				this.destroy();
				//this.reinitialise();

			}
		)
		apis = [];
	}
	$('.scroll-pane').each(
		function()
		{
			apis.push($(this).jScrollPane({
				showArrows: true,
				// autoReinitialise: true,
				horizontalGutter: 10,
				verticalDragMinHeight: 15,
				verticalDragMaxHeight: 15,
				horizontalDragMinWidth: 16,
				horizontalDragMaxWidth: 16
			}).data().jsp);
            
             
            
		}
	);
    
    pane3 = $('#scroll-pane-chat');
    api3 = pane3.data('jsp');	
        
        if (api3  )
        { 
             if (window.oldCont===undefined) oldCont=0;
    
             if (api3.getContentPositionY()==0 || api3.getContentHeight()!=oldCont)
             {
                  api3.scrollToBottom();
                 oldCont=api3.getContentHeight();
             }
               
                
        }      
            
}
function auto_heigh(id){ // пересчет высоты контейнера для скролинга
                     
    var ht = $('#'+id).height();
    ht=ht+20;
    ht=ht+'px';

    $('.auto_heigh-'+id+' .jspContainer').css('height', ht);
}
function open_chat(user_char2,type,name)
{
	$('#chat_text').html(name);
      user_char = user_char2;
  
	  if (window.chat_type === undefined) chat_type=type;
	  if (chat_type!=type)  chat_open=1;
	   chat_type=type;
	   
    if ($('#win-chat').is(':visible'))
     {
        load_chat(); 
     }
     
     
}
function load_chat()
{
     
    if ($('#win-chat').is(':visible'))
     {
         ajax('ajax.php','do=chat_get&char='+user_char+'&gos='+chat_type,'#win-chat_ajax');
         setTimeout(load_chat, 5000);
     }
     
}
function open_chat_admin( )
{ 
    user_char=0;
	chat_type=-1;	
     if ($('#win-chat').is(':visible'))
     {
        load_chat(); 
     } 
     
}
 
function initTitle() {
	
	
	var browserWidth = document.documentElement.clientWidth,
		browserHeight = document.documentElement.clientHeight,
		s_x = 20, 
		s_y = -20,
		show_time = 10000,
		to;
		$('#title').remove();
		
		$('<span id=title></span>').appendTo('body').hide().bind("click", function(e){
			 $('#title').hide();
		} );
		 
		title2=0; 
		
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
						.fadeIn('fast').css({left:(coordX+s_x)+'px', top:(coordY+s_y)+'px'})
						if(show_time) to = setTimeout(hide_title, show_time)
				})
				.mouseout( hide_title )
				.mousemove(function(evt){
					 
					if (title2==0)
					{
						var coordY = evt.pageY;
						if (browserWidth - evt.pageX < 100 ) {
							var coordX = evt.pageX - 100;
							coordY=coordY-40;
						}
						else {
							var coordX = evt.pageX;
						}
						
						
						if (browserHeight - coordY < $('#title').height() ) {
							coordY = coordY - $('#title').height();
							
							if (  (coordY-$('#title').height()/2) <0  ) {
								coordY = coordY + $('#title').height()/2;
							}
						} 
						$('#title').css({left:(coordX + s_x) + 'px', top:(coordY + s_y) + 'px'})   
					}
					
				    //$('#title').css({left:(evt.pageX+s_x)+'px', top:(evt.pageY+s_y)+'px'})   
				});
		});
	function hide_title(){ clearTimeout(to); $('#title').hide(); }
}
function isPDAClient () {
     if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		 	return true;  
	  } else {
	 	return false;  
	  }
	 
}

  
 
function checkpomeha(coordX,coordY,el,icon)
{
	pomeha = false;
			var fieldCoordX = -(field.offsetLeft);
			var fieldCoordY = -(field.offsetTop); 	
				 var halfWidth = el.attr('w');
		
				var halfHeight = el.attr('h');
				var center_niz = parseFloat(el.attr('center_niz'));
		var center_vert = parseFloat(el.attr('center_vert'));
				coordX=parseFloat(coordX);
				halfWidth=parseFloat(halfWidth);
				halfHeight=parseFloat(halfHeight);
				 
				coordY=parseFloat(coordY);
				
				
				//теперь конвертируем х и y в изометрическую проекцию
				C = 1600;
				Xo=fieldCoordX +coordX;
				Yo=fieldCoordY +coordY-200+8;
				px=parseInt(Xo/32)-50;
				py=parseInt(Yo/16);
				y=(py+px)/2;
				x=py-y;
				
				
				
				// x   = parseInt((Yo+50-Xo/32)/2);   
				//y=parseInt((Yo-x*16)/16)  ; 
				 //y=parseInt((Xo+x*32-1600)/32); 
				var h = el.attr('w_klet'); 
				var w = el.attr('h_klet'); 
				if (x-h+1<1 || y-w+1<1 || x>48 || y>48) {pomeha=true;}
				if (zdan_array_ids[y]!==undefined) 
				if (zdan_array_ids[y][x]!==undefined) 
				if (zdan_array_ids[y][x]!=0)  {pomeha=true;}
				
				if (w>0)
				{ 
					for (yy=0;yy<=w-1;yy++)
					{
						 
						for (xx=0;xx<=h-1;xx++)
						{
							 
							if (zdan_array_ids[y-yy]!=undefined)
							{
								if (zdan_array_ids[y-yy][x-xx]!=undefined)
								{
									if (zdan_array_ids[y-yy][x-xx]!=0)  {pomeha=true;}
								}
								else  {pomeha=true;}
							}
							else  {pomeha=true;}
							 
						}
					}
				}
				 
				
				var st=false;
				rx = parseInt(x/10)+1;
				ry = parseInt(y/10)+1;
				
				 
				
				if (rx>5) pomeha=true;
				else if (ry>5) pomeha=true;
				else if (ry<1) pomeha=true;
				else if (rx<1) pomeha=true;
				else if (window.rayon[rx][ry]==1 ) st=true;
				
				if (!st && window.rayon !== undefined)
				{
					$(icon).find("img").addClass("red_border"); 
				}
                
                
                if (pomeha)
                {
                     
                    $(icon).find("img").addClass("red_border");
                    //setTimeout($(icon).find("img").removeClass("red_border"),2000);
                    return false;
                }
				else {
					$(icon).find("img").removeClass("red_border");
					return true;
				}
	
}


function perenos_zdan(zid,ee)
{
	$(document).unbind('mousemove');
			$(document).unbind('click');
			$(document).unbind('touchstart');
			$(document).unbind('touchend');
			$(document).unbind('touchmove');
			
	el2=zid;
	 
	for(var y = 0; y <= 49; y++) {
		for(var x = 0; x <= 49; x++) {
			if (zdan_array_ids[y][x]==zid)  zdan_array_ids[y][x]=0;
		}
	}
	
	 
        $.post('ajax.php',
					'do=get_build_info&build='+zid , 
				function(data, textStatus){ 
					$('#perenos_temp').empty()
							.append(data);
                    zdan_function(ee);
				},
					"html" // "xml", "script", "json", "jsonp", "text"
			);
    
	 
	
	
}
select_klet = function(e) {
		klet = document.getElementById('city_klet');
			var fieldCoordX = -(field.offsetLeft);
			var fieldCoordY = -(field.offsetTop); 
			
			window.clientX=e.clientX;
			window.clientY=e.clientY;
			
			var new_x = parseInt((fieldCoordX+e.clientX)/canvas_zoom /32);
			 var new_y = parseInt((fieldCoordY+e.clientY)/canvas_zoom /16);
			 if (new_y%2!= new_x%2 ) new_x=new_x+1; 
					window.zdanx =  new_x*32 -fieldCoordX  ;// -32;
					window.zdany =  new_y*16 -fieldCoordY ;
			
			
			 
			 var new_x = parseInt((fieldCoordX+e.clientX)/canvas_zoom/32);
			 var new_y = parseInt((fieldCoordY+e.clientY)/canvas_zoom/16);
			 if (new_y%2!= new_x%2 ) new_x=new_x-1;
			 
			  
			  //делаем сдвиги по оси
					 zdanx1 =  new_x*32-fieldCoordX ;// -32;
					 zdany1 =  new_y*16-fieldCoordY  -8;
				 
			$(klet).show();
			
			 
			C = 1600;
				Xo=fieldCoordX +zdanx1+32;
				Yo=fieldCoordY +zdany1+16-200+8;
				px=parseInt(Xo/32)-50;
				py=parseInt(Yo/16);
				y=parseInt((py+px)/2);
				x=parseInt(py-y)-1; 
		 
			klet.style.left = (new_x*32*canvas_zoom) + "px";
			klet.style.top = (new_y*16*canvas_zoom-8*canvas_zoom ) + "px";
			
					
			
				
			if (x<0 || x>49 || y<0 || y>49 || zdan_array_ids[y][x]<1) 
			{
				$(klet).hide();
				$('#title').hide();
			}
			else {
				$(klet).show();
				$('#title').css({left:((new_x*32*canvas_zoom-fieldCoordX) + 30*canvas_zoom ) + 'px', top:((new_y*16*canvas_zoom-fieldCoordY) + 30*canvas_zoom ) + 'px'});
				$('#title').show();
				$('#title').html(zdan_array_names[y][x]);
			}
			 
		};
		
function city_klet_click(e) {
			klet = document.getElementById('city_klet');
			var fieldCoordX = -(field.offsetLeft);
			var fieldCoordY = -(field.offsetTop); 
			 
			 var new_x = parseInt((    parseInt(klet.style.left)+32)/canvas_zoom/32);
			 var new_y = parseInt((   parseInt(klet.style.top)+16)/canvas_zoom/16);
			 if (new_y%2!= new_x%2 ) new_x=new_x-1;
			 
			  
			  //делаем сдвиги по оси
					 zdanx1 =  new_x*32-fieldCoordX  ;// -32;
					 zdany1 =  new_y*16-fieldCoordY ; 
			 
			C = 1600;
				Xo=fieldCoordX +zdanx1;
				Yo=fieldCoordY +zdany1-200+8;
				px=parseInt(Xo/32)-50;
				py=parseInt(Yo/16);
				y=(py+px)/2;
				x=py-y-1; 
			 
				var cid = zdan_array_ids[y][x];
				
				if (cid>0)
				{
					$('.left_hide').hide();ajax('ajax.php','do=zdan_info&zdan='+cid,'#zdan-info-ajax');$('#bilding-win').show();$('.zdan_select').removeClass('zdan_select');$(this).children().addClass('zdan_select');
		
				}
				else {
					$('#city_klet').hide();
				}
			 
		} 
 	
		
		


function clickToDrag() {
	var browserWidth = document.documentElement.clientWidth;
	var browserHeight = document.documentElement.clientHeight;
	 
	
	zdan_function = function(e) {
		if (el2>0) var el=$("#build_perenos"+el2);
		else var el = $(this);
		
		for (var ri = 0; ri < 5; ri++) {
		    for (var rj = 0; rj < 5; rj++) {
				if (window.rayon[ri+1][rj+1]==1)
					$('#canvas_rayon'+ri+'_'+rj).show();
			}
		}
		  
		
		 
		$(field).unbind('mousemove');
		
		var almaz = parseFloat(el.attr('almaz'));
		 
		if (almaz=='3' && almaz_use==0)
		{
			if (!confirm('Вы собираетесь построить здание за деньги. К сожалению, у вас недостаточно ресурсов для постройки этого здания, но вы можете возвести его, используя деньги которые будут потрачены на рынке автоматически. В дальнейшем вы можете обращать на это внимание, замечая синюю жолтую здания в меню строительства.')) return false;
			almaz_use=3;
		}
		 
		
		if (document.documentElement.clientWidth<1000)  $('#win-bilding').hide();
		
	 
		var icon = document.createElement('div');
		$(icon).addClass('tools-icon');
		document.body.appendChild(icon);
		zdan_start_allow=1;
		regime_perenos=0;
		if (el.attr('ob')>0)
		{
			 $('#win-bilding').hide();
			var img = document.createElement('img');
			img.setAttribute('src', el.find('img').attr('src'));
			
			//zdan_start_allow=0;
			regime_perenos=1;
			window.zdan = el2; 
			
			if (el2>0) el.unbind('click');
			
		}
		else { 
			var img = document.createElement('img');
			img.setAttribute('src', el.find('img').attr('src'));
			window.zdan = el.attr('zdan'); 
		} 
		icon.appendChild(img); 
		
		
		var halfWidth = el.attr('w'); 
		var halfHeight = el.attr('h');
		
		var h = el.attr('w_klet'); 
		var w = el.attr('h_klet');
		
		img.setAttribute('width', el.attr('w')*canvas_zoom); 
		  
		var cursorX = e.clientX - halfWidth;
		var cursorY = e.clientY - halfHeight;
		$(icon).attr('style', 'left: ' + cursorX + 'px; top: ' + cursorY + 'px;');
		$(document).bind('mousemove', function(e) {
			var fieldCoordX = -(field.offsetLeft);
			var fieldCoordY = -(field.offsetTop); 
			
			var WHeight=window.innerHeight;
			if (WHeight==0) WHeight=$(window).height();
			var WWidth=window.innerWidth;
			if (WWidth==0) WWidth=$(window).width();
			
			if (e.clientX<100*canvas_zoom)
			{
				//if ($(field).offset().left + field.width < $(window).width()-800) 
					$(field).offset({left:($(field).offset().left+20*canvas_zoom)});
			}
			if (e.clientX>WWidth-100*canvas_zoom)
			{
				//if ($(field).offset().left > +600) 
					$(field).offset({left:($(field).offset().left-20*canvas_zoom)});
			}
			if (e.clientY<100*canvas_zoom)
			{
				//if ($(field).offset().top + field.height < $(window).height()-800)
					$(field).offset({top:($(field).offset().top+20*canvas_zoom)});
			}
			if (e.clientY>WHeight-100*canvas_zoom)
			{
				//console.log(window.innerHeight,window);
				//if ($(field).offset().top > +300) 
					$(field).offset({top:($(field).offset().top-20*canvas_zoom)});
			}
			
                                    
                          
			 
			 /*
			 var new_x = parseInt((fieldCoordX+e.clientX) /32);
			 var new_y = parseInt((fieldCoordY+e.clientY) /16);
			 if (new_y%2!= new_x%2 ) new_x=new_x+1; 
			  //делаем сдвиги по оси
					window.zdanx =  new_x*32-fieldCoordX  ;// -32;
					window.zdany =  new_y*16-fieldCoordY ;
			console.log(window.zdanx,window.zdany);	 
			*/
			//альтверсия
			var new_x = parseInt((fieldCoordX+e.clientX)/canvas_zoom /32);
			 var new_y = parseInt((fieldCoordY+e.clientY)/canvas_zoom /16);
			 if (new_y%2!= new_x%2 ) new_x=new_x+1; 
					window.zdanx =  new_x*32 -fieldCoordX  ;// -32;
					window.zdany =  new_y*16 -fieldCoordY ;
			//console.log('alt',window.zdanx,window.zdany);	 
			
			icon.style.left = ((new_x*32*canvas_zoom -fieldCoordX)   -  parseInt(halfWidth*canvas_zoom/(parseInt(h)+parseInt(w))*w)  )    + "px";
			icon.style.top = ((new_y*16*canvas_zoom -fieldCoordY)    -  parseInt(halfHeight)*canvas_zoom   +(32+8)*canvas_zoom   )  + "px";
			
			
			checkpomeha(window.zdanx ,window.zdany,el,icon);
			 
			 
		});
		zdan_click_start = function(e) {
			if (zdan_start_allow==0)
			{
				zdan_start_allow=1;//костыль чтобы дать время для переноса здания
				return;
			}
			var coordX = window.zdanx;
			var coordY = window.zdany;
			var fieldCoordX = -(field.offsetLeft);
			var fieldCoordY = -(field.offsetTop); 
			  
            if ( isPDAClient()) 
			{
				 
				  if (e.originalEvent.touches[0]  !== undefined )   touch = e.originalEvent.touches[0];
				  else touch=endCoords;
				  
				 
				// if (e.changedTouches[0]  !== undefined )  touch = e.changedTouches[0];
				
				//var new_x = parseInt((fieldCoordX+e.clientX)/32);
				// var new_y = parseInt((fieldCoordY+e.clientY)/16);
				 //if (new_y%2!= new_x%2 ) new_x=new_x+1;
				
				coordX =  parseInt((fieldCoordX+touch.pageX))-fieldCoordX;
				coordY =  parseInt((fieldCoordY+touch.pageY))-fieldCoordY;
				 
			}				
           
			if (coordX >   550 && coordY >   50   ||  ( coordX >   50  && $('#win-bilding').attr('style')!='display: block;'   )) {
				
				
				if (checkpomeha(coordX,coordY,el,icon))
				{
					
					if (document.documentElement.clientWidth<1000)  $('#win-bilding').show();
				  //   alert(parseInt(fieldCoordX) +'+'+ parseInt(coordX)+','+parseInt(fieldCoordY)+'+'+  parseInt(coordY)+'='+window.zdan);
					$('.rayon').hide();
					$(document).unbind('mousemove');
					$(document).unbind('click');
					$(document).unbind('touchstart');
					$(document).unbind('touchend');
					$(document).unbind('touchmove');
					document.body.removeChild(icon);
					$('.tools-icon').remove();
					
					$(field).bind('mousemove', select_klet);
					
					console.log(window.zdan, x,y, almaz_use , regime_perenos);
					add_zdan( window.zdan, x,y, almaz_use , regime_perenos);
					 
				}
				else return false;
                
                
				
			}
			$('.rayon').hide();
			$(document).unbind('mousemove');
			$(document).unbind('click');
			$(document).unbind('touchstart');
			$(document).unbind('touchend');
			$(document).unbind('touchmove');
			document.body.removeChild(icon);
			$('.tools-icon').remove();
			
			$(field).bind('mousemove', select_klet);
		};
		if ( isPDAClient()===false)  
			$(document).bind('click',zdan_click_start );
		else { 
		
			$(document).bind('touchstart',zdan_click_start );
			 var endCoords = {};
			$(document).bind("touchmove", function(event) {
				endCoords = event.originalEvent.targetTouches[0];
			});
			$(document).bind('touchend', zdan_click_start ); 
		}
		
		window.addEventListener("keydown", function(e){
 
        if (e.keyCode == 27) {
			$(document).unbind('mousemove');
			$(document).unbind('click');
			$(document).unbind('touchstart');
			$(document).unbind('touchend');
			$(document).unbind('touchmove');
			$(window).unbind('keydown');
			document.body.removeChild(icon);
			$(field).bind('mousemove', select_klet);
				} 
			}, true);

		return false;
	};

	//if ( isPDAClient()===false)  
	el2=0;
	$('.zdan_icon').off().click(zdan_function   );

	//else   $('.zdan_icon').bind("touchstart", zdan_function); 
		 
	 
}

 
function init() {
	//Scroll-pane
	field = document.getElementById('field');
	initScrollPane();
	title2=0; 
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
	$('#title_help').remove();
	
	$('<span id=title_help></span>').appendTo('.t-nav').hide();
	console.log('Интерфейс проинициализирован');
}

function initfield() {
    field = document.getElementById('field');
	field2 = document.getElementById('field_2');
    $(field).drags();
     $('#field_2').drags(); 
	 $(field).bind('mousemove', select_klet);
	 add_whell(field,function(e) {
		  e = e || window.event; 
		  // wheelDelta не дает возможность узнать количество пикселей
		  var delta = e.deltaY || e.detail || e.wheelDelta; 
		  // if ($.browser.mozilla) delta=delta*10;
			var new_zoom=canvas_zoom-delta/1000;
			setzoom(new_zoom);
		  e.preventDefault ? e.preventDefault() : (e.returnValue = false);
		});
		
	add_whell(field2,function(e) {
		  e = e || window.event; 
		  // wheelDelta не дает возможность узнать количество пикселей
		  var delta = e.deltaY || e.detail || e.wheelDelta;  
		 // if ($.browser.mozilla) delta=delta*10;
			if(canvas_zoom>=0.15) var new_zoom=canvas_zoom-delta/2000;
			else if (canvas_zoom>=0.05)  var new_zoom=canvas_zoom-delta/10000;
			else  var new_zoom=canvas_zoom-delta/30000;
			if (new_zoom>=0.03 && new_zoom<0.15 && new_zoom>canvas_zoom) new_zoom=0.15;
			else if (new_zoom>=0.03 && new_zoom<0.15  ) new_zoom=0.025;
			 
			setzoom_map(new_zoom);
		  e.preventDefault ? e.preventDefault() : (e.returnValue = false);
		});
    
    $(field).bind('mouseup', function(e) {
        var browserWidth = document.documentElement.clientWidth,
            browserHeight = document.documentElement.clientHeight,
            
            fieldWidth = field.offsetWidth,
            fieldHeight = field.offsetHeight,
            coordX = (browserWidth - fieldWidth) / 2,
            coordY = (browserHeight - fieldHeight) / 2; 
                             if ($(field).offset().left > +600 ) 
                                    $(field).offset({left:+600 });
                            
                            if ($(field).offset().top > +300*canvas_zoom) 
                                    $(field).offset({top:+300*canvas_zoom});
                            
                            if ($(field).offset().left + fieldWidth < $(window).width()-800*canvas_zoom ) 
                                    $(field).offset({left:$(window).width() - fieldWidth-800*canvas_zoom });
                            
                            if ($(this).offset().top + fieldHeight < $(window).height()-800*canvas_zoom) {
                                    $(field).offset({top:$(window).height() - fieldHeight-800*canvas_zoom});
                            }
    })
    
    
    
        
    
     field2 = document.getElementById('field_2');
    $(field2).bind('mouseup', function(e) {
        var browserWidth = document.documentElement.clientWidth,
            browserHeight = document.documentElement.clientHeight,
              
            fieldWidth = field2.offsetWidth,
            fieldHeight = field2.offsetHeight ; 
             
            
                             if ($(field2).offset().left > 0) 
                                    $(field2).offset({left:0});
                            
                            if ($(field2).offset().top > 75) 
                                    $(field2).offset({top:75}); 
                            
                            if ($(field2).offset().left + fieldWidth < $(window).width()-330) 
                                    $(field2).offset({left:$(window).width()-330 - fieldWidth});
                             
                            if ($(field2).offset().top + fieldHeight+40 < $(window).height()) {
                                  
                                    $(field2).offset({top:$(window).height() - fieldHeight-40});
                            }
                            
                            
                            
            coordX=($(field2).offset().left-browserWidth/2)*(-1);
            coordY=64-$(field2).offset().top-(browserHeight-64)/2 ;                
                        
                            
            load_map(coordX,coordY,1);
    })
}




            
//Загрузка документа
$(document).ready(function() {
    initfield(); 
	 moveToCenter();
	//Поле
    
        
    
   // if (typeof window['initMaps'] == 'function')  alert(2); else alert(3);//initMaps();
	init();
	init();
	initForms();
	check_ajax_info();
	setTimeout(check_ajax_info,10000);
	setInterval(check_ajax_info,60000);
    
	fulscr=0;
	 
	
    window.addEventListener("keydown", function(e){
 
        if (e.keyCode == 122 || e.keyCode ==121 ) {
				 var doc = document.body;
			 if (fulscr==0)
			 {
				
				if(doc.requestFullscreen){
				  doc.requestFullscreen();
				}
				else if(doc.mozRequestFullScreen){
				  doc.mozRequestFullScreen();
				}
				else if(doc.webkitRequestFullScreen){
				  doc.webkitRequestFullScreen();
				}
				fulscr=1;
			 }
			 else {
				 if(document.exitFullscreen){
				  document.exitFullscreen();
				}
				else if(document.mozCancelFullScreen){
				  document.mozCancelFullScreen();
				}
				else if(document.webkitCancelFullScreen){
				  document.webkitCancelFullScreen();
				}
				 fulscr=0;
			 }
				} 
			}, true);
});


// PAGE PRELOADER

$(window).on('load', function () {
    var $preloader = $('#page-preloader'),
        $spinner   = $preloader.find('.spinner');
    $spinner.fadeOut();
   $preloader.delay(150).fadeOut('slow');
});


function initForms()
{
	$('button[type=submit]').bind("onclick", function(e){
		$(e).closest('form').submit();
		//e.form.submit();
		console.log($(e).closest('form'));
		return false;
	} );
}

if ( isPDAClient()===true)  {
	
	$('#fullscreen').hide();
	$('#fullscreen').empty();
	$('#fullscreen').remove();
}

function ajax_post(file,form_id,div)
    {
		$('select').removeAttr('disabled');
		$(div).empty() .append('<div style="text-align:center;width:100%;height:100%;vertical-align:middle;"><img width="50" src="/game_files/img/other/gif-load.gif"></div>');
       $.ajax({
				   type: "POST",
				   url:  file,
				    cache:false,
					contentType: false,
					processData: false,
				   data: new FormData(form_id), // serializes the form's elements.
				   success: function(data)
				   {
					    $(div).html(data);  
						initForms();
				   }
		});
    }

function getOffsetSum(elem) {
    var top=0, left=0
    while(elem) {
        top = top + parseFloat(elem.offsetTop)
        left = left + parseFloat(elem.offsetLeft)
        elem = elem.offsetParent        
    }
    
    return {top: Math.round(top), left: Math.round(left)}
}
	
//вешаем на обьект стрелочку. после клика стрелочка исчезает и можно тыкать куда хочешь.	
function strelka(obj,type,text,kol)
{
	if ($(obj+'.strelka'+type).length==0) 
	{
		
		$('.strelka'+type).removeClass('strelka'+type);
		$(obj).addClass('strelka'+type);
		//if (kol<2) $('.overlay').show();  
		 
		//$('strelka'+type+'::before').unbind("click");
		var ofset = $('.ub_ava').offset();
		if ($(obj).length>0)
		{
			$('#title_help').css({display: 'block', left:(109 ) + 'px', top:(170 ) + 'px'});
			$('#title_help').html(text);
		}
		
		$('#title_help').bind("click", function(e){ 
			$('#title_help').hide();
			$('#title_help').unbind("click"); 
		});
		
		$(obj).bind("mousedown", function(e){
			console.log('st1');
			$('.overlay').hide();
			$(obj).removeClass('strelka'+type);
			$(obj).unbind("mousedown"); 
			$('#title_help').html('');
			$('#title_help').hide();
			check_ajax_info(kol);//отмечаем квест сделанным
			console.log('st2');
		});
	} 
}

function check_ajax_info(doit=0)
{
	 
	$.post('ajax_system.php',
			'do=check_ajax_info&doit='+doit ,//отмечаем обучалку сделанной и обновляем
		function(data, textStatus){
			$('#n_count_res').html(data.count_res);
			$('#n_count_teh').html(data.count_teh);
			$('#n_count_mes').html(data.count_mes);
			$('#research_count').html($('#centers_count').html()-data.count_teh); 
			
			$('#n_count_quest').html(data.count_quest);
			if (data.count_res>0) $('#n_count_res').show(); else  $('#n_count_res').hide();
			if (data.count_teh>0) $('#n_count_teh').show(); else  $('#n_count_teh').hide();
			if (data.count_mes>0) $('#n_count_mes').show(); else  $('#n_count_mes').hide();
			if (data.count_quest>0) $('#n_count_quest').show(); else  $('#n_count_quest').hide(); 
			//бой начался
			if (data.batle>0) window.open("/battle?id="+data.batle, "_blank");
			//если обучалка еще есть
			if (data.teach  !== undefined && data.teach  !== null)
			if (data.teach.obj !== undefined) strelka(data.teach.obj,data.teach.type,data.teach.text,data.teach_с);
			 
		},
                        "json" // "xml", "script", "json", "jsonp", "text"
	);
}
 
 
       function mobile_toggle(e) {
            $(e).toggleClass('mobile-toggle--opened');
            $('.user_box').toggleClass('hidden');
            $('.r_crist').toggleClass('hidden');

            $('.r_city').toggleClass('hidden');
            $('.c_resors').toggleClass('hidden');
            $('.t-nav .l').toggleClass('hidden');
            $('.t-nav .r').toggleClass('hidden');

            $('.t-nav').toggleClass('menu-opened');

            $('.l-nav').toggleClass('hidden');
            $('.roll').toggleClass('hidden');
        } 
 
	default_height=0;
	
	function menu_hover(toend,count)
	{
		default_height=$('.p_main').height();
		if (toend<count) var a = count-toend;
		$('.p_main').height(parseInt(default_height)+parseInt(a*45));
		
		console.log(a*45,$('.p_main').height());
	}
	
	function menu_hover_out()
	{ 
		$('.p_main').height(default_height);
	}
	