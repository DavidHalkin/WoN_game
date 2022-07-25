new SpriteMapGenerator();

function SpriteMapGenerator() {

    const MARGIN = 2;

    let tilesLoaded = 0;

    const canvas = document.getElementById('map');
    const ctx = canvas.getContext('2d');

    let spriteMap = [],
        imgClass;

    class Info {
        constructor(selector) {
            const elem = document.querySelector(selector);
            const dropzone = elem.querySelector('[type="file"]');
            const textarea = elem.querySelector('[name="json"]');
            const download = elem.querySelector('a[download]');

            this.textarea = textarea;
            this.download = download;

            dropzone.addEventListener('change', () => {

                tilesLoaded = 0;

                const imgFiles = Array.from(dropzone.files);

                imgFiles.forEach((file, i) => {

                    let item = parseNameParams(file.name);
                    const image = new Image();

                    const variation = {
                        img: image
                    };

                    if (item.variation) delete item.variation;
                    const similarTile = findSimilarTile(spriteMap, item);

                    if (similarTile) {

                        similarTile.variations.push(variation);

                    } else {

                        item.variations = [variation];
                        spriteMap.push(item);

                    }

                    loadImg(file);

                    function loadImg(file) {

                        const objectUrl = URL.createObjectURL(file);

                        image.onload = () => {

                            URL.revokeObjectURL(objectUrl);
                            tilesLoaded++;

                            variation.w = image.width + MARGIN;
                            variation.h = image.height + MARGIN;

                            if (tilesLoaded === imgFiles.length) {
                                drawMap(spriteMap);
                                // enableDownload(this.download);
                                dropzone.value = '';
                            };

                        };

                        image.src = objectUrl;

                    }

                });


                this.output(JSON.stringify(spriteMap));

            });
        }
        output(text) {
            this.textarea.innerText = text;
        }
    }

    const info = new Info('#info');

    function findSimilarTile(spriteMap, item) {

        if (spriteMap.length === 0) return false;

        return spriteMap.find(tile => {

            let tileProps = [];
            let itemProps = [];

            for (const itemProp in item) {

                itemProps.push(`${itemProp}:${item[itemProp]}`);

            }

            for (const tileProp in tile) {

                if (tileProp === 'variations') continue;
                tileProps.push(`${tileProp}:${tile[tileProp]}`);

            }

            if (itemProps.length !== tileProps.length) return false;
            if (itemProps.every(x => tileProps.includes(x))) return true;

        });

    }
    function drawMap(spriteMap) {

        const allVariations = getAllVariations(spriteMap);
        const { w, h, fill } = potpack(allVariations);

        ctx.canvas.width = w;
        ctx.canvas.height = h;

        for (const variation of allVariations) {
            variation.w -= MARGIN;
            variation.h -= MARGIN;
            ctx.drawImage(variation.img, variation.x, variation.y, variation.w, variation.h);
            delete variation.img;

        }

        info.output(JSON.stringify(spriteMap));
        console.log(spriteMap);

        enableDownload(info.download);

    }
    function getAllVariations(spriteMap) {

        let array = [];

        spriteMap.forEach(item => array = array.concat(item.variations));

        return array;

    }
    function enableDownload(btn) {

        const image = canvas.toDataURL();

        btn.style.visibility = 'visible';
        btn.href = image;
        btn.download = 'spritesheet.png';

        btn.dispatchEvent(new MouseEvent('click'));

    }
    function parseNameParams(fullFileName) {

        const name = fullFileName.split('.')[0].split('_');

        imgClass = name[0];

        switch (imgClass) {
            case 'back':
                if (name[1] == 6) {
                    return {
                        class: imgClass,
                        type: name[1],
                        river_part: name[2],
                        hex_sides: name[3],
                        variation: name[4]
                    }
                }
                return {
                    class: imgClass,
                    type: name[1],
                    variation: name[2]
                }
            case 'front':
                return {
                    class: imgClass,
                    type: name[1],
                    variation: name[2]
                }
            case 'city':
                return {
                    class: imgClass,
                    culture: name[1],
                    size: name[2]
                }
            case 'camp':
                return {
                    class: imgClass,
                    culture: name[1]
                }
            case 'vil':
                return {
                    class: imgClass,
                    type: name[1]
                }
            case 'small':
                return {
                    class: imgClass,
                    type: name[1],
                    zone: name[2],
                    variation: name[3]
                }
            case 'res':
                return {
                    class: imgClass,
                    id: +name[1]
                }
            default:
                return {
                    class: imgClass
                }
        }

    }

}
