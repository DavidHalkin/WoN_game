import * as spriteMap from './sprite-maps.js';

window.map = new WoN();

function WoN() {

    const viewportStart = {
        col: 1599,
        row: 504
    }

    const IMG_PATH = '/images/map/world/';
    const IMG_FORMAT = 'webp';
    const BASE = '/ajax?c=map&do=';
    const API = {
        updates: `${BASE}get_renews`,
        layers: {
            terrain: `${BASE}get_map_terrain`,
            nature: `${BASE}get_map_terra_objects`,
            cities: `${BASE}get_map_objects`,
        },
        modes: {
            physical: '',
            climate: `${BASE}get_map_colors&mode=climate`,
            geo: `${BASE}get_map_resurs&mode=geo`,
            animals: `${BASE}get_map_resurs&mode=nature`,
            ethnic: `${BASE}get_map_colors&mode=ethnic`,
            religion: `${BASE}get_map_colors&mode=religion`,
            polytics: `${BASE}get_map_colors&mode=polytics`,
            vassals: `${BASE}get_map_colors&mode=vassals`,
            trade: ''
        },
        units: `${BASE}get_map_units`,
        select: `${BASE}click_select`,
        unit_route: `${BASE}click`
    };

    let updates = {};
    let spritesheets = {};

    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    const HEX_WIDTH = 300;
    const HEX_HEIGHT = 255;
    const CELL_RATIO = HEX_WIDTH / HEX_HEIGHT;
    const OBJECT_TOP_EXTENSION = 0.25;

    const ZOOM_MIN = 10;
    const ZOOM_MAX = 300;
    const ZOOM_START = 60;
    const DISTANT_ZOOM_MAX = 20;
    const STRETCH_AT_MIN_ZOOM = 0.6;

    const map = {
        layer: {
            terrain: [],
            nature: [],
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
        height: null
    };
    let activeLayer = null;
    let imgData;

    const img = new Image();
    img.onload = function() {
        bufferCanvas.width = 360;
        bufferCanvas.height = 306;
        ctx2.drawImage(
            img,
            0,
            0,
            360 - 3,
            306 - 3,
            0,
            0,
            map.cell_width,
            map.cell_height
        );

        imgData = ctx2.getImageData(0, 0, map.cell_width, map.cell_height).data;
    }
    img.src = `${IMG_PATH}hex-light.webp`;

    class Unit {
        constructor(object) {
            this.id = object.id;
            this.x = +object.x;
            this.y = +object.y;
            this.route = object.route;
            this.can_selected = object.can_selected;
            this.asure_route_list = () => {
                if (!this ?.route ?.list) this.route = { list: [] };
            }
        }
        set_route(x, y) {
            this.asure_route_list();
            x++;
            y++;
            this.route.list = [{ x, y }];
        }
        add_route(x, y) {
            this.asure_route_list();
            x++;
            y++;
            this.route.list.push({ x, y });
        }
    }

    getUpdates();
    loadUnits();
    loadSpritesheets(spriteMap);

    const container = $('#field_map');
    const canvas = $('#mapcanvas');
    const ctx = canvas.getContext('2d');

    const bufferCanvas = document.createElement('canvas');
    const ctx2 = bufferCanvas.getContext('2d');

    let canvasWidth,
        canvasHeight,
        update,
        onPause,
        dev = false;

    if (location.hostname === 'localhost') dev = true;
    document.title = location.hostname;

    class Info {
        constructor(selector) {

            const elem = $(selector);
            const zoom = $('#info .zoom span');
            const coordCurrentCol = $('#coord-current span:nth-child(1)');
            const coordCurrentRow = $('#coord-current span:nth-child(2)');
            const coordClickCol = $('#coord-click span:nth-child(1)');
            const coordClickRow = $('#coord-click span:nth-child(2)');
            const fCol = $('#hex-col');
            const fRow = $('#hex-row');

            this.coordCurrentCol = coordCurrentCol;
            this.coordCurrentRow = coordCurrentRow;
            this.coordClickCol = coordClickCol;
            this.coordClickRow = coordClickRow;
            this.fCol = fCol;
            this.fRow = fRow;
            this.zoomElem = zoom;

            if (dev) {
                fCol.addEventListener('change', updateCoordinates);
                fRow.addEventListener('change', updateCoordinates);
            }

            function updateCoordinates() {

                if (fCol.value && fRow.value && fCol.value > 0 && fRow.value > 0) {
                    viewport.go_to_hex(fCol.value, fRow.value);
                }

            }

        }
        zoom(text) {
            if (dev) {
                this.zoomElem.innerHTML = text;
            }
        }
        show_hex_coord(col, row) {
            if (dev) {
                this.coordCurrentCol.innerText = col + 1;
                this.coordCurrentRow.innerText = row + 1;
            }
        }
        show_hex_click(col, row) {
            if (dev) {
                this.coordClickCol.innerText = col + 1;
                this.coordClickRow.innerText = row + 1;
            }
        }
    }

    setCanvasSize();

    const viewport = new Viewport(0);
    const info = new Info('#info');
    const cursor = new Cursor();
    const selection = new Selection();
    new Controls();

    this.mode = switchMode;
    this.active_mode = getActiveLayer;
    this.viewport = viewport;

    info.show_hex_coord(viewport.coordinates.col, viewport.coordinates.row);

    window.addEventListener('resize', handleWindowResize);

    function getUpdates() {

        let url = API.updates;

        if (location.hostname === 'localhost') {
            url = `/cache/map/renews.json`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {

                updates = data;
                loadMap();

            });

    }
    function loadMap() {

        let loadedLayers = 0;

        for (const key in API.layers) {

            let url = `/cache/map/${key}.bin`;

            if (key === 'terrain') {
                const terrainStored = localStorage.getItem('won_map_terrain');
                if (terrainStored) {
                    const cache = JSON.parse(terrainStored);
                    if (cache.updated >= +updates.get_map_terrain) {
                        map.layer.terrain = cache.terrain;
                        // console.log(key, [...new Set(cache.terrain)]);
                        loadedLayers++;
                        continue;
                    }
                } else {
                    // if (location.hostname != 'localhost') {
                    //     url = `${API.layers[key]}&min_x=1&min_y=1&max_x=2182&max_y=1048`;
                    // }
                }
            }

            fetch(url)
                .then(res => res.arrayBuffer())
                .then(buffer => {

                    const data = msgpack.deserialize(buffer);

                    loadedLayers++;

                    switch (key) {
                        case 'terrain':
                            map.layer[key] = data.terra;
                            localStorage.setItem('won_map_terrain', JSON.stringify({
                                updated: +updates.get_map_terrain,
                                terrain: data.terra
                            }));
                            // console.log(key, [...new Set(data.terra)]);
                            break;
                        case 'nature':
                            map.layer[key] = data.objects;
                            // console.log(key, [...new Set(data.objects)]);
                            break;
                        case 'cities':
                            map.layer[key] = data.city;
                            // console.log(key, [...new Set(data.city)]);
                            break;
                        // case 'colors':
                        //     map.layer[key] = data.colors;
                        //     break;
                        // case 'resources':
                        //     map.layer[key] = data.resurses;
                        //     break;
                        default:

                    }

                    if (loadedLayers === Object.keys(API.layers).length) {
                        checkAllResources();
                    }

                });

        }

    }
    function loadUnits() {

        let url = `${API.units}&min_x=1&min_y=1&max_x=2182&max_y=1048`;
        if (location.hostname === 'localhost') {
            url = `/cache/map/units.json`;
        }

        fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {

                data.army.forEach(unitData => {
                    map.layer.units.push(new Unit(unitData));
                });

                checkAllResources();

                if (map.layer.units.length > 0) {
                    const unit = map.layer.units[0];
                    viewport.go_to_hex(unit.x, unit.y);
                } else {
                    viewport.go_to_hex(viewportStart.col, viewportStart.row);
                }

            });

    }
    function loadModes() {

        for (const key in API.modes) {

            if (key === 'physical') continue;
            if (key === 'animals') continue;

            // let url = `${API[key]}&min_x=1&min_y=1&max_x=2182&max_y=1048`;

            // if (location.hostname === 'localhost') {
            let url = `/cache/map/${key}.bin`;
            //}

            fetch(url)
                .then(res => res.arrayBuffer())
                .then(buffer => {

                    const data = msgpack.deserialize(buffer);

                    // switch (key) {
                    //     case 'climate':
                    //         console.log(data);
                    //         console.log(key, [...new Set(data.colors)]);
                    //         break;
                    //     case 'polytics':
                    //         console.log(key, [...new Set(data.colors)]);
                    //         break;
                    //     case 'geo':
                    //         console.log(key, [...new Set(data.resurses)]);
                    //         break;
                    //     case 'nature':
                    //         console.log(key, [...new Set(data.resurses)]);
                    //         break;
                    //     case 'ethnic':
                    //         console.log(key, [...new Set(data.resurses)]);
                    //         break;
                    //     case 'religion':
                    //         console.log(key, [...new Set(data.resurses)]);
                    //         break;
                    //     case 'vassals':
                    //         console.log(key, [...new Set(data.resurses)]);
                    //         break;
                    //     case 'trade':
                    //         console.log(key, [...new Set(data.resurses)]);
                    //         break;
                    //     default:
                    // }

                    map.mode[key] = data;

                });

        }

    }
    function loadSpritesheets(spriteMap) {

        let loadedMaps = 0;

        for (const map in spriteMap) {
            const url = `${IMG_PATH}spritesheet_${map}.${IMG_FORMAT}`;
            const img = new Image();
            img.addEventListener('load', () => {

                loadedMaps++;
                spritesheets[map] = img;

                if (loadedMaps === Object.keys(spriteMap).length) checkAllResources();

            });
            img.src = url;

        }

    }
    function checkAllResources() {

        if (map.layer.units.length > 0 &&
            map.layer.terrain.length === map.columns * map.rows &&
            Object.keys(spritesheets).length === Object.keys(spriteMap).length) {
            console.log('sprite sheets:', Object.keys(spritesheets).length);
            console.log('everything\'s loaded');

            setMapDimensions();
            generateRandomFeatures();
            redraw();
            loadModes();

        } else {
            console.log('loading...');
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

        window.addEventListener('resize', resize);

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

        }
        function goToHex(col, row) {

            const y = map.row_height * row - map.cell_height * 0.25;
            let x = map.cell_width * col;
            if (row % 2 === 0) x -= map.cell_width / 2;

            viewport.x = x - viewport.width / 2;
            viewport.y = y - viewport.height / 2;

            viewport.position = { x, y };
            viewport.coordinates = { col, row };

            redraw();

        }
        function target(col, row, object) {
            if (viewport.coordinates.col === col && viewport.coordinates.row === row) {
                console.log(object);
            }
        }

    }
    function Controls() {

        const MIN_DRAG = 4; // px

        let dragProcess = false;
        let mouseDownCoord = { x: null, y: null };
        let mousePressed = false;
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

                if (!mousePressed) {
                    mousePressed = true;
                    cursor.down();
                }

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
                    if (mousePressed) {
                        mousePressed = false;
                        cursor.up();
                    }
                    // cursor.use('default');
                    if (dragProcess) return dragEnd();
                    return click(event);
                case 3:
                    if (selection.unit) {
                        const target = getHexOnClick(event.offsetX, event.offsetY);
                        if (target.col + 1 === +selection.unit.x &&
                            target.row + 1 === +selection.unit.y) return;

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

                const x = Math.round(viewport.position.x -= event.movementX / devicePixelRatio);
                const y = Math.round(viewport.position.y -= event.movementY / devicePixelRatio);

                viewport.go_to(x, y);

                info.show_hex_coord(viewport.coordinates.col, viewport.coordinates.row);

            }

        }
        function zoom(event) {

            event.preventDefault();

            play();

            if (map.cell_width === ZOOM_MIN && event.deltaY > 0) return;
            if (map.cell_width === ZOOM_MAX && event.deltaY < 0) return;

            const xRatio = viewport.position.x / map.width;
            const yRatio = viewport.position.y / map.height;

            const previousCellWidth = map.cell_width;

            let zoomRatio = 1.1;
            if (event.deltaY > 0) zoomRatio = 0.91;

            map.cell_width *= zoomRatio;
            map.cell_height *= zoomRatio;

            if (map.cell_width >= ZOOM_MAX) {
                map.cell_width = ZOOM_MAX;
            } else if (map.cell_width <= ZOOM_MIN) {
                map.cell_width = ZOOM_MIN;
            }

            map.cell_height = map.cell_width / CELL_RATIO;

            if (map.cell_width <= DISTANT_ZOOM_MAX) {

                const distantZoomRatio = 1 - (map.cell_width - ZOOM_MIN) / (DISTANT_ZOOM_MAX - ZOOM_MIN);
                const cellHeightRatio = 1 + STRETCH_AT_MIN_ZOOM * distantZoomRatio;

                setMapDimensions({
                    cellHeight: map.cell_height * cellHeightRatio
                });

            }

            map.row_height = map.cell_height * 0.75;
            map.column_shift = map.cell_width / 2;
            map.width = map.cell_width * map.columns;
            map.height = map.row_height * map.rows;

            const actualZoomRatio = map.cell_width / previousCellWidth;
            const shiftXRatio = 1 - actualZoomRatio;
            const cursorShiftX = (viewport.center.x - event.offsetX) * shiftXRatio;
            const cursorShiftY = (viewport.center.y - event.offsetY) * shiftXRatio;

            viewport.go_to(map.width * xRatio + cursorShiftX, map.height * yRatio + cursorShiftY);

            info.zoom(Math.round(map.cell_width));
            info.show_hex_coord(viewport.coordinates.col, viewport.coordinates.row);

            setTimeout(pause, 1000);

        }
        function dragEnd() {

            pause();

            dragProcess = false;
            canvas.removeEventListener('mousemove', handleMove);

        }
        function click(event) {

            const target = getHexOnClick(event.offsetX, event.offsetY);

            if (target.col === selection.col && target.row === selection.row) return;
            selection.set(target.col, target.row);
            info.show_hex_click(target.col, target.row);

            const index = target.col * target.row;
            if (map.layer.info[index]) {
                return redraw();
            }

            fetch(`${API.select}&x=${target.col + 1}&y=${target.row + 1}`, {
                method: 'GET'
            })
                .then(res => {
                    if (res.ok) {
                        res.json().then(res => {
                            map.layer.info[index] = res;
                            console.log(res);
                        });
                    } else {
                        res.json().then(res => {
                            console.log(res);
                        });
                    }
                });

            redraw();

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

        const elem = document.createElement('div');
        elem.id = 'cursor';
        elem.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 40px;
            width: 40px;
            background-image: url(/images/map/cursor.webp);
            background-size: contain;
            background-repeat: no-repeat;
            pointer-events: none;
            z-index: 1000;
        `;
        document.body.insertAdjacentElement('beforeend', elem);
        window.addEventListener('mousemove', moveCursor);

        const target = new Target();

        const c = this;
        this.use = use;
        this.down = down;
        this.up = up;
        this.target = target;
        this.coords = {
            x: null,
            y: null
        }

        function use(name) {

            container.style.cursor = name;

        }
        function down() {
            elem.style.width = '32px';
        }
        function up() {
            elem.style.width = '40px';
        }
        function moveCursor(e) {
            c.coords.x = e.clientX;
            c.coords.y = e.clientY;
            elem.style.transform = `translate3d(${c.coords.x}px, ${c.coords.y}px, 0)`;
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

        stats.begin();

        onPause = false;

        // ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = 'center';

        drawMap();

        if (dev) viewport.draw();

        stats.end();

        if (!onPause) update = requestAnimationFrame(loop);

    }
    function drawMap() {

        let colMin = Math.floor(viewport.x / map.cell_width) - 1;
        let rowMin = Math.floor(viewport.y / map.row_height) - 1;
        let colMax = Math.ceil((viewport.x + viewport.width) / map.cell_width);
        let rowMax = Math.ceil((viewport.y + viewport.height) / map.row_height);

        if (colMin < 0) colMin = 0;
        if (rowMin < 0) rowMin = 0;
        if (colMax > map.columns) colMax = map.columns;
        if (rowMax > map.rows) rowMax = map.rows;



        layer();
        // layer(back);
        // layer(rivers);
        // layer(front);
        // layer(colors);
        // layer(highlight);
        // layer(route);
        // layer(cityNames);
        // layer(units);

        function layer() {

            for (let row = rowMin; row < rowMax; row++) {

                let imageDatas = [];

                for (let col = colMin; col < colMax; col++) {

                    const index = row * map.columns + col;
                    const tile = getHexCoords(col, row);

                    // const imgData = getHexImageData(col, row, tile.x, tile.y, index);
                    imageDatas.push(imgData);
                    // callback(col, row, tile.x, tile.y, index);

                }

                const tiledImageData = tileImageData(imageDatas);
                const tiledImage = ctx2.createImageData(imageDatas.length * map.cell_width, map.cell_height);

                for (let i = 0; i < tiledImage.data.length; i++) {
                    tiledImage.data[i] = tiledImageData[i];
                }

                const tiledRow = getHexCoords(colMin, row);

                bufferCanvas.width = tiledImage.width;
                bufferCanvas.height = tiledImage.height;
                ctx2.putImageData(tiledImage, 0, 0);
                const image = new Image();
                image.src = bufferCanvas.toDataURL();
                ctx.drawImage(image, tiledRow.x, tiledRow.y);
            }

        }

        function getHexImageData(col, row, tileX, tileY, index) {

            numberOfTiles++;

            let tileID = map.layer.terrain[index];

            switch (tileID) {
                case 0:
                    return ctx2.createImageData(map.cell_width, map.cell_height).data; // есди вода то пропускаем
                case 6:
                    tileID = 5; // если река, то делаем травяную подкладку
                    break;
                default:

            }

            const sprite = spriteMap.back.find(sprite => {
                if (+sprite.type === tileID) return true;
            });
            const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

            bufferCanvas.width = map.cell_width;
            bufferCanvas.height = map.cell_height;

            ctx2.drawImage(
                spritesheets.back,
                spriteVar.x + 1.5,
                spriteVar.y + 1.5,
                spriteVar.w - 3,
                spriteVar.h - 3,
                0,
                0,
                map.cell_width,
                map.cell_height
            );

            return ctx2.getImageData(0, 0, map.cell_width, map.cell_height).data;

        }

        function back(col, row, tileX, tileY, index) {

            numberOfTiles++;

            let tileID = map.layer.terrain[index];

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

        }
        function rivers(col, row, tileX, tileY, index) {

            if (map.layer.terrain[index] === 6) {

                const sides = findAdjacentTiles(col, row);
                let hex_sides = '';
                let river_part = "1";
                let riverSprite = null;

                for (let i = 0; i < sides.length; i++) {
                    const index = sides[i].row * map.columns + sides[i].col;
                    if (map.layer.terrain[index] === 0) {
                        river_part = "2";
                        hex_sides = i;
                        break;
                    } else if (map.layer.terrain[index] === 6) {
                        hex_sides += i;
                    }
                }

                riverSprite = spriteMap.back.find(sprite => {
                    if (+sprite.type === 6 &&
                        sprite.hex_sides === hex_sides + '' &&
                        sprite.river_part === river_part) {
                        return true;
                    }
                });

                if (riverSprite) {
                    const spriteVar = riverSprite.variations[0];
                    ctx.drawImage(
                        spritesheets.back,
                        spriteVar.x,
                        spriteVar.y,
                        spriteVar.w,
                        spriteVar.h,
                        tileX - map.cell_width * 0.13,
                        tileY - map.cell_height * 0.361,
                        map.cell_width * 1.26,
                        map.cell_height * 1.4118
                    );
                } else {
                    plainHex(tileX, tileY, '#3079AF', .75);
                }
            }

        }
        function front(col, row, tileX, tileY, index) {

            const city = located(map.layer.cities, col, row);
            if (city) return drawCity(city);

            drawNature();

            if (activeLayer === 'geo' && map.mode.geo.resurses[index] !== '') {
                drawResource(index);
            }

            function drawCity(city) {

                const sprite = spriteMap.city.find(sprite => {

                    let cityClass = 'city';
                    if (city.city_is_camp) cityClass = 'camp';

                    if (cityClass === 'city') {

                        if (cityClass === sprite.class &&
                            city.arh === sprite.culture &&
                            city.size === +sprite.size) return true;

                    } else {

                        if (cityClass === sprite.class &&
                            city.arh === sprite.culture) return true;

                    }

                });

                if (sprite) {

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

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

                } else {

                    plainHex(tileX, tileY, '#D2203E', 1);

                }

            }
            function drawNature() {

                let tileID = map.layer.nature[index];
                const sprite = spriteMap.front.find(sprite => {

                    if (tileID === 11 && map.layer.terrain[index] === 3) tileID = 12;

                    if (+sprite.type === tileID) return true;

                });

                if (sprite) {
                    makePatches();
                } else {
                    spreadSmallObjects();
                }

                function makePatches() {

                    const spriteVar = sprite.variations[randomOnSeed(0, sprite.variations.length - 1, index)];

                    if (sprite.type != 1 && located(map.layer.units, col, row)) {
                        ctx.globalAlpha = 0.6;
                    }

                    ctx.drawImage(
                        spritesheets.front,
                        spriteVar.x,
                        spriteVar.y,
                        spriteVar.w,
                        spriteVar.h,
                        tileX - ((map.cell_width * 1.2) - map.cell_width) / 2,
                        tileY - map.cell_height * 1.411 * OBJECT_TOP_EXTENSION,
                        map.cell_width * 1.2,
                        map.cell_height * 1.4118
                    );

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

                            const objWidth = spriteVar.w / HEX_WIDTH * map.cell_width / 2;
                            const objHeight = spriteVar.h / HEX_HEIGHT * map.cell_height / 2;

                            const xShift = tileX + map.cell_width * randomOnSeed(-10, 40, index) / 100;
                            const yShift = tileY + map.cell_height * randomOnSeed(-10, 40, index) / 100;

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

                        }

                    }

                }

            }
            function drawResource(index) {

                let resID = map.mode.geo.resurses[index];

                const resource = spriteMap.resources.find(resource => +resID === resource.id);
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

                drawText(tileX, tileY, `${col + 1}, ${row + 1}`, 'center');

                ctx.globalAlpha = 0.4;

                const adjacent = findAdjacentTiles(col, row);

                adjacent.forEach((tile, i) => {

                    ctx.drawImage(
                        selection.img,
                        0,
                        0,
                        selection.sprite_width,
                        selection.sprite_height,
                        tile.x - map.cell_width * 0.1,
                        tile.y - map.cell_height * 0.1,
                        map.cell_width * 1.2,
                        map.cell_height * 1.2
                    );

                    drawText(tile.x, tile.y, i, 'center');

                });

                ctx.globalAlpha = 1;

            }

        }
        function route(col, row, tileX, tileY) {

            if (!selection.unit || !selection.unit.route) return;
            if (selection.unit.route.list.length === 0) return;

            const route = selection.unit.route.list;
            const start = getHexCoords(selection.unit.x - 1, selection.unit.y - 1);

            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'cyan';
            ctx.moveTo(start.x + map.cell_width / 2, start.y + map.cell_height / 2);

            for (let i = 0; i < route.length; i++) {
                const point = getHexCoords(route[i].x - 1, route[i].y - 1);
                ctx.lineTo(point.x + map.cell_width / 2, point.y + map.cell_height / 2);
            }

            ctx.stroke();

        }
        function cityNames(col, row, tileX, tileY, index) {

            const city = located(map.layer.cities, col, row);
            if (city) drawText(tileX, tileY, city.name, 'bottom');

        }
        function units(col, row, tileX, tileY, index) {

            const unit = located(map.layer.units, col, row);

            if (unit) {
                let color = 'yellow';
                if (selection.unit &&
                    selection.unit.x === col + 1 &&
                    selection.unit.y === row + 1) color = 'cyan';
                drawText(tileX, tileY, `Юнит, id: ${unit.id}`, 'center', color);
            }

        }
        function colors(col, row, tileX, tileY, index) {

            let color = null;

            switch (activeLayer) {
                case 'polytics':
                    if (map.mode.polytics.colors[index] === '') return;
                    color = '#' + map.mode.polytics.colors[index];
                    break;
                case 'climate':
                    if (map.mode.climate.colors[index] === '') return;
                    const type = map.mode.climate.colors[index];
                    color = map.mode.climate.types[type].color;
                    break;
                default:
                    return;

            }

            plainHex(tileX, tileY, color, 0.4);

        }

        function tileImageData(tiles) {
            // console.time('function');
            const itemsRow = map.cell_width * 4;

            let tiledArray = [];
            for (let y = 0; y < map.cell_height; y++) {
                for (let x = 0; x < tiles.length; x++) {
                    const rowStart = y * itemsRow;
                    for (let i = rowStart; i < rowStart + itemsRow; i++) {
                        tiledArray.push(tiles[x][i]);
                    }
                }
            }
            // console.timeEnd('function');
            return tiledArray;
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

    // unitilities
    function getHexCoords(col, row) {

        let x = col * map.cell_width - viewport.x + canvasWidth / 2 - viewport.width / 2;
        if (row % 2 === 0) x += map.column_shift;
        const y = row * map.row_height - viewport.y + canvasHeight / 2 - viewport.height / 2;

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

        if (col < 0) col = 1;
        if (row < 0) row = 1;
        if (col > map.columns - 1) col = map.columns;
        if (row > map.rows - 1) row = map.rows;

        return { col, row };

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

            tile.x = coords.x;
            tile.y = coords.y;

        });

        return tiles;

    }
    function $(selector) {

        return document.querySelector(selector);

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

        return array.find(object => +object.x === col + 1 && +object.y === row + 1);

    }
}
