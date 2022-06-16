const urlParams = new URLSearchParams(new URL(location).search);
const mapType = $('#field_map') ?.dataset ?.map;
const dev = location.hostname == 'localhost' || location.hostname == '192.168.1.16' ? true : false;
let page_data = JSON.parse($("#page_data").innerText);

window.ui = {};
window.ui.modes = new Modes('.panel_game_modes');
window.ui.city = new City('.panel_town');
window.ui.aside = new Aside('.panel_sidebar');
window.ui.bottom = new Bottom('.panel_army');
window.ui.actions = new Actions('.actions_panel');
window.ui.tooltip = new ComponentsTip('.tooltip');
window.ui.confirm = new Confirm('.popup');

initAll();

let pageData, cityClickJson, cityBuildJson, cityInfoJson, cityData;

switch (mapType) {
    case 'world':
        $('div#field_map').addEventListener('map:click:left:response', ev => {
            if (typeof ev.detail === 'object') {
                ui.aside.init(ev.detail);
                if (ev.detail ?.army ) ui.bottom.update(ev.detail.army, true);
                if (ev.detail ?.buildings ) ui.bottom.update(ev.detail.buildings);
                if (ev.detail ?.commands) ui.actions.update(ev.detail.commands);
                if (ev.detail ?.commands_hide_back) $('.actions_panel_holder').style = "background: none;";
                else $('.actions_panel_holder').style = "";
            }
        });
        break;
    case 'city':
        loadCityInfo();
        break;
    case 'battle':

        break;
    default:

}


function initAll() {

    new CustomScroll();
    new CustomAccordion();
    new Slider();
    new Tabs();
    new ToolTips();
    new Draggables();
    new Timer();
    new Table();

    initSelectElements();
    enableRenaming();
    enableArmyname();

}
/* Pages ------------------------------------------- */
async function loadCityInfo() {

    let idParam = '';

    for (const p of urlParams) {
        if (p[0] === 'id') id = `&city_id=${p[1]}`;
    }

    let url = `/ajax?do=city_info&c=city${idParam}`;
    if (dev) url = '/cache/map/clicksim/city_info.json';

    const res = await fetch(url);
    const data = await res.json();

    if (typeof data === 'object') {
        if (data.info) ui.aside.init(data);
        if (data.buildings) ui.bottom.update(data.buildings);
        if (data.commands) ui.actions.update(data.commands);
        if (data.commands_hide_back || mapType == 'city') $('.actions_panel_holder').style = "background: none; --h: auto;";
        else $('.actions_panel_holder').style = "";
    }

}

