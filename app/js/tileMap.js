function tileMap() {
    var init = {};
    var tile = {};
	var start_x=0;
	var start_y=0;
    this.setTile = function(arr) {
        tile.arr = arr;
    };
    this.setInit = function(arr) {
        init.arr = arr;
    };
    this.setTileSize = function(i, j) {
        tile.width = i;
        tile.height = j;
    };
    this.setInitSize = function(i, j) {
        init.width = i;
        init.height = j;
    };
    this.getTile = function() {
        return tile;
    };
    this.getInit = function() {
        return init;
    };
    this.draw = function(context) {
        for (var i = tile.arr.length-1; i >=0; i=i-1) {
            for (var j = 0; j < tile.arr[i].length; j++) {
				if (init.arr[tile.arr[i][j]]!==undefined )   
				{
					context.drawImage(
						init.arr[tile.arr[i][j]].pic,  init.arr[tile.arr[i][j]].coord[0] * init.width, init.arr[tile.arr[i][j]].coord[1] * init.height, init.width, init.height, start_x+j * tile.height, start_y+i * tile.width, tile.width, tile.height);
				}
            }
        }
    };
}

function array_create(object)
{
	 
	var arr = [];
	 
	for(var index in object) { 
		var attr = object[index]; 
		var arr2 = [];
		for(var index2 in attr) { 
			
			arr2.push(attr[index2]);
		}
		 
		arr.push(arr2);
	}
	
	return arr;
}