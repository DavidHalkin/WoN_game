import * as spriteMap from './sprite-maps.js?v=5';
export function Map() {

    const container = $('#field_map');
    const canvas = $('#mapcanvas');
    const ctx = canvas.getContext('2d');

    const IMG_PATH = '/images/map/world/';
    const IMG_VERSION = 4;
    const IMG_FORMAT = 'webp';
    const BASE = '/ajax?c=map&do=';
    const CACHE = '/cache/map/ajax_get_map_';
    const API = {
        updates: `${BASE}get_renews`,
        layers: {
            terrain: `${BASE}get_map_terrain`,
            nature: `${BASE}get_map_terra_objects`,
            cities: `${BASE}get_map_objects`,
        },
        modes: {
            physical: '',
            climate: `${CACHE}colors_climate.bin`,
            geo: `${CACHE}resurs_geo.bin`,
            nature: `${CACHE}resurs_nature.bin`,
            ethnic: `${CACHE}colors_ethnic.bin`,
            religion: `${CACHE}colors_relig.bin`,
            polytics: `${CACHE}colors_polytics.bin`,
            vassals: `${CACHE}colors_vassals.bin`,
            trade: `${CACHE}colors_trade.bin`
        },
        units: `${BASE}get_map_units`,
        unit_animations: `/cache/units.json`,
        select: `${BASE}click_select`,
        unit_route: `${BASE}click`
    };
    const OTHER_ASSETS = {
        round_frame: '/images/map/circles/circle_empty_shadow.png',
        country_coa: '/images/map/circles/emblem.png'
    };

    let spritesheets = {};
    let img_assets = {};
    let unit_animations = {};
    let countryColor = hex2rgb('#b80e3e');

    const HEX_WIDTH = 300;
    const HEX_HEIGHT = 255;
    const CELL_RATIO = HEX_WIDTH / HEX_HEIGHT;
    const OBJECT_TOP_EXTENSION = 0.25;

    const ZOOM_MIN = 1;
    const ZOOM_MIN_FOR_HEX = 10;
    const ZOOM_MAX = 300;
    const ZOOM_START = 60;
    const DISTANT_ZOOM_MAX = 20;
    const STRETCH_AT_MIN_ZOOM = 0.568;
    const CITY_NAME_ZOOM = 30;
    const RESOURCES_ZOOM = 20;

    const SEA_HEX_WIDTH = 1000;
    const SEA_HEX_HEIGHT = 1000;
    const SEA_CELL_RATIO = 1;
    const SEA_ZOOM_MIN = 300;
    const SEA_ZOOM_MAX = 1000;
    const SEA_ZOOM_START = 200;
    const SEA_DISTANT_ZOOM_MAX = 66.666;

    const WMAP_CELL_RATIO = 1;
    const WMAP_ZOOM_MIN = 132;
    const WMAP_ZOOM_MAX = 39600;
    const WMAP_ZOOM_START = 7920;
    const WMAP_ZOOM_REAL = 1320;
    const WMAP_DISTANT_ZOOM_MAX = 2640;
    const WMAP_STRETCH_AT_MIN_ZOOM = 0.638;

    const BLAZON_GAP = 0; // 0–1 : 1 = map.cell_height
    const BLAZON_TO_FRAME_SIZE_RATIO = 0.8;
    const FPS = 30; // animation FPS, not canvas map.

    const map = {
        updates: {},
        layer: {
            terrain: new Array(2182 * 1048),
            nature: new Array(2182 * 1048),
            random: [],
            cities: [],
            units: [],
            info: []
        },
        mode: {
            physical: {},
            climate: {},
            geo: {},
            animals: {},
            ethnic: {},
            religion: {},
            polytics: {},
            vassals: {},
            trade: {}
        },
        columns: 2182,
        rows: 1048,
        cell_width: ZOOM_START,
        cell_height: ZOOM_START / CELL_RATIO,
        row_height: ZOOM_START / CELL_RATIO * 0.75,
        column_shift: null,
        width: null,
        height: null,
        distant_zoom_ratio: 1,
        sea_columns: 654,
        sea_rows: 314,
        sea_cell_width: SEA_ZOOM_START,
        sea_cell_height: SEA_ZOOM_START / SEA_CELL_RATIO,
        sea_row_height: SEA_ZOOM_START / SEA_CELL_RATIO,
        sea_column_shift: null,
        sea_width: null,
        sea_height: null,
        wmap_columns: 17,
        wmap_rows: 9,
        wmap_cell_width: WMAP_ZOOM_START,
        wmap_cell_height: WMAP_ZOOM_START / WMAP_CELL_RATIO * WMAP_STRETCH_AT_MIN_ZOOM,
        wmap_row_height: WMAP_ZOOM_START / WMAP_CELL_RATIO,
        wmap_column_shift: null,
        wmap_width: null,
        wmap_height: null
    };
    let activeLayer = null;

    class Unit {
        constructor(object) {
            const VARIATIONS = ['U10', 'U7'];
            const _ = this;
            const TEMPL_RATIO_W = 1.167;
            const TEMPL_RATIO_H = 1.196;
            const TEMPL_RATIO = 0.87;

            let compositing;

            this.variation = null;
            this.animation = getAnimation(VARIATIONS);
            this.id = object.id;
            this.x = +object.x;
            this.y = +object.y;
            this.route = object.route;
            this.can_selected = object.can_selected;
            this.video = addVideoElement();
            this.elem = addCanvasElement();
            this.show = show;
            this.change_look = changeLook;
            this.position = position;
            this.turn = turn;
            this.asure_route_list = () => {
                if (!this ?.route ?.list) this.route = { list: [] };
            }

            position(_.x, _.y);

            function addVideoElement() {

                const video = document.createElement('video');
                video.style.cssText = `
                    pointer-events: none;
                    visibility: hidden;
                    top: 0;
                    left: 0;
                    position: fixed;
                `;
                container.insertAdjacentElement('beforeend', video);
                return video;

            }
            function addCanvasElement() {

                const can = document.createElement('canvas');
                can.style.cssText = `
                    display: block;
                    pointer-events: none;
                    top: 0;
                    left: 0;
                    position: absolute;
                `;
                container.insertAdjacentElement('beforeend', can);
                return can;

            }
            function position(col, row) {

                if (!col) col = _.x;
                if (!row) row = _.y;

                const coord = getHexCoords(col, row);

                const shiftLeft = (map.cell_width * TEMPL_RATIO_W - map.cell_width) / 2;
                const shiftTop = (map.cell_height * TEMPL_RATIO_H - map.cell_height) / 2;
                const x = coord.x - shiftLeft;
                const y = coord.y - shiftTop;

                const width = map.cell_width * TEMPL_RATIO_W;
                const height = map.cell_height * TEMPL_RATIO_H;

                // hide if outside screen
                if (x < -width ||
                    x > viewport.width ||
                    y < -height ||
                    y > viewport.height
                ) {
                    _.elem.style.display = 'none';
                    return;
                } else {
                    _.elem.style.display = 'block';
                }

                _.elem.style.width = width + 'px';
                _.elem.style.height = height + 'px';
                _.elem.style.transform = `translate3d(${x}px, ${y}px, 0)`;

            }
            function turn(side) {

                if (_.variation === 'U7') {
                    _.video.currentTime = f(side + 1);
                } else {
                    _.video.currentTime = f(72 * side + 1);
                }

            }
            function getAnimation(array) {

                let obj = {};

                array.forEach(type => {
                    obj[type] = unit_animations[type];
                });

                return obj;

            }
            function show() {

                _.variation = VARIATIONS[0];
                const index = +object.y * map.columns + +object.x;
                if (map.layer.terrain[index]) {
                    _.change_look(_.variation);
                } else if (map.layer.terrain[index] === 0) {
                    _.variation = VARIATIONS[1];
                    _.change_look(_.variation);
                } else {
                    container.addEventListener('fetched:map:layers', resolve);
                }

                function resolve(ev) {

                    if (ev.detail.layer_name === 'terrain') {
                        if (map.layer.terrain[index] === 0) _.variation = VARIATIONS[1];
                        _.change_look(_.variation);
                    }
                }

            }
            function changeLook(variation) {

                let side = 1;
                let moving = false;
                if (_.route ?.list.length) {
                    moving = true;
                    const unitCoords = getHexCoords(_.x, _.y);
                    const destination = getHexCoords(_.route.list[0].x, _.route.list[0].y);
                    const x1 = unitCoords.x;
                    const y1 = unitCoords.y;
                    const x2 = destination.x;
                    const y2 = destination.y;
                    const angle = getAngle(x1, y1, x2, y2);
                    side = sideFromAngle(angle);
                }

                turn(side);

                this.video.src = `/video/${variation}.mp4`;
                this.video.addEventListener('loadeddata', () => {
                    setTimeout(() => {
                        compositing = new Compositing(this.video, this.elem);

                        if (moving) animate();
                    }, 100);
                });

                function animate() {

                    // const startFrame = 72 * side + 14;
                    // const finalFrame = 72 * side + 13 + 47;
                    const startFrame = 378;
                    const finalFrame = 378 + 34;
                    let currentFrame = startFrame;
                    let lastTimestamp = 0;

                    _.video.currentTime = currentFrame;

                    update();

                    function update(timestamp) {

                        requestAnimationFrame(update);
                        if (timestamp - lastTimestamp < 1000 / FPS) return;

                        if (currentFrame === finalFrame) {
                            currentFrame = startFrame;
                            _.video.currentTime = f(startFrame);
                        } else {
                            currentFrame++;
                            _.video.currentTime = f(currentFrame);
                        }
                        compositing.process();
                        lastTimestamp = timestamp;
                    }

                }

            }

        }
        set_route(x, y) {
            this.asure_route_list();
            this.route.list = [{ x, y }];
        }
        add_route(x, y) {
            this.asure_route_list();
            this.route.list.push({ x, y });
        }
    }

    let canvasWidth,
        canvasHeight,
        stats,
        update,
        onPause,
        dev = false,
        editor = false,
        units_requested = false,
        showMountainsArea = false,
        wmapTiles = new Array(map.wmap_columns * map.wmap_rows);

    if (location.hostname === 'localhost') dev = true;
    if ($('meta[content="editor"]')) editor = true;

    const urlParams = new URLSearchParams(new URL(location).search);

    setCanvasSize();

    const viewport = new Viewport(0);
    const load = new Loader();
    const cursor = new Cursor();
    const selection = new Selection();
    new Controls();

    const _ = this;
    this.mode = switchMode;
    this.active_mode = getActiveLayer;
    this.viewport = viewport;
    this.redraw = redraw;
    this.props = map;
    this.container = container;
    this.toggle_mountains_area = toggleMountainsArea;

    setMapDimensions();
    generateRandomFeatures();
    load.updates();

    window.minimap = new MiniMap();
    minimap.create();

    window.addEventListener('resize', handleWindowResize);

    function Loader() {

        const RADIUS = 1;
        const EDGE = 0.5;

        const assets = {
            updates: {
                loaded: 0,
                total: 1
            },
            layers: {
                loaded: 0,
                total: Object.keys(API.layers).length
            },
            units: {
                loaded: 0,
                total: 1
            },
            unit_animations: {
                loaded: 0,
                total: 1
            },
            spritesheets: {
                loaded: 0,
                total: Object.keys(spriteMap).length
            },
            other_assets: {
                loaded: 0,
                total: Object.keys(OTHER_ASSETS).length
            }
        };
        const modes = {
            loaded: 0,
            total: Object.keys(API.modes).length
        }
        let loading = false;

        watchAssetsLoading();
        watchModesLoading();

        this.updates = loadUpdates;
        this.map = resolve;
        this.units = loadUnitAnimations;
        this.modes = loadModes;
        this.spritesheets = loadSpritesheets;
        this.other_assets = loadOtherAssets;

        container.addEventListener('viewport:update', resolve);

        function loadUpdates() {

            let url = API.updates;
            if (dev) url = `/cache/map/renews.json`;

            fetch(url)
                .then(res => res.json())
                .then(data => {

                    hey('fetched:map:updates');

                    map.updates = data;
                    load.spritesheets(spriteMap);
                    load.map();
                    load.other_assets();

                });

        }
        function resolve() {

            const view = viewport.coordinates;

            let { colMin, rowMin, colMax, rowMax } = viewport.area;

            const cols = colMax - colMin;
            const rows = rowMax - rowMin;

            const colMinEdge = Math.round(colMin - cols * EDGE);
            const colMaxEdge = Math.round(colMax + cols * EDGE);
            const rowMinEdge = Math.round(rowMin - rows * EDGE);
            const rowMaxEdge = Math.round(rowMax + rows * EDGE);

            colMin = Math.round(colMin - cols * RADIUS);
            colMax = Math.round(colMax + cols * RADIUS);
            rowMin = Math.round(rowMin - rows * RADIUS);
            rowMax = Math.round(rowMax + rows * RADIUS);

            if (colMin < 0) colMin = 0;
            if (rowMin < 0) rowMin = 0;
            if (colMax > map.columns) colMax = map.columns - 1;
            if (rowMax > map.rows) rowMax = map.rows - 1;

            if (!loading && emptyIndex()) {
                // simLoadMap(colMin, rowMin, colMax, rowMax);
                loadMapLayers({ colMin, rowMin, colMax, rowMax });
            }

            function emptyIndex() {

                for (let row = rowMinEdge; row < rowMaxEdge; row++) {
                    for (let col = colMinEdge; col < colMaxEdge; col++) {
                        const index = row * map.columns + col;
                        if (map.layer.terrain[index] == undefined) return true;
                    }
                }

                return false;

            }

        }
        function loadMapLayers(area) {

            loading = true;

            if (area) hey('loading:map:layer:terrain', area);

            let numberOfLoadedLayers = 0;
            let x1 = 0;
            let x2 = map.columns - 1;
            let y1 = 0;
            let y2 = map.rows - 1;

            for (const key in API.layers) {

                let url = '';
                let latestUpdate;
                switch (key) {
                    case 'terrain':
                        latestUpdate = map.updates.get_map_terrain;
                        break;
                    case 'nature':
                        latestUpdate = map.updates.get_map_terra_objects;
                        break;
                    case 'cities':
                        latestUpdate = map.updates.get_map_objects;
                        break;
                    default:

                }

                if (dev) {

                    url = `/cache/map/${key}.bin?u=${latestUpdate}`;

                    fetch(url)
                        .then(res => res.arrayBuffer())
                        .then(buffer => {

                            const data = msgpack.deserialize(buffer);
                            extractDataFromObject(data, key);

                        });

                } else {

                    if (area) {
                        x1 = area.colMin;
                        x2 = area.colMax;
                        y1 = area.rowMin;
                        y2 = area.rowMax;
                    }

                    let latestUpdate = null;
                    switch (key) {
                        case 'terrain':
                            latestUpdate = map.updates.get_map_terrain;
                            break;
                        case 'nature':
                            latestUpdate = map.updates.get_map_terra_objects;
                            break;
                        case 'cities':
                            latestUpdate = map.updates.get_map_objects;
                            break;
                        default:
                    }

                    url = `${API.layers[key]}&min_x=${x1}&min_y=${y1}&max_x=${x2}&max_y=${y2}?u=${latestUpdate}`;

                    fetch(url)
                        .then(res => res.json())
                        .then(data => {
                            extractDataFromObject(data, key, area);
                        });

                }

            }

            function extractDataFromObject(data, key, area) {

                numberOfLoadedLayers++;

                switch (key) {
                    case 'terrain':
                        // console.log(`"${key}" array unique ids:`, [...new Set(data.terra)]);
                        if (dev) {
                            map.layer[key] = data.terra;
                        } else {
                            replacePartOfArray(map.layer[key], data.terra);
                        }
                        break;
                    case 'nature':
                        // console.log(`"${key}" array unique ids:`, [...new Set(data.objects)]);
                        if (dev) {
                            map.layer[key] = data.objects;
                            // map.layer[key] = map.layer[key].map(id => {
                            //     if (id === 1) {
                            //         return 101
                            //     } else {
                            //         return id;
                            //     }
                            // });
                            // console.log([...new Set(map.layer[key])]);
                        } else {
                            replacePartOfArray(map.layer[key], data.objects);
                        }
                        break;
                    case 'cities':
                        map.layer[key] = data.city;
                        break;
                    default:

                }

                if (!units_requested) load.units();

                hey('fetched:map:layers', { layer_name: key });
                redraw();

                if (numberOfLoadedLayers === Object.keys(API.layers).length) {
                    loading = false;
                }

                function replacePartOfArray(layerArray, data) {
                    let j = 0;
                    for (let row = area.rowMin; row < area.rowMax + 1; row++) {
                        for (let col = area.colMin; col < area.colMax + 1; col++) {
                            const index = row * map.columns + col;
                            layerArray[index] = data[j];
                            j++;
                        }
                    }
                }

            }

        }
        function loadSpritesheets(spriteMap) {

            for (const map in spriteMap) {

                const url = `${IMG_PATH}spritesheet_${map}.${IMG_FORMAT}?v=${IMG_VERSION}`;
                const img = new Image();
                img.addEventListener('load', () => {

                    spritesheets[map] = img;
                    hey('fetched:map:spritesheets', { spritesheet_name: map });

                });
                img.src = url;

            }

        }
        function loadUnitAnimations() {

            units_requested = true;

            fetch(API.unit_animations, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(res => res.json())
                .then(data => {

                    unit_animations = data;

                    loadUnits();

                    hey('fetched:map:unit_animations');

                });

        }
        function loadUnits() {

            let url = `${API.units}&min_x=1&min_y=1&max_x=2182&max_y=1048`;
            if (dev) url = `/cache/map/units.json`;

            fetch(url, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(res => res.json())
                .then(data => {

                    data.army.forEach(unitData => {
                        const unit = new Unit(unitData);
                        map.layer.units.push(unit);
                        unit.show();
                    });

                    hey('fetched:map:units');

                });

        }
        function loadModes() {

            for (const key in API.modes) {

                if (key === 'physical') continue;

                let latestUpdate;

                switch (key) {
                    case 'geo':
                    case 'nature':
                        latestUpdate = map.updates.get_map_resurs;
                        break;
                    default:
                        latestUpdate = map.updates.get_map_colors;
                }

                fetch(API.modes[key] + '?u=' + latestUpdate)
                    .then(res => res.arrayBuffer())
                    .then(buffer => {

                        let data = null;

                        try {
                            data = msgpack.deserialize(buffer);

                            if (typeof data === 'object') {
                                map.mode[key] = data;
                            } else if (typeof data === 'string') {
                                try {
                                    data = JSON.parse(data);
                                    map.mode[key] = data;
                                } catch (e) {
                                    console.info(e);
                                }
                            }

                        } catch (e) {
                            console.log(e);
                        } finally {
                            hey('fetched:map:modes', { mode_name: key });
                            if (key === 'polytics') positionCountryNames(data);
                        }

                        // enable mode
                        if (Object.keys(map.mode[key]).length) {
                            ui.modes.activate(key);

                            for (const p of urlParams) {
                                if (p[0] === 'mode' && p[1] === key) {
                                    ui.modes.buttons.querySelector(`[name="${key}"]`).click();
                                }
                            }
                        }

                    });

            }

        }
        function loadOtherAssets() {

            for (const assetName in OTHER_ASSETS) {

                const img = new Image();
                img.src = OTHER_ASSETS[assetName];
                img.onload = () => {
                    img_assets[assetName] = img;
                    hey(`fetched:map:other_assets`);
                }

            }

        }
        function watchAssetsLoading() {

            const totalAssets = getAssetsNumber('total');

            for (const assetName in assets) {
                container.addEventListener(`fetched:map:${assetName}`, updateNumbers);
            }

            function updateNumbers(e) {

                const assetName = e.type.split(':')[2];
                assets[assetName].loaded++;
                const loadedAssets = getAssetsNumber('loaded');
                if (loadedAssets === totalAssets) {
                    redraw();
                    if (!editor) setTimeout(loadModes, 1000);
                }

            }
            function getAssetsNumber(key) {

                let count = 0;

                for (const asset in assets) {
                    count += assets[asset][key];
                }

                return count;

            }

        }
        function watchModesLoading() {

            container.addEventListener(`fetched:map:modes`, e => {
                modes.loaded++;
            });

        }

    }
    function generateRandomFeatures() {

        let randomIndex = 0;

        for (let i = 0; i < map.rows * map.columns; i++) {

            let index = 0;
            if (i === randomIndex) {
                randomIndex = i + randomOnSeed(2, 18, i);
                index = 1;
            }
            map.layer.random.push(index);

        }

    }
    function setMapDimensions(options) {

        map.row_height = map.cell_height * 0.75;

        if (options) {

            map.cell_height = options.cellHeight;
            map.height = map.row_height * map.rows;

        } else {

            map.column_shift = map.cell_width / 2;
            map.width = map.cell_width * map.columns;
            map.height = map.row_height * map.rows;

        }

    }
    function setSeaMapDimensions(options) {

        map.sea_row_height = map.sea_cell_height * 0.75;

        if (options) {

            map.sea_cell_height = options.seaCellHeight;
            map.sea_height = map.sea_row_height * map.sea_rows;

        } else {

            map.sea_column_shift = map.sea_cell_width / 2;
            map.sea_width = map.sea_cell_width * map.sea_columns;
            map.sea_height = map.sea_row_height * map.sea_rows;

        }

    }
    function setWmapMapDimensions(options) {

        map.wmap_row_height = map.wmap_cell_height * 0.75;

        if (options) {

            map.wmap_cell_height = options.wmapCellHeight;
            map.wmap_height = map.wmap_row_height * map.wmap_rows;

        } else {

            map.wmap_column_shift = map.wmap_cell_width / 2;
            map.wmap_width = map.wmap_cell_width * map.wmap_columns;
            map.wmap_height = map.wmap_row_height * map.wmap_rows;

        }

    }
    function handleWindowResize() {

        setCanvasSize();
        viewport.update();

        redraw();

    }
    function setCanvasSize() {

        const containerBox = container.getBoundingClientRect();

        canvasWidth = Math.round(containerBox.width);
        canvasHeight = Math.round(containerBox.height);

        ctx.canvas.width = canvasWidth;
        ctx.canvas.height = canvasHeight;

    }

    // objects
    function Viewport(margin) {

        const viewport = this;

        this.margin = margin;
        this.x = margin;
        this.y = margin;
        this.width = canvasWidth - margin * 2;
        this.height = canvasHeight - margin * 2;
        this.area = {
            colMin: null,
            rowMin: null,
            colMax: null,
            rowMax: null
        };
        this.draw = draw;
        this.go_to = goTo;
        this.go_to_hex = goToHex;
        this.center = getCenter();
        this.position = {
            x: margin + viewport.width / 2,
            y: margin + viewport.height / 2
        };
        this.coordinates = getHexLocation(viewport.position.x, viewport.position.y);
        this.update = update;
        this.target = target;

        initialViewortPosition();
        window.addEventListener('resize', resize);

        function initialViewortPosition() {

            let loc = {};

            if (urlParams) {
                for (const p of urlParams) {
                    if (p[0] === 'x' || p[0] === 'y') loc[p[0]] = p[1];
                }
            }

            if (loc.hasOwnProperty('x') && loc.hasOwnProperty('y')) {
                return goToHex(loc.x, loc.y);
            }

            const coordRecord = localStorage.getItem('wonmap_last_viewport_location');
            let startX, startY;

            if (coordRecord) {
                const coord = JSON.parse(localStorage.getItem('wonmap_last_viewport_location'));
                startX = coord.col;
                startY = coord.row;
            } else {
                startX = map.updates.x;
                startY = map.updates.y;
            }
            goToHex(startX, startY);

        }
        function update() {
            resize();
            goTo(viewport.position.x, viewport.position.y)
        }
        function resize() {

            viewport.width = canvasWidth - margin * 2;
            viewport.height = canvasHeight - margin * 2;

            viewport.center = getCenter();

        }
        function getCenter() {
            return {
                x: margin + viewport.width / 2,
                y: margin + viewport.height / 2
            };
        }
        function draw() {

            ctx.beginPath();
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 1;
            ctx.strokeRect(margin, margin, viewport.width, viewport.height);

            ctx.moveTo(viewport.center.x, viewport.center.y - 20);
            ctx.lineTo(viewport.center.x, viewport.center.y + 20);
            ctx.moveTo(viewport.center.x - 20, viewport.center.y);
            ctx.lineTo(viewport.center.x + 20, viewport.center.y);
            ctx.stroke();

        }
        function goTo(x, y) {

            viewport.x = x - viewport.width / 2;
            viewport.y = y - viewport.height / 2;

            viewport.position = { x, y };
            viewport.coordinates = getHexLocation(x, y);

            areaUpdate();
            hey('viewport:update');
            updateLocalStorage(viewport.coordinates.col, viewport.coordinates.row);

        }
        function goToHex(col, row) {

            updateLocalStorage(col, row);

            // потому гексы выходят за видимый край карты вверх и вниз
            col++;
            row++;

            const y = map.row_height * row - map.cell_height * 0.25;
            let x = map.cell_width * col;
            if (row % 2 === 0) x -= map.cell_width / 2;

            viewport.x = x - viewport.width / 2;
            viewport.y = y - viewport.height / 2;

            viewport.position = { x, y };
            viewport.coordinates = { col, row };

            areaUpdate();
            hey('viewport:update');
            redraw();

        }
        function target(col, row, object) {
            if (viewport.coordinates.col === col && viewport.coordinates.row === row) {
                console.log(object);
            }
        }
        function areaUpdate() {

            let colMin = Math.floor(viewport.x / map.cell_width) - 1;
            let rowMin = Math.floor(viewport.y / map.row_height) - 1;
            let colMax = Math.ceil((viewport.x + viewport.width) / map.cell_width);
            let rowMax = Math.ceil((viewport.y + viewport.height) / map.row_height);

            if (colMin < 0) colMin = 0;
            if (rowMin < 0) rowMin = 0;
            if (colMax > map.columns) colMax = map.columns;
            if (rowMax > map.rows) rowMax = map.rows;

            let sea_colMin = Math.floor(viewport.x / map.sea_cell_width) - 1;
            let sea_rowMin = Math.floor(viewport.y / map.sea_row_height) - 1;
            let sea_colMax = Math.ceil((viewport.x + viewport.width) / map.sea_cell_width);
            let sea_rowMax = Math.ceil((viewport.y + viewport.height) / map.sea_row_height);

            if (sea_colMin < 0) sea_colMin = 0;
            if (sea_rowMin < 0) sea_rowMin = 0;
            if (sea_colMax > map.sea_columns) sea_colMax = map.sea_columns;
            if (sea_rowMax > map.sea_rows) sea_rowMax = map.sea_rows;

            let wmap_colMin = Math.floor(viewport.x / map.wmap_cell_width) - 1;
            let wmap_rowMin = Math.floor(viewport.y / map.wmap_row_height) - 1;
            let wmap_colMax = Math.ceil((viewport.x + viewport.width) / map.wmap_cell_width);
            let wmap_rowMax = Math.ceil((viewport.y + viewport.height) / map.wmap_row_height);

            if (wmap_colMin < 0) wmap_colMin = 0;
            if (wmap_rowMin < 0) wmap_rowMin = 0;
            if (wmap_colMax > map.wmap_columns) wmap_colMax = map.wmap_columns;
            if (wmap_rowMax > map.wmap_rows) wmap_rowMax = map.wmap_rows;

            viewport.area = {
                colMin,
                rowMin,
                colMax,
                rowMax,
                sea_colMin,
                sea_rowMin,
                sea_colMax,
                sea_rowMax,
                wmap_colMin,
                wmap_rowMin,
                wmap_colMax,
                wmap_rowMax
            };

        }
        function updateLocalStorage(col, row) {

            const text = JSON.stringify({ col, row });
            localStorage.setItem('wonmap_last_viewport_location', text);

        }

    }
    function Controls() {

        const MIN_DRAG = 4; // px

        let dragProcess = false;
        let mouseDownCoord = { x: null, y: null };
        let shift = false;
        let shiftClick = false;

        canvas.addEventListener('mousedown', handleDown);
        canvas.addEventListener('mouseup', handleUp);
        canvas.addEventListener('wheel', zoom);
        canvas.addEventListener('contextmenu', e => e.preventDefault());

        window.addEventListener('keydown', handleKeyboard);
        window.addEventListener('keyup', handleKeyboard);

        function handleDown(event) {

            if (event.which === 1) {

                mouseDownCoord = {
                    x: event.offsetX,
                    y: event.offsetY
                };

                if (shift && selection.active) return;

                // cursor.use('move');
                canvas.addEventListener('mousemove', handleMove);

            }

        }
        function handleUp(event) {

            switch (event.which) {
                case 1:
                    if (dragProcess) return dragEnd();
                    return click(event);
                case 3:
                    const target = getHexOnClick(event.offsetX, event.offsetY);
                    const index = target.row * map.columns + target.col;
                    hey('map:click:right', {
                        col: target.col,
                        row: target.row,
                        index
                    });
                    if (selection.unit) {
                        if (target.col === +selection.unit.x &&
                            target.row === +selection.unit.y) return;

                        cursor.target.play(target.col, target.row);

                        if (shift) {
                            shiftClick = true;
                            selection.unit.add_route(target.col + '', target.row + '');
                        } else {
                            selection.unit.set_route(target.col + '', target.row + '');
                            sendRoute();
                        }

                        redraw();
                    }
                    break;
                default:

            }

        }
        function handleMove(event) {

            const xDistance = Math.round(event.offsetX - mouseDownCoord.x);
            const yDistance = Math.round(event.offsetY - mouseDownCoord.y);

            if (event.which === 1 &&
                (Math.abs(xDistance) > MIN_DRAG || Math.abs(yDistance) > MIN_DRAG)) {

                dragProcess = true;
                if (onPause) loop();

                const x = Math.round(viewport.position.x -= event.movementX);
                const y = Math.round(viewport.position.y -= event.movementY);

                viewport.go_to(x, y);

            }

        }
        function zoom(event) {

            event.preventDefault();

            play();

            const xRatio = viewport.position.x / map.width;
            const yRatio = viewport.position.y / map.height;

            const previousCellWidth = map.cell_width;

            let zoomRatio = 1.1;
            if (event.deltaY > 0) zoomRatio = 0.91;


            // ============ hex map

            // if (map.cell_width <= ZOOM_MIN_FOR_HEX && event.deltaY > 0) return;
            // if (map.cell_width >= ZOOM_MAX && event.deltaY < 0) return;

            map.cell_width *= zoomRatio;
            map.cell_height *= zoomRatio;
            map.sea_cell_width *= zoomRatio;
            map.sea_cell_height *= zoomRatio;

            if (map.cell_width >= ZOOM_MAX) {
                map.cell_width = ZOOM_MAX;
                map.sea_cell_width = SEA_ZOOM_MAX;
            } else if (map.cell_width <= ZOOM_MIN) {
                map.cell_width = ZOOM_MIN;
                map.sea_cell_width = SEA_ZOOM_MIN;
            }

            map.cell_height = map.cell_width / CELL_RATIO;
            map.sea_cell_height = map.sea_cell_width / SEA_CELL_RATIO;

            map.distant_zoom_ratio = 1 - (map.cell_width - ZOOM_MIN_FOR_HEX) / (DISTANT_ZOOM_MAX - ZOOM_MIN_FOR_HEX);

            if (map.distant_zoom_ratio < 0) {
                map.distant_zoom_ratio = 0;
            } else if (map.distant_zoom_ratio > 1) {
                map.distant_zoom_ratio = 1;
            }

            const cellHeightRatio = 1 + STRETCH_AT_MIN_ZOOM * map.distant_zoom_ratio;
            // const sea_distantZoomRatio = 1 - (map.sea_cell_width - SEA_ZOOM_MIN) / (SEA_DISTANT_ZOOM_MAX - SEA_ZOOM_MIN);
            // const sea_cellHeightRatio = STRETCH_AT_MIN_ZOOM * sea_distantZoomRatio;

            setMapDimensions({
                cellHeight: map.cell_height * cellHeightRatio
            });
            // setSeaMapDimensions({
            //     seaCellHeight: map.sea_cell_height * sea_cellHeightRatio
            // });

            map.row_height = map.cell_height * 0.75;
            map.column_shift = map.cell_width / 2;
            map.width = map.cell_width * map.columns;
            map.height = map.row_height * map.rows;

            map.sea_row_height = map.sea_cell_height;
            map.sea_column_shift = map.sea_cell_width / 2;
            map.sea_width = map.sea_cell_width * map.sea_columns;
            map.sea_height = map.sea_row_height * map.sea_rows;



            // ============ polytical map

            map.wmap_cell_width *= zoomRatio;
            map.wmap_cell_height *= zoomRatio;

            if (map.wmap_cell_width >= WMAP_ZOOM_MAX) {
                map.wmap_cell_width = WMAP_ZOOM_MAX;
            } else if (map.wmap_cell_width <= WMAP_ZOOM_MIN) {
                map.wmap_cell_width = WMAP_ZOOM_MIN;
            }

            map.wmap_cell_height = map.wmap_cell_width / WMAP_CELL_RATIO;

            let wmap_distantZoomRatio = (map.wmap_cell_width - WMAP_ZOOM_REAL) / (WMAP_DISTANT_ZOOM_MAX - WMAP_ZOOM_REAL);
            if (wmap_distantZoomRatio < 0) {
                wmap_distantZoomRatio = 0;
            } else if (wmap_distantZoomRatio > 1) {
                wmap_distantZoomRatio = 1;
            }

            const wmap_cellHeightRatio = (WMAP_STRETCH_AT_MIN_ZOOM - 1) * wmap_distantZoomRatio + 1;
            setWmapMapDimensions({
                wmapCellHeight: map.wmap_cell_height * wmap_cellHeightRatio
            });

            map.wmap_row_height = map.wmap_cell_height;
            map.wmap_column_shift = map.wmap_cell_width / 2;
            map.wmap_width = map.wmap_cell_width * map.wmap_columns;
            map.wmap_height = map.wmap_row_height * map.wmap_rows;

            const actualZoomRatio = map.cell_width / previousCellWidth;
            const shiftXRatio = 1 - actualZoomRatio;
            const cursorShiftX = (viewport.center.x - event.offsetX) * shiftXRatio;
            const cursorShiftY = (viewport.center.y - event.offsetY) * shiftXRatio;

            viewport.go_to(map.width * xRatio + cursorShiftX, map.height * yRatio + cursorShiftY);

            setTimeout(pause, 1000);

        }
        function dragEnd() {

            pause();

            dragProcess = false;
            canvas.removeEventListener('mousemove', handleMove);

        }
        function click(event) {

            const target = getHexOnClick(event.offsetX, event.offsetY);
            const index = target.row * map.columns + target.col;

            hey('map:click:left', {
                col: target.col,
                row: target.row,
                index
            });

            // spam protection
            // if (target.col === selection.col && target.row === selection.row) return;

            selection.set(target.col, target.row);

            // if (map.layer.info[index]) {
            //     return redraw();
            // }

            if (!dev && !editor) {
                fetch(`${API.select}&x=${target.col}&y=${target.row}`, {
                    method: 'GET'
                })
                    .then(res => {
                        if (res.ok) {
                            res.json().then(res => {
                                map.layer.info[index] = res;
                                hey('map:click:left:response', res);
                            });
                        } else {
                            res.json().then(res => {
                                console.log(res);
                            });
                        }
                    });
            } else {

                fetch('/cache/map/clicksim/map_click.json', {
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then(async (res) => {
                        const data = await res.json();
                        hey('map:click:left:response', data);
                    });
            }

            redraw();

        }
        function handleKeyboard(event) {

            if (event.keyCode === 16) {
                if (event.type === 'keyup') {
                    if (selection.unit && shiftClick) sendRoute();
                    shift = shiftClick = false;
                    selection.route = [];
                    redraw();
                    return;
                } else {
                    shift = true;
                }
            }

        }
        function sendRoute() {

            fetch(`${API.unit_route}&unit_id=${selection.unit.id}`, {
                method: 'POST',
                body: JSON.stringify(selection.unit.route.list)
            })
                .then(res => {
                    if (res.ok) {
                        res.json().then(res => {
                            console.log(res);
                        });
                    } else {
                        res.json().then(res => {
                            console.log(res);
                        });
                    }
                });

            selection.route = [];

        }

    }
    function Cursor() {

        window.addEventListener('mousemove', solveMove);

        const target = new Target();

        const c = this;
        this.use = use;
        this.target = target;
        this.coords = {
            x: null,
            y: null
        };
        this.location = {
            col: null,
            row: null
        };

        function use(name) {

            container.style.cursor = name;

        }
        function solveMove(e) {

            c.coords.x = e.clientX;
            c.coords.y = e.clientY;
            c.location = getHexOnClick(e.clientX, e.clientY);

            if (map.cell_width > CITY_NAME_ZOOM && c.location) cityBlazonHover();

        }
        function cityBlazonHover() {

            const yShift = c.coords.y - map.cell_height * 0.73;
            const { col, row } = getHexOnClick(c.coords.x, yShift);
            const city = located(map.layer.cities, col, row);

            if (city && city.name) {
                if (c.coords.x >= city.blazon_coords.x1 &&
                    c.coords.x <= city.blazon_coords.x2 &&
                    c.coords.y >= city.blazon_coords.y1 &&
                    c.coords.y <= city.blazon_coords.y2
                ) {
                    hey('map:hover:city:blazon', city);
                }
            };

        }
        function Target() {

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = 200;
            canvas.height = 170;
            canvas.style.position = 'fixed';
            canvas.style.pointerEvents = 'none';

            const img = new Image();
            img.src = '/images/map/world/spritesheet_arrows.webp';

            let frame = 0;
            const FPS = 60;

            this.play = play;

            function play(col, row) {
                if (editor) return;
                const zone = container.getBoundingClientRect();
                const coord = getHexCoords(col, row);
                canvas.style.left = `${coord.x + map.cell_width / 2 + zone.left - canvas.width / 2}px`;
                canvas.style.top = `${coord.y + map.cell_height / 2 + zone.top - canvas.height / 1.8}px`;
                container.appendChild(canvas);
                canvas.style.opacity = 1;
                requestAnimationFrame(frames);
            }
            function frames() {

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const sprite = spriteMap.arrows[0].variations[frame];

                ctx.drawImage(img,
                    sprite.x,
                    sprite.y,
                    sprite.w,
                    sprite.h,
                    canvas.width / 2 - sprite.w / 4,
                    canvas.height / 2 - sprite.h / 4,
                    sprite.w / 2,
                    sprite.h / 2);

                frame++;
                if (frame < spriteMap.arrows[0].variations.length) {
                    requestAnimationFrame(frames);
                } else {
                    frame = 0;
                    fade(.75, 1, 0);
                }

            }
            function fade(sec, start, finish) {

                const ms = sec * 1000;
                const frames = ms / FPS;
                const step = (start - finish) / frames;

                let value = start;

                requestAnimationFrame(animation);

                function animation() {

                    value -= step;
                    canvas.style.opacity = value;

                    if (value > finish) {
                        requestAnimationFrame(animation);
                    } else {
                        canvas.remove();
                    }

                }

            }

        }

    }
    function Selection() {

        let selection = this;

        const img = new Image();
        img.addEventListener('load', () => {

            selection.sprite_width = img.width;
            selection.sprite_height = img.height;

        });
        img.src = `${IMG_PATH}hex-light.webp`;

        const _this = this;
        this.img = img;
        this.unset = unset;
        this.active = false;
        this.col = null;
        this.row = null;
        this.set = set;
        this.unit = null;

        function set(col, row) {

            selection.active = true;
            selection.col = col;
            selection.row = row;

            const unit = located(map.layer.units, col, row);
            if (unit && unit.can_selected) _this.unit = unit;

        }
        function unset(x, y) {
            selection.active = false;
        }

    }
    function MiniMap() {


        let position = {
            top: '130px',
            left: '20px',
            bottom: 'auto',
            right: 'auto',
            width: 545 * .6,
            height: 262 * .6
        };
        if (editor) {
            position = {
                top: 'auto',
                left: '0',
                bottom: '0',
                right: 'auto',
                width: 545,
                height: 262
            };
        }
        const RATIO = position.width / map.columns;

        let mini, ctx, frame;

        const canvas2 = document.createElement('canvas');
        const ctx2 = canvas2.getContext('2d');
        canvas2.width = map.columns;
        canvas2.height = map.rows;

        // container.addEventListener('loading:map:layer:terrain', visualizeTerrainData);
        // container.addEventListener('fetched:map:layers:terrain', visualizeTerrainData);

        this.create = create;
        this.viewport = viewport;

        function create() {
            mini = new MiniElement();
            ctx = mini.can.getContext('2d');

            enableClick();
        }
        function MiniElement() {

            const minimap = $('#minimap');
            const minimapContainer = minimap.querySelector('.panel_holder');
            const div = document.createElement('div');
            const canvas = document.createElement('canvas');
            frame = document.createElement('div');
            minimapContainer.style.padding = '7px 0';
            minimapContainer.style.overflow = 'hidden';


            canvas.width = position.width;
            canvas.height = position.height;
            div.style.cssText = `
                position: relative;
                width: ${position.width}px;
                height: ${position.height}px;
                bottom: ${position.bottom};
                right: ${position.right};
                background-image: url(/images/map/world/minimap_bg.png);
                background-size: 100% 100%;
            `;
            frame.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                box-shadow: inset 0 0 0 1px yellow;
            `;

            this.elem = div;
            this.can = canvas;

            div.insertAdjacentElement('beforeend', canvas);
            div.insertAdjacentElement('beforeend', frame);
            minimapContainer.insertAdjacentElement('beforeend', div);

        }
        function generateMap(mapArray) {

            const worldMapImage = ctx.createImageData(map.columns, map.rows);

            for (let i = 0; i < mapArray.length; i++) {
                switch (mapArray[i]) {
                    case 0:
                    case 6:
                        worldMapImage.data[i * 4 + 0] = 0;
                        worldMapImage.data[i * 4 + 1] = 0;
                        worldMapImage.data[i * 4 + 2] = 255;
                        break;
                    case 1:
                    case 5:
                        worldMapImage.data[i * 4 + 0] = 0;
                        worldMapImage.data[i * 4 + 1] = 255;
                        worldMapImage.data[i * 4 + 2] = 0;
                        break;
                    case 2:
                        worldMapImage.data[i * 4 + 0] = 255;
                        worldMapImage.data[i * 4 + 1] = 255;
                        worldMapImage.data[i * 4 + 2] = 0;
                        break;
                    case 3:
                        worldMapImage.data[i * 4 + 0] = 255;
                        worldMapImage.data[i * 4 + 1] = 255;
                        worldMapImage.data[i * 4 + 2] = 255;
                        break;
                    default:

                }
                worldMapImage.data[i * 4 + 3] = 255;
            }

            ctx2.putImageData(worldMapImage, 0, 0);
            return canvas2.toDataURL();
        }
        function viewport(x, y, width, height) {

            x = x * RATIO;
            y = y * RATIO;
            width = width * RATIO;
            height = height * RATIO;

            if (ctx) {

                frame.style.top = y + 'px';
                frame.style.left = x + 'px';
                frame.style.width = width + 'px';
                frame.style.height = height + 'px';


                // ctx.clearRect(0, 0, WIDTH, HEIGHT);
                //
                // x = x * RATIO;
                // y = y * RATIO;
                // width = width * RATIO;
                // height = height * RATIO;
                //
                // ctx.strokeStyle = 'yellow';
                // ctx.beginPath();
                // ctx.rect(x, y, width, height);
                // ctx.stroke();
            }

        }
        function enableClick() {
            mini.can.onclick = e => {
                const col = Math.round(e.offsetX / RATIO);
                const row = Math.round(e.offsetY / RATIO);
                _.viewport.go_to_hex(col, row);
            }
        }
        function visualizeTerrainData(e) {

            const eventName = e.type.split(':');
            let colMin, colMax, rowMin, rowMax;

            if (e.detail) {
                colMin = e.detail.colMin;
                colMax = e.detail.colMax;
                rowMin = e.detail.rowMin;
                rowMax = e.detail.rowMax;
            };

            const layer = map.layer[eventName[3]];
            const imgData = ctx2.createImageData(map.columns, map.rows);

            for (let i = 0; i < layer.length; i++) {
                if (layer[i] !== undefined) {

                    let r = 0, g = 255, b = 0;
                    if (eventName[0] === 'loading') {
                        const col = i % map.columns;
                        const row = Math.floor(i / map.columns);

                        if (col >= colMin && col <= colMax && row >= rowMin && row <= rowMax) {
                            r = 255;
                            g = 0;
                        }

                    }
                    imgData.data[i * 4 + 0] = r;
                    imgData.data[i * 4 + 1] = g;
                    imgData.data[i * 4 + 2] = b;
                    imgData.data[i * 4 + 3] = 85;

                }
            }

            ctx2.putImageData(imgData, 0, 0);
            const image = new Image();
            image.onload = () => {
                ctx.clearRect(0, 0, WIDTH, HEIGHT);
                ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, WIDTH, HEIGHT);
            };
            image.src = canvas2.toDataURL();

        }

    }

    // playbacj control
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
    function redraw() {

        play();
        pause();

    }

    // drawing
    function loop() {

        onPause = false;

        // ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = 'center';

        drawMap();

        if (dev || editor) viewport.draw();

        if (!onPause) update = requestAnimationFrame(loop);

    }
    function drawMap() {

        const {
            colMin,
            rowMin,
            colMax,
            rowMax,
            sea_colMin,
            sea_rowMin,
            sea_colMax,
            sea_rowMax,
            wmap_colMin,
            wmap_rowMin,
            wmap_colMax,
            wmap_rowMax
        } = viewport.area;

        if (map.cell_width > ZOOM_MIN_FOR_HEX) {
            seaLayer();
            layer(back);
            layer(rivers);
            layer(front);
        }
        if (map.cell_width < DISTANT_ZOOM_MAX) {
            worldMapLayer();
        }
        if (!editor) layer(colors);
        if (!editor) layer(cityNames);
        if (!editor) layer(countryNames);
        if (!editor) route();
        layer(highlight);
        if (!editor) layer(units);

        map.layer.units.forEach(unit => unit.position());

        if (window.minimap) minimap.viewport(colMin, rowMin, colMax - colMin, rowMax - rowMin);

        function layer(callback) {

            for (let row = rowMin; row < rowMax; row++) {

                for (let col = colMin; col < colMax; col++) {

                    const index = row * map.columns + col;
                    const tile = getHexCoords(col, row);
                    // console.log(col, row);

                    callback(col, row, tile.x, tile.y, index);

                }

            }

        }
        function seaLayer() {

            for (let row = sea_rowMin; row < sea_rowMax; row++) {

                for (let col = sea_colMin; col < sea_colMax; col++) {

                    const index = row * map.sea_columns + col;
                    const tile = getSeaHexCoords(col, row);

                    sea(col, row, tile.x, tile.y, index);

                }

            }

        }
        function worldMapLayer() {

            for (let row = wmap_rowMin; row < wmap_rowMax; row++) {

                for (let col = wmap_colMin; col < wmap_colMax; col++) {

                    const index = row * map.wmap_columns + col;
                    const tile = getWmapHexCoords(col, row);

                    worldMap(col, row, tile.x, tile.y, index);

                }

            }

        }

        function sea(col, row, tileX, tileY, index) {

            const spriteVar = spriteMap.sea[0].variations[0];

            try {
                ctx.drawImage(
                    spritesheets.sea,
                    spriteVar.x,
                    spriteVar.y,
                    spriteVar.w,
                    spriteVar.h,
                    tileX,
                    tileY,
                    map.sea_cell_width,
                    map.sea_cell_height
                );
            } catch (e) {
            }

        }
        function back(col, row, tileX, tileY, index) {

            let tileID = map.layer.terrain[index];
            if (!tileID) return;

            switch (tileID) {
                case 0:
                    return; // есди вода то пропускаем
                case 6:
                    tileID = 5; // если река, то делаем травяную подкладку
                    break;
                default:

            }

            const sprite = spriteMap.back.find(sprite => {
                if (+sprite.type === tileID) return true;
            });
            const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

            try {
                ctx.drawImage(
                    spritesheets.back,
                    spriteVar.x + 1.5,
                    spriteVar.y + 1.5,
                    spriteVar.w - 3,
                    spriteVar.h - 3,
                    tileX,
                    tileY,
                    map.cell_width,
                    map.cell_height
                );
            } catch (e) {

            }

            drawIntersections();

            function drawIntersections() {

                const sides = findAdjacentTiles(col, row);

                sides.forEach(side => {
                    const zone = map.layer.terrain[side.index];
                    side.terra = zone;
                });

                // =================== land


                if (tileID === 1 || tileID === 5) { // if land intersections

                    // =================== corner 34

                    if ((sides[3].terra === 2 || sides[3].terra === 3) && (sides[4].terra === 2 || sides[4].terra === 3)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === sides[3].terra && sprite.type === '1' && sprite.corner === '34') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX - map.cell_width * 0.193,
                                tileY - map.cell_height * 0.035,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    } else if ((sides[3].terra === 2 || sides[3].terra === 3) && (sides[4].terra !== 2 && sides[4].terra !== 3)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === sides[3].terra && sprite.type === '0' && sprite.corner === '05') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX - map.cell_width * 0.307,
                                tileY - map.cell_height * 0.035,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    } else if ((sides[3].terra !== 2 && sides[3].terra !== 3) && (sides[4].terra === 2 || sides[4].terra === 3)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === sides[4].terra && sprite.type === '0' && sprite.corner === '12') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX - map.cell_width * 0.31,
                                tileY - map.cell_height * 0.055,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    }

                    // =================== corner 45

                    if ((sides[4].terra === 2 || sides[4].terra === 3) && (sides[5].terra === 2 || sides[5].terra === 3)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === sides[4].terra && sprite.type === '1' && sprite.corner === '45') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX + map.cell_width * 0.19,
                                tileY - map.cell_height * 0.2,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    } else if ((sides[4].terra !== 2 && sides[4].terra !== 3) && (sides[5].terra === 2 || sides[5].terra === 3)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === sides[5].terra && sprite.type === '0' && sprite.corner === '23') return true;
                        });
                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX + map.cell_width * 0.3,
                                tileY - map.cell_height * 0.251,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    } else if ((sides[4].terra === 2 || sides[4].terra === 3) && (sides[5].terra !== 2 && sides[5].terra !== 3)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === sides[4].terra && sprite.type === '0' && sprite.corner === '01') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX + map.cell_width * 0.19,
                                tileY - map.cell_height * 0.251,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    }

                    // =================== corner 05

                    if ((sides[0].terra === 2 || sides[0].terra === 3) && (sides[5].terra === 2 || sides[5].terra === 3)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === sides[0].terra && sprite.type === '1' && sprite.corner === '05') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX + map.cell_width * 0.69,
                                tileY - map.cell_height * 0.035,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    } else if ((sides[0].terra === 2 || sides[0].terra === 3) && (sides[5].terra !== 2 && sides[5].terra !== 3)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === sides[0].terra && sprite.type === '0' && sprite.corner === '34') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX + map.cell_width * 0.803,
                                tileY - map.cell_height * 0.035,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    } else if (sides[0].terra === 0 && (sides[5].terra === 2 || sides[5].terra === 3)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === sides[5].terra && sprite.type === '1' && sprite.corner === '05') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX + map.cell_width * 0.69,
                                tileY - map.cell_height * 0.035,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    }

                    // =================== corner 23

                    if ((sides[2].terra === 2 || sides[2].terra === 3) && (sides[3].terra === 2 || sides[3].terra === 3)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === sides[2].terra && sprite.type === '1' && sprite.corner === '23') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX - map.cell_width * 0.193,
                                tileY + map.cell_height * 0.498,
                                map.cell_width * (spriteVar.w - 2) / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    } else if ((sides[2].terra === 2 || sides[2].terra === 3) && (sides[3].terra !== 2 && sides[3].terra !== 3)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === sides[2].terra && sprite.type === '0' && sprite.corner === '45') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX - map.cell_width * 0.31,
                                tileY + map.cell_height * 0.55,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    }

                    // =================== corner 12

                    if ((sides[1].terra === 2 || sides[1].terra === 3) && (sides[2].terra === 2 || sides[2].terra === 3)) { // corner 12: water / water

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === sides[1].terra && sprite.type === '1' && sprite.corner === '12') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX + map.cell_width * 0.19,
                                tileY + map.cell_height * 0.7,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    }

                    // ------
                    // =================== corner 01

                    if ((sides[0].terra === 2 || sides[0].terra === 3) && (sides[1].terra === 2 || sides[1].terra === 3)) { // corner 12: water / water

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === sides[0].terra && sprite.type === '1' && sprite.corner === '01') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX + map.cell_width * 0.69,
                                tileY + map.cell_height * 0.498,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    }

                } else if (tileID === 2 || tileID === 3) {

                    // =================== corner 34

                    if ((sides[3].terra === 1 || sides[3].terra === 5) && (sides[4].terra === 1 || sides[4].terra === 5)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === tileID && sprite.type === '0' && sprite.corner === '34') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX - map.cell_width * 0.193,
                                tileY - map.cell_height * 0.035,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    } else if ((sides[3].terra === 1 || sides[3].terra === 5) && (sides[4].terra !== 1 && sides[4].terra !== 5)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === tileID && sprite.type === '1' && sprite.corner === '05') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX - map.cell_width * 0.307,
                                tileY - map.cell_height * 0.035,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    } else if ((sides[3].terra !== 1 && sides[3].terra !== 5) && (sides[4].terra === 1 || sides[4].terra === 5)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === tileID && sprite.type === '1' && sprite.corner === '12') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX - map.cell_width * 0.31,
                                tileY - map.cell_height * 0.055,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    }

                    // =================== corner 45

                    if ((sides[4].terra === 1 || sides[4].terra === 5) && (sides[5].terra === 1 || sides[5].terra === 5)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === tileID && sprite.type === '0' && sprite.corner === '45') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX + map.cell_width * 0.19,
                                tileY - map.cell_height * 0.2,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    } else if ((sides[4].terra !== 1 && sides[4].terra !== 5) && (sides[5].terra === 1 || sides[5].terra === 5)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === tileID && sprite.type === '1' && sprite.corner === '23') return true;
                        });
                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX + map.cell_width * 0.3,
                                tileY - map.cell_height * 0.251,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    } else if ((sides[4].terra === 1 || sides[4].terra === 5) && (sides[5].terra !== 1 && sides[5].terra !== 5)) {

                        const sprite = spriteMap.intersections.find(sprite => {
                            if (+sprite.zone === tileID && sprite.type === '1' && sprite.corner === '01') return true;
                        });

                        const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                        try {
                            ctx.drawImage(
                                spritesheets.intersections,
                                spriteVar.x,
                                spriteVar.y,
                                spriteVar.w,
                                spriteVar.h,
                                tileX + map.cell_width * 0.19,
                                tileY - map.cell_height * 0.251,
                                map.cell_width * spriteVar.w / HEX_WIDTH,
                                map.cell_height * spriteVar.h / HEX_HEIGHT
                            );
                        } catch (e) {

                        } finally {

                        }

                    }

                    // =================== corner 05

                    if (sides[0].terra !== tileID) {
                        if ((sides[0].terra !== 1 && sides[0].terra !== 5) && (sides[5].terra === 1 || sides[5].terra === 5)) {

                            const sprite = spriteMap.intersections.find(sprite => {
                                if (+sprite.zone === tileID && sprite.type === '0' && sprite.corner === '05') return true;
                            });

                            const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                            try {
                                ctx.drawImage(
                                    spritesheets.intersections,
                                    spriteVar.x,
                                    spriteVar.y,
                                    spriteVar.w,
                                    spriteVar.h,
                                    tileX + map.cell_width * 0.69,
                                    tileY - map.cell_height * 0.035,
                                    map.cell_width * spriteVar.w / HEX_WIDTH,
                                    map.cell_height * spriteVar.h / HEX_HEIGHT
                                );
                            } catch (e) {

                            } finally {

                            }

                        }
                    }


                }

                // =================== seashores

                let tile_x;
                let tile_y;
                let tile_w;
                let tile_h;
                // let ratioSizeBigger = 1.25;
                // let ratioSizeSmaller = 0.75;
                // let ratioShift = 0.1;
                // =================== corner 34

                if (sides[3].terra === 0 && sides[4].terra === 0) { // corner 34: water / water

                    const sprite = spriteMap.intersections.find(sprite => {
                        if (sprite.type === '1' && sprite.corner === '34') return true;
                    });

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    tile_x = tileX - map.cell_width * 0.193;
                    tile_y = tileY - map.cell_height * 0.035;
                    tile_w = map.cell_width * spriteVar.w / HEX_WIDTH;
                    tile_h = map.cell_height * spriteVar.h / HEX_HEIGHT;

                    try {
                        ctx.drawImage(
                            spritesheets.intersections,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tile_x,
                            tile_y,
                            tile_w,
                            tile_h
                        );
                    } catch (e) {

                    }

                } else if (sides[3].terra !== 0 && sides[4].terra === 0) { // corner 34: land / water

                    const sprite = spriteMap.intersections.find(sprite => {
                        if (sprite.type === '0' && sprite.corner === '12') return true;
                    });
                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    tile_x = tileX - map.cell_width * 0.31;
                    tile_y = tileY - map.cell_height * 0.045;
                    tile_w = map.cell_width * spriteVar.w / HEX_WIDTH;
                    tile_h = map.cell_height * spriteVar.h / HEX_HEIGHT;

                    try {
                        ctx.drawImage(
                            spritesheets.intersections,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tile_x,
                            tile_y,
                            tile_w,
                            tile_h
                        );
                    } catch (e) {

                    }

                } else if (sides[3].terra === 0 && sides[4].terra !== 0) { // corner 34: water / land

                    const sprite = spriteMap.intersections.find(sprite => {
                        if (sprite.type === '0' && sprite.corner === '05') return true;
                    });

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    tile_x = tileX - map.cell_width * 0.317;
                    tile_y = tileY - map.cell_height * 0.035;
                    tile_w = map.cell_width * spriteVar.w / HEX_WIDTH;
                    tile_h = map.cell_height * spriteVar.h / HEX_HEIGHT;

                    try {
                        ctx.drawImage(
                            spritesheets.intersections,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tile_x,
                            tile_y,
                            tile_w,
                            tile_h
                        );
                    } catch (e) {

                    }
                }

                // =================== corner 45

                if (sides[4].terra === 0 && sides[5].terra === 0) { // corner 45: water / water

                    const sprite = spriteMap.intersections.find(sprite => {
                        if (sprite.type === '1' && sprite.corner === '45') return true;
                    });

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    tile_x = tileX + map.cell_width * 0.19;
                    tile_y = tileY - map.cell_height * 0.2;
                    tile_w = map.cell_width * spriteVar.w / HEX_WIDTH;
                    tile_h = map.cell_height * spriteVar.h / HEX_HEIGHT;

                    try {
                        ctx.drawImage(
                            spritesheets.intersections,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tile_x,
                            tile_y,
                            tile_w,
                            tile_h
                        );
                    } catch (e) {

                    }

                } else if (sides[4].terra !== 0 && sides[5].terra === 0) { // corner 45: land / water

                    const sprite = spriteMap.intersections.find(sprite => {
                        if (sprite.type === '0' && sprite.corner === '23') return true;
                    });
                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    tile_x = tileX + map.cell_width * 0.3;
                    tile_y = tileY - map.cell_height * 0.251;
                    tile_w = map.cell_width * spriteVar.w / HEX_WIDTH;
                    tile_h = map.cell_height * spriteVar.h / HEX_HEIGHT;

                    try {
                        ctx.drawImage(
                            spritesheets.intersections,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tile_x,
                            tile_y,
                            tile_w,
                            tile_h
                        );
                    } catch (e) {

                    }

                } else if (sides[4].terra === 0 && sides[5].terra !== 0) { // corner 45: water / land

                    const sprite = spriteMap.intersections.find(sprite => {
                        if (sprite.type === '0' && sprite.corner === '01') return true;
                    });

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    tile_x = tileX + map.cell_width * 0.195;
                    tile_y = tileY - map.cell_height * 0.251;
                    tile_w = map.cell_width * spriteVar.w / HEX_WIDTH;
                    tile_h = map.cell_height * spriteVar.h / HEX_HEIGHT;

                    try {
                        ctx.drawImage(
                            spritesheets.intersections,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tile_x,
                            tile_y,
                            tile_w,
                            tile_h
                        );
                    } catch (e) {

                    }

                }

                // ------
                // =================== corner 05

                if (sides[0].terra === 0 && sides[5].terra === 0) { // corner 05: water / water

                    const sprite = spriteMap.intersections.find(sprite => {
                        if (sprite.type === '1' && sprite.corner === '05') return true;
                    });

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    tile_x = tileX + map.cell_width * 0.68;
                    tile_y = tileY - map.cell_height * 0.025;
                    tile_w = map.cell_width * spriteVar.w / HEX_WIDTH;
                    tile_h = map.cell_height * spriteVar.h / HEX_HEIGHT;

                    try {
                        ctx.drawImage(
                            spritesheets.intersections,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tile_x,
                            tile_y,
                            tile_w,
                            tile_h
                        );
                    } catch (e) {

                    }

                } else if (sides[0].terra === 0 && sides[5].terra !== 0) { // corner 05: water / land

                    const sprite = spriteMap.intersections.find(sprite => {
                        if (sprite.type === '0' && sprite.corner === '34') return true;
                    });

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    tile_x = tileX + map.cell_width * 0.808;
                    tile_y = tileY - map.cell_height * 0.035;
                    tile_w = map.cell_width * spriteVar.w / HEX_WIDTH;
                    tile_h = map.cell_height * spriteVar.h / HEX_HEIGHT;

                    try {
                        ctx.drawImage(
                            spritesheets.intersections,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tile_x,
                            tile_y,
                            tile_w,
                            tile_h
                        );
                    } catch (e) {

                    }

                }

                // ------
                // =================== corner 23

                if (sides[2].terra === 0 && sides[3].terra === 0) { // corner 23: water / water

                    const sprite = spriteMap.intersections.find(sprite => {
                        if (sprite.type === '1' && sprite.corner === '23') return true;
                    });

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    tile_x = tileX - map.cell_width * 0.193;
                    tile_y = tileY + map.cell_height * 0.498;
                    tile_w = map.cell_width * (spriteVar.w - 2) / HEX_WIDTH;
                    tile_h = map.cell_height * spriteVar.h / HEX_HEIGHT;

                    try {
                        ctx.drawImage(
                            spritesheets.intersections,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tile_x,
                            tile_y,
                            tile_w,
                            tile_h
                        );
                    } catch (e) {

                    }

                } else if (sides[2].terra === 0 && sides[3].terra !== 0) {

                    const sprite = spriteMap.intersections.find(sprite => {
                        if (sprite.type === '0' && sprite.corner === '45') return true;
                    });

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    tile_x = tileX - map.cell_width * 0.31;
                    tile_y = tileY + map.cell_height * 0.55;
                    tile_w = map.cell_width * spriteVar.w / HEX_WIDTH;
                    tile_h = map.cell_height * spriteVar.h / HEX_HEIGHT;

                    try {
                        ctx.drawImage(
                            spritesheets.intersections,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tile_x,
                            tile_y,
                            tile_w,
                            tile_h
                        );
                    } catch (e) {

                    }

                }

                // ------
                // =================== corner 12

                if (sides[1].terra === 0 && sides[2].terra === 0) { // corner 12: water / water

                    const sprite = spriteMap.intersections.find(sprite => {
                        if (sprite.type === '1' && sprite.corner === '12') return true;
                    });

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    tile_x = tileX + map.cell_width * 0.19;
                    tile_y = tileY + map.cell_height * 0.705;
                    tile_w = map.cell_width * spriteVar.w / HEX_WIDTH;
                    tile_h = map.cell_height * spriteVar.h / HEX_HEIGHT;

                    try {
                        ctx.drawImage(
                            spritesheets.intersections,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tile_x,
                            tile_y,
                            tile_w,
                            tile_h
                        );
                    } catch (e) {

                    }

                }

                // ------
                // =================== corner 01

                if (sides[0].terra === 0 && sides[1].terra === 0) { // corner 12: water / water

                    const sprite = spriteMap.intersections.find(sprite => {
                        if (sprite.type === '1' && sprite.corner === '01') return true;
                    });

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    tile_x = tileX + map.cell_width * 0.695;
                    tile_y = tileY + map.cell_height * 0.498;
                    tile_w = map.cell_width * spriteVar.w / HEX_WIDTH;
                    tile_h = map.cell_height * spriteVar.h / HEX_HEIGHT;

                    try {
                        ctx.drawImage(
                            spritesheets.intersections,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tile_x,
                            tile_y,
                            tile_w,
                            tile_h
                        );
                    } catch (e) {

                    }

                }

                // ------

            }

        }
        function rivers(col, row, tileX, tileY, index) {

            if (map.layer.terrain[index] === 0) return;

            if (map.layer.nature[index] === 6) {

                const sides = findAdjacentTiles(col, row);
                let hex_sides = '';
                let river_part = '1';
                let riverSprite = null;

                for (let i = 0; i < sides.length; i++) {
                    const index = sides[i].row * map.columns + sides[i].col;
                    if (map.layer.terrain[index] === 0) {
                        river_part = '2';
                        hex_sides = i;
                        break;
                    } else if (map.layer.nature[index] === 6) {
                        hex_sides += i;
                    }
                }
                if (hex_sides.length <= 1 && map.layer.terrain[index] !== 0) {
                    river_part = '3';
                }

                riverSprite = spriteMap.back.find(sprite => {
                    if (river_part === '3') {
                        let zone = map.layer.terrain[index];
                        if (zone === 1) zone = 5;
                        if (+sprite.zone === zone &&
                            sprite.hex_sides === hex_sides + '' &&
                            sprite.river_part === river_part) {
                            return true;
                        }
                    } else if (sprite.hex_sides === hex_sides + '' &&
                        sprite.river_part === river_part) {
                        return true;
                    }
                });

                let posX = tileX - map.cell_width * 0.13;
                let posY = tileY - map.cell_height * 0.361;
                let sizeW = map.cell_width * 1.26;
                let sizeH = map.cell_height * 1.4118;

                if (riverSprite) {
                    const spriteVar = riverSprite.variations[randomOnSeed(0, riverSprite.variations.length - 1, index)];

                    if (river_part === '2') { // if estuary
                        spriteVar.w = 894;
                        spriteVar.h = 848;
                        sizeW = (spriteVar.w / HEX_WIDTH) * map.cell_width;
                        sizeH = (spriteVar.h / HEX_HEIGHT) * map.cell_height;
                        posX = tileX - map.cell_width;
                        posY = tileY - map.cell_height * 1.31;
                    }

                    try {
                        ctx.drawImage(
                            spritesheets.back,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            posX,
                            posY,
                            sizeW,
                            sizeH
                        );
                    } catch (e) {

                    }
                } else {
                    plainHex(tileX, tileY, '#3079AF', .75);
                }
            }

        }
        function front(col, row, tileX, tileY, index) {

            if (map.layer.terrain[index] === 0) return;
            if (map.cell_width < DISTANT_ZOOM_MAX) return;

            const city = located(map.layer.cities, col, row);
            if (city && (city.type == 1 || city.type == 2 || city.type == 3) && !editor) return drawCity(city);
            if (city && (city.type == 4 || city.type == 5) && !editor) return drawVillage(city);

            drawNature();

            function drawCity(city) {

                const sprite = spriteMap.city.find(sprite => {

                    let cityClass = '';

                    switch (city.type) {
                        case '1':
                        case 1:
                            cityClass = 'city';
                            if (cityClass == sprite.class &&
                                city.arh == sprite.culture &&
                                city.size == +sprite.size) return true;
                            break;
                        case '2':
                        case 2:
                            cityClass = 'camp';
                            if (cityClass == sprite.class &&
                                city.arh == sprite.culture) return true;
                            break;
                        case '3':
                        case 3:
                            cityClass = 'port';
                            if (cityClass == sprite.class) {
                                const sides = findAdjacentTiles(col, row);
                                sides.forEach((side, i) => {

                                    if (map.layer.terrain[side[index]] === 0) {
                                        if (i === sprite.side) return true;
                                    }

                                });
                            }
                            return false;
                        default:

                    }

                });

                if (sprite) {

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    try {
                        ctx.drawImage(
                            spritesheets.city,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tileX - ((map.cell_width * 1.2) - map.cell_width) / 2,
                            tileY - map.cell_height * 1.411 * OBJECT_TOP_EXTENSION,
                            map.cell_width * 1.2,
                            map.cell_height * 1.4118
                        );
                    } catch (e) {

                    }

                } else {

                    switch (city.type) {
                        case '1':
                        case 1:
                            plainHex(tileX, tileY, 'red', 0.5); // city
                            break;
                        case '2':
                        case 2:
                            plainHex(tileX, tileY, 'lime', 0.5); // rogues
                            break;
                        case '3':
                        case 3:
                            plainHex(tileX, tileY, 'deepskyblue', 0.5); // port
                            break;
                        default:

                    }

                }

            }
            function drawVillage(village) {

                const sprite = spriteMap.village.find(sprite => {

                    let zone = map.layer.terrain[index];
                    if (zone === 1 || zone === 5) zone = 5;

                    switch (village.type) {
                        case '4':
                        case 4:
                            if (sprite.type === '2' && +sprite.zone === zone) return true;
                            return false;
                        case '5':
                        case 5:
                            if (sprite.type === '1' && +sprite.zone === zone) return true;
                            return false;
                        default:
                            return false;

                    }

                });

                if (sprite) {

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    ctx.drawImage(
                        spritesheets.village,
                        spriteVar.x,
                        spriteVar.y,
                        spriteVar.w,
                        spriteVar.h,
                        tileX - ((map.cell_width * 1.2) - map.cell_width) / 2,
                        tileY - map.cell_height * 1.411 * OBJECT_TOP_EXTENSION,
                        map.cell_width * 1.2,
                        map.cell_height * 1.4118
                    );

                } else {

                    switch (village.type) {
                        case '4':
                        case 4:
                            plainHex(tileX, tileY, 'lime', 0.5); // mill
                            break;
                        case '5':
                        case 5:
                            plainHex(tileX, tileY, '#D220CC', 0.5); // field
                            break;
                        default:

                    }

                }

            }
            function drawNature() {

                let tileID = map.layer.nature[index];
                const sprite = spriteMap.front.find(sprite => {

                    if (String(tileID).slice(0, 2) === '10') { // if mountains

                        const groupType = String(tileID)[2];
                        if (+sprite.type === 1 && sprite.group === groupType) return true;

                    } else if (tileID === 1) {

                        return;

                    }

                    if (map.layer.terrain[index] === 3) {
                        switch (tileID) {
                            case 4:
                                tileID = 5;
                                break;
                            case 11:
                                tileID = 12;
                                break;
                            default:

                        }
                    }

                    // if forest
                    if (tileID === 4 ||
                        tileID === 5 ||
                        tileID === 8 ||
                        tileID === 11 ||
                        tileID === 12) {

                        const sides = findAdjacentTiles(col, row);
                        let woodSizes = 0;
                        for (let i = 0; i < sides.length; i++) {
                            const index = sides[i].row * map.columns + sides[i].col;
                            if (map.layer.nature[index] === tileID) { // if neighbor hex is forest
                                woodSizes++;
                            }
                        }

                        if (+sprite.type === tileID) {
                            if (woodSizes === 6 && +sprite.density === 1) return true;
                            if (woodSizes < 6 && +sprite.density === 0) return true;
                        }

                    } else if (+sprite.type === tileID) {
                        return true;
                    }

                });

                if (sprite) {
                    makePatches();
                } else {
                    spreadSmallObjects();
                }

                if (editor && showMountainsArea) highlightMountainsArea(tileID);

                function makePatches() {

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    let posX = tileX - ((map.cell_width * 1.2) - map.cell_width) / 2;
                    let posY = tileY - map.cell_height * 1.411 * OBJECT_TOP_EXTENSION;
                    let cellWidth = map.cell_width * 1.2;
                    let cellHeight = map.cell_height * 1.4118;

                    if (sprite.type != 1 && located(map.layer.units, col, row)) {
                        ctx.globalAlpha = 0.6;
                    }

                    if (sprite.type === '1') { // if mountains

                        switch (+sprite.group) {
                            case 1:
                                break;
                            case 2:
                                posX -= map.cell_width * 0.075;
                                posY += map.cell_height * 0.15;
                                cellWidth = map.cell_width * 2.3;
                                cellHeight = map.cell_height * 1.274;
                                break;
                            case 3:
                                posX -= map.cell_width * 0.075;
                                posY -= map.cell_height * 0.1;
                                cellWidth = map.cell_width * 3.37;
                                cellHeight = map.cell_height * 1.835;
                                break;
                            case 4:
                                posX -= map.cell_width * 0.075;
                                posY -= map.cell_height * 0.05;
                                cellWidth = map.cell_width * 4.257;
                                cellHeight = map.cell_height * 1.51;
                                break;
                            case 5:
                                posX -= map.cell_width * 0.1;
                                cellWidth = map.cell_width * 2.243;
                                cellHeight = map.cell_height * 2.286;
                                break;
                            case 6:
                                posX -= map.cell_width * 0.52;
                                posY += map.cell_height * 0.05;
                                cellWidth = map.cell_width * 2.237;
                                cellHeight = map.cell_height * 2.145;
                                break;
                            case 7:
                                posX -= map.cell_width * 0.6;
                                cellWidth = map.cell_width * 2.3;
                                cellHeight = map.cell_height * 2.86;
                                break;
                            case 8:
                                posX -= map.cell_width * 0.15;
                                posY += map.cell_height * 0.12;
                                cellWidth = map.cell_width * 3.817;
                                cellHeight = map.cell_height * 2.067;
                                break;
                            default:

                        }

                    }

                    try {
                        ctx.drawImage(
                            spritesheets.front,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            posX,
                            posY,
                            cellWidth,
                            cellHeight
                        );
                    } catch (e) {

                    }

                    ctx.globalAlpha = 1;

                }
                function spreadSmallObjects() {

                    if (map.layer.random[index]) {

                        let allVariations = [];
                        const sprites = spriteMap.small.filter(sprite => {
                            if (+sprite.zone === map.layer.terrain[index]) return true;
                        });
                        sprites.forEach(sprite => {
                            allVariations = allVariations.concat(sprite.variations);
                        });

                        if (sprites.length > 0) {

                            const spriteVar = allVariations[randomOnSeed(0, allVariations.length - 1, index)];

                            const objWidth = spriteVar.w / HEX_WIDTH * map.cell_width;
                            const objHeight = spriteVar.h / HEX_HEIGHT * map.cell_height;

                            const xShift = tileX + map.cell_width * randomOnSeed(-10, 40, index) / 100;
                            const yShift = tileY + map.cell_height * randomOnSeed(-10, 40, index) / 100;

                            try {
                                ctx.drawImage(
                                    spritesheets.small,
                                    spriteVar.x,
                                    spriteVar.y,
                                    spriteVar.w,
                                    spriteVar.h,
                                    xShift,
                                    yShift,
                                    objWidth,
                                    objHeight
                                );
                            } catch (e) {
                            }

                        }

                    }

                }
                function highlightMountainsArea(id) {

                    let opacity;

                    switch (id) {
                        case 1:
                            opacity = 0.3;
                            break;
                        case 101:
                        case 102:
                        case 103:
                        case 104:
                        case 105:
                        case 106:
                        case 107:
                        case 108:
                            opacity = 0.6;
                            break;
                        default:
                            return;
                    }

                    plainHex(tileX, tileY, 'red', opacity);
                    drawText(tileX, tileY, id, 'center');

                }

            }


        }
        function highlight(col, row, tileX, tileY) {

            if (col === selection.col && row === selection.row) {

                ctx.drawImage(
                    selection.img,
                    0,
                    0,
                    selection.sprite_width,
                    selection.sprite_height,
                    tileX - map.cell_width * 0.1,
                    tileY - map.cell_height * 0.1,
                    map.cell_width * 1.2,
                    map.cell_height * 1.2
                );

                drawText(tileX, tileY, `${col}, ${row}`, 'center');

                // ctx.globalAlpha = 0.4;
                //
                // const adjacent = findAdjacentTiles(col, row);
                //
                // adjacent.forEach((tile, i) => {
                //
                //     ctx.drawImage(
                //         selection.img,
                //         0,
                //         0,
                //         selection.sprite_width,
                //         selection.sprite_height,
                //         tile.x - map.cell_width * 0.1,
                //         tile.y - map.cell_height * 0.1,
                //         map.cell_width * 1.2,
                //         map.cell_height * 1.2
                //     );
                //
                //     drawText(tile.x, tile.y, i, 'center');
                //
                // });
                //
                // ctx.globalAlpha = 1;

            }

        }
        function cityNames(col, row, tileX, tileY, index) {

            if (map.cell_width < CITY_NAME_ZOOM) return;
            if (map.layer.terrain[index] === 0) return;

            const city = located(map.layer.cities, col, row);

            if (city && city.name) {

                const framesSize = map.cell_width / 2;
                const blazonSize = map.cell_width / 2 * BLAZON_TO_FRAME_SIZE_RATIO;
                const blazonCoordShift = framesSize * (1 - BLAZON_TO_FRAME_SIZE_RATIO) / 2;

                city.blazon_coords = {
                    x1: tileX + map.cell_width / 2 - framesSize / 2,
                    x2: tileX + map.cell_width / 2 + framesSize / 2,
                    y1: tileY + map.cell_height + map.cell_height * BLAZON_GAP,
                    y2: tileY + map.cell_height + map.cell_height * BLAZON_GAP + framesSize,
                }

                // drawText(tileX, tileY, city.name, 'bottom');
                // const cityNameWidth = ctx.measureText(city.name).width;

                if (city.blazon_img) {
                    try {
                        ctx.drawImage(
                            city.blazon_img,
                            0,
                            0,
                            city.blazon_img.width,
                            city.blazon_img.height,
                            city.blazon_coords.x1 + blazonCoordShift,
                            city.blazon_coords.y1 + blazonCoordShift,
                            blazonSize,
                            blazonSize
                        );
                        ctx.drawImage(
                            img_assets.round_frame,
                            0,
                            0,
                            img_assets.round_frame.width,
                            img_assets.round_frame.height,
                            city.blazon_coords.x1,
                            city.blazon_coords.y1,
                            framesSize,
                            framesSize
                        );
                    } catch (e) {

                    }
                } else {
                    city.blazon_img = new Image();
                    city.blazon_img.src = city.blazon;
                    city.blazon_img.onload = redraw;
                }

            };

        }
        function countryNames(col, row, tileX, tileY, index) {

            if (activeLayer !== 'polytics') return;
            if (!map.mode.polytics.gravityCenters) return;

            const name = map.mode.polytics.gravityCenters[index];
            if (name) {

                const lines = name.split(' ');
                const lineHeight = 20;

                ctx.font = "18px Vollkorn";
                ctx.fillStyle = 'white';
                ctx.strokeStyle = '#180f0a99';
                ctx.lineWidth = 3;

                const x = tileX + map.cell_width / 2
                const y = tileY + map.cell_height / 2 + map.cell_height * .1;

                for (let i = 0; i < lines.length; i++) {
                    ctx.strokeText(
                        lines[i],
                        x,
                        y + (i * lineHeight)
                    );

                    ctx.fillText(
                        lines[i],
                        x,
                        y + (i * lineHeight)
                    );

                }

            }

        }
        function units(col, row, tileX, tileY, index) {

            const unit = located(map.layer.units, col, row);

            if (unit) {
                if (map.layer.terrain[index] === 0) {

                    // const width = map.cell_width * 1.2;
                    // let height = map.cell_height * 1.4118;
                    //
                    // try {
                    //
                    //     ctx.drawImage(
                    //         img_assets.unit_on_sea,
                    //         0,
                    //         0,
                    //         img_assets.unit_on_sea.naturalWidth,
                    //         img_assets.unit_on_sea.naturalHeight,
                    //         tileX - ((map.cell_width * 1.2) - map.cell_width) / 2,
                    //         tileY - map.cell_height * 1.411 * OBJECT_TOP_EXTENSION,
                    //         width,
                    //         height
                    //     );
                    //
                    // } catch (e) {
                    //
                    // }

                } else {

                    const tileID = map.layer.nature[index];
                    if (String(tileID).slice(0, 2) === '10') { // if mountains

                        const width = map.cell_width / 2;
                        let height = map.cell_height / 2 * CELL_RATIO;
                        if (map.cell_width < DISTANT_ZOOM_MAX) height = width;

                        ctx.drawImage(
                            img_assets.country_coa,
                            0,
                            0,
                            img_assets.country_coa.naturalWidth,
                            img_assets.country_coa.naturalHeight,
                            tileX + map.cell_width / 4,
                            tileY + map.cell_height / 6,
                            width,
                            height
                        );

                    } else {

                        // let color = 'yellow';
                        // if (selection.unit &&
                        //     selection.unit.x === col &&
                        //     selection.unit.y === row) color = 'cyan';
                        // drawText(tileX, tileY, `Юнит, id: ${unit.id}`, 'center', color);

                    }

                }

            }

        }
        function colors(col, row, tileX, tileY, index) {

            if (!activeLayer || activeLayer === 'physical') return;

            let color = null;
            const data = map.mode[activeLayer];

            switch (activeLayer) {
                case 'geo':
                case 'nature':
                    let resID = data.resurses[index];
                    if (!resID) return;

                    let resColor = `hsl(${resID}, 100%, 50%)`;
                    plainHex(tileX, tileY, resColor, 0.4);

                    if (map.cell_width < RESOURCES_ZOOM) return;

                    const resource = spriteMap.resources.find(resource => +resID === resource.id);
                    if (!resource) return;
                    const spriteVar = resource.variations[randomOnSeed(0, resource.variations.length - 1, index)];

                    const objWidth = spriteVar.w / HEX_WIDTH * map.cell_width * 0.75;
                    const objHeight = spriteVar.h / HEX_HEIGHT * map.cell_height * 0.75;

                    const xShift = tileX + map.cell_width / 2 - objWidth / 2;
                    const yShift = tileY + map.cell_height / 2 - objHeight / 2;

                    ctx.drawImage(
                        spritesheets.resources,
                        spriteVar.x,
                        spriteVar.y,
                        spriteVar.w,
                        spriteVar.h,
                        xShift,
                        yShift,
                        objWidth,
                        objHeight
                    );
                    break;
                default:
                    if (!data.colors[index]) return;
                    const type = data.colors[index];
                    color = data.types[type - 1].color;
                    plainHex(tileX, tileY, color, 0.4);

            }

        }
        function worldMap(col, row, tileX, tileY, index) {

            if (!wmapTiles[index]) {

                const tile = new Image();
                tile.src = `/images/map/world/w660/${index}.jpg`;
                wmapTiles[index] = tile;

            } else {
                try {
                    ctx.globalAlpha = map.distant_zoom_ratio;
                    ctx.drawImage(
                        wmapTiles[index],
                        0,
                        0,
                        660,
                        660,
                        tileX,
                        tileY,
                        map.wmap_cell_width,
                        map.wmap_cell_height
                    );
                    ctx.globalAlpha = 1;
                } catch (e) {
                    console.log(e);
                }
            }

        }
        function route() {

            if (!selection.unit || !selection.unit.route) return;
            if (selection.unit.route.list.length === 0) return;

            const route = selection.unit.route.list;
            const start = getHexCoords(selection.unit.x, selection.unit.y);

            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'cyan';
            ctx.moveTo(start.x + map.cell_width / 2, start.y + map.cell_height / 2);

            for (let i = 0; i < route.length; i++) {
                const point = getHexCoords(route[i].x, route[i].y);
                ctx.lineTo(point.x + map.cell_width / 2, point.y + map.cell_height / 2);
            }

            ctx.stroke();

        }

    }
    function drawText(tileX, tileY, text, position, color) {

        color = color ? color : 'white';

        ctx.font = "18px Vollkorn";
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
    function plainHex(x, y, color, opacity) {

        ctx.globalAlpha = opacity;
        ctx.lineWidth = 0;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + map.cell_width / 2, y);
        ctx.lineTo(x + map.cell_width, y + map.cell_height / 4);
        ctx.lineTo(x + map.cell_width, y + map.cell_height * 0.75);
        ctx.lineTo(x + map.cell_width / 2, y + map.cell_height);
        ctx.lineTo(x, y + map.cell_height * 0.75);
        ctx.lineTo(x, y + map.cell_height / 4);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

    }
    function switchMode(name) {

        activeLayer = name;
        redraw();

    }
    function getActiveLayer() {
        return activeLayer;
    }
    function toggleMountainsArea(boolean) {

        showMountainsArea = boolean;
        redraw();

    }

    // utilities
    function Compositing(video, can) {

        const COLOR_OPACITY = 0.9;

        const ctx = can.getContext('2d');
        const canOff = document.createElement('canvas');
        const ctxOff = canOff.getContext('2d');

        const width = video.videoWidth;
        const height = video.videoHeight;

        can.width = width;
        can.height = height / 2;
        canOff.width = width;
        canOff.height = height;

        this.process = process;

        process();

        function process() {

            ctxOff.drawImage(
                video,
                0,
                0,
                width,
                height,
                0,
                0,
                width,
                height
            );

            const color = ctxOff.getImageData(0, 0, width, height / 2);
            const info = ctxOff.getImageData(0, height / 2, width, height);

            const colorPass = color.data;
            const infoPass = info.data;

            for (let i = 0; i < colorPass.length; i += 4) {

                const red = colorPass[i + 0];
                const green = colorPass[i + 1];
                const blue = colorPass[i + 2];

                const alpha = infoPass[i + 0]; // red
                const mask = infoPass[i + 1]; // green
                colorPass[i + 3] = alpha;
                if (mask) {
                    const deltaRatio = (mask / (255 / COLOR_OPACITY));
                    colorPass[i + 0] = shiftChannel(red, countryColor.r, deltaRatio);
                    colorPass[i + 1] = shiftChannel(green, countryColor.g, deltaRatio);
                    colorPass[i + 2] = shiftChannel(blue, countryColor.b, deltaRatio);
                }
            }

            ctx.putImageData(color, 0, 0);

        }

        function shiftChannel(value1, value2, ratio) {

            const delta = value2 - value1;
            const shift = delta * ratio;
            const newValue = value1 + shift;

            return newValue;

        }

    }
    function hex2rgb(string) {

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(string);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;

    }
    function getHexCoords(col, row) {

        let x = col * map.cell_width - viewport.x + canvasWidth / 2 - viewport.width / 2;
        if (row % 2 === 0) x += map.column_shift;
        const y = row * map.row_height - viewport.y + canvasHeight / 2 - viewport.height / 2;

        return { x, y };

    }
    function getSeaHexCoords(col, row) {

        const x = col * map.sea_cell_width - viewport.x + canvasWidth / 2 - viewport.width / 2;
        const y = row * map.sea_row_height - viewport.y + canvasHeight / 2 - viewport.height / 2;

        return { x, y };

    }
    function getWmapHexCoords(col, row) {

        const x = col * map.wmap_cell_width - viewport.x + canvasWidth / 2 - viewport.width / 2;
        const y = row * map.wmap_row_height - viewport.y + canvasHeight / 2 - viewport.height / 2;

        return { x, y };

    }
    function getHexLocation(x, y) {

        // get hex coordinates:
        // https://stackoverflow.com/questions/7705228/hexagonal-grids-how-do-you-find-which-hexagon-a-point-is-in

        // find row and colum of the initial frid

        let col;
        let row = Math.floor(y / map.row_height);

        const rowIsEven = row % 2 === 1;

        if (rowIsEven) {
            col = Math.floor(x / map.cell_width);
        } else {
            col = Math.floor((x - map.cell_width / 2) / map.cell_width);
        }

        // Work out the position of the point relative to the box it is in

        let relX;
        const relY = y - (row * map.row_height);

        if (rowIsEven) {
            relX = x - (col * map.cell_width);
        } else {
            relX = (x - (col * map.cell_width)) - map.cell_width / 2;
        }

        // Work out if the point is above either of the hexagon's top edges

        const hexCap = map.cell_height * 0.25;
        const hexEdgeGradient = hexCap / (map.cell_width / 2);

        if (relY < (-hexEdgeGradient * relX) + hexCap) { // left edge

            row--;
            if (rowIsEven) col--;

        } else if (relY < (hexEdgeGradient * relX) - hexCap) { // right edge

            row--;
            if (!rowIsEven) col++;

        }

        // if (col < 0 || row < 0 || col > map.columns - 1 || row > map.rows - 1) return;

        if (col < 0) col = 0;
        if (row < 0) row = 0;
        if (col > map.columns - 1) col = map.columns - 1;
        if (row > map.rows - 1) row = map.rows - 1;

        return { col, row };

    }
    function getHexOnClick(offsetX, offsetY) {

        const click = {
            x: viewport.position.x - (viewport.center.x - offsetX),
            y: viewport.position.y - (viewport.center.y - offsetY)
        };

        if (click.x < 0 ||
            click.y < 0 ||
            click.x > map.width ||
            click.y > map.height
        ) return;

        return getHexLocation(click.x, click.y);

    }
    function findAdjacentTiles(col, row) {

        let tiles = [];

        if (row % 2 == 0) {

            tiles = [
                {
                    col: col + 1,
                    row: row
                },
                {
                    col: col + 1,
                    row: row + 1
                },
                {
                    col: col,
                    row: row + 1
                },
                {
                    col: col - 1,
                    row: row
                },
                {
                    col: col,
                    row: row - 1
                },
                {
                    col: col + 1,
                    row: row - 1
                }
            ];

        } else {

            tiles = [
                {
                    col: col + 1,
                    row: row
                },
                {
                    col: col,
                    row: row + 1
                },
                {
                    col: col - 1,
                    row: row + 1
                },
                {
                    col: col - 1,
                    row: row
                },
                {
                    col: col - 1,
                    row: row - 1
                },
                {
                    col: col,
                    row: row - 1
                }
            ];

        }

        tiles.forEach(tile => {

            const coords = getHexCoords(tile.col, tile.row);
            const index = tile.row * map.columns + tile.col;

            tile.x = coords.x;
            tile.y = coords.y;
            tile.index = index;

        });

        return tiles;

    }
    function rnd(range) {

        return Math.floor(Math.random() * (range + 1));

    }
    function randomOnSeed(min, max, seed) {

        const x = Math.sin(seed) * 10000;
        const randomFloat = x - Math.floor(x);
        return Math.round((max - min) * randomFloat + min);

    }
    function located(array, col, row) {

        return array.find(object => +object.x === col && +object.y === row);

    }
    function hey(eventName, data) {

        const event = new CustomEvent(eventName, { detail: data });
        container.dispatchEvent(event);

    }
    function positionCountryNames(data) {

        // console.log(data);
        // console.table(data.types);
        data.gravityCenters = {};

        data.types.forEach((country, i) => {

            const id = i + 1;
            country.cells = [];

            // let cols = 0;
            // let rows = 0;
            let indexes = 0;

            for (let i = 0; i < data.colors.length; i++) {
                if (data.colors[i] === id) {
                    const row = Math.floor(i / map.columns);
                    const col = i - (row) * map.columns;
                    country.cells.push({ col, row });
                    // cols += col;
                    // rows += row;
                    indexes += i;
                }
            }

            // const avgCol = cols / country.cells.length;
            // const avgRow = rows / country.cells.length;
            const index = Math.round(indexes / country.cells.length);

            // country.gravityCenter = {
            //     col: avgCol,
            //     row: avgRow,
            //     index: index
            // }

            map.mode.polytics.gravityCenters[index + ''] = country.name;

            // const colMin = Math.min(...country.cells.map(item => item.col));
            // const colMax = Math.max(...country.cells.map(item => item.col));
            // const rowMin = Math.min(...country.cells.map(item => item.row));
            // const rowMax = Math.max(...country.cells.map(item => item.row));
            //
            // country.edge = {
            //     col_min: colMin,
            //     col_max: colMax,
            //     row_min: rowMin,
            //     row_max: rowMax
            // }



        });

    }
    function f(frameNumber) {

        return frameNumber / FPS;

    }
    function getAngle(sX, sY, eX, eY) {
        const dX = eX - sX;
        const dY = eY - sY;
        const radians = Math.atan2(dY, dX);
        let angle = radians * 180 / Math.PI + 90;
        if (angle < 0) angle += 360;
        if (angle > 360) angle -= 360;
        return angle;
    }
    function sideFromAngle(angle) {

        if (angle >= 60 && angle < 120) return 0;
        if (angle >= 120 && angle < 180) return 1;
        if (angle >= 180 && angle < 240) return 2;
        if (angle >= 240 && angle < 300) return 3;
        if (angle >= 300 && angle < 360) return 4;
        if (angle >= 0 && angle < 60) return 5;

    }

}
function $(selector) {

    return document.querySelector(selector);

}