/* Panels ------------------------------------------- */
function Modes(selector) {
    const elem = $(selector);
    if (!elem || mapType == 'city') return;
    const list = elem.querySelector('.panel_holder');
    const buttons = Array.from(list.children);

    this.activate = activateButton;
    this.buttons = list;

    buttons.forEach((btn) => {
        if (!btn.classList.contains('active')) {
            btn.firstElementChild.style.opacity = 0.3;
            btn.disabled = true;
        }
        btn.onclick = () => {
            map.mode(btn.name);
            buttons.forEach((btn) => btn.classList.remove('active'));
            btn.classList.add('active');
        };
    });

    function activateButton(name) {
        const btn = list.querySelector(`[name="${name}"]`);
        btn.firstElementChild.style.opacity = 1;
        btn.disabled = false;
    }
}
function City(selector) {
    const elem = $(selector);
    if (!elem) return;
    const currentCityNameContainer = elem.querySelector(
        '.panel_holder > .part_txt'
    );
    const currentCityName = currentCityNameContainer.querySelector('h3');
    const cityList = elem.querySelector('#city-list');

    cityList.onclick = handleCityListClick;

    watchTextSize();

    function watchTextSize() {
        const initialStyles = getComputedStyle(currentCityName);
        const initialFontSize = initialStyles.fontSize;
        const initialMaxWidth = initialStyles.maxWidth;

        let minified = false;
        let previousStringLength = currentCityName.innerText.length;

        const titleWidth = currentCityName.getBoundingClientRect().width;
        const containerWidth =
            currentCityNameContainer.getBoundingClientRect().width;
        sizeSolver(titleWidth, containerWidth);

        currentCityName.addEventListener('input', () => {
            const titleWidth = currentCityName.getBoundingClientRect().width;
            const containerWidth =
                currentCityNameContainer.getBoundingClientRect().width;
            const newStringLength = currentCityName.innerText.length;

            if (
                (!minified && newStringLength > previousStringLength) ||
                (minified && newStringLength < previousStringLength)
            ) {
                sizeSolver(titleWidth, containerWidth);
                previousStringLength = newStringLength;
            }
        });

        function sizeSolver(titleWidth, containerWidth) {
            if (titleWidth >= containerWidth) {
                currentCityName.style.fontSize = '16px';
                currentCityName.style.maxWidth = '100%';
                minified = true;
            } else if (titleWidth < containerWidth) {
                currentCityName.style.fontSize = initialFontSize;
                currentCityName.style.maxWidth = initialMaxWidth;
                minified = false;
            }
        }
    }
    function handleCityListClick(ev) {
        const city = ev.target.closest('a');
        const href = city.getAttribute('href');
        if (href && href !== '#') return location.href = href;
        ev.preventDefault();
        map.viewport.go_to_hex(city.dataset.x, city.dataset.y);
    }
}
function Aside(selector) {
    const elem = $(selector);
    if (!elem) return;

    const htmlContainer = elem.querySelector(':scope > .panel_holder > .panel_content > .content_scroll');
    const asideHistory = new DomHistory();
    const closeBtn = elem.querySelector('.close_btn');

    DomHistory.prototype.addRecord = function(json) {
        this.history.push(json);
    };
    DomHistory.prototype.removeRecord = function() {
        this.history.pop();
    };
    DomHistory.prototype.clear = function() {
        this.history = [];
    };

    if (closeBtn) closeBtn.onclick = close;

    const _ = this;
    this.elem = elem;
    this.close = close;
    this.init = panelSolver;
    this.update = buildPanelDOM;

    function DomHistory() {
        this.history = [];
    }
    function close() {
        asideHistory.removeRecord();
        const { history } = asideHistory;

        if (history.length) {
            buildPanelDOM(history[history.length - 1], false);
        } else if (mapType != 'city') {
            elem.style.display = 'none';
        }
    }
    function open() {
        elem.style.display = 'block';
    }
    function panelSolver(data) {

        const elemStyles = window.getComputedStyle(elem);

        if (
            elem.style.display == 'none' ||
            elemStyles.getPropertyValue('display')
        ) {
            open();
        }
        asideHistory.clear();
        buildPanelDOM(data);

    }
    function buildPanelDOM(structure, pushHistory = true) {

        if (!structure) console.info('no data in responce');

        // Add Structure to History
        if (pushHistory) asideHistory.addRecord(structure);

        // Build Aside Header
        _buildAsideHeader(structure.city_header);

        // Build Aside Body
        generateHTML(htmlContainer, structure.info, _);
        if (structure.tabs) htmlContainer.classList.add('px-0');
        else htmlContainer.classList.remove('px-0');

        new Tabs();

    }
    function _buildAsideHeader(structure) {

        const headerContainer = elem.querySelector(':scope > .panel_holder');
        let headerElem = headerContainer.querySelector('.panel_header');

        if (headerElem) headerElem.remove();
        if (!structure) return;

        const { flag, character, city_name, city_id } = structure;

        headerElem = `
            <div class="panel_header py-10">
                <div class="d-flex align-items-center">
                    <div class="pr-25">
                        <a href="${character.url}" class="circle emblem size_2 size_xl_4 d-block my-4"><img src="${character.image}" alt=""></a>
                        <a href="${flag.url}" class="circle emblem size_2 size_xl_4 d-block my-4"><img src="${flag.image}" alt=""></a>
                    </div>
                    <h3 class="mb-0 fz_25 font-weight-normal">${city_id ? `<a href="/city?id=${city_id}">${city_name}</a>` : city_name}</h3>
                </div>
                <div class="decor">
                    <span class="corner"></span>
                    <span class="corner right_top"></span>
                    <span class="corner right_bottom"></span>
                    <span class="corner left_bottom"></span>
                </div>
            </div>`;

        headerContainer.insertAdjacentHTML('afterbegin', headerElem);

    }
}
function Bottom(selector) {
    const elem = $(selector);
    if (!elem) return;
    const itemsContainer = elem.querySelector('.holder_slider_list');
    const switcher = elem.querySelector('button.switcher');

    let itemShowing = 0;

    const scroll = new Scroll();
    scroll.init();

    const _ = this;
    this.update = populateItems;
    this.collapsed = true;
    this.deselect = deselectAll;
    this.selected = [];

    switcher.addEventListener('click', toggle);

    function populateItems(data, multiSelect) {

        itemsContainer.innerHTML = '';
        if (data ?.length )
            $('.panel_army').classList.remove('d-none');
        else {
            $('.panel_army').classList.add('d-none');
            return;
        }



        itemsContainer.innerHTML = '';

        for (const [i, itemData] of data.entries()) {

            let {
                back,
                enabled,
                icon,
                id,
                name,
                tooltip,
                number,
                width,
                height,
                blazon,
                army_id
            } = itemData;

            if (mapType === 'world' && army_id && enabled) {
                if (name) $('#paneltitle').innerText = name;
                $('#paneltitle').dataset.id = army_id;
            }

            enabled = enabled ? (mapType === 'world' && army_id ? 'type_active' : '') : 'type_disabled';
            if (back == 'opacity') class_type = 'type_disabled';
            else if (back == 'gold') class_type = 'type_warning';
            else if (back == 'blue') class_type = 'type_primary';
            else class_type = '';

            const item = document.createElement('div');
            item.classList.add('slider_item', 'mx-7');

            item.innerHTML = `
                <div data-id="${id}" data-i="${i}" data-armyname="${name}"  data-army_id="${army_id}" class="slot ${enabled}  ${class_type} ${blazon ? 'has_bottom_right_alert' : ''} ">
                    <div class="figure_holder">
                        <button class="figure" type="button">
                            <div class="mask">
                                <img src="${icon}" alt="${name}">
                            </div>
                        </button>
                        <button type="button" class="close_btn"></button>
                        <div class="square size_0 top_alert">
                            <img src="/images/map/icons/lock.svg" alt="">
                        </div>
                        <div class="square bottom_alert size_0">
                            <img src="/images/map/icons/alert.svg" alt="">
                        </div>
                        <a href="#" class="circle emblem bottom_right_alert size_0">
                            <img src="${blazon}" alt="">
                        </a>
                    </div>
                    ${number ? `<div class="text_holder">${number}</div>` : ''}
                </div>`;

            if (enabled !== 'type_disabled') {
                item.onclick = () => {

                    const slot = item.firstElementChild;

                    if (multiSelect) {
                        slot.classList.toggle('type_active');

                        if (slot.classList.contains('type_active')) {
                            var panel_army_title = $('#paneltitle');
                            panel_army_title.innerText = slot.dataset.armyname;
                            panel_army_title.dataset.id = slot.dataset.army_id;
                        }
                    }
                    else {
                        deselectAll();
                        slot.classList.add('type_active');
                    }

                    updateSelected(data);

                    if (mapType === 'city') {
                        map.buildings.build({
                            id,
                            name,
                            height,
                            width,
                            img: icon
                        });
                    }
                };
            }

            if (tooltip) enableTooltip(item, tooltip);

            itemsContainer.insertAdjacentElement('beforeend', item);

        }

        scroll.init();

    }
    function updateSelected(array) {

        _.selected = [];

        const allSelected = itemsContainer.querySelectorAll('.type_active');
        for (const elem of allSelected) {
            _.selected.push(elem.dataset.id);
        }

    }
    function deselectAll() {
        itemsContainer.querySelector('.type_active') ?.classList.remove('type_active');
        _.selected = null;
    }
    function toggle(ev) {

        if (_.collapsed) {
            _.collapsed = false;
        } else {
            _.collapsed = true;
            scroll.to_start();
        }

        scroll.init();

    }
    function Scroll() {

        const SCROLL_AMOUNT = 0.5; // relative to container width

        const holderSlider = elem.querySelector('.holder_slider');
        const btnLeft = elem.querySelector('[data-direction="left"]');
        const btnRight = elem.querySelector('[data-direction="right"]');

        this.init = init;
        this.enable = enable;
        this.disable = disable;
        this.to_start = scrollToStart;

        function init() {

            if (itemsContainer.scrollWidth > holderSlider.clientWidth) enable();
            else disable();

        }
        function enable() {
            if (btnLeft == null) return false;
            btnLeft.addEventListener('click', handleClick);
            btnRight.addEventListener('click', handleClick);

            btnLeft.style.opacity = 1;
            btnRight.style.opacity = 1;

        }
        function disable() {
            if (btnLeft == null) return false;
            btnLeft.removeEventListener('click', handleClick);
            btnRight.removeEventListener('click', handleClick);

            btnLeft.style.opacity = 0.3;
            btnRight.style.opacity = 0.3;

        }
        function handleClick(ev) {

            const containerWidth = holderSlider.offsetWidth;
            const totalItems = elem.querySelector('.holder_slider_list').children.length;

            let duration = 500;

            let d = 1;
            if (ev.target.dataset.direction === 'left' && !_.collapsed) d = -1;

            let hScroll = holderSlider.scrollLeft + containerWidth * SCROLL_AMOUNT * d;
            if (_.collapsed) {
                if (ev.target.dataset.direction === 'left') d = -1;
                itemShowing += d;
                if (itemShowing < 0) {
                    itemShowing = 0;
                } else if (itemShowing >= totalItems) {
                    itemShowing = totalItems - 1;
                }
                hScroll = containerWidth * itemShowing * Math.abs(d);
                duration = 250;
            }

            animate(holderSlider, {
                prop: 'scroll-x',
                start: holderSlider.scrollLeft,
                end: hScroll,
                duration
            })

        }
        function scrollToStart() {

            itemShowing = 0;
            holderSlider.scroll(0, 0);

        }
    }
}
function Actions(selector) {
    const elem = $(selector);
    if (!elem) return;


    const htmlContainer = elem.querySelector('.actions_panel_holder');

    const _ = this;
    this.update = updateHTML;

    function updateHTML(data) {

        if (data ?.length )
            $('.actions_panel').classList.remove('d-none');
        else {
            $('.actions_panel').classList.add('d-none');
            return;
        }

        generateHTML(htmlContainer, data, _);


    }

}
function Confirm(selector) {
    const elem = $(selector);
    if (!elem) return;

    const questionEl = elem.querySelector('.content_scroll').children[0];
    const confirmEl = elem.querySelector('.confirm');
    const btnConfirm = confirmEl.querySelector('[data-action="yes"]');
    const btnCancel = confirmEl.querySelector('[data-action="no"]');
    const controls = elem.querySelector('.popup_footer').children[1];
    const name = elem.querySelector('.content_scroll').children[1];

    this.ask = show;

    function show(naming, callback) {

        questionEl.innerText = page_data.confirm.quest;
        btnConfirm.firstElementChild.innerText = page_data.confirm.y;
        btnCancel.firstElementChild.innerText = page_data.confirm.n;

        elem.style.left = '50%';
        elem.style.top = '50%';
        elem.style.transform = 'translate(-50%, -50%)';

        name.classList.add('d-none');
        controls.classList.add('d-none');
        questionEl.classList.remove('d-none');
        confirmEl.classList.remove('d-none');
        elem.style.display = 'block';

        btnConfirm.onclick = () => {
            callback(true);
            hide();
        }
        btnCancel.onclick = () => {
            callback(false);
            hide();
        }

    }
    function hide() {

        name.classList.add('d-none');
        controls.classList.add('d-none');
        questionEl.classList.add('d-none');
        confirmEl.classList.add('d-none');
        elem.style.display = 'none';

    }

}

