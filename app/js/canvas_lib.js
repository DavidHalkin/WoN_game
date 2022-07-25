function renew_zdan(x,y,element)
{
	
	var ctx = element.getContext('2d');
	var x_sdvig=0;
	var y_sdvig=0;
	if (x>=25) x_sdvig=25;
	if (y>=25) y_sdvig=25;
	
	var img_osn = zdan_img_array[zdan_array[y][x]];
	Xo=get_coor_x(x-x_sdvig,y-y_sdvig);
	Yo=get_coor_y(x-x_sdvig,y-y_sdvig);
	zdan_img_array[zdan_array[y][x]].setAttribute('x',Xo);
	zdan_img_array[zdan_array[y][x]].setAttribute('y',Yo);
	zdan_img_array[zdan_array[y][x]].setAttribute('width',img_osn.width);
	zdan_img_array[zdan_array[y][x]].setAttribute('height',img_osn.height);
	
	var klet_w=parseInt(img_osn.getAttribute('w'));
	var klet_h=parseInt(img_osn.getAttribute('h'));
	for (yy=0;yy<=klet_h-1;yy++)
	{
		for (xx=0;xx<=klet_w-1;xx++)
		{
			if (xx!=0 || yy!=0) zdan_array[y-yy][x-xx]='0';
		}
	}
	Xo2 = Xo   - parseInt(img_osn.width/(parseInt(klet_h)+parseInt(klet_w))*klet_h);
	Yo2 = Yo - img_osn.height  +16  +canvas_prosvet ;
	ctx.clearRect(Xo2, Yo2, img_osn.width, img_osn.height);
	count_img=0;
	
	var imgs = new Array();
	var imgs_x = new Array();
	var imgs_y = new Array();
	var max=0;
	for (i=x-5;i<x+5;i++)
	{
		for (j=y-5;j<y+5;j++)
		{
			if (zdan_array[j]!=undefined &&  zdan_array[j][i]!=undefined)
			{
				
			
				if (   zdan_img_array===undefined || zdan_array===undefined)
				{
					ajax('ajax.php','do=show_city' ,'#ajax_add_zdan'); 
					return;
				}
				if (zdan_img_array[zdan_array[j][i]]!=undefined)
				{ 
					
					var klet_w=parseInt(zdan_img_array[zdan_array[j][i]].getAttribute('w'));
					var klet_h=parseInt(zdan_img_array[zdan_array[j][i]].getAttribute('h'));
					
					var ind = (j-klet_w+1)*100+(i-klet_h+1)*100+i-klet_w-klet_h;
					ind=get_ind(imgs,ind,klet_w); 
						
					imgs[ind]=zdan_img_array[zdan_array[j][i]]; 
					if (max<ind) max=ind;
					imgs_x[ind]=i;
					imgs_y[ind]=j; 
					count_img=count_img+1;
					 
					
				}	
			 
			} 
		}
	}
	
 
	count_img2=0;
	
	for (i=0;i<=max;i++)
	{
		if (imgs[i]!=undefined)
		{
			count_img2=count_img2+1;

			
			var klet_x=parseInt(imgs[i].getAttribute('x'));
				var klet_y=parseInt(imgs[i].getAttribute('y'));
				var klet_w=parseInt(imgs[i].getAttribute('w'));
				var klet_h=parseInt(imgs[i].getAttribute('h'));
			 
			
			 var imgs_width=parseInt(imgs[i].getAttribute('width'));
			 var imgs_height=parseInt(imgs[i].getAttribute('height'));
			 
			
			if ( (Xo== klet_x &&  Yo==klet_y) || (Xo<=klet_x+imgs_width   && Xo+img_osn.width>=klet_x   &&  Yo<=klet_y+imgs_height  && Yo+img_osn.height>=klet_y  ))
			{
				 
				
				var klet_x1=Xo;
				var klet_y1=Yo;
				var klet_w1=parseInt(img_osn.getAttribute('w'));
				var klet_h1=parseInt(img_osn.getAttribute('h'));
				
				
				
				if (klet_w<1) return;
				 
				Xo2 = Xo   - parseInt(img_osn.width/(parseInt(klet_h1)+parseInt(klet_w1))*klet_h1);
				Yo2 = Yo - img_osn.height  +16  +canvas_prosvet ;
				
				Xo1=klet_x - parseInt(imgs[i].width/(parseInt(klet_h)+parseInt(klet_w))*klet_h);
				Yo1=klet_y - imgs[i].height  +16  +canvas_prosvet;
				
				Xs=Xo2;
				Ys=Yo2;
				
				stX=0;
				stY=0;
				
				if (Xo1>Xo2) Xs=Xo1;
				else stX=Xo2-Xo1;
				if (Yo1>Yo2) Ys=Yo1;
				else stY=Yo2-Yo1;
				
				s_width=imgs[i].width;
				s_height=imgs[i].height;
				 
				if (Xo1+s_width>Xo2+img_osn.width) s_width=Xo2+img_osn.width-Xo1;
				if (Yo1+s_height>Yo2+img_osn.height) s_height=Yo2+img_osn.height-Yo1; 
				
				ctx.drawImage(imgs[i], stX, stY,s_width ,s_height  , Xs ,  Ys,s_width ,s_height  );
				 
			}
			
		}
	}
	
	 
	 
	
	if (count_img2<count_img) {
		ajax('ajax.php','do=show_city' ,'#ajax_add_zdan'); 
		return;
	}
	 
}

