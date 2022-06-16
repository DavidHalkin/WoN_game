const ASSETS_VERSION = 1;
import * as spriteMap from './sprite-maps-city.js?v=1';
const dev = isLocalhost();

let city_build_id=0;

const buildingTip = new BuildingContextMenu();

window.onload = () => {

    let cityID = '';

    const urlSearchParams = new URLSearchParams(new URL(location).search);

    for (const p of urlSearchParams) {
        if (p[0] === 'id') city_build_id = p[1];
    }

    if (city_build_id) cityID = `?city_id=${city_build_id}`;

    let url = `/ajax?c=city&do=city_builds${cityID}`;
    if (dev) url = '/cache/map/city.json';

    fetch(url, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            if (res.ok) {
                res.json().then(res => window.map = new Map(res));
            } else {
                res.json().then(res => console.log(res));
            }
        });

}

function Map(data) {

    const EDGE_SIZE = 30;
    const START_SIZE = data.min_diametr - 1;
    const CONSTRUCTION_SIZE = data.max_diametr - 1;
    const CLIMATE = +data.background;
    const ENVIRONMENT = +data.front;
    const IMG_PATH = '/images/city/';
    const IMG_FORMAT = 'webp';
    const MIN_SCALE = 0.25;
    const MAX_SCALE = 1;
    const START_SCALE = 1;
    const TILE_WIDTH = 128 * START_SCALE;
    const TILE_HEIGHT = 94 * START_SCALE;
    const PAN_EDGE_GAP = 1; // number of cells between edge of the city and max panning
    if (data.city_id) city_build_id=data.city_id;

    const tiles = {
        total: Math.pow(START_SIZE + EDGE_SIZE * 2, 2),
        selected: {
            x: null,
            y: null
        },
        hovered: {
            x: null,
            y: null
        },
        center: {
            x: null,
            y: null
        },
        scale: START_SCALE,
        cell_width: TILE_WIDTH,
        cell_height: TILE_HEIGHT,
        show: {
            checkerboard: true,
            grid: false,
            coordinates: false,
            indexes: false,
            territory: false,
            construction_territory: false,
            axis: false,
            building_areas: false
        },
        random: [],
        building_areas: [],
        coordinates: []
    };


    const assets = {
        ground: []
    }

    const container = $('#field_map');
    const canvas = $('#mapcanvas');
    const ctx = canvas.getContext('2d');

    let update, onPause = true, spritesheets = {}, ghostBuildings = false;

    const load = new Loader();
    const buildings = new Buildings(data.build_list);
    const viewport = new Viewport();
    new Controls();

    this.tiles = tiles;
    this.ghost_buildings = ghostBuildings;
    this.buildings = buildings;

    updateCanvasSize();
    propagateBuildingAreas();
    generateRandomFeatures();

    /*
    $('button[name="coords"]').onclick = () => {
        if (ghostBuildings) {
            ghostBuildings = false;
            tiles.show.grid = false;
            tiles.show.coordinates = false;
            tiles.show.axis = false;
            tiles.show.building_areas = false;
            tiles.show.construction_territory = false;
        } else {
            ghostBuildings = true;
            tiles.show.grid = true;
            tiles.show.coordinates = true;
            tiles.show.axis = true;
            tiles.show.building_areas = true;
            tiles.show.construction_territory = true;
        }
        redraw();
    }
    */

    load.spritesheets(spriteMap);

    function Loader() {

        this.updates = loadUpdates;
        this.spritesheets = loadSpritesheets;

        function loadUpdates() {

            let url = API.updates;
            if (dev) url = `/cache/map/renews.json`;

            fetch(url)
                .then(res => res.json())
                .then(data => {

                    hey('fetched:map:updates');

                    map.updates = data;
                    load.spritesheets(spriteMap);
                });

        }
        function loadSpritesheets(spriteMap) {

            container.addEventListener('fetched:map:spritesheets', watchSpritesheets);
            const total = Object.keys(spriteMap).length;
            let loaded = 0;

            for (const map in spriteMap) {

                const url = `${IMG_PATH}spritesheet_${map}.${IMG_FORMAT}?v=${ASSETS_VERSION}`;
                const img = new Image();
                img.addEventListener('load', () => {

                    spritesheets[map] = img;
                    hey('fetched:map:spritesheets', { spritesheet_name: map });

                });
                img.src = url;

            }

            function watchSpritesheets(ev) {

                if (++loaded === total) loadAssets();

            }

        }
        function loadAssets() {

            let texture = '';

            switch (CLIMATE) {
                case 1:
                    texture = 'grass';
                    break;
                case 2:
                    texture = 'sand';
                    break;
                case 3:
                    texture = 'snow';
                    break;
                default:

            }

            let img = new Image();
            img.src = `/images/city/${texture}.webp`;
            img.onload = () => {
                assets.ground.push(img);
                redraw();
            }
            return img;

        }

    }
    function Buildings(list) {

        const _ = this;
        this.list = list;
        this.destroy = destroyBuilding;
        this.move = moveBuilding;
        this.moving = null;
        this.end_move = endMove;
        this.reset_move = resetMove;
        this.position_overlay = positionOverlay;
        this.build = build;
        this.show_ghost = addGhost;
        this.add_new = addNew;
        this.update = update;

        function update(array) {

            _.list = array;
            propagateBuildingAreas();
            redraw();

        }
        function destroyBuilding(id) {

            buildingTip.hide();

            if (dev) {

                removeFromMap(id);

            } else {

                fetch(`/ajax?c=city&do=destroy&id=${id}`)
                    .then(res => {
                        if (res.ok) {
                            res.json().then(res => {
                                console.log(res);
                                removeFromMap(id);
                            });
                        } else {
                            res.json().then(res => console.log(res));
                        }
                    });

            }

            function removeFromMap(id) {

                const index = buildings.list.findIndex(building => {
                    if (building.id == id) return true;
                });

                if (index > -1) {
                    buildings.list.splice(index, 1);
                    propagateBuildingAreas();
                    redraw();
                }

            }

        }
        function addGhost(building) {

            const ghost = building.image;

            ghost.style.cssText = `
                display:block;
                position:absolute;
                top: 0;
                left: 0;
                width: ${tiles.cell_width * building.width}px;
                height: auto;
                opacity: 0.5;
                pointer-events: none;
            `;
            container.insertAdjacentElement('beforeend', ghost);

            return ghost;

        }
        function moveBuilding(id) {

            const building = buildings.list.find(building => {
                if (building.id == id) return true;
            });

            if (building) {

                buildingTip.hide();

                building.moving = true;
                propagateBuildingAreas();
                redraw();

                _.moving = {
                    elem: addGhost(building),
                    building
                };

            }

        }
        function endMove() {

            const x = tiles.selected.x;
            const y = tiles.selected.y;
            const building = buildings.moving.building;

            if (dev) {

                placeBuilding(building);

            } else {

                fetch(`/ajax?c=city&do=relocate&id=${building.id}&x=${x}&y=${y}`)
                    .then(res => {
                        if (res.ok) {
                            res.json().then(res => {
                                if (res.status === true) placeBuilding(building);
                            });
                        } else {
                            res.json().then(res => console.log(res));
                        }
                    });

            }

        }
        function resetMove() {

            buildings.moving.elem.remove();
            buildings.moving.building.moving = false;
            propagateBuildingAreas();
            buildings.moving = null;

            redraw();

        }
        function positionOverlay(index) {

            const t = tiles.coordinates[index];
            const x = t.offX + tiles.cell_width / 2;
            const y = t.offY + tiles.cell_height;

            const xShift = `calc(${x}px - 50%)`;
            const yShift = `calc(${y}px - 100%)`;
            _.moving.elem.style.transform = `translate3D(${xShift}, ${yShift}, 0)`;

        }
        function build(building) {

            if (_.moving) resetMove();

            const img = new Image();
            img.src = building.img;
            building.image = img;

            _.moving = {
                new: true,
                elem: addGhost(building),
                building
            };

        }
        function addNew(next) {

            const x = tiles.selected.x;
            const y = tiles.selected.y;
            const building = Object.assign({}, buildings.moving.building);
            /*
            if (dev) {

                building.id = Date.now();
                buildings.list.push(building);

                if (next) {
                    placeBuildingAndContinue(building);
                } else {
                    placeBuilding(building);
                }

            } else {
                    */
                fetch(`/ajax?c=city&do=add&x=${x}&y=${y}&city=${city_build_id}&id=${building.id}`)
                    .then(res => {
                        if (res.ok) {
                            res.json().then(res => {+

                                console.log(res);
                                if (res.status)
                                {
                                    buildings.list.push(building);

                                    if (next) {
                                        placeBuildingAndContinue(building);
                                    } else {
                                        placeBuilding(building);
                                    }
                                }



                            });
                        } else {
                            res.json().then(res => {
                                console.log(res);
                            });
                        }
                    });



        }
        function placeBuilding(building) {

            buildings.moving.elem.remove();

            building.x = tiles.selected.x;
            building.y = tiles.selected.y;
            building.moving = false;
            propagateBuildingAreas();
            buildings.moving = null;
            redraw();
            ui.bottom.deselect();

        }
        function placeBuildingAndContinue(building) {

            building.x = tiles.selected.x;
            building.y = tiles.selected.y;
            propagateBuildingAreas();
            redraw();

        }

    }
    function updateCanvasSize() {

        const containerBox = container.getBoundingClientRect();
        const canvasWidth = Math.round(containerBox.width);
        const canvasHeight = Math.round(containerBox.height);

        ctx.canvas.width = canvasWidth;
        ctx.canvas.height = canvasHeight;

        viewport.center = {
            x: canvasWidth / 2,
            y: canvasHeight / 2
        };

        tiles.center.x = canvasWidth / 2 + viewport.coord.x;
        tiles.center.y = canvasHeight / 2 + viewport.coord.y;

    }
    function generateRandomFeatures() {

        let randomIndex = 0;

        for (let i = 0; i < tiles.total; i++) {

            let index = 0;
            if (i === randomIndex) {
                randomIndex = i + randomOnSeed(2, 19, i);
                index = 1;
            }
            tiles.random.push(index);

        }

    }
    function propagateBuildingAreas() {

        tiles.building_areas = [];

        for (let i = 0; i < tiles.total; i++) {

            tiles.building_areas.push(0);

            const { x, y } = index2tile(i);
            if (!onConstructionTerritory(x, y)) continue;

            buildings.list.find(building => {
                if (+building.x === x && +building.y === y && !building.moving) {
                    const buildingIndexes = getIndexArea(x, y, +building.width, +building.height);
                    buildingIndexes.forEach(index => tiles.building_areas[index] = building.id);
                }
            });

        }

    }
    function Viewport() {

        const _ = this;
        this.coord = {
            x: 0,
            y: 0
        };
        this.tile = {
            x: 0,
            y: 0
        };
        this.center = {
            x: ctx.canvas.width / 2,
            y: ctx.canvas.height / 2
        };
        this.go_to_tile = goToTile;
        this.go_to_coord = goToCoord;
        this.crosshair = drawCrosshair;

        function goToTile() {

            // TBD

        }
        function goToCoord(x, y) {

            _.coord.x = x;
            _.coord.y = y;

            const panSize = START_SIZE + PAN_EDGE_GAP * 2;
            const panPXheight = panSize * tiles.cell_height;
            const panPXwidth = panSize * tiles.cell_width;

            if (ctx.canvas.width > panPXwidth) _.coord.x = 0;
            if (ctx.canvas.height > panPXheight) _.coord.y = 0;

            tiles.center.x = viewport.center.x + _.coord.x;
            tiles.center.y = viewport.center.y + _.coord.y;

            _.tile = screenPX2Tile(viewport.center.x, viewport.center.y);

        }
        function drawCrosshair() {

            ctx.beginPath();
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 1;

            const viewportCenterX = viewport.center.x;
            const viewportCenterY = viewport.center.y;

            ctx.moveTo(viewportCenterX, viewportCenterY - 20);
            ctx.lineTo(viewportCenterX, viewportCenterY + 20);
            ctx.moveTo(viewportCenterX - 20, viewportCenterY);
            ctx.lineTo(viewportCenterX + 20, viewportCenterY);
            ctx.stroke();

        }

    }

    // playback
    function redraw() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;

        drawGround();

        ctx.imageSmoothingEnabled = false;
        ctx.textAlign = 'center';

        tiles.coordinates = [];

        const xStart = -START_SIZE / 2 + 1 - EDGE_SIZE;
        const xEnd = START_SIZE / 2 + EDGE_SIZE;
        const yStart = -START_SIZE / 2 + 1 - EDGE_SIZE;
        const yEnd = START_SIZE / 2 + EDGE_SIZE;

        for (let x = xStart; x <= xEnd; x++) {
            for (let y = yStart; y <= yEnd; y++) {

                const cw = tiles.cell_width;
                const ch = tiles.cell_height;
                const offX = -x * cw / 2 + y * cw / 2 + tiles.center.x - cw / 2;
                const offY = y * ch / 2 + x * ch / 2 + tiles.center.y - ch;

                let cell = { x, y, offX, offY };

                if (offX < 0 - tiles.cell_width ||
                    offX > window.innerWidth ||
                    offY < 0 - tiles.cell_height ||
                    offY > window.innerHeight + tiles.cell_height
                ) cell = null;

                tiles.coordinates.push(cell);

            }
        }

        placeTile(tiles.coordinates);
        placeObjects(tiles.coordinates);

        if (dev) viewport.crosshair();

    }
    function play() {

        if (onPause) loop();

    }
    function pause() {

        setTimeout(() => {

            onPause = true;
            cancelAnimationFrame(update);
            update = null;

        }, 16);

    }
    function loop() {

        onPause = false;

        // ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        redraw();

        if (!onPause) update = requestAnimationFrame(loop);

    }

    // drawing
    function placeTile(coordinates) {

        coordinates.forEach((cell, i) => {

            if (!cell) return;

            const { offX, offY, x, y } = cell;

            if (tiles.show.territory) showTerritory(x, y);
            if (tiles.show.construction_territory) showConstructionTerritory(offX, offY, x, y);
            if (tiles.show.axis) showAxis(x, y, offX, offY);
            if (tiles.show.building_areas) showBuildingAreas(offX, offY, x, y, i);
            if (tiles.show.checkerboard) showCheckerboard(offX, offY, x, y, i);
            if (tiles.show.grid) showGrid(offX, offY);
            if (tiles.show.coordinates) showCoordinates(offX, offY, x, y);
            if (tiles.show.indexes) showIndexes(offX, offY, i);

        });

    }
    function placeObjects(coordinates) {

        coordinates.forEach((cell, i) => {

            if (!cell) return;

            const { offX, offY, x, y } = cell;

            drawForest(offX, offY, x, y, i);
            drawBuildings(offX, offY, x, y, i);
            drawObjects(offX, offY, x, y, i);

        });

    }
    function showTerritory(x, y) {
        if (onTerritory(x, y)) {
            ctx.globalAlpha = 1;
        } else {
            ctx.globalAlpha = 0.5;
        }
    }
    function showConstructionTerritory(offX, offY, x, y) {
        if (!onConstructionTerritory(x, y)) {
            ctx.globalCompositeOperation = 'color';
            drawTile(offX, offY, 'rgba(128, 128, 128, 1');
            ctx.globalCompositeOperation = 'source-over';
        }
    }
    function showBuildingAreas(offX, offY, x, y, i) {

        if (!onConstructionTerritory(x, y)) return;
        if (tiles.building_areas[i]) drawTile(offX, offY, 'rgba(255, 0, 0, 0.4)');

    }
    function showIndexes(offX, offY, i) {

        ctx.font = `${16 * tiles.scale}px Vollkorn`;
        ctx.lineWidth = 3;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#180f0a99';

        const text = i;
        const tX = offX + tiles.cell_width / 2;
        const tY = offY + tiles.cell_height * 0.35;

        ctx.strokeText(text, tX, tY);
        ctx.fillText(text, tX, tY);

    }
    function showCoordinates(offX, offY, x, y) {

        if (!onTerritory(x, y)) return;

        ctx.font = `${24 * tiles.scale}px Vollkorn`;
        ctx.lineWidth = 3;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#180f0a99';

        const text = `${x} : ${y}`;
        const tX = offX + tiles.cell_width / 2;
        const tY = offY + tiles.cell_height * 0.67;

        ctx.strokeText(text, tX, tY);
        ctx.fillText(text, tX, tY);

    }
    function showGrid(x, y) {

        let color = '#FFF';
        drawLine(x, y + tiles.cell_height / 2, x + tiles.cell_width / 2, y, color);
        drawLine(x + tiles.cell_width / 2, y, x + tiles.cell_width, y + tiles.cell_height / 2, color);
        drawLine(x + tiles.cell_width, y + tiles.cell_height / 2, x + tiles.cell_width / 2, y + tiles.cell_height, color);
        drawLine(x + tiles.cell_width / 2, y + tiles.cell_height, x, y + tiles.cell_height / 2, color);

    }
    function showCheckerboard(offX, offY, x, y, i) {

        ctx.globalCompositeOperation = 'overlay';
        const color = '#FFFFFF1C';

        if (onTerritory(x, y)) {

            if (x % 2 === 0 && y % 2 !== 0) {
                drawTile(offX, offY, color);
            } else if (x % 2 !== 0 && y % 2 === 0) {
                drawTile(offX, offY, color);
            }

        }

        ctx.globalCompositeOperation = 'source-over';

    }
    function drawLine(x1, y1, x2, y2, color) {
        color = color ? color : 'white';
        ctx.lineWidth = 0.15;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    function showAxis(x, y, offX, offY) {

        let color = '';

        if (x === tiles.selected.x && y === tiles.selected.y) {
            ctx.globalAlpha = 1;
            color = 'white';
        } else if (x === tiles.hovered.x && y === tiles.hovered.y) {
            color = '#AAA';
        } else if (x <= 0 && y <= 0) {
            color = '#8e202055';
        } else if (x > 0 && y <= 0) {
            color = '#FE910055';
        } else if (x <= 0 && y > 0) {
            color = '#394bc455';
        } else {
            color = '#1A8F0655';
        }

        drawTile(offX, offY, color);

    }
    function drawTile(offX, offY, color) {

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(offX, offY + tiles.cell_height / 2);
        ctx.lineTo(offX + tiles.cell_width / 2, offY, offX + tiles.cell_width, offY + tiles.cell_height / 2);
        ctx.lineTo(offX + tiles.cell_width, offY + tiles.cell_height / 2, offX + tiles.cell_width / 2, offY + tiles.cell_height);
        ctx.lineTo(offX + tiles.cell_width / 2, offY + tiles.cell_height, offX, offY + tiles.cell_height / 2);
        ctx.closePath();
        ctx.fill();

    }
    function drawText(tileX, tileY, text, position, color) {

        color = color ? color : 'white';

        ctx.font = "18px Vollkorn";
        ctx.textAlign = 'center';
        ctx.fillStyle = color;
        ctx.strokeStyle = '#180f0a99';
        ctx.lineWidth = 3;

        let y;

        switch (position) {
            case 'center':
                y = tileY + map.cell_height / 2 + map.cell_height * .1;
                break;
            case 'bottom':
                y = tileY + map.cell_height / 2 + map.cell_height * .8;
                break;
            default:

        }

        ctx.strokeText(
            text,
            tileX + map.cell_width / 2,
            y
        );

        ctx.fillText(
            text,
            tileX + map.cell_width / 2,
            y
        );

    }
    function drawGround() {

        const img = assets.ground[0];
        if (!img) return;

        // console.log();

        const groundTileWidth = img.width * tiles.scale;
        const groundTileHeight = img.height * tiles.scale;

        const cols = Math.ceil(canvas.width / 2 / groundTileWidth);
        const rows = Math.ceil(canvas.height / 2 / groundTileHeight);

        // shift columns and rows from center on map panning
        const colsShift = Math.floor(viewport.coord.x / groundTileWidth);
        const rowsShift = Math.floor(viewport.coord.y / groundTileHeight);

        for (let row = -rows - rowsShift - 1; row < rows - rowsShift; row++) {
            for (let col = -cols - colsShift - 1; col < cols - colsShift; col++) {

                const tileX = col * groundTileWidth + tiles.center.x;
                const tileY = row * groundTileHeight + tiles.center.y;

                try {
                    ctx.drawImage(
                        img,
                        0,
                        0,
                        img.width,
                        img.height,
                        tileX,
                        tileY,
                        groundTileWidth,
                        groundTileHeight
                    );
                } catch (e) {
                    console.log(e);
                }

            }
        }

    }
    function drawForest(offX, offY, x, y, i) {

        const TEMPLATE_TOP_MARGIN = 34 * tiles.scale;

        if (onTerritory(x, y)) return;
        if (tiles.building_areas[i]) return;

        const sprite = spriteMap.forest.find(sprite => {
            if (+sprite.zone === ENVIRONMENT) return true;
        });
        if (!sprite) return;

        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, i)];

        if (tiles.show.construction_territory) {
            if (!onConstructionTerritory(x, y)) ctx.filter = 'grayscale(100%)';
        }

        try {
            ctx.drawImage(
                spritesheets.forest,
                spriteVar.x,
                spriteVar.y,
                spriteVar.w,
                spriteVar.h,
                offX,
                offY - TEMPLATE_TOP_MARGIN,
                spriteVar.w * tiles.scale,
                spriteVar.h * tiles.scale
            );
        } catch (e) {
        }

        ctx.filter = 'none';

    }
    function drawBuildings(offX, offY, x, y, i) {

        let urlbase = '';
        if (dev) urlbase = 'https://dev.wealthofnations.uk';

        const building = buildings.list.find(building => {
            if (+building.x === x && +building.y === y) return true;
        });
        if (!building) return;
        if (building.moving) return;

        if (building.image) {
            if (ghostBuildings) ctx.globalAlpha = 0.27;
            const width = building.width * tiles.cell_width;
            const height = building.image.naturalHeight / building.image.naturalWidth * width;
            try {
                ctx.drawImage(
                    building.image,
                    0,
                    0,
                    building.image.naturalWidth,
                    building.image.naturalHeight,
                    offX + tiles.cell_width / 2 - width / 2,
                    offY - height + tiles.cell_height,
                    width,
                    height
                );
                ctx.globalAlpha = 1;
            } catch (e) {

            }
        } else {
            building.image = new Image();
            building.image.src = urlbase + building.img;
            building.image.onload = redraw;
        }

    }
    function drawObjects(offX, offY, x, y, i) {

        const TEMPLATE_TOP_MARGIN = 34 * tiles.scale;

        if (tiles.random[i] === 0) return;
        if (tiles.building_areas[i]) return;
        if (!onTerritory(x, y)) return;

        const sprite = spriteMap.ob.find(sprite => {
            if (+sprite.zone === ENVIRONMENT) return true;
        });
        if (!sprite) return;

        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, i)];

        try {
            ctx.drawImage(
                spritesheets.ob,
                spriteVar.x,
                spriteVar.y,
                spriteVar.w,
                spriteVar.h,
                offX,
                offY - TEMPLATE_TOP_MARGIN,
                spriteVar.w * tiles.scale,
                spriteVar.h * tiles.scale
            );
        } catch (e) {
        }

    }

    // controls
    function Controls() {

        let dragProcess = false;
        let mouseDownCoord = { x: null, y: null };
        let panStart = { x: null, y: null };
        const MIN_DRAG = 4;
        let shiftPressed = false;

        window.addEventListener('resize', () => {
            updateCanvasSize();
            redraw();
        });
        canvas.addEventListener('mousemove', handleMove);
        canvas.addEventListener('mousedown', handleDown);
        canvas.addEventListener('mouseup', handleUp);
        canvas.addEventListener('mousewheel', handleScroll);
        window.addEventListener('keydown', handleKeyboard);
        window.addEventListener('keyup', handleKeyboard);

        function handleScroll(e) {

            const previousScale = tiles.scale;

            const step = 0.05;
            let direction = 1;
            if (e.deltaY > 0) direction = -1;

            tiles.scale += step * direction;

            if (tiles.scale > MAX_SCALE) {
                tiles.scale = MAX_SCALE;
            } else if (tiles.scale < MIN_SCALE) {
                tiles.scale = MIN_SCALE;
            }

            tiles.cell_width = TILE_WIDTH * tiles.scale;
            tiles.cell_height = TILE_HEIGHT * tiles.scale;

            const actualZoomRatio = tiles.scale / previousScale;
            if (actualZoomRatio === 1) return;

            const shiftXRatio = 1 - actualZoomRatio;

            const cursorDeviationX = e.offsetX - tiles.center.x;
            const cursorDeviationY = e.offsetY - tiles.center.y;

            const mapShiftX = viewport.coord.x + cursorDeviationX * shiftXRatio;
            const mapShiftY = viewport.coord.y + cursorDeviationY * shiftXRatio;

            viewport.go_to_coord(mapShiftX, mapShiftY);

            if (buildings.moving) {
                const width = tiles.cell_width * buildings.moving.building.width;
                buildings.moving.elem.style.width = width + 'px';
            }

            redraw();

        }
        function handleDown(event) {

            if (event.which === 1) {

                mouseDownCoord = {
                    x: event.offsetX,
                    y: event.offsetY
                };

                panStart = {
                    x: viewport.coord.x,
                    y: viewport.coord.y
                };

                // cursor.use('move');

            }

        }
        function handleUp(event) {

            switch (event.which) {
                case 1: // left button
                    if (dragProcess) return dragEnd();
                    return click(event);
                case 3: // right button
                    break;
                default:

            }

        }
        function dragEnd() {

            pause();
            dragProcess = false;

        }
        function handleMove(e) {

            const x = e.offsetX;
            const y = e.offsetY;

            const tile = screenPX2Tile(x, y);
            const index = tile2index(tile.x, tile.y);

            if (e.which === 1) { // drag

                const xDistance = Math.round(x - mouseDownCoord.x);
                const yDistance = Math.round(y - mouseDownCoord.y);

                if ((Math.abs(xDistance) > MIN_DRAG || Math.abs(yDistance) > MIN_DRAG)) {

                    dragProcess = true;

                    let newX = panStart.x + xDistance;
                    let newY = panStart.y + yDistance;

                    const cityEdgeGap = tiles.cell_width * PAN_EDGE_GAP;

                    const rightEdgeX = -newX + viewport.center.x;
                    const leftEdgeX = -newX - viewport.center.x;

                    const edgeYtop = -newY - viewport.center.y;
                    const edgeYbottom = -newY + viewport.center.y;

                    const maxPanX = tiles.cell_width * START_SIZE / 2 + cityEdgeGap;
                    const maxPanY = tiles.cell_height * START_SIZE / 2 + cityEdgeGap;

                    if (rightEdgeX > maxPanX) newX = -maxPanX + viewport.center.x;
                    if (leftEdgeX < -maxPanX) newX = maxPanX - viewport.center.x;

                    if (edgeYbottom > maxPanY) newY = -maxPanY + viewport.center.y;
                    if (edgeYtop < -maxPanY) newY = maxPanY - viewport.center.y;

                    viewport.go_to_coord(newX, newY);

                    if (buildings.moving) {

                        if (onConstructionTerritory(tile.x, tile.y)) {

                            buildings.position_overlay(index);

                        } else {

                            buildings.reset_move();

                        }

                    }

                    if (onPause) loop();

                }

            } else { // hover

                if (tiles.building_areas[index]) {

                    if (!buildings.moving) {

                        const building = buildings.list.find(building => {
                            if (tiles.building_areas[index] === building.id) return true;
                        });

                        const buildingCoordIndex = tile2index(+building.x, +building.y);
                        const coord = tiles.coordinates[buildingCoordIndex];

                        if (!buildingTip.visible) {
                            buildingTip.show(building, coord.offX, coord.offY, {
                                label_destroy: data.label_destroy,
                                label_yes: data.label_yes,
                                label_no: data.label_no
                            });
                        } else {
                            if (hoveredTileChange(tile.x, tile.y)) {
                                buildingTip.show(building, coord.offX, coord.offY, {
                                    label_destroy: data.label_destroy,
                                    label_yes: data.label_yes,
                                    label_no: data.label_no
                                });
                            }
                        }

                    }

                } else {

                    if (buildingTip.visible) buildingTip.hide();

                    if (buildings.moving) {

                        if (onConstructionTerritory(tile.x, tile.y)) {

                            buildings.position_overlay(index);

                        }

                    }

                }

            }

            if (hoveredTileChange(tile.x, tile.y)) {

                tiles.hovered = {
                    x: tile.x,
                    y: tile.y
                };

            }

        }
        function click(event) {

            const tile = screenPX2Tile(event.offsetX, event.offsetY);

            tiles.selected.x = tile.x;
            tiles.selected.y = tile.y;

            if (onConstructionTerritory(tile.x, tile.y)) {
                if (buildings.moving) {
                    if (buildings.moving.new) {
                        if (shiftPressed) {
                            buildings.add_new('next');
                        } else {
                            buildings.add_new();
                        }
                    } else {
                        buildings.end_move();
                    }
                }
            }

            redraw();

        }
        function handleKeyboard(event) {

            if (event.key === 'Shift') {
                shiftPressed = true;
                if (event.type === 'keyup') shiftPressed = false;
            }

            if (buildings.moving && event.key === 'Escape') {
                buildings.reset_move();
            }

        }

    }

    // unitilities
    function getIndexArea(x, y, w, h) {

        let array = [];

        for (let i = x; i > x - w; i--) {
            for (let j = y; j > y - h; j--) {
                array.push(tile2index(i, j));
            }
        }

        return array;

    }
    function getTilesArea(x, y, w, h) {

        let array = [];

        for (let i = x; i > x - w; i--) {
            for (let j = y; j > y - h; j--) {
                const offX = -i * tiles.cell_width / 2 + j * tiles.cell_width / 2 + tiles.center.x - tiles.cell_width / 2;
                const offY = j * tiles.cell_height / 2 + i * tiles.cell_height / 2 + tiles.center.y - tiles.cell_height;
                array.push({
                    x: offX,
                    y: offY
                })
            }
        }

        return array;

    }
    function onTerritory(x, y) {

        if (x > -START_SIZE / 2 && x <= START_SIZE / 2 &&
            y > -START_SIZE / 2 && y <= START_SIZE / 2) return true;
        return false;

    }
    function onConstructionTerritory(x, y) {

        if (x > -CONSTRUCTION_SIZE / 2 && x <= CONSTRUCTION_SIZE / 2 &&
            y > -CONSTRUCTION_SIZE / 2 && y <= CONSTRUCTION_SIZE / 2) return true;
        return false;

    }
    function tile2index(qx, qy) {

        const xStart = -START_SIZE / 2 + 1 - EDGE_SIZE;
        const xEnd = START_SIZE / 2 + EDGE_SIZE;
        const yStart = -START_SIZE / 2 + 1 - EDGE_SIZE;
        const yEnd = START_SIZE / 2 + EDGE_SIZE;

        let index = 0;
        for (let x = xStart; x <= xEnd; x++) {
            for (let y = yStart; y <= yEnd; y++) {
                if (x === qx && y === qy) return index;
                index++;
            }
        }

    }
    function index2tile(i) {

        const xStart = -START_SIZE / 2 + 1 - EDGE_SIZE;
        const xEnd = START_SIZE / 2 + EDGE_SIZE;
        const yStart = -START_SIZE / 2 + 1 - EDGE_SIZE;
        const yEnd = START_SIZE / 2 + EDGE_SIZE;

        let index = 0;
        for (let x = xStart; x <= xEnd; x++) {
            for (let y = yStart; y <= yEnd; y++) {
                if (i === index) return { x, y };
                index++;
            }
        }

    }
    function screenPX2Tile(x, y) {

        const xDistance = x - tiles.center.x;
        const yDistance = y + tiles.cell_height / 2 - tiles.center.y;
        const tileX = Math.round(-xDistance / tiles.cell_width + yDistance / tiles.cell_height);
        const tileY = Math.round(xDistance / tiles.cell_width + yDistance / tiles.cell_height);

        return {
            x: tileX,
            y: tileY
        }

    }
    function hoveredTileChange(x, y) {

        if (x !== tiles.hovered.x || y !== tiles.hovered.y) return true;
        return false;

    }
    function rnd(range) {

        return Math.floor(Math.random() * (range + 1));

    }
    function randomOnSeed(min, max, seed) {

        const x = Math.sin(seed) * 10000;
        const randomFloat = x - Math.floor(x);
        return Math.round((max - min) * randomFloat + min);

    }
    function hey(eventName, data) {

        const event = new CustomEvent(eventName, { detail: data });
        container.dispatchEvent(event);

    }

}
function BuildingContextMenu() {

    const elem = $('.popup');
    const controls = elem.querySelector('.popup_footer').children[1];
    const name = elem.querySelector('.content_scroll').children[1];
    const question = elem.querySelector('.content_scroll').children[0];
    const btnDelete = elem.querySelector('button[name="delete"]');
    const btnMove = elem.querySelector('button[name="move"]');
    const confirm = elem.querySelector('.confirm');
    const btnApproveDelete = confirm.querySelector('[data-action="yes"]');
    const btnCancel = confirm.querySelector('[data-action="no"]');

    const _ = this;
    this.visible = false;
    this.show = show;
    this.hide = hide;

    function show(building, x, y, naming) {

        if (naming) {
            question.innerText = naming.label_destroy;
            btnApproveDelete.firstElementChild.innerText = naming.label_yes;
            btnCancel.firstElementChild.innerText = naming.label_no;
        }

        name.innerHTML = building.name;
        elem.dataset.id = building.id;

        name.classList.remove('d-none');
        controls.classList.remove('d-none');
        question.classList.add('d-none');
        confirm.classList.add('d-none');

        elem.style.top = y + map.tiles.cell_height + 'px';
        elem.style.left = x + map.tiles.cell_width / 2 + 'px';
        elem.style.transform = `translate(-50%, -${map.tiles.cell_height / 2}px)`;
        elem.style.paddingTop = `${map.tiles.cell_height / 2}px`;
        elem.style.display = 'block';
        hideConfirm();
        _.visible = true;

        btnDelete.onclick = showConfirm;
        btnApproveDelete.onclick = () => map.buildings.destroy(elem.dataset.id);
        btnCancel.onclick = hideConfirm;
        btnMove.onclick = () => map.buildings.move(elem.dataset.id);

    }
    function hide() {

        hideConfirm();
        elem.style.display = 'none';
        name.classList.add('d-none');
        controls.classList.add('d-none');
        confirm.classList.add('d-none');
        question.classList.add('d-none');
        _.visible = false;

    }
    function showConfirm() {

        confirm.classList.remove('d-none');
        question.classList.remove('d-none');

    }
    function hideConfirm() {

        confirm.classList.add('d-none');
        question.classList.add('d-none');

    }

}
function $(selector) {

    return document.querySelector(selector);

}
function isLocalhost() {

    if (location.hostname === 'localhost' || location.hostname === '192.168.1.16') return true;
    return false;

}
