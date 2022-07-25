const FPS = 30;
let timing;
window.onload = () => {

    import('/js/sandbox/unit_timings.json', { assert: { type: 'json' } })
        .then(data => {
            timing = data.default;
            // new KeyingExample();
            new ControlsExample();
        });

};
function KeyingExample() {

    const colorPicker = document.querySelector('input[type="color"]');
    const btnPlay = document.querySelector('#keying button[name="play"]');

    const video = document.getElementById('video');
    const videoA = document.getElementById('videoA');

    const c1 = document.getElementById('canvas');
    const ctx1 = c1.getContext('2d');
    const c2 = document.createElement('canvas');
    const ctx2 = c2.getContext('2d');
    c2.width = 300;
    c2.height = 200;

    let countryColor = hex2rgb(colorPicker.value);

    hex2rgb('#b80e3e');

    btnPlay.onclick = () => {
        video.currentTime = videoA.currentTime = 3;
        video.play();
        videoA.play();
    }

    colorPicker.addEventListener('input', updateCountryColor, false);

    process();

    function process() {

        ctx1.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        ctx2.drawImage(videoA, 0, 0, video.videoWidth, video.videoHeight);

        const frame = ctx1.getImageData(0, 0, video.videoWidth, video.videoHeight);
        const frameA = ctx2.getImageData(0, 0, video.videoWidth, video.videoHeight);

        const data = frame.data;
        const dataA = frameA.data;

        for (let i = 0; i < frame.data.length; i += 4) {
            const red = data[i + 0];
            const green = data[i + 1];
            const blue = data[i + 2];
            const delta = green - (red + blue - 10) / 2;
            const deltaRatio = delta / 255;
            data[i + 0] = shiftChannel(red, countryColor.r - 20, deltaRatio);
            data[i + 1] = shiftChannel(green, countryColor.g - 75, deltaRatio);
            data[i + 2] = shiftChannel(blue, countryColor.b, deltaRatio);
            data[i + 3] = dataA[i + 0];
        }
        ctx1.putImageData(frame, 0, 0);

        window.requestAnimationFrame(process);

    }
    function updateCountryColor(ev) {

        countryColor = hex2rgb(ev.target.value);

    }

}
function ControlsExample() {

    const video = document.querySelector('#unit2');
    const colorPicker = document.querySelector('#controls input[type="color"]');
    const btnIdle = document.querySelector('#controls button[name="idle"]');
    const btnMove = document.querySelector('#controls button[name="move"]');
    const btnFight = document.querySelector('#controls button[name="fight"]');
    const btn0 = document.querySelector('#controls button[name="0"]');
    const btn1 = document.querySelector('#controls button[name="1"]');
    const btn2 = document.querySelector('#controls button[name="2"]');
    const btn3 = document.querySelector('#controls button[name="3"]');
    const btn4 = document.querySelector('#controls button[name="4"]');
    const btn5 = document.querySelector('#controls button[name="5"]');
    const can = document.getElementById('u2');

    let countryColor = hex2rgb(colorPicker.value);

    let compositing;

    video.src = '/video/U1_30_test_4.mp4';
    video.addEventListener('loadeddata', () => {
        setTimeout(() => {
            can.style.display = 'block';
            compositing = new Compositing(video, can);
        }, 100);
    });
    colorPicker.addEventListener('input', updateCountryColor, false);

    const archer = new Unit('archer');

    btnIdle.onclick = () => {
        archer.do('idle', -1);
    };
    btnMove.onclick = () => {
        archer.do('move', -1);
    };
    btnFight.onclick = () => {
        archer.do('fight', -1);
    };
    btn0.onclick = btn1.onclick = btn2.onclick = btn3.onclick = btn4.onclick = btn5.onclick = (e) => {
        archer.turn(e.target.innerText);
    }

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

    }
    function updateCountryColor(ev) {

        countryColor = hex2rgb(ev.target.value);
        if (!archer.state) compositing.process();

    }
    function Unit(unit) {

        const anim = timing[unit];

        let state = null;
        let requestedState = null;
        let currentPhase = 'cycle';
        let still = null;
        let transition = false;
        let facing = 1;

        const _ = this;
        this.new_state = state;
        this.state = state;
        this.do = changeState;
        this.turn = turn;

        window.addEventListener('animation:loop:ended', (e) => {

            switch (currentPhase) {
                case 'start':
                    if (state !== requestedState) {
                        animate(state, 'end', 1);
                    } else {
                        transition = false;
                        animate(requestedState, 'cycle', -1);
                    }
                    break;
                case 'cycle':
                    animate(state, 'end', 1);
                    break;
                case 'end':
                    if (requestedState === 'idle') { }
                    animate(requestedState, 'start', 1);
                    break;
                default:

            }

        });

        function changeState(type, repeat) {

            requestedState = type;
            if (!state || still) return animate(type, 'start', 1);
            transition = true;

        }
        function animate(type, phase, repeat) {

            if (!anim[type].start) phase = 'cycle';

            let startFrame = anim[type][phase].start;
            let finalFrame = startFrame + anim[type][phase].duration;
            let currentFrame = startFrame;
            let lastTimestamp = 0;
            let repetitions = 0;
            let stop = false;

            video.currentTime = f(startFrame);
            if (finalFrame > startFrame) {
                update();
                still = false;
            } else {
                still = true;
            }

            _.state = state = type;
            currentPhase = phase;

            function update(timestamp) {
                if (stop) {
                    return hey('animation:loop:ended', { type, phase });
                } else {
                    requestAnimationFrame(update);
                }
                if (timestamp - lastTimestamp < 1000 / FPS) return;
                // -----
                if (currentFrame === finalFrame) {
                    if (transition) {
                        stop = true;
                        return;
                    } else if (repeat === -1) {
                        currentFrame = startFrame;
                        video.currentTime = f(startFrame);
                    } else if (repetitions < repeat - 1) {
                        currentFrame = startFrame;
                        video.currentTime = f(startFrame);
                        repetitions++;
                    } else {
                        stop = true;
                        return;
                    }
                } else {
                    currentFrame++;
                    video.currentTime = f(currentFrame);
                }
                compositing.process();
                // -----
                lastTimestamp = timestamp;
            }

        }
        function updateRotationAbilities() {
        }
        function turn(side) {

            if (facing === side) return;

            let angle = facing + side + '';

            for (const key in anim.turn) {
                if (key) {
                    facing = side;
                    return animateRotation(anim.turn[angle]);
                }
            }

        }
        
        function animateRotation(frames) {

            let startFrame = frames.start;
            let finalFrame = startFrame + frames.duration;
            let direction = 1;
            if (frames.duration < 0) direction = -1;
            let lastTimestamp = 0;
            let currentFrame = startFrame;

            video.currentTime += f(currentFrame);

            update();

            function update(timestamp) {
                requestAnimationFrame(update);
                if (timestamp - lastTimestamp < 1000 / FPS) return;
                // -----
                if ((direction > 0 && currentFrame <= finalFrame) || (direction < 0 && currentFrame >= startFrame)) {
                    currentFrame += direction;
                    video.currentTime = f(currentFrame);
                    compositing.process();
                }
                // -----
                lastTimestamp = timestamp;
            }

        }

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
function shiftChannel(value1, value2, ratio) {

    const delta = value2 - value1;
    const shift = delta * ratio;
    const newValue = value1 + shift;

    return newValue;

}
function f(frameNumber) {

    return frameNumber / FPS;

}
function hey(eventName, data) {

    const event = new CustomEvent(eventName, { detail: data });
    window.dispatchEvent(event);

}
