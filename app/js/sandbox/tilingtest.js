new WoN();

function WoN() {

    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    // const HEX_WIDTH = 120;
    // const HEX_HEIGHT = 140;
    const HEX_WIDTH = 300;
    const HEX_HEIGHT = 255;
    const CELL_RATIO = HEX_WIDTH / HEX_HEIGHT;

    const ZOOM_MIN = 10;
    const ZOOM_MAX = 150;
    const ZOOM_START = 60;

    let columns,
        rows,
        cellWidth,
        cellHeight,
        columnShift,
        mapWidth,
        mapHeight;

    let tilesLoaded = 0;
    let tiles = [];
    let map;
    generateMapArray();

    const container = document.querySelector('.canvas_container');
    const canvas = document.getElementById('map');
    const ctx = canvas.getContext('2d');
    // const ctx = canvas.getContext('2d', { alpha: false });

    let canvasWidth,
        canvasHeight,
        update;

    class Info {
        constructor(selector) {
            const elem = document.querySelector(selector);
            const zoom = elem.querySelector('.zoom span');
            const dropzone = elem.querySelector('[type="file"]');
            this.zoomElem = zoom;

            dropzone.addEventListener('change', () => {

                tiles = [];
                tilesLoaded = 0;

                const imgFiles = Array.from(dropzone.files);

                imgFiles.forEach(file => {
                    const img = new Image();
                    tiles.push(img);
                    let objectUrl = URL.createObjectURL(file);
                    img.onload = () => {
                        URL.revokeObjectURL(objectUrl);
                        tilesLoaded++;
                        if (tilesLoaded === imgFiles.length) {
                            generateMapArray();
                            loop();
                            dropzone.value = '';
                        };
                    };
                    img.src = objectUrl;
                });

            });
        }
        zoom(text) {
            this.zoomElem.innerHTML = text;
        }
    }

    setCanvasSize();

    const info = new Info('#info');
    const viewport = new Viewport(0);
    const cursor = new Cursor();
    new MouseControls();

    window.addEventListener('resize', handleWindowResize);

    function generateMapArray() {

        let array = [];

        columns = 200;
        rows = 150;
        cellWidth = ZOOM_START;
        cellHeight = ZOOM_START / CELL_RATIO;
        rowHeight = cellHeight * 0.75 - 1;
        columnShift = cellWidth / 2;
        mapWidth = cellWidth * columns;
        mapHeight = rowHeight * rows;

        for (let i = 0; i < columns * rows; i++) {
            array.push(Math.floor(Math.random() * tiles.length));
        }

        map = array;

    }
    function loop() {

        stats.begin();

        ctx.imageSmoothingEnabled = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawMap(map);
        viewport.draw();

        stats.end();

        update = requestAnimationFrame(loop);

    }
    function handleWindowResize() {

        setCanvasSize();
        viewport.update();

    }
    function setCanvasSize() {

        const containerBox = container.getBoundingClientRect();

        canvasWidth = Math.round(containerBox.width);
        canvasHeight = Math.round(containerBox.height);

        ctx.canvas.width = canvasWidth;
        ctx.canvas.height = canvasHeight;

    }

    function Viewport(margin) {

        const viewport = this;
        this.margin = margin;
        this.x = margin;
        this.y = margin;
        this.width = canvasWidth - margin * 2;
        this.height = canvasHeight - margin * 2;
        this.draw = draw;
        this.go_to = goTo;
        this.center = getCenter();
        this.position = {
            x: margin + viewport.width / 2,
            y: margin + viewport.height / 2
        };
        this.update = update;

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

            ctx.strokeStyle = 'yellow';
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

        }

    }
    function MouseControls() {

        canvas.addEventListener('mousedown', handleDown);
        canvas.addEventListener('mouseup', handleUp);
        canvas.addEventListener('wheel', zoom);

        function handleDown(event) {

            if (event.which === 1) {

                cursor.use('move');
                canvas.addEventListener('mousemove', handleMove);

            }

        }
        function handleUp() {

            if (event.which === 1) {

                cursor.use('default');
                canvas.removeEventListener('mousemove', handleMove);

            }

        }
        function handleMove(event) {

            if (event.which === 1) {

                const x = viewport.position.x -= event.movementX / devicePixelRatio;
                const y = viewport.position.y -= event.movementY / devicePixelRatio;

                viewport.go_to(x, y);

            }

        }
        function zoom(event) {

            event.preventDefault();

            let xRatio = viewport.position.x / mapWidth;
            let yRatio = viewport.position.y / mapHeight;

            const previousCellWidth = cellWidth;

            let zoomRatio = 1.1;
            if (event.deltaY > 0) zoomRatio = 0.91;

            cellWidth *= zoomRatio;
            cellHeight *= zoomRatio;

            if (cellWidth > ZOOM_MAX) {
                cellWidth = ZOOM_MAX;
                cellHeight = ZOOM_MAX / CELL_RATIO;
            } else if (cellWidth < ZOOM_MIN) {
                cellWidth = ZOOM_MIN;
                cellHeight = ZOOM_MIN / CELL_RATIO;
            }

            rowHeight = cellHeight * 0.75 - 1;
            columnShift = cellWidth / 2;
            mapWidth = cellWidth * columns;
            mapHeight = rowHeight * rows;

            const actualZoomRatio = cellWidth / previousCellWidth;
            const shiftXRatio = 1 - actualZoomRatio;
            const cursorShiftX = (viewport.center.x - event.offsetX) * shiftXRatio;
            const cursorShiftY = (viewport.center.y - event.offsetY) * shiftXRatio;

            viewport.go_to(mapWidth * xRatio + cursorShiftX, mapHeight * yRatio + cursorShiftY);

            info.zoom(Math.round(cellWidth));

        }

    }
    function Cursor() {

        let cursor = this;
        this.use = use;

        function use(name) {

            container.style.cursor = name;

        }

    }

    function drawMap(map) {

        let xMin = Math.floor(viewport.x / cellWidth) - 1;
        let yMin = Math.floor(viewport.y / rowHeight) - 1;
        let xMax = Math.ceil((viewport.x + viewport.width) / cellWidth);
        let yMax = Math.ceil((viewport.y + viewport.height) / rowHeight);

        if (xMin < 0) xMin = 0;
        if (yMin < 0) yMin = 0;
        if (xMax > columns) xMax = columns;
        if (yMax > rows) yMax = rows;

        for (let x = xMin; x < xMax; x++) {

            for (let y = yMin; y < yMax; y++) {

                const index = map[y * columns + x];
                let cellX = x * cellWidth - viewport.x + canvasWidth / 2 - viewport.width / 2;
                let cellY = y * rowHeight - viewport.y + canvasHeight / 2 - viewport.height / 2;

                if (y % 2 === 0) {
                    cellX += columnShift;
                }
                ctx.drawImage(tiles[index], 0, 0, HEX_WIDTH, HEX_HEIGHT, cellX, cellY, cellWidth, cellHeight);

            }

        }

    }
    function pause() {
        cancelAnimationFrame(update);
    }
    function resume() {
        update = requestAnimationFrame(loop);
    }
}