/* Utilities ------------------------------------------- */
function generateHTML(target, structure, panel) {

    if (!Array.isArray(structure) || !structure.length) {
        console.info('htmlGenerator: content structure is not an array or empty array');
        return;
    }

    target.innerHTML = '';

    for (const rootEl of structure) {
        target.insertAdjacentElement('beforeend', _getComponentDom(rootEl));
    }


    function _getComponentDom(component) {
        let el = document.createElement('div');
        let clickableElement = null;
        let childs = [];
        let parentForChildsEl = el;
        let classNames = [];
        if (component ?.classNames ?.length) classNames = component.classNames;
        if (!component.type) component.type = 'text';
        // Component DOM
        switch (component.type) {
            case 'tabs':
                classNames.push('tabs', 'grid_column');
                addClasses(el, classNames);



                el.innerHTML = `
                    <div class="header_tab">
                        <div class="tab_nav">
                            <ul class="tab_nav_list list-unstyled d-flex"></ul>
                            <span></span>
                        </div>
                        <div class="tab_info" style="display:none">
                            <div class="tab_info_content py-6 d-flex justify-content-center align-items-center flex-wrap">
                                <p class="mb-0 py-10"></p>
                            </div>
                            <div class="line"></div>
                        </div>
                    </div>
                    <div class="panel_holder inner_height">
                        <div class="panel_content">
                            <div class="content_scroll">
                                <div class="tab_content"></div>
                            </div>
                            <div class="scrollbar">
                                <div class="btn_func arrow_prev"></div>
                                <div class="bar">
                                    <div class="handler" style="top:0%;"></div>
                                </div>
                                <div class="btn_func arrow_next"></div>
                            </div>
                        </div>
                    </div>`;

                for (let [index, tab] of component.tabs.entries()) {

                    const navEl = document.createElement('li');
                    navEl.classList.add('small_img');
                    if (index == 0) navEl.classList.add('active');

                    navEl.innerHTML = `
                        <a href="#t${index}">
                            <span class="link_holder">${tab.name}</span>
                        </a>`;

                    if (tab.icon) {
                        navEl.querySelector('.link_holder').innerHTML = `
                            <img src='${tab.icon}'>`;
                    }

                    const tabEl = document.createElement('div');
                    tabEl.classList.add('tab_pane');
                    tabEl.id = 't' + index;

                    if (index == 0) tabEl.classList.add('active');

                    _recursiveBuildDom(tabEl, tab.content);

                    el.querySelector('.tab_nav_list').insertAdjacentElement(
                        'beforeend',
                        navEl
                    );
                    el.querySelector('.tab_content').insertAdjacentElement(
                        'beforeend',
                        tabEl
                    );

                    setTimeout(() => {
                        new CustomScroll('.panel_sidebar');
                    }, 160);

                }

                break;

            case 'section':
                childs = component.components;

                classNames.push(
                    'section_accordion',
                    'd-flex',
                    'pt-10',
                    'align-items-start',
                    // 'closed'
                );
                addClasses(el, classNames);

                el.innerHTML = `
          <div class="col accordion_hidden_part"></div>
          <div class="col-auto pl-5">
            <button type="button" class="switcher down"></button>
          </div>
        `;

                parentForChildsEl = el.querySelector('.accordion_hidden_part');

                if (component.name) {
                    parentForChildsEl.insertAdjacentHTML(
                        'beforeend',
                        `<h3 class="fz_20 mb-12">${component.name}</h3>`
                    );
                }

                new CustomAccordion(el);

                break;

            case 'mini_info':

                el.classList.add('col_item');

                let mini_info_inputType = component.input_type ? component.input_type : 'text';

                el.innerHTML = `
                    <div>
                      ${component.label ? `<label>${component.label}</label>` : ''}
                        ${component.icon ? `
                        <a
                            href="${component.url ? component.url : '#'}"
                            class="item_ico size_1">
                            <img src="${component.icon}" alt="">
                        </a>` : ''}
                        <div class="mini_holder">
                            <input
                                type="${mini_info_inputType}"
                                value="${component.value}" ${!component.editable ? 'disabled' : ''}>
                        </div>
                    </div>`;

                const input = el.querySelector('input');
                if (component.name) input.setAttribute('name', component.name);

                classNames.push('mini_info');
                if (component.label) classNames.push('label');
                addClasses(el.firstElementChild, classNames);

                if (!component.icon && el.querySelector('.item_icon')) {
                    el.querySelector('.item_icon').remove();
                }

                clickableElement = el.querySelector('a');

                break;

            case 'property':
                childs = component.production ? component.production : [];
                classNames.push('property', 'fold_js');
                addClasses(el, classNames);

                el.innerHTML = `
                  <div class="property_head d-flex align-items-center">
                    <div class="property_prev square size_4">
                      <img src="${component.icon}" alt="">
                    </div>
                    <div class="property_details col">
                      <h3>${component.name}</h3>
                      <div class="property_details_row">
                        <div class="column">
                          <div class="mini_info mini_info_square">
                            <label>.label in parent</label>
                            <a href="#" class="item_ico size_1"><img src="/images/panel/x2/webp/build_count.webp" alt=""></a>
                            <div class="mini_holder">
                              <input type="text" value="${component.amount}" disabled>
                            </div>
                          </div>
                        </div>
                        <div class="column">
                          <div class="mini_info mini_info_square">
                            <label>.label in parent</label>
                            <a href="#" class="item_ico size_1"><img src="/images/panel/x2/webp/workers.webp" alt=""></a>
                            <div class="mini_holder">
                              <input type="text" value="${component.people}" disabled>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                `;

                break;

            case 'slider':
                classNames.push('slider');
                addClasses(el, classNames);

                if (component.label) el.classList.add('has_mini_info');
                if (component.url) el.dataset.url = component.url;

                el.innerHTML = `
                    <div class="mini_info label">
                        <label>${component.label}</label>
                        <div class="mini_holder">
                            <input
                                type="number"
                                min="${component.min}"
                                max="${component.max}"
                                value="${component.value}"
                                step="1"
                                class="info">
                        </div>
                    </div>
                    <div class="range_slider">
                        <input
                            type="range"
                            min="${component.min}"
                            max="${component.max}"
                            value="${component.value}"
                            step="1"
                            list="styled-range-list"
                            class="range--progress"
                            style="--min: ${component.min}; --max: ${component.max}; --val: 75">
                        <div class="filled" style="width: calc(24.3013% + 1px);"></div>
                    </div>
                `;

                if (component.name) el.querySelector('.range_slider input').setAttribute('name', component.name);

                new Slider(el);

                break;

            case 'checkbox':
                classNames.push('checkbox', 'py-10');
                addClasses(el, classNames);

                if (!component.label) el.classList.add('checkbox_no_label');
                if (component.url) el.dataset.url = component.url;

                el.innerHTML = `
                  <label>
                    <input
                      type="checkbox"
                      ${component.value ? 'checked' : ''}
                      ${component.editable ? '' : 'disabled'}
                    >
                    <i class="checkbox_item"></i>
                    <span class="checkbox_label">${component.label}</span>
                  </label>
                `;

                if (component.name) el.querySelector('input').setAttribute('name', component.name);

                new Checkbox(el);

                break;

            case 'icon':
                if (component.url) {
                    el.dataset.url = component.url;
                }

                classNames.push('size_5', component.round ? 'circle' : 'square');
                addClasses(el, classNames);

                el.innerHTML = `
                    <img src="${component.icon}" alt="${component.type}">
                `;

                clickableElement = el;

                break;

            case 'button':
                el = document.createElement('a');
                classNames.push('btn');
                addClasses(el, classNames);
                if (component.url) el.dataset.url = component.url;

                let icon = '';
                if (component.icon) icon = `
                    <img src="${component.icon}" alt="${component.type}">`;

                el.innerHTML = `
                    <span>
                    ${icon}
                    ${component.name}
                    </span>
                `;

                clickableElement = el;

                break;
            case 'command':
                el = document.createElement('div');
                classNames.push('actions_col');
                addClasses(el, classNames);
                if (component.url) el.dataset.url = component.url;

                el.innerHTML = `
                    <button class="actions_item" type="button">
                    <img src="${component.icon}"  >
                    </button>
                    `;

                clickableElement = el;

                break;

            case 'text':
                addClasses(el, classNames);
                el.innerHTML = (component.text ? component.text : component.content);

                break;

            case 'icon_list':
                classNames.push('icon_list');
                addClasses(el, classNames);

                childs = component.components;

                break;

            case 'color':
                classNames.push('color_picker');
                addClasses(el, classNames);

                if (component.url) el.dataset.url = component.url;

                let colorValue = component.value ? component.value : '#000000';

                el.innerHTML = `
                <label>${component.label}</label><br>
                <input type="color" value="${colorValue}">`;

                if (component.name) el.querySelector('input').setAttribute('name', component.name);
                clickableElement = el.querySelector('input');

                break;

            case 'select':

                classNames.push('select');
                addClasses(el, classNames);

                if (component.url) el.dataset.url = component.url;

                let value = -1;
                if (component.value) value = component.value;
                el.dataset.value = value;

                if (component.name) el.setAttribute('name', component.name);

                el.innerHTML = `
                    <div class="select_header">
                        <div class="panel sm centered_corners_none">
                            <button class="panel_holder"></button>
                            <div class="decor ">
                                <span class="corner"></span>
                                <span class="corner right_top"></span>
                                <span class="corner right_bottom"></span>
                                <span class="corner left_bottom"></span>
                            </div>
                        </div>
                    </div>
                    <div class="drop_down">
                        <div class="panel grid_column sm centered_corners_none">
                            <div class="panel_holder p-0">
                                <div class="panel_content ">
                                    <div class="content_scroll">
                                        <ul class="etc_drop list-unstyled m-0"></ul>
                                    </div>
                                    <div class="scrollbar">
                                        <div class="btn_func arrow_prev"></div>
                                        <div class="bar">
                                            <div class="handler"></div>
                                        </div>
                                        <div class="btn_func arrow_next"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="decor">
                                <span class="corner"></span>
                                <span class="corner right_top"></span>
                                <span class="corner right_bottom"></span>
                                <span class="corner left_bottom"></span>
                            </div>
                        </div>
                    </div>`;

                let listItems = '';

                for (const item of component.list) {

                    let icon = '';
                    if (item.icon) icon = `<i class="ico"><img src="${item.icon}" alt="${item.name}"></i>`;

                    listItems += `
                        <li data-value="${item.value}">
                            <strong class="select_item">
                                ${icon}
                                <span>${item.name}</span>
                            </strong>
                        </li>
                    `;

                }

                el.querySelector('.etc_drop').insertAdjacentHTML('afterbegin', listItems);

                new Select(el);

                break;
            default:
                classNames.push(component.type);
                addClasses(el, classNames);
                childs = component.components;
                break;
        }

        // Build Childs Components
        if (childs) {

            if (!Array.isArray(childs)) {
                childs = Object.entries(childs).map((item) => item[1]);
            }

            if (childs.length) {
                _recursiveBuildDom(parentForChildsEl, childs);
            }
        }
        if (component.tooltip) enableTooltip(el, component.tooltip);
        if (clickableElement && component.url) {

            clickableElement.setAttribute('data-clickable', '');

            if (component.ajax) {
                clickableElement.setAttribute('data-ajax', 'true');
                clickableElement.onclick = ev => {
                    ev.preventDefault();
                    const url = replaceVars(component.url);
                    handleClick(url);
                };
            } else {
                clickableElement.onclick = () => {
                    const url = replaceVars(component.url);
                    window.location.href = url;
                };
            }

        }

        return el;
    }

    function _recursiveBuildDom(parent, childs) {
        for (let childComponent of childs) {
            const elem = _getComponentDom(childComponent)
            parent.insertAdjacentElement('beforeend', elem);
        }
    }
    function addClasses(elem, array) {

        if (array) elem.classList.add(...array);

    }
    function replaceVars(string) {

        const names = string.match(/[^{]+(?=})/g);
        if (!names) return string;

        let stringUpdated = string;

        names.forEach(name => {
            const elem = target.querySelector(`[name="${name}"]`);
            if (elem) {
                let value = elem.value;
                if (elem.classList.contains('select')) value = elem.dataset.value;
                if (name === 'color') value = value.substring(1);
                stringUpdated = stringUpdated.replace(`{${name}}`, value);
            }
        });

        return stringUpdated;

    }
    async function handleClick(url) {

        function getSelectedIds() {
            return ui.bottom.selected;
        }

        let data;

        if (!dev) {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(getSelectedIds())
            });
            data = await res.json();
            console.log('ajax response:', data);

            if (data.redirect) window.location.href = data.redirect;
            else if (typeof data === 'object') {
                if (data.hasOwnProperty('info')) panel.update(data);
                if (data.hasOwnProperty('buildings')) ui.bottom.update(data.buildings);
                if (data.hasOwnProperty('commands')) ui.actions.update(data.commands);
                if (data.hasOwnProperty('commands_hide_back') || mapType == 'city') $('.actions_panel_holder').style = "background: none; --h: auto;";
                else $('.actions_panel_holder').style = "";
            }
            if (data.hasOwnProperty('renew_city_map') && (typeof renew_city_map) == 'function') renew_city_map();

        } else {

            fetch('/cache/map/clicksim/city_builds.json', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(getSelectedIds())
            })
                .then(async (res) => {
                    const data = await res.json();
                    panel.update(data);
                });


        }

    }

}
function enableTooltip(el, data) {

    el.addEventListener('mouseenter', () => ui.tooltip.show(el, data));
    el.addEventListener('mouseleave', () => ui.tooltip.hide());

}
function CustomScroll(target) {

    let targetElement = document;

    if (typeof target === 'string' && $(target)) {
        targetElement = $(target);
    } else if (typeof target === 'object' && target.isConnected) {
        targetElement = target;
    }

    const scrolls = targetElement.querySelectorAll('.panel_holder');

    const resizeObserver = new ResizeObserver(entries => {
        for (const element of entries) {
            const elem = element.target;
            const panel_holder = elem.closest('.panel_holder');

            if (elem.classList.contains('content_scroll')) {
                if (elem.scrollHeight > elem.parentElement.offsetHeight) {
                    start(panel_holder);
                } else {
                    panel_holder.classList.remove('scroll_js');
                }
            } else if (elem.classList.contains('panel_content')) {
                if (elem.offsetHeight < elem.querySelector('.content_scroll').scrollHeight) {
                    start(panel_holder);
                } else {
                    panel_holder.classList.remove('scroll_js');
                }
            }
        }
    });

    scrolls.forEach(scroll => {
        const panel_content = scroll.querySelector(':scope > .panel_content');

        if (panel_content) {
            const content_scroll = scroll.querySelector('.content_scroll');
            if (!content_scroll) return;

            resizeObserver.observe(content_scroll);
            resizeObserver.observe(panel_content);
        }
    });

    function start(scroll) {

        scroll.classList.add('scroll_js');

        const content = scroll.querySelector(':scope > .panel_content');
        const contentScroll = content.querySelector('.content_scroll');
        const bar = content.querySelector('.bar');
        const thumb = content.querySelector('.handler');
        const up = content.querySelector('.arrow_prev');
        const down = content.querySelector('.arrow_next');

        let moveY = 0;

        thumb.style.transition = 'none';

        thumb.onmousedown = (e) => {
            e.preventDefault();

            contentScroll.removeEventListener('scroll', onScrollMove);

            let shiftY = e.clientY - thumb.getBoundingClientRect().top;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            function onMouseMove(e) {
                moveY = e.clientY - shiftY - bar.getBoundingClientRect().top;
                moveScroll(e);
            }
            function onMouseUp() {
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('mousemove', onMouseMove);
            }
        };

        contentScroll.onmouseover = () => {
            contentScroll.addEventListener('scroll', onScrollMove);
        }

        up.onclick = (e) => {
            e.preventDefault();

            contentScroll.removeEventListener('scroll', onScrollMove);

            moveY = moveY - 10;
            moveScroll(e);
        };
        down.onclick = (e) => {
            e.preventDefault();

            contentScroll.removeEventListener('scroll', onScrollMove);

            moveY = moveY + 10;
            moveScroll(e);
        };

        function moveScroll(e) {
            e.preventDefault();

            let end = bar.offsetHeight - thumb.offsetHeight;

            if (moveY <= 0) moveY = 0;
            if (moveY >= end) moveY = end;

            let handPos = moveY / end;
            let scrollAmout =
                (contentScroll.scrollHeight - bar.offsetHeight) * handPos;

            thumb.style.top = moveY + 'px';
            contentScroll.scrollTo(0, scrollAmout);
        };
        function onScrollMove(e) {
            const maxContentScroll =
                contentScroll.scrollHeight - content.scrollHeight;
            const maxThumbScroll = bar.offsetHeight - thumb.offsetHeight;

            const ratio = e.target.scrollTop / maxContentScroll;
            let thumbScroll = maxThumbScroll * ratio;

            if (thumbScroll >= maxThumbScroll) thumbScroll = maxThumbScroll;

            moveY = thumbScroll;
            thumb.style.top = `${thumbScroll}px`;
        }
    }

}
function CustomAccordion(element) {
    if (element) {
        initAccordion(element);
        return;
    }

    let acc = $$('.section_accordion');
    for (i = 0; i < acc.length; i++) {
        initAccordion(acc[i]);
    }

    function initAccordion(el) {
        el.lastElementChild.addEventListener('click', function() {
            this.parentNode.classList.toggle('closed');
        });
    }
}
function enableArmyname() {


    $$('[data-armyname]').forEach(elem => init(elem));

    function init(elem) {
        if (!elem.dataset.army_id) return false;
        var paneltitle = $('#paneltitle');
        paneltitle.innerHTML = elem.dataset.armyname;
        paneltitle.dataset.id = elem.dataset.army_id;
        return true;
    }

}
function enableRenaming() {

    const MAX_LENGTH = 32;

    $$('[data-rename]').forEach(elem => init(elem));

    function init(elem) {

        let object = elem.dataset.rename;
        let text = elem.innerText;

        elem.contentEditable = true;
        elem.addEventListener('keydown', handleUpdate);
        elem.addEventListener('keyup', handleUpdate);
        elem.addEventListener('blur', handleUpdate);

        function handleUpdate(e) {
            if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.type === 'blur') {
                e.preventDefault();
                const newText = elem.innerText;

                if (newText === '') {
                    elem.innerText = text;
                    return;
                }
                if (newText === text) return;

                if (textValid(newText)) {
                    sendNewText(newText);
                    text = newText;
                }
            } else if (elem.innerText.length > MAX_LENGTH) {
                e.preventDefault();
                elem.innerText = elem.innerText.slice(0, MAX_LENGTH);
                document.execCommand('selectAll', false, null);
                document.getSelection().collapseToEnd();
            }
        }
        function textValid(string) {
            const regex = /[^\p{L}\p{N} -]+/gu;

            if (!string.match(regex)) return true;
            return false;
        }
        function sendNewText(string) {
            var id = elem.dataset.id;
            fetch(`/ajax?do=rename&c=map&id=${id}&o=${object}&name=${string}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then((res) => {
                if (res.ok) {
                    res.json().then((res) => {
                        console.log(res);
                    });
                } else {
                    res.json().then((res) => {
                        console.log(res);
                    });
                }
            });
        }

    }

}
function Slider(el) {
    if (el) {
        initSlider(el);
    } else {
        const sliders = $$('.slider');
        if (!sliders.length) return false;
        sliders.forEach((sliderEl) => {
            initSlider(sliderEl);
        });
    }

    function initSlider(slider) {
        const input = slider.querySelector('[type="range"]');
        const fill = slider.querySelector('.filled');
        const mini_info = slider.querySelector('.mini_info');
        const inputField = mini_info.querySelector('input');

        input.oninput = update;
        inputField.onchange = () => {
            input.value = inputField.value;
            update();
            if (slider.dataset.url) fetch(slider.dataset.url + '&value=' + input.value);
        };

        input.addEventListener('mouseup', ev => {
            if (slider.dataset.url) fetch(slider.dataset.url + '&value=' + input.value);
        });

        update();

        function update(e) {
            const TRACK_GAPS = 5;
            const HANDLER_SHIFT = 4;
            const value = input.value;
            const percent = (value / input.max) * 100;
            const ratio = 50 - percent;
            const extremumShift = Math.round(ratio / TRACK_GAPS) - HANDLER_SHIFT;

            fill.style.setProperty('width', `calc(${percent}% + ${extremumShift}px)`);

            if (mini_info) mini_info.querySelector('input').value = value;
        }
    }
}
function Tabs(element) {
    if (element) {
        new Tab(element);
        return;
    }

    const allTabs = $$('.tabs');

    allTabs.forEach((tab) => new Tab(tab));

    function Tab(elem) {
        const panel = elem.closest('.panel_holder');
        const panelContent = panel.querySelector(':scope > .panel_content');
        const tabsContent = elem.querySelector(':scope > .panel_holder');
        const navTabs = elem.children[0].firstElementChild.firstElementChild.children;
        const content = elem.children[1].querySelector('.panel_content > div > .tab_content');
        let maxContentHeight = null;

        [...navTabs].forEach(tab => {
            tab.onclick = (ev) => {
                ev.preventDefault();
                const tabID = tab.firstElementChild.getAttribute('href');

                for (const contentPane of content.children) {
                    contentPane.classList.remove('active');
                }
                for (const tabBtn of navTabs) {
                    tabBtn.classList.remove('active');
                }

                tab.classList.add('active');
                content.querySelector(tabID).classList.add('active');

                setMaxComponentHeight(elem);

            };
        });

        // const resizeObserver = new ResizeObserver(entries => {
        //     for (const element of entries) {
        //         if (element.target === panel) {
        //             maxContentHeight = null;
        //             setMaxComponentHeight(elem);
        //         }
        //     }
        // });
        //
        // resizeObserver.observe(panel);

        function setMaxComponentHeight(elem) {

            tabsContent.style.maxHeight = 'none';

            const style = window.getComputedStyle(panelContent);
            const paddingBottom = style.getPropertyValue('padding-bottom');
            const padding = parseFloat(paddingBottom);

            const panelCoord = panel.getBoundingClientRect();
            const tabsContentTop = tabsContent.getBoundingClientRect().top;
            const height = panelCoord.bottom - tabsContentTop - padding;

            if (maxContentHeight === null || height > maxContentHeight) {
                maxContentHeight = height;
            }

            tabsContent.style.maxHeight = maxContentHeight + 'px';

        }

    }

}
function ToolTips() {

    const TIP_WINDOW_WIDTH = 320;
    const TIP_WINDOW_MARGIN = 0;
    const tipWindow = document.querySelector('.tooltip');
    if (!tipWindow) return console.log('tooltip element not found on the page');

    const container = tipWindow.querySelector('.container');
    const svg = tipWindow.lastElementChild;
    const tipElements = findTips('[data-tooltip]');

    svg.onclick = hide;
    tipWindow.onmouseleave = hide;

    initTips();

    function findTips(selector) {

        let arr = [];
        arr = document.querySelectorAll(selector);
        return arr;

    }
    function initTips() {

        tipElements.forEach(elem => {

            let mouseOver = false;

            elem.onmouseenter = () => {
                mouseOver = true;
                setTimeout(makeTip, 300);
            };
            elem.onmouseleave = e => {

                const hoveredElem = document.elementFromPoint(e.clientX, e.clientY);
                if (hoveredElem && hoveredElem.closest('.tooltip')) return;

                mouseOver = false;
                hide();
            };

            function makeTip() {

                if (mouseOver) {

                    let thisTipData = elem.dataset.tooltip;

                    if (thisTipData.length > 1) {
                        container.innerHTML = thisTipData;
                        positionTip(elem);
                        revealTip();
                    }

                }

            }

        });

    }
    function positionTip(elem) {

        const position = getCoordinates(elem);
        const elemBox = elem.getBoundingClientRect();

        const pageWidth = document.body.clientWidth;
        const top = position.top + elemBox.height;
        const left = position.left;
        const spaceForTip = pageWidth - left;
        let containerShiftTop = 0;
        let containerShiftLeft = 0;

        tipFitsWindow = true;

        if (spaceForTip < TIP_WINDOW_WIDTH) {
            tipFitsWindow = false;
            containerShiftTop = 0;
            containerShiftLeft = -(TIP_WINDOW_WIDTH - spaceForTip + TIP_WINDOW_MARGIN);
        }

        tipWindow.style.top = top + 'px';
        tipWindow.style.left = left + 'px';

        container.style.top = 0 + 'px';
        container.style.left = 0 + 'px';
        container.style.transformOrigin = -containerShiftLeft + 'px 0';

    }
    function revealTip() {

        tipWindow.style.opacity = 1;
        tipWindow.style.visibility = 'visible';

    }
    function hide() {

        tipWindow.style.opacity = 0;
        tipWindow.style.visibility = 'hidden';

    }

}
function ComponentsTip(selector) {

    const elem = $(selector);
    if (!elem) return;

    const htmlContainer = elem.querySelector('.container');

    this.show = show;
    this.hide = hide;
    this.update = update;

    function show(component, data) {

        update(data);
        position(component);

        elem.style.opacity = 1;
        elem.style.visibility = 'visible';

    }
    function hide() {

        elem.style.opacity = 0;
        elem.style.visibility = 'hidden';
        htmlContainer.innerHTML = '';

    }
    function position(el) {

        const RIGHT_GAP = 10; // px

        const component = el.getBoundingClientRect();
        let x = component.left;
        let y = component.bottom;

        if (window.innerHeight - y < elem.offsetHeight) {
            y = component.top - elem.offsetHeight;
        }

        if (window.innerWidth - x < elem.offsetWidth) {
            x = window.innerWidth - elem.offsetWidth - RIGHT_GAP;
        }

        elem.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
        `;

    }
    function update(data) {

        generateHTML(htmlContainer, data);

    }

}
function Select(elem) {

    const header = elem.querySelector('.select_header');
    const dropdown = elem.querySelector('.drop_down');

    const _ = this;
    this.elem = elem;
    this.value = elem.dataset.value;
    this.set_value = setValue;
    this.toggle = toggle;

    header.onclick = toggle;
    setValue(-1);
    initClicks();
    observeMutation();

    function setValue(val) {

        if (val === -1) {
            const firstItem = dropdown.querySelector('ul').children[0];
            if (firstItem) elem.dataset.value = firstItem.dataset.value;
            _.value = elem.dataset.value;
            showActive(_.value);
        } else if (val) {
            _.value = val;
            elem.dataset.value = val;
        } else {
            _.value = elem.dataset.value;
        }

        const title = header.querySelector('.panel_holder');
        let selectedLi = dropdown.querySelector(`li[data-value="${_.value}"]`);
        if (!selectedLi) selectedLi = dropdown.querySelector('li:first-child');
        if (!selectedLi) return;

        title.innerHTML = selectedLi.innerHTML;
        showActive(_.value);

    }
    function showActive(value) {

        dropdown.querySelectorAll('li').forEach(li => {
            if (li.dataset.value === '' + value) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });

    }
    function toggle() {

        dropdown.style.display = 'block';
        const dropdownHeight = dropdown.getBoundingClientRect().height;
        dropdown.style.cssText = '';

        const bottomGap = window.innerHeight - header.getBoundingClientRect().bottom;
        if (bottomGap < dropdownHeight) {
            elem.classList.add('select_drop_up');
        } else {
            elem.classList.remove('select_drop_up');
        }

        elem.classList.toggle('opened');

    }
    function initClicks() {

        const liElements = dropdown.querySelectorAll('li');
        liElements.forEach(li => {
            li.onclick = e => {
                e.preventDefault();
                const value = e.target.closest('li').dataset.value;
                _.value = value;
                setValue(value);
                toggle(value);
            }
        });

    }
    function ajax(value) {

        fetch(elem.dataset.url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ value })
        })
            .then(res => {
                if (res.ok) {
                    res.json().then(res => {

                    });
                } else {
                    res.json().then(res => {

                    });
                }
            });

    }
    function observeMutation() {

        const callback = function(mutationsList, observer) {
            for (const mutation of mutationsList) {
                if (mutation.attributeName === 'data-value') {
                    setValue();
                    if (elem ?.dataset ?.url) ajax(_.value);
                    generateEvent(_.value);
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(elem, { attributes: true });

    }
    function generateEvent(value) {

        elem.dispatchEvent(new CustomEvent('select:update', {
            detail: { value }
        }));

    }
}
function Draggables() {

    const SCALE_STEP = 0.03;
    const MAX_SCALE = 1.5;
    const MIN_SCALE = 0.7;
    const EDGE = 100; // px

    const draggableEls = $$('.draggable');
    let mouseDownCoord, x, y, minX, maxX, minY, maxY;

    [...draggableEls].forEach(elem => {

        const parent = elem.parentElement;
        parent.style.overflow = 'hidden';
        parent.style.position = 'relative';

        let onlyX, onlyY, deltaWidth, deltaHeight;

        elem.style.cssText = `
            position: absolute;
            top: 0;
            left: ${(parent.clientWidth - elem.clientWidth) / 2}px;
            transform: translateZ(0);
            will-change: transform;
        `;

        elem.transforms = {
            x: 0,
            y: 0,
            s: 1
        };

        elem.addEventListener('mousedown', startDrag);
        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('mousewheel', handleScroll);

        function startDrag(ev) {

            mouseDownCoord = {
                x: ev.clientX,
                y: ev.clientY
            };

            const elemCurrentWidth = elem.clientWidth * elem.transforms.s;
            const elemCurrentHeight = elem.scrollHeight * elem.transforms.s;

            deltaWidth = elemCurrentWidth - elem.clientWidth;
            deltaHeight = elemCurrentHeight - elem.scrollHeight;

            onlyX = check('x');
            onlyY = check('y');

            minX = parent.clientWidth - elemCurrentWidth + deltaWidth / 2 - EDGE;
            maxX = deltaWidth / 2 + EDGE;
            minY = parent.clientHeight - elemCurrentHeight + deltaHeight / 2 - EDGE;
            maxY = deltaHeight / 2;

            window.addEventListener('mousemove', handleDragging);

            function check(axis) {

                switch (axis) {
                    case 'x':
                        if (elemCurrentHeight < parent.clientHeight) return true;
                        break;
                    case 'y':
                        if (elemCurrentWidth < parent.clientWidth) return true;
                        break;
                    default:
                }

                return false;

            }
        }
        function stopDrag(ev) {

            elem.transforms.x = x;
            elem.transforms.y = y;
            window.removeEventListener('mousemove', handleDragging);

        }
        function handleDragging(ev) {

            const distanceX = Math.round(ev.clientX - mouseDownCoord.x);
            const distanceY = Math.round(ev.clientY - mouseDownCoord.y);

            x = elem.transforms.x + distanceX / elem.transforms.s;
            y = elem.transforms.y + distanceY / elem.transforms.s;

            updateTransform();

        }
        function handleScroll(ev) {

            if (ev.target.closest('.draggable') === elem) {

                const previousScale = elem.transforms.s;

                let direction = 1;
                if (ev.deltaY > 0) direction = -1;

                elem.transforms.s += SCALE_STEP * direction;

                if (elem.transforms.s > MAX_SCALE) {
                    elem.transforms.s = MAX_SCALE;
                } else if (elem.transforms.s < MIN_SCALE) {
                    elem.transforms.s = MIN_SCALE;
                }

                const actualZoomRatio = elem.transforms.s / previousScale;
                if (actualZoomRatio === 1) return;

                const shiftRatio = 1 - actualZoomRatio;

                const cursorDeviationX = ev.clientX - parent.width / 2;
                const cursorDeviationY = ev.clientY - parent.height / 2;

                x = x + cursorDeviationX * shiftRatio;
                y = y + cursorDeviationY * shiftRatio;

                updateTransform();

            }

        }
        function updateTransform() {

            x = x < minX ? minX : x;
            x = x > maxX ? maxX : x;
            y = y < minY ? minY : y;
            y = y > maxY ? maxY : y;

            if (onlyX) y = deltaHeight / 2;
            if (onlyY) x = (parent.clientWidth - elem.clientWidth) / 2;

            elem.style.left = x + 'px';
            elem.style.top = y + 'px';
            elem.style.transform = `scale(${elem.transforms.s})`;

        }
    });

}
function Timer() {

    $$('.timer').forEach(timer => init(timer));

    function init(elem) {

        const countDownDate = new Date(elem.dataset.end).getTime();
        if (isNaN(countDownDate)) return;
        const metronome = setInterval(updateCountdown, 1000);

        function updateCountdown() {

            const now = new Date().getTime();
            const interval = countDownDate - now;

            if (interval < 0) {
                clearInterval(metronome);
                elem.style.visibility = 'hidden';
                return;
            }

            const days = Math.floor(interval / (1000 * 60 * 60 * 24));
            const hours = Math.floor((interval % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((interval % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((interval % (1000 * 60)) / 1000);

            elem.innerHTML = `${days}д ${hours}ч ${minutes}м ${seconds}с`;

        }

    }

}
function Table(target) {

    if (typeof target === 'string' && $(target)) {
        init($(target));
    } else if (typeof target === 'object' && target.isConnected) {
        init(target);
    } else {
        $$('.table').forEach(table => init(table));
    }

    function init(elem) {

        const header = elem.querySelector('.table_header');
        if (!header) return console.info(`${elem.tagName}.${elem.classList} — is not a table`);
        const headerCols = [...header.firstElementChild.children];
        const body = elem.querySelector('.table_body');

        setTimeout(updateWidths, 16);
        watchTableContent(body);
        handleScroll();

        body.parentElement.addEventListener('scroll', handleScroll);

        function watchTableContent(body) {

            const config = {
                childList: true,
                subtree: true,
                characterData: true
            };

            const callback = (mutationsList, observer) => {
                for (const mutation of mutationsList) {

                    switch (mutation.type) {
                        case 'childList':
                        case 'characterData':
                            return updateWidths();
                    }

                }
            };

            const observer = new MutationObserver(callback);
            observer.observe(body, config);

        }
        function updateWidths() {

            const row = body.querySelector('.tr');
            let cols = [];

            [...row.children].forEach(col => cols.push(col));

            headerCols.forEach((title, i) => {

                if (title.dataset.width) {
                    const w = title.dataset.width / row.clientWidth * 100;
                    title.style.width = `${w}%`;
                    cols[i].style.width = `${w}%`;
                } else {
                    title.style.width = cols[i].offsetWidth / row.clientWidth * 100 + '%';
                }

            });

            if (elem.children[1].classList.contains('scroll_js')) {
                header.style.paddingRight = `12px`;
                elem.classList.add('table_scroll_active');
            }

        }
        function handleScroll(ev) {

            const shadowsElem = body.closest('.panel_content');
            const maxScroll = body.scrollHeight - shadowsElem.offsetHeight;
            const shadowTreshold = 10; // px

            if (body.parentElement.scrollTop < shadowTreshold) {
                shadowsElem.classList.remove('has_shadow_top');
            } else {
                shadowsElem.classList.add('has_shadow_top');
            }

            if (body.parentElement.scrollTop > maxScroll - shadowTreshold) {
                shadowsElem.classList.remove('has_shadow_bottom');
            } else {
                shadowsElem.classList.add('has_shadow_bottom');
            }

        }
    }
}
function Checkbox(el) {

    if (el) {
        initComponent(el);
    } else {
        const els = $$('.checkbox');
        if (!els.length) return false;
        els.forEach(el => initComponent(el));
    }

    function initComponent(el) {

        el.querySelector('input').onchange = ev => {
            if (el.dataset.url) fetch(el.dataset.url);
        }

    }

}

function initSelectElements() {

    let sel = [];
    const selects = $$('.select');
    selects.forEach(select => sel.push(new Select(select)));

}
function getCoordinates(element) {

    const target = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    const top = scrollTop + target.top;
    const left = scrollLeft + target.left;

    return { top: Math.round(top), left: Math.round(left) };

}
function $(selector) {
    return document.querySelector(selector);
}
function $$(selector) {
    return document.querySelectorAll(selector);
}
function animate(elem, options) {

    const { prop, start, end, duration } = options;

    let animationStartTime;

    animationStartTime = performance.now();
    requestAnimationFrame(updateValue);


    function updateValue(time) {

        const msPassed = time - animationStartTime;
        let progress = ease.easeOutQuart(msPassed / duration);
        if (msPassed > duration) progress = 1;


        switch (prop) {
            case 'scroll-x':
                const value = (end - start) * progress + start;
                elem.scroll(value, 0);
                break;
            default:

        }

        if (progress < 1) requestAnimationFrame(updateValue);

    }

    const ease = {
        easeInOutQuart: x => {
            return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
        },
        easeOutQuart: x => {
            return 1 - Math.pow(1 - x, 4);
        },
        easeOutBack: x => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
        },
        easeOutElastic: x => {
            const c4 = (2 * Math.PI) / 3;
            return x === 0
                ? 0
                : x === 1
                    ? 1
                    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
        },
    };
}