function get_coor_x(x,y)
{
	 
	 
	var C = Math.floor(1600 / 2);
  
	var Yo = (32 / 2) * (x+y+1 );	 
	var Xc = C - (64 / 2 * x);  
	var Xo = Xc + ( y  * (64 / 2));
	
	return Xo;
}

function get_coor_y(x,y)
{
	  
	var C = Math.floor(1600 / 2);
  
	var Yo = (32 / 2) * (x+y+1 );	 
	var Xc = C - (64 / 2 * x);  
	var Xo = Xc + (  y  * (64 / 2));
	
	return Yo;
}

Array.prototype.in_array = function(p_val) {
	for(var i = 0, l = this.length; i < l; i++)	{
		if(this[i] == p_val) {
			return true;
		}
	}
	return false;
};

canvas_prosvet=100;//сдвиг сверху чтобі здания біли видны

zdan_img_array = new Array();
	
	function loadzdan(dy,dx,type)
	{	
		if (zdan_array[dy][dx]!='0')
		{
					index=zdan_img_array.length+1 ;
					zdan_img_array[index]=new Image(); 
					zdan_img_array[index].src = '/game_files/img/zdan/'+ zdan_array[dy][dx]; 
					zdan_array[dy][dx]=index;
					 
					zdan_img_array[index].onload = function() { 
						dx=dx+1;
						if (dx>=50) {
							dx=0;
							dy=dy+1;
							if (dy>=50) 
							{
								 
								if (type!=2) start_canvas(type);
								
								 return;
							}
						}
						 
						  loadzdan(dy,dx,type);
					}
		}
		else {
			dx=dx+1;
						if (dx>=50) {
							dx=0;
							dy=dy+1;
							if (dy>=50) 
							{
								 
								if (type!=2) start_canvas(type);
								
								 return;
							}
						}
						
						  loadzdan(dy,dx,type);
		}
	}
	
	
	function create_city(element)
	{
		 element.width = 1600;
		element.height = 800+canvas_prosvet;
		
		var ctx = element.getContext('2d');
		ctx.clearRect(0, 0, element.width, element.height);
		var image = new Image();
		image.src = '/game_files/img/podlog2/leto.png';

		// Высота и ширина изображения
		var width = 64;
		var height = 32;
		
		image.onload = function() {

			function draw(x, y) {
				ctx.drawImage(image, x - width / 2, y - height / 2+canvas_prosvet, width, height);
			}
		 
			// Это будет координата X и Y для отрисовки ромба.
			// Мы не будем искать все углы для отрисовки прямоугольника, а только его центр
			// чтоб потом мы уже высчитали, как именно будем рисовать этот ромб.
			var Xo = 0;
			var Yo = 0;

			// Получение центра холста
			var C = Math.floor(element.width / 2);

			// Это сдвиг оси X, который вычисляется в зависимости
			// от текущей координаты Y
			var Xc = 0;
			
			var matrixHeight = 25;
			var matrixWidth = 25;

			for(var y = 0; y < matrixHeight; y++) {

				// Здесь высчитывается, на какой высоте должна начинаться отрисовка 
				Yo = (height / 2) * y;

				// Про эту переменную я уже рассказал чуть ранее.
				Xc = C - (width / 2 * y);

				
				for(var x = 0; x < matrixWidth; x++) {

					// Мы берем сдвиг координаты X и добавляем половину ширины изображения.
					// Мы никогда не сдвигаемся на всю ширину, только на половину.
					// Такая фишка изометрической матрицы
					Xo = Xc + (x * (width / 2));

					// Дополнительный сдвиг по оси Y.
					// Когда мы вычисляем координату X, то она мало того 
					// что сдвигается по оси X, но еще и по оси Y.
					Yo += height / 2;

					draw(Xo, Yo);
				 
				}
			}
			
			
		}
	}
	
	function create_rayon(element,minx=0,miny=0,maxx=10,maxy=10)
	{
		if (element==null) return;
		 element.width = 640;
		element.height = 320;
		
		var ctx = element.getContext('2d');
		ctx.clearRect(0, 0, element.width, element.height);
		var image = new Image();
		image.src = '/game_files/img/other/zdan_select.png';

		// Высота и ширина изображения
		var width = 64;
		var height = 32;
		
		image.onload = function() {

			function draw(x, y) {
				ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
			}
		 
			// Это будет координата X и Y для отрисовки ромба.
			// Мы не будем искать все углы для отрисовки прямоугольника, а только его центр
			// чтоб потом мы уже высчитали, как именно будем рисовать этот ромб.
			var Xo = 0;
			var Yo = 0;

			// Получение центра холста
			var C = Math.floor(element.width / 2);

			// Это сдвиг оси X, который вычисляется в зависимости
			// от текущей координаты Y
			var Xc = 0;
			
			var matrixHeight = maxy;
			var matrixWidth = maxx;

			for(var y = miny; y < matrixHeight; y++) {

				// Здесь высчитывается, на какой высоте должна начинаться отрисовка 
				Yo = (height / 2) * y;

				// Про эту переменную я уже рассказал чуть ранее.
				Xc = C - (width / 2 * y);

				
				for(var x = minx; x < matrixWidth; x++) {

					// Мы берем сдвиг координаты X и добавляем половину ширины изображения.
					// Мы никогда не сдвигаемся на всю ширину, только на половину.
					// Такая фишка изометрической матрицы
					Xo = Xc + (x * (width / 2));

					// Дополнительный сдвиг по оси Y.
					// Когда мы вычисляем координату X, то она мало того 
					// что сдвигается по оси X, но еще и по оси Y.
					Yo += height / 2;

					draw(Xo, Yo);
				 
				}
			}
			
			
		}
	}
	
	function create_zdan(element,dopx,dopy)
	{
		var imgs = new Array();
		var imgs_x = new Array();
		var imgs_y = new Array();
		var max=0;
		
		if (element===null) return;
		
		element.width = 1600;
		element.height = 800+canvas_prosvet; 
		var ctx = element.getContext('2d');
		ctx.clearRect(0, 0, element.width, element.height);
		  
		
		// Высота и ширина изображения
		var width = 64;
		var height = 32;
		 
  
			function draw_img2(  image2) {
				
				 
					var x=image2.getAttribute('x');
					var y=image2.getAttribute('y');
					var w=image2.getAttribute('w');
					var h=image2.getAttribute('h');
					if (w<1) return;
					image2.width=image2.width;
					image2.height=image2.height;
					ctx.drawImage(image2, x - parseInt(image2.width/(parseInt(h)+parseInt(w))*h) , y - image2.height  +16  +canvas_prosvet  , image2.width, image2.height);
				  
				  var dx = image2.getAttribute('dx');
				  var dy = image2.getAttribute('dy');
				
			}

			// Это будет координата X и Y для отрисовки ромба.
			// Мы не будем искать все углы для отрисовки прямоугольника, а только его центр
			// чтоб потом мы уже высчитали, как именно будем рисовать этот ромб.
			var Xo = 0;
			var Yo = 0;

			// Получение центра холста
			var C = Math.floor(element.width / 2);

			// Это сдвиг оси X, который вычисляется в зависимости
			// от текущей координаты Y
			var Xc = 0;
			
			var matrixHeight = 25;
			var matrixWidth = 25;

			for(var dx = -5; dx <matrixHeight+5; dx++) {
				
				
				
				for(var dy = -5; dy < matrixWidth+5; dy++) {
					x= dx;
					y= dy;
					// Здесь высчитывается, на какой высоте должна начинаться отрисовка 
					Yo = (height / 2) * (x+y+1 );	

					// Про эту переменную я уже рассказал чуть ранее.
					Xc = C - (width / 2 * y); 
					
					
					// Мы берем сдвиг координаты X и добавляем половину ширины изображения.
					// Мы никогда не сдвигаемся на всю ширину, только на половину.
					// Такая фишка изометрической матрицы
					Xo = Xc + (x * (width / 2));

					// Дополнительный сдвиг по оси Y.
					// Когда мы вычисляем координату X, то она мало того 
					// что сдвигается по оси X, но еще и по оси Y.
					//Yo += (height / 2) ;

					 
					if (zdan_array[x+dopx]!=undefined)
					if (zdan_array[x+dopx][y+dopy]!=undefined)
					if (zdan_array[x+dopx][y+dopy]!='0'  ) {
						// var image2  = new Image();
						//image2.src = '/game_files/img/zdan/'+zdan_array[y+dopy][x+dopx];
						  
						//draw_img2(Xo, Yo, image2);
						 
						zdan_img_array[zdan_array[x+dopx][y+dopy]].setAttribute('dx',x);
						zdan_img_array[zdan_array[x+dopx][y+dopy]].setAttribute('dy',y);
						
						zdan_img_array[zdan_array[x+dopx][y+dopy]].setAttribute('x',Xo);
						zdan_img_array[zdan_array[x+dopx][y+dopy]].setAttribute('y',Yo);
						
						zdan_img_array[zdan_array[x+dopx][y+dopy]].setAttribute('h',zdan_array_h[x+dopx][y+dopy]);
						zdan_img_array[zdan_array[x+dopx][y+dopy]].setAttribute('w',zdan_array_w[x+dopx][y+dopy]);
						
						var ind = (x+dopx-parseInt(zdan_array_w[x+dopx][y+dopy])+1)*100+(y+dopy-parseInt(zdan_array_h[x+dopx][y+dopy])+1)*100+x+dopx-parseInt(zdan_array_w[x+dopx][y+dopy]);
						ind=get_ind(imgs,ind,zdan_array_w[x+dopx][y+dopy]); 
						imgs[ind]=zdan_array[x+dopx][y+dopy]; 
						if (max<ind) max=ind; 
						 
					}
				}
			}
			
		for (i=-20000;i<=max;i++)
		{
			 
			if (imgs[i]!=undefined)
			{
				
				draw_img2( zdan_img_array[imgs[i]]);
			}
		}		
		 
	}
	
	function get_ind(imgs,ind,sdvig)
	{
		if (sdvig<1) sdvig=1;
		if (imgs[ind]!=undefined) return get_ind(imgs,ind-sdvig,sdvig);
		return ind;
	}
	
	
	function start_canvas(type=0)
	{
		 
		 
		
		
		//отрисовка зданий
		var element4 = document.getElementById('canvas_zdan4'); 
		$(element4).attr('style', 'width:'+1600*canvas_zoom+' px;height: '+(800+canvas_prosvet)*canvas_zoom+'px;position: absolute; left: ' + 800*canvas_zoom + 'px; top: ' + (800+canvas_prosvet)*canvas_zoom + 'px;');
		$(element4).attr('top',	(800+canvas_prosvet));
		$(element4).attr('left',800);
		create_zdan(element4,25,25); 
		
		var element2 = document.getElementById('canvas_zdan2'); 
		$(element2).attr('style', 'width:'+1600*canvas_zoom+' px;height: '+(800+canvas_prosvet)*canvas_zoom+'px;position: absolute; left: ' + 0 + 'px; top: ' + (400+canvas_prosvet)*canvas_zoom + 'px;');
		$(element2).attr('top',	(400+canvas_prosvet));
		$(element2).attr('left',0);		
		create_zdan(element2,0,25); 
		
		var element3 = document.getElementById('canvas_zdan3'); 
		$(element3).attr('style', 'width:'+1600*canvas_zoom+' px;height: '+(800+canvas_prosvet)*canvas_zoom+'px;position: absolute; left: ' + 1600*canvas_zoom + 'px; top: ' + (400+canvas_prosvet )*canvas_zoom+ 'px;');
		$(element3).attr('top',	(400+canvas_prosvet));
		$(element3).attr('left',1600);				
		create_zdan(element3,25,0);
		
		var element1 = document.getElementById('canvas_zdan1');
		$(element1).attr('style', 'width:'+1600*canvas_zoom+' px;height: '+(800+canvas_prosvet)*canvas_zoom+'px;position: absolute; left: ' + 800*canvas_zoom + 'px; top: ' + (0+canvas_prosvet)*canvas_zoom + 'px;'); 
		$(element1).attr('top',	(0+canvas_prosvet));
		$(element1).attr('left',800);		
		create_zdan(element1,0,0);
		
		 
	}

