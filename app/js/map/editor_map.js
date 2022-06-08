import { Map } from './map.js';

window.map = new Map();
new Editor();

function Editor() {

    const editingURL = '/ajax?do=edit_terra&c=map';

    map.container.addEventListener('map:click:left', add);
    map.container.addEventListener('map:click:right', remove);

    function add(e) {

        let id = +ui.aside.active_object;
        const coord = e.detail;
        const index = coord.index;
        const x = coord.col;
        const y = coord.row;
        let climat = null;
        let layerName = null;
        let array = [];
        let clearArray = [];
        let clearID = undefined;
        let noMountains = null;

        switch (id) {
            case 0:
                climat = 10;
                layerName = 'terrain';
                array = [{ x, y, climat }];
                break;
            case -1:
            case -2:
            case -3:
            case -5:
                climat = id;
                layerName = 'terrain';
                array = [{ x, y, climat }];
                break;
            case 1:
                let mountainGroupID = map.props.layer.nature[index];
                if (mountainGroupID < 101 || mountainGroupID > 108) noMountains = true;

                if (mountainGroupID === 1) return;
                if (!mountainGroupID || mountainGroupID.toString()[0] !== '1') {
                    mountainGroupID = 101;
                } else if (mountainGroupID + 1 > 108) {
                    mountainGroupID = 101;
                } else {
                    mountainGroupID += 1;
                }
                array = getMountainArray(mountainGroupID, x, y);

                layerName = 'nature';

                if (!noMountains) {
                    if (mountainGroupID - 1 < 101) {
                        clearID = 108
                    } else {
                        clearID = mountainGroupID - 1;
                    }
                    clearArray = getMountainArray(clearID, x, y, 'clear');
                }

                break;
            case 4:
            case 6:
            case 8:
            case 11:
                if (map.props.layer.terrain[index] === 0) return;
                climat = id;
                layerName = 'nature';
                array = [{ x, y, climat }];
                break;
            default:
                return;
        }
        if (id === 1) {
            if (location.hostname === 'localhost') {
                updateMapLayer(layerName, clearArray);
                updateMapLayer(layerName, array);
            } else {
                updateDB(layerName, clearArray, array);
            }
        } else {
            if (location.hostname === 'localhost') {
                updateMapLayer(layerName, array);
            } else {
                updateDB(layerName, array);
            }
        }

    }
    function remove(e) {

        let id = +ui.aside.active_object;
        const coord = e.detail;
        const index = coord.index;
        const x = coord.col;
        const y = coord.row;
        let climat = null;
        let layerName = null;
        let array = [];


        switch (id) {
            case 0:
                return;
            case -1:
            case -2:
            case -3:
            case -5:
                climat = 2;
                layerName = 'terrain';
                array = [{ x, y, climat }];
                break;
            case 1:
                let mountainGroupID = map.props.layer.nature[index];
                if (!mountainGroupID) return;
                if ((mountainGroupID >= 101 && mountainGroupID <= 108) || mountainGroupID === 1) {
                    climat = 2;
                    layerName = 'nature';
                    array = getMountainArray(mountainGroupID, x, y);
                    array.forEach(item => item.climat = 2);
                }
                break;
            case 4:
            case 5:
            case 6:
            case 8:
            case 11:
            case 12:
                climat = 2;
                layerName = 'nature';
                array = [{ x, y, climat }];
                break;
            default:
                return;
        }

        if (location.hostname === 'localhost') {
            updateMapLayer(layerName, array);
        } else {
            updateDB(layerName, array);
        }

    }
    function getMountainArray(mountainGroupID, x, y, clear) {

        let climat = 1;
        if (clear) climat = 2;

        let array = [{
            x,
            y,
            climat: mountainGroupID
        }];

        switch (mountainGroupID) {
            case 102:
                array.push({
                    x: x + 1,
                    y,
                    climat
                });
                break;
            case 103:
                array.push({
                    x: x + 1,
                    y,
                    climat
                });
                array.push({
                    x: x + 2,
                    y,
                    climat
                });
                break;
            case 104:
                array.push({
                    x: x + 1,
                    y,
                    climat
                });
                array.push({
                    x: x + 2,
                    y,
                    climat
                });
                array.push({
                    x: x + 3,
                    y,
                    climat
                });
                break;
            case 105:
                array.push({
                    x: x + 1,
                    y,
                    climat
                });
                if (y % 2 == 0) {
                    array.push({
                        x: x + 1,
                        y: y + 1,
                        climat
                    });
                } else {
                    array.push({
                        x,
                        y: y + 1,
                        climat
                    });
                }
                break;
            case 106:
                if (y % 2 == 0) {
                    array.push({
                        x: x + 1,
                        y: y + 1,
                        climat
                    });
                    array.push({
                        x,
                        y: y + 1,
                        climat
                    });
                } else {
                    array.push({
                        x,
                        y: y + 1,
                        climat
                    });
                    array.push({
                        x: x - 1,
                        y: y + 1,
                        climat
                    });
                }
                break;
            case 107:
                if (y % 2 == 0) {
                    array.push({
                        x: x + 1,
                        y: y + 1,
                        climat
                    });
                    array.push({
                        x,
                        y: y + 1,
                        climat
                    });
                } else {
                    array.push({
                        x: x - 1,
                        y: y + 1,
                        climat
                    });
                    array.push({
                        x,
                        y: y + 1,
                        climat
                    });
                }
                array.push({
                    x,
                    y: y + 2,
                    climat
                });
                break;
            case 108:
                array.push({
                    x: x + 1,
                    y,
                    climat
                });
                if (y % 2 == 0) {
                    array.push({
                        x: x + 2,
                        y: y + 1,
                        climat
                    });
                    array.push({
                        x: x + 3,
                        y: y + 1,
                        climat
                    });
                } else {
                    array.push({
                        x: x + 1,
                        y: y + 1,
                        climat
                    });
                    array.push({
                        x: x + 2,
                        y: y + 1,
                        climat
                    });
                }
                break;
            default:
        }

        return array;

    }
    function updateMapLayer(layerName, array) {

        array.forEach(cell => {
            const index = cell.y * map.props.columns + cell.x;

            if (cell.climat === 10 && layerName === 'terrain') {
                map.props.layer.terrain[index] = 0;
                map.props.layer.nature[index] = 0;
            } else if (layerName === 'nature' && cell.climat === 2) {
                map.props.layer.nature[index] = 0;
            } else if (cell.climat === 11 || cell.climat === 4) {
                let id = cell.climat;
                if (map.props.layer.terrain[index] === 3) id++;
                map.props.layer.nature[index] = id;
            } else {
                map.props.layer[layerName][index] = Math.abs(cell.climat);
            }

        });
        map.redraw();

    }
    function updateDB(layerName, array, array2, final) {

        let arrayToSend;
        if (array && array.length !== 0) {
            arrayToSend = array;
        } else {
            arrayToSend = array2;
        }

        fetch(editingURL, {
            method: 'POST',
            body: JSON.stringify(arrayToSend)
        })
            .then(res => {
                if (res.ok) {
                    res.json().then(res => {
                        console.log(res);
                        updateMapLayer(layerName, arrayToSend);
                        if (array2 && !final) updateDB(layerName, null, array2, 'final');
                    });
                } else {
                    res.json().then(res => {
                        console.log(res);
                    });
                }
            });

    }

}
