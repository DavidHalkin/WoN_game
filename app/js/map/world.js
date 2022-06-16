import { Map } from './map.js';

window.map = new Map();
new CityLabel();

function CityLabel() {

    const label = $('#city_name_panel');
    const blazon = label.querySelector('.blazon');
    const panel = label.querySelector('.panel');
    const panelContent = panel.querySelector('.panel_content');

    let hidden = true;

    label.style.position = 'absolute';

    map.container.addEventListener('map:hover:city:blazon', handleHover);


    function handleHover(e) {
        if (hidden) {
            show(e.detail);
            map.container.addEventListener('mousemove', solveHover);
            hidden = false;
        }

    }
    function show(city) {
        if (map.props.cell_width > 55) {
            position(city.blazon_coords.x1, city.blazon_coords.y1);
            setName(city.name);
            setBlazon(city.blazon);
            label.classList.add('show');
        }
    }
    function hide() {
        label.classList.remove('show');
        hidden = true;

    }
    function setName(text) {

        panelContent.innerText = text;

    }
    function setBlazon(url) {

        blazon.innerHTML = '';
        const img = new Image();
        img.src = url;
        blazon.appendChild(img);

    }
    function position(x, y) {

        const initBlazonSize = 45;
        const initFontSize = 16;
        const size = map.props.cell_width / 2;

        label.style.top = y + size / 2 + 'px';
        label.style.left = x + size / 2 + 'px';

        blazon.style.width = size + 'px';
        blazon.style.height = size + 'px';

        panelContent.style.fontSize = size / initBlazonSize * initFontSize + 'px';

    }
    function solveHover(e) {

        if (!e.target.closest('.blazon')) {
            hide();
            map.container.removeEventListener('mousemove', solveHover);
        }

    }


}
function $(selector) {
    return document.querySelector(selector);
}