$(document).ready(function() {
	  /*
	var element1 = document.getElementById('canvas_city1');
			$(element1).attr('style', 'position: absolute; left: ' + 800 + 'px; top: ' + (0+canvas_prosvet) + 'px;');
			 
			create_city(element1);
			var element2 = document.getElementById('canvas_city2');
			
			$(element2).attr('style', 'position: absolute; left: ' + 0 + 'px; top: ' + (400+canvas_prosvet) + 'px;');
			 
			create_city(element2);
			var element3 = document.getElementById('canvas_city3');
			
			$(element3).attr('style', 'position: absolute; left: ' + 1600 + 'px; top: ' + (400+canvas_prosvet) + 'px;');
			 
			create_city(element3);
			var element4 = document.getElementById('canvas_city4');
			
			$(element4).attr('style', 'position: absolute; left: ' + 800 + 'px; top: ' + (800+canvas_prosvet) + 'px;'); 
			create_city(element4);
			*/
			
			
			for (i=0;i<5;i++)
			{
				for (j=0;j<5;j++)
				{
					var element2 = document.getElementById('canvas_rayon'+i+'_'+j);
					 min_y=0;
					 min_x=0;
					 max_y=10;
					 max_x=10;
					 
					if (j==4) max_x=9;   
					if (i==4) {if (j==0) max_y=10; else  max_y=9;   }   
					
					if (i==0) { if (j==0) {min_y=2;max_y=11;} else min_y=1;  }  
					if (j==0) {min_x=2;max_x=11; }    
					
					
					
					
					create_rayon(element2,min_x,min_y,max_x,max_y);
				}
			}
	
});
