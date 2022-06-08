class Cursor {
    constructor() {
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
        window.addEventListener('mousemove', solveMove);
        hideDefaultCursor();

        const _ = this;
        this.elem = elem;
        this.coords = {
            x: null,
            y: null
        };
        this.location = {
            col: null,
            row: null
        };

        function solveMove(e) {
            _.coords.x = e.clientX;
            _.coords.y = e.clientY;
            elem.style.transform = `translate3d(${_.coords.x}px, ${_.coords.y}px, 0)`;
        }
        function hideDefaultCursor() {
            const styles = `<style media="screen">* {cursor: none;}</style>`;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }
    use(url) {
        console.log(cursor.elem);
        cursor.elem.style.backgroundImage = `url(${url})`;
    }
    down() {
        cursor.elem.style.width = '32px';
    }
    up() {
        cursor.elem.style.width = '40px';
    }
}

window.cursor = new Cursor();
