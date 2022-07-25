import * as spriteMap from './sprite-maps.js';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const img = new Image();
img.src = '/images/map/world/spritesheet_arrows.webp';


clickzone.addEventListener('mouseup', handleUp);
clickzone.addEventListener('contextmenu', e => {
    e.preventDefault();
});

let frame = 0;
const FPS = 60;

function handleUp(event) {

    event.preventDefault();

    switch (event.which) {
        case 3:
            const zone = clickzone.getBoundingClientRect();
            canvas.width = 200;
            canvas.height = 170;
            canvas.style.left = `${event.offsetX + zone.left - canvas.width / 2}px`;
            canvas.style.top = `${event.offsetY + zone.top - canvas.height / 1.8}px`;
            clickzone.appendChild(canvas);

            canvas.style.opacity = 1;
            window.requestAnimationFrame(frames);
            break;
        default:
        return;
    }

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
        window.requestAnimationFrame(frames);
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
