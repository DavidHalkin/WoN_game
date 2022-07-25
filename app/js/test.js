new WoN();

function WoN() {

    const container = $('.canvas_container');
    const canvas = $('#map');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    const bufferCanvas = document.createElement('canvas');
    const ctx2 = bufferCanvas.getContext('2d');


    let canvasWidth,
        canvasHeight,
        update;

    const SIZE = 20;

    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    const img = new Image();
    const img2 = new Image();
    const img3 = new Image();

    img.addEventListener('load', () => {
        img2.addEventListener('load', () => {
            img3.addEventListener('load', () => {
                loop();
            });
            img3.src = '/images/tile3.jpg';
        });
        img2.src = '/images/tile2.jpg';
    });
    img.src = '/images/tile1.jpg';


    setCanvasSize();

    window.addEventListener('resize', handleWindowResize);


    function loop() {

        stats.begin();

        ctx.imageSmoothingEnabled = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        draw();

        stats.end();

        update = requestAnimationFrame(loop);

    }
    function handleWindowResize() {

        setCanvasSize();

    }
    function setCanvasSize() {

        const containerBox = container.getBoundingClientRect();

        canvasWidth = Math.round(containerBox.width);
        canvasHeight = Math.round(containerBox.height);

        ctx.canvas.width = canvasWidth;
        ctx.canvas.height = canvasHeight;

    }

    function draw() {

        const tiledImage = tileImages([img, img2, img3]);

        for (let i = 0; i < 50; i++) {
            ctx.putImageData(
                tiledImage,
                0,
                i * SIZE
            );
        }


        function tileImages(images) {

            let imageDatas = [];

            images.forEach(img => {
                ctx2.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, SIZE, SIZE);
                imageDatas.push(ctx2.getImageData(0, 0, SIZE, SIZE).data);
            });

            const tiledImageData = tileImageData(imageDatas);
            const tiledImage = ctx2.createImageData(images.length * SIZE, SIZE);

            for (let i = 0; i < tiledImage.data.length; i++) {
                tiledImage.data[i] = tiledImageData[i];
            }

            return tiledImage;

            function tileImageData(tiles) {
                const itemsRow = SIZE * 4;
                let tiledArray = [];
                for (let y = 0; y < SIZE; y++) {
                    for (let x = 0; x < tiles.length; x++) {
                        for (let i = y * itemsRow; i < (y * itemsRow) + itemsRow; i++) {
                            tiledArray.push(tiles[x][i]);
                        }
                    }
                }
                return tiledArray;
            }
        }
    }
    function pause() {
        cancelAnimationFrame(update);
    }
    function resume() {
        update = requestAnimationFrame(loop);
    }
    function drawText(tileX, tileY, text) {

        ctx.fillText(
            text,
            tileX + map.cell_width / 2,
            tileY + map.cell_height / 2 + 2.5
        );

        ctx.font = "12px sans-serif";
        ctx.fillStyle = 'white';

    }
    function $(selector) {

        return document.querySelector(selector);

    }

    // random generators
    function rnd(range) {

        return Math.floor(Math.random() * (range + 1));

    }
    function randomOnSeed(min, max, seed) {

        const x = Math.sin(seed) * 10000;
        const randomFloat = x - Math.floor(x);
        return Math.round((max - min) * randomFloat + min);

    }
}
