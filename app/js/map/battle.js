const ASSETS_VERSION = 1;
import * as spriteMap from './sprite-maps.js?v=1';
import * as unit_animations from './units-battle.js?v=1';
const urlSearchParams = new URLSearchParams(new URL(location).search);
const dev = isLocalhost();

loadMapData();

function loadMapData() {

    let id, x, y, url, unitsUrl;

    for (const p of urlSearchParams) {
        if (p[0] === 'id') id = p[1];
        if (p[0] === 'x') x = p[1];
        if (p[0] === 'y') y = p[1];
    }

    if (id) {
        url = `/ajax?c=batle&do=map&id=${id}`;
        unitsUrl = `/ajax?c=batle&do=units&batle_id=${id}`;
    } else {
        url = `/ajax?c=batle&do=map&x=${x}&y=${y}`;
        unitsUrl = `/ajax?c=batle&do=units&x=${x}&y=${y}`;
    }
    if (dev) {
        url = '/cache/map/battle.json';
        unitsUrl = '/cache/map/battle-units.json';
    }

    fetch(url)
        .then(async (res) => {
            const mapData = await res.json();

            fetch(unitsUrl)
                .then(async (res) => {
                    const allBattleUnits = await res.json();
                    window.map = new Map(mapData, allBattleUnits);
                });
        });

}
function Map(data, battleUnits) {

    // $('button[name="update"]').onclick = () => {
    //     hey('socket:update', JSON.stringify({
    //         "units": [
    //             {
    //                 class: "U1",
    //                 id: "1234",
    //                 x: "15",
    //                 y: "16",
    //                 can_use: true,
    //                 atack: false,
    //                 speed: "2",
    //                 tootip: [],
    //                 amount: "1",
    //                 size: "2",
    //                 color: "#00FF00",
    //                 blazon: "/images/map/circles/emblem.png",
    //                 route: {
    //                     list: [
    //                         {
    //                             x: "15",
    //                             y: "16"
    //                         },
    //                         {
    //                             x: "24",
    //                             y: "14"
    //                         }
    //                     ],
    //                 }
    //             },
    //             {
    //                 class: "U2",
    //                 id: "4567",
    //                 x: "17",
    //                 y: "18",
    //                 can_use: false,
    //                 atack: false,
    //                 speed: "2",
    //                 tootip: [],
    //                 amount: "1",
    //                 size: "2",
    //                 color: "#00FF00",
    //                 blazon: "/images/map/circles/emblem.png",
    //                 route: {}
    //             },
    //         ]
    //     }));
    // };

    const container = $('#field_map');
    const canvas = $('#mapcanvas');
    const ctx = canvas.getContext('2d');

    const IMG_PATH = '/images/map/world/';
    const IMG_FORMAT = 'webp';
    const OTHER_ASSETS = {
        round_frame: '/images/map/circles/circle_empty_shadow.png',
        country_coa: '/images/map/circles/emblem.png'
    };

    let spritesheets = {};
    let img_assets = {};

    const HEX_WIDTH = 300;
    const HEX_HEIGHT = 255;
    const CELL_RATIO = HEX_WIDTH / HEX_HEIGHT;
    const OBJECT_TOP_EXTENSION = 0.25;

    const ZOOM_MAX = 150;
    const ZOOM_START = 150;
    const DISTANT_ZOOM_MAX = 20;
    const CITY_NAME_ZOOM = 30;

    const SEA_ZOOM_MAX = 1000 / (HEX_WIDTH / ZOOM_MAX); // 1000 - actual image size in px
    const SEA_ZOOM_START = 400;

    const SQUARE_RATIO = 1;

    const BLAZON_GAP = 0; // 0–1 : 1 = map.cell_height
    const BLAZON_TO_FRAME_SIZE_RATIO = 0.8;
    const FPS = 30; // animation FPS, not canvas map.

    const map = {
        updates: {},
        layer: {
            terrain: data.map,
            nature: data.objects,
            random: [],
            cities: [data.city],
            units: [],
            info: []
        },
        columns: 35,
        rows: 35,
        cell_width: ZOOM_START,
        cell_height: ZOOM_START / CELL_RATIO,
        row_height: ZOOM_START / CELL_RATIO * 0.75,
        column_shift: null,
        width: null,
        height: null,
        distant_zoom_ratio: 1,
        sea_columns: 11,
        sea_rows: 7,
        sea_cell_width: SEA_ZOOM_START,
        sea_cell_height: SEA_ZOOM_START / SQUARE_RATIO,
        sea_row_height: SEA_ZOOM_START / SQUARE_RATIO,
        sea_column_shift: null,
        sea_width: null,
        sea_height: null,
        zone: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
            0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
            0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
            0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ]
    };
    let activeLayer = null;

    let canvasWidth,
        canvasHeight,
        update,
        onPause,
        editor = false,
        units_requested = false,
        showMountainsArea = false;

    if ($('meta[content="editor"]')) editor = true;

    setCanvasSize();

    const viewport = new Viewport(0);
    const load = new Loader();
    new Cursor();
    const selection = new Selection();
    new Controls();

    const _ = this;
    this.viewport = viewport;
    this.redraw = redraw;
    this.props = map;
    this.container = container;
    this.selection = selection;
    this.toggle_mountains_area = toggleMountainsArea;
    this.play = play;
    this.pause = pause;
    this.redraw = redraw;
    this.map = map;

    setMapDimensions();
    viewport.initial_zoom();
    generateRandomFeatures();
    load.spritesheets(spriteMap);
    load.other_assets();

    battleUnits.units.forEach(unitData => {
        const unit = new Unit(unitData);
        map.layer.units.push(unit);
    });

    map.layer.units.forEach(unit => unit.update_visibility());

    window.addEventListener('resize', handleWindowResize);
    // container.addEventListener('socket:update', ev => {
    //     const unitsData = JSON.parse(ev.detail);
    //
    //     unitsData.units.forEach(updatedUnit => {
    //         const unit = map.layer.units.find(unit => {
    //             if (unit.id === updatedUnit.id) return unit;
    //         });
    //         if (unit) unit.update(updatedUnit);
    //     });
    // });

    function Loader() {

        const assets = {
            spritesheets: {
                loaded: 0,
                total: Object.keys(spriteMap).length
            },
            other_assets: {
                loaded: 0,
                total: Object.keys(OTHER_ASSETS).length
            }
        };

        watchAssetsLoading();

        this.spritesheets = loadSpritesheets;
        this.other_assets = loadOtherAssets;

        function loadSpritesheets(spriteMap) {

            for (const map in spriteMap) {

                const url = `${IMG_PATH}spritesheet_${map}.${IMG_FORMAT}?v=${ASSETS_VERSION}`;
                const img = new Image();
                img.addEventListener('load', () => {

                    spritesheets[map] = img;
                    hey('fetched:map:spritesheets', { spritesheet_name: map });

                });
                img.src = url;

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
                    loop();
                    // setTimeout(redraw, 16);
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

    }
    function Unit(object) {

        const { id, x, y, can_use, atack, speed, tootip, amount, size, color, route, blazon } = object;

        const DEFAULT_FACING_SIDE = 1;
        const WALK_SPEED = 7250;
        const _ = this;

        let compositing, exitState = false;

        // basic properties
        this.class = object.class;
        this.id = id;
        this.x = +x;
        this.y = +y;
        this.can_use = can_use;
        this.atack = atack;
        this.speed = speed;
        this.tootip = tootip;
        this.amount = amount;
        this.size = size;
        this.color = hex2rgb(color);
        this.route = route;
        this.blazon = blazon;

        // properties
        this.shown = true;
        this.facing_side = DEFAULT_FACING_SIDE;
        this.anim = unit_animations[_.class];
        this.video = addVideoElement();
        this.elem = addCanvasElement();
        this.state = getState(object);
        this.walking = false;
        this.goal_x = null;
        this.goal_y = null;
        this.walking_progress = null;
        this.action = null;
        this.phase = null;
        this.transform = {
            x: 0,
            y: 0
        };
        this.update_visibility = checkVisibility;

        // actions
        this.place = place;
        this.turn = turn;
        this.update = update;
        this.set_route = setRoute;
        this.add_route = addRoute;
        this.asure_route_list = () => {
            if (!this ?.route ?.list) this.route = { list: [] };
        }

        loadMedia();

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
                will-change: transform;
            `;
            container.insertAdjacentElement('beforeend', can);
            return can;

        }
        function loadMedia() {

            const side = getFacingSideFromRoute();
            if (side) _.facing_side = side;

            _.video.currentTime = f(_.facing_side + 1 * _.anim.idle.start);

            _.video.src = `/video/${_.class}_${_.size}.mp4`;
            _.video.addEventListener('loadeddata', () => {
                compositing = new Compositing(_.video, _.elem, _.color);
                animate(_.state, 'cycle', -1);
            });

        }

        async function animate(newState, phase, repeat) {

            return new Promise((resolve, reject) => {

                if (newState === 'atack') newState = 'attack'; // typo in API
                if (!_.anim[newState] ?.start) {
                    return console.log(`unknown state "${newState}" for ${_.class} unit`);
                }
                if (newState === 'idle') {
                    _.phase = 'start';
                    _.video.currentTime = f(getIdleFrame() + _.anim[newState].start);
                    _.video.onseeked = () => {
                        compositing.process();
                        return resolve();
                    };
                    return;
                }

                _.phase = phase;
                _.state = newState;

                const phaseStart = _.anim[newState][phase].start;
                const phaseDuration = _.anim[newState][phase].duration;

                let startFrame = getIdleFrame() + phaseStart;
                let finalFrame = getIdleFrame() + phaseStart + phaseDuration;

                let currentFrame = startFrame;
                let lastTimestamp = 0;
                let repetitions = 0;

                if (repeat == 0) {
                    _.phase = 'start';
                    _.video.currentTime = f(startFrame);
                    _.video.onseeked = () => {
                        compositing.process();
                        return resolve();
                    };
                    return;
                }

                let updater = requestAnimationFrame(update);

                function update(timestamp) {

                    updater = requestAnimationFrame(update);
                    if (timestamp - lastTimestamp < 1000 / FPS) return;

                    if (currentFrame === finalFrame) { // if loop ended

                        if (exitState) { // request to end loop

                            cancelAnimationFrame(updater);
                            resolve();
                            hey(`${_.class}:animation:cycle:ended`);
                            return;

                        } else if (repeat < 0 || ++repetitions < repeat) { // repeat

                            currentFrame = startFrame;
                            _.video.currentTime = f(startFrame);

                        } else { // end loop

                            cancelAnimationFrame(updater);
                            resolve();

                        }

                    } else {
                        currentFrame++;
                        _.video.currentTime = f(currentFrame);
                    }
                    compositing.process();
                    lastTimestamp = timestamp;
                }

            });

        }

        function place() {

            let x, y;

            const position = calcCanvasPosition(_.x, _.y);

            if (_.walking) {
                const finalPosition = calcCanvasPosition(_.goal_x, _.goal_y);
                const stransformX = (finalPosition.x - position.x) * _.walking_progress;
                const stransformY = (finalPosition.y - position.y) * _.walking_progress;
                x = stransformX + position.x;
                y = stransformY + position.y;
                _.transform.x = stransformX;
                _.transform.y = stransformY;
            } else {
                x = position.x;
                y = position.y;
                _.transform.x = 0;
                _.transform.y = 0;
            }

            if (position) {

                _.elem.style.width = position.width + 'px';
                _.elem.style.height = position.height + 'px';
                _.elem.style.transform = `translate3d(${x}px, ${y}px, 0)`;

            }

        }
        function turn(side) {

            _.facing_side = side;
            animate('idle');

        }
        async function update(updated) {

            _.amount = updated.amount;
            _.size = updated.size;
            _.speed = updated.speed;
            _.route = updated.route;
            if (!updated.route) _.route = null;

            const newSide = getFacingSideFromHex(+updated.x, +updated.y);
            if (newSide !== _.facing_side) {
                await exitCurrentState();
                turn(newSide);
            }

            if (+updated.x !== _.x || +updated.y !== _.y) {

                _.goal_x = +updated.x;
                _.goal_y = +updated.y;

                await animate('move', 'start', 1);
                animate('move', 'cycle', -1);
                move(_.x, _.y, _.goal_x, _.goal_y, WALK_SPEED);

            } else if (updated.atack) {

                await animate('attack', 'start', 1);
                animate('attack', 'cycle', -1);

            } else {

                animate('idle');

            }

            checkVisibility();

        }
        async function exitCurrentState() {
            return new Promise((resolve, reject) => {

                container.addEventListener(`${_.class}:animation:cycle:ended`, nextPhase);
                exitState = true;

                async function nextPhase(ev) {

                    container.removeEventListener(`${_.class}:animation:cycle:ended`, nextPhase);
                    exitState = false;

                    await animate(_.state, 'end', 1);
                    _.video.pause();
                    resolve();

                }

            });
        }
        function setRoute(x, y) {
            this.asure_route_list();
            this.route.list = [{ x, y }];
        }
        function addRoute(x, y) {
            this.asure_route_list();
            this.route.list.push({ x, y });
        }

        function getState(object) {

            if (object.route ?.list ?.length) {
                if (object.atack) return 'attack';
                return 'move';
            } else {
                return 'idle';
            }

        }
        function getFacingSideFromRoute(route = _.route) {

            if (route ?.list.length) {
                const unitCoords = getHexCoords(_.x, _.y);
                const destination = getHexCoords(route.list[0].x, route.list[0].y);
                const x1 = unitCoords.x;
                const y1 = unitCoords.y;
                const x2 = destination.x;
                const y2 = destination.y;
                const angle = getAngle(x1, y1, x2, y2);
                return sideFromAngle(angle);
            } else {
                return null;
            }

        }
        function getFacingSideFromHex(col, row) {

            const tiles = findAdjacentTiles(_.x, _.y);

            for (const [i, tile] of tiles.entries()) {
                if (+tile.col === +col && +tile.row === +row) return i;
            }

        }
        function getIdleFrame() {

            return _.facing_side * _.anim.side_cycle;

        }
        function calcCanvasPosition(col, row) {

            const coord = getHexCoords(col, row);

            const scaleRatio = map.cell_width / HEX_WIDTH;
            const hexCenterX = coord.x + map.cell_width / 2;
            const hexCenterY = coord.y + map.cell_height / 2;

            const width = _.video.clientWidth * scaleRatio;
            const height = _.video.clientHeight / 2 * scaleRatio;
            const x = hexCenterX - width / 2;
            const y = hexCenterY - height / 2;

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

            return { x, y, width, height };

        }
        function distance(x1, y1, x2, y2) {

            const a = x1 - x2;
            const b = y1 - y2;

            return Math.sqrt(a * a + b * b);

        }
        function move(startX, startY, finX, finY, duration) {

            _.walking = true;

            let animationStartTime;

            animationStartTime = performance.now();
            requestAnimationFrame(updateValue);

            async function updateValue(time) {

                const msPassed = time - animationStartTime;
                _.walking_progress = msPassed / duration;
                if (msPassed > duration) {
                    _.walking_progress = 1;
                    _.x = _.goal_x;
                    _.y = _.goal_y;
                    _.goal_x = null;
                    _.goal_y = null;
                    _.walking = false;
                    await exitCurrentState();
                    if (_.route ?.list ?.length) {
                        const newSide = getFacingSideFromRoute();
                        if (newSide !== _.facing_side) turn(newSide);
                        animate('move', 'cycle', -1);
                    }
                }

                place();

                if (_.walking_progress < 1) requestAnimationFrame(updateValue);

            }
        }
        function checkVisibility() {

            const unit = located(map.layer.units, _.x, _.y);
            if (unit.class !== _.class) {
                if (unit.amount > _.amount) {
                    _.elem.style.visibility = 'hidden';
                    unit.elem.style.visibility = 'visibile';
                } else {
                    unit.elem.style.visibility = 'hidden';
                    _.elem.style.visibility = 'visibile';
                }
            }

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
        viewport.initial_zoom();
        viewport.update();

        // redraw();

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
        this.initial_zoom = initialZoom;

        window.addEventListener('resize', resize);

        function initialZoom() {

            const mapRatio = map.width / map.height;
            const viewRatio = viewport.width / viewport.height;

            if (mapRatio > viewRatio) {

                const minHeight = viewport.height / (map.rows - 0.25) * 1.333;

                if (map.cell_height * 0.75 * map.rows <= viewport.height) {
                    map.cell_width = minHeight * CELL_RATIO;
                }

            } else if (mapRatio <= viewRatio) {

                if (map.cell_width * map.columns <= viewport.width) {
                    map.cell_width = viewport.width / (map.columns - 0.75);
                }

            }

            const zoomScale = map.cell_width / ZOOM_START;
            map.sea_cell_width = SEA_ZOOM_START * zoomScale;
            map.sea_cell_height = SEA_ZOOM_START * zoomScale;

            map.cell_height = map.cell_width / CELL_RATIO;
            map.sea_cell_height = map.sea_cell_width / SQUARE_RATIO;
            map.row_height = map.cell_height * 0.75;
            map.column_shift = map.cell_width / 2;
            map.width = map.cell_width * map.columns;
            map.height = map.row_height * map.rows;

            map.sea_row_height = map.sea_cell_height;
            map.sea_column_shift = map.sea_cell_width / 2;
            map.sea_width = map.sea_cell_width * map.sea_columns;
            map.sea_height = map.sea_row_height * map.sea_rows;

            viewport.go_to(map.width / 2 + map.cell_width / 4, map.height / 2 + map.row_height / 4);

            // redraw();

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
        function updateViewportCoordinates(x, y) {

            viewport.x = x - viewport.width / 2;
            viewport.y = y - viewport.height / 2;

            viewport.position = { x, y };

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

            updateViewportCoordinates(x, y);
            viewport.coordinates = getHexLocation(x, y);

            areaUpdate();
            hey('viewport:update');

        }
        function goToHex(col, row) {

            // потому гексы выходят за видимый край карты вверх и вниз
            col++;
            row++;

            const y = map.row_height * row - map.cell_height * 0.25;
            let x = map.cell_width * col;
            if (row % 2 === 0) x -= map.cell_width / 2;

            updateViewportCoordinates(x, y);
            viewport.coordinates = { col, row };

            areaUpdate();
            hey('viewport:update');
            // redraw();

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

            viewport.area = {
                colMin,
                rowMin,
                colMax,
                rowMax,
                sea_colMin,
                sea_rowMin,
                sea_colMax,
                sea_rowMax
            };

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
                    break;
                case 3:
                    // const target = getHexOnClick(event.offsetX, event.offsetY);
                    // const index = target.row * map.columns + target.col;
                    // hey('map:click:right', {
                    //     col: target.col,
                    //     row: target.row,
                    //     index
                    // });
                    // if (selection.unit) {
                    //     if (target.col === +selection.unit.x &&
                    //         target.row === +selection.unit.y) return;
                    //
                    //     cursor.target.play(target.col, target.row);
                    //
                    //     if (shift) {
                    //         shiftClick = true;
                    //         selection.unit.add_route(target.col + '', target.row + '');
                    //     } else {
                    //         selection.unit.set_route(target.col + '', target.row + '');
                    //         sendRoute();
                    //     }
                    //
                    //     selection.unit.update({
                    //         class: "U1",
                    //         id: "1234",
                    //         x: "17",
                    //         y: "17",
                    //         can_use: true,
                    //         atack: false,
                    //         speed: "2",
                    //         tootip: [],
                    //         amount: "1",
                    //         size: "2",
                    //         color: "#00FF00",
                    //         blazon: "/images/map/content/blazons/0.png",
                    //         route: selection.unit.route
                    //     });
                    //
                    //     redraw();
                    // }
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
                // if (onPause) loop();

                const minX = viewport.center.x + map.cell_width / 2;
                const maxX = map.width - viewport.center.x;
                const minY = viewport.center.y + map.row_height * 0.25;
                const maxY = map.height - viewport.center.y;

                let x = Math.round(viewport.position.x -= event.movementX);
                let y = Math.round(viewport.position.y -= event.movementY);

                if (x < minX) x = minX;
                else if (x > maxX) x = maxX;
                if (y < minY) y = minY;
                else if (y > maxY) y = maxY;

                viewport.go_to(x, y);

            }

        }
        function zoom(event) {

            event.preventDefault();

            // play();

            const xRatio = viewport.position.x / map.width;
            const yRatio = viewport.position.y / map.height;

            const previousCellWidth = map.cell_width;

            let zoomRatio = 1.1;
            if (event.deltaY > 0) zoomRatio = 0.91;

            // ============ hex map

            map.cell_width *= zoomRatio;
            map.cell_height *= zoomRatio;

            if (zoomRatio < 1) { // if zooming out

                const mapRatio = map.width / map.height;
                const viewRatio = viewport.width / viewport.height;

                if (mapRatio > viewRatio) {

                    const minHeight = viewport.height / (map.rows - 0.25) * 1.333;

                    if (map.cell_height * 0.75 * map.rows <= viewport.height) {
                        map.cell_width = minHeight * CELL_RATIO;
                    } else {
                        map.sea_cell_width *= zoomRatio;
                        map.sea_cell_height *= zoomRatio;
                    }

                } else if (mapRatio <= viewRatio) {

                    if (map.cell_width * map.columns <= viewport.width) {
                        map.cell_width = viewport.width / (map.columns - 0.5);
                    } else {
                        map.sea_cell_width *= zoomRatio;
                        map.sea_cell_height *= zoomRatio;
                    }

                }

            } else { // if zooming in

                map.sea_cell_width *= zoomRatio;
                map.sea_cell_height *= zoomRatio;

                if (map.cell_width >= ZOOM_MAX) {
                    map.cell_width = ZOOM_MAX;
                    map.sea_cell_width = SEA_ZOOM_MAX;
                }

            }

            map.cell_height = map.cell_width / CELL_RATIO;
            map.sea_cell_height = map.sea_cell_width / SQUARE_RATIO;
            map.row_height = map.cell_height * 0.75;
            map.column_shift = map.cell_width / 2;
            map.width = map.cell_width * map.columns;
            map.height = map.row_height * map.rows;

            map.sea_row_height = map.sea_cell_height;
            map.sea_column_shift = map.sea_cell_width / 2;
            map.sea_width = map.sea_cell_width * map.sea_columns;
            map.sea_height = map.sea_row_height * map.sea_rows;

            const actualZoomRatio = map.cell_width / previousCellWidth;
            const shiftXRatio = 1 - actualZoomRatio;
            const cursorShiftX = (viewport.center.x - event.offsetX) * shiftXRatio;
            const cursorShiftY = (viewport.center.y - event.offsetY) * shiftXRatio;

            const minX = viewport.center.x + map.cell_width / 2;
            const maxX = map.width - viewport.center.x;
            const minY = viewport.center.y + map.row_height * 0.25;
            const maxY = map.height - viewport.center.y;

            let x = map.width * xRatio + cursorShiftX;
            let y = map.height * yRatio + cursorShiftY;

            if (x < minX) x = minX;
            else if (x > maxX) x = maxX;
            if (y < minY) y = minY;
            else if (y > maxY) y = maxY;

            viewport.go_to(x, y);

            // setTimeout(pause, 1000);

        }
        function dragEnd() {

            // pause();

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

            // if (!dev && !editor) {
            //     fetch(`${API.select}&x=${target.col}&y=${target.row}`, {
            //         method: 'GET'
            //     })
            //         .then(res => {
            //             if (res.ok) {
            //                 res.json().then(res => {
            //                     map.layer.info[index] = res;
            //                     hey('map:click:left:response', res);
            //                 });
            //             } else {
            //                 res.json().then(res => {
            //                     console.log(res);
            //                 });
            //             }
            //         });
            // } else {
            //
            //     fetch('/cache/map/clicksim/map_click.json', {
            //         headers: {
            //             "Content-Type": "application/json"
            //         }
            //     })
            //         .then(async (res) => {
            //             const data = await res.json();
            //             hey('map:click:left:response', data);
            //         });
            // }

            // redraw();

        }
        function handleKeyboard(event) {

            if (event.keyCode === 16) {
                if (event.type === 'keyup') {
                    if (selection.unit && shiftClick) sendRoute();
                    shift = shiftClick = false;
                    selection.route = [];
                    // redraw();
                    return;
                } else {
                    shift = true;
                }
            }

        }
        // function sendRoute() {
        //
        //     fetch(`${API.unit_route}&unit_id=${selection.unit.id}`, {
        //         method: 'POST',
        //         body: JSON.stringify(selection.unit.route.list)
        //     })
        //         .then(res => {
        //             if (res.ok) {
        //                 res.json().then(res => {
        //                     console.log(res);
        //                 });
        //             } else {
        //                 res.json().then(res => {
        //                     console.log(res);
        //                 });
        //             }
        //         });
        //
        //     selection.route = [];
        //
        // }

    }
    function Cursor() {

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
            if (unit && unit.can_use) {
                _this.unit = unit;
                ui.bottom.update([unit]);
            }

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
            sea_rowMax
        } = viewport.area;

        seaLayer();
        layer(back);
        layer(rivers);
        layer(front);

        // if (!editor) route();
        layer(highlight);
        if (!editor) layer(cellBlazons);
        layer(zone);

        map.layer.units.forEach(unit => unit.place());

        if (window.minimap) minimap.viewport(colMin, rowMin, colMax - colMin, rowMax - rowMin);

        function layer(callback) {

            for (let row = rowMin; row < rowMax; row++) {

                for (let col = colMin; col < colMax; col++) {

                    const index = coordsToIndex(col, row);
                    const tile = getHexCoords(col, row);

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

            try {
                drawIntersections();
            } catch (e) {

            }

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

                    const placedWidth = map.cell_width * 1.2 * 3;
                    const placedHeight = map.cell_height * 1.4118 * 3;

                    try {
                        ctx.drawImage(
                            spritesheets.city,
                            spriteVar.x,
                            spriteVar.y,
                            spriteVar.w,
                            spriteVar.h,
                            tileX - placedWidth / 2 + map.cell_width / 2,
                            tileY - placedHeight / 2 + map.cell_height / 2 - OBJECT_TOP_EXTENSION * map.cell_height,
                            placedWidth,
                            placedHeight
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
            }

        }
        function cellBlazons(col, row, tileX, tileY, index) {

            if (map.cell_width < CITY_NAME_ZOOM) return;

            const unit = located(map.layer.units, col, row);

            if (unit) {

                let item = unit;

                const framesSize = map.cell_width / 2;
                const blazonSize = map.cell_width / 2 * BLAZON_TO_FRAME_SIZE_RATIO;
                const blazonCoordShift = framesSize * (1 - BLAZON_TO_FRAME_SIZE_RATIO) / 2;

                item.blazon_coords = {
                    x1: tileX + map.cell_width / 2 - framesSize / 2,
                    x2: tileX + map.cell_width / 2 + framesSize / 2,
                    y1: tileY + map.cell_height + map.cell_height * BLAZON_GAP,
                    y2: tileY + map.cell_height + map.cell_height * BLAZON_GAP + framesSize,
                }

                const natureID = map.layer.nature[index];
                if (String(natureID).slice(0, 2) === '10') { // if mountains
                    item.blazon_coords.y1 = tileY + (map.cell_height - framesSize) / 2;
                    item.blazon_coords.y2 = tileY + (map.cell_height - framesSize) / 2 + framesSize;
                } else {
                    item.blazon_coords.y1 -= map.cell_height * 0.2;
                    item.blazon_coords.y2 -= map.cell_height * 0.2;
                }

                if (item.blazon_img) {
                    try {
                        ctx.drawImage(
                            item.blazon_img,
                            0,
                            0,
                            item.blazon_img.width,
                            item.blazon_img.height,
                            item.blazon_coords.x1 + blazonCoordShift + unit.transform.x,
                            item.blazon_coords.y1 + blazonCoordShift + unit.transform.y,
                            blazonSize,
                            blazonSize
                        );
                        ctx.drawImage(
                            img_assets.round_frame,
                            0,
                            0,
                            img_assets.round_frame.width,
                            img_assets.round_frame.height,
                            item.blazon_coords.x1 + unit.transform.x,
                            item.blazon_coords.y1 + unit.transform.y,
                            framesSize,
                            framesSize
                        );
                    } catch (e) {

                    }
                } else {
                    item.blazon_img = new Image();
                    item.blazon_img.src = item.blazon;
                    // item.blazon_img.onload = redraw;
                }

            };

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
        function zone(col, row, tileX, tileY, index) {

            if (map.zone[index]) return;

            plainHex(tileX, tileY, '#000', 0.3);

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
    function toggleMountainsArea(boolean) {

        showMountainsArea = boolean;
        // redraw();

    }

    // utilities
    function Compositing(video, can, colorOverlay) {

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
                    colorPass[i + 0] = shiftChannel(red, colorOverlay.r, deltaRatio);
                    colorPass[i + 1] = shiftChannel(green, colorOverlay.g, deltaRatio);
                    colorPass[i + 2] = shiftChannel(blue, colorOverlay.b, deltaRatio);
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
    function indexToCoords(index) {

        const row = Math.floor(index / map.columns);
        const col = index - map.columns * row;

        return { col, row };

    }
    function coordsToIndex(col, row) {

        return map.columns * row + col;

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

        tiles = tiles.filter(function(value, index) {
            if (value.col >= 0 &&
                value.col <= map.columns &&
                value.row >= 0 &&
                value.row < map.rows
            ) return true;
        });

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
function renew_battle(data) {

    const unitsData = JSON.parse(data);

    unitsData.units.forEach(updatedUnit => {
        const unit = map.map.layer.units.find(unit => {
            if (unit.id === updatedUnit.id) return unit;
        });
        if (unit) unit.update(updatedUnit);
    });

}
function $(selector) {

    return document.querySelector(selector);

}
function isLocalhost() {

    if (location.hostname === 'localhost' || location.hostname === '192.168.1.16') return true;
    return false;

}
