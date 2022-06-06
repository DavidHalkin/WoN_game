const mapType = $('#field_map') ?.dataset ?.map;

window.ui = {};
window.ui.modes = new Modes('.panel_game_modes');
window.ui.city = new City('.panel_town');
window.ui.aside = new Aside('.panel_sidebar');
window.ui.bottom = new Bottom('.panel_army');

initAll();

let cityClickJson, cityBuildJson, cityInfoJson, cityData;

if (location.hostname == 'localhost') {
    const assets = [
        fetch('/js/map/examples/city_click.json'),
        fetch('/js/map/examples/city_info.json'),
        fetch('/js/map/examples/city_build.json'),
        fetch('/js/map/examples/city.json')
    ];

    Promise.all(assets).then((results) => {
        results.forEach((res) => {
            res.json().then((data) => {
                if (data.city_header) cityClickJson = data;
                if (data.info) cityInfoJson = data;
                if (data.buildings) cityBuildJson = data;
                if (data.map === 'city') {
                    cityData = data;
                    if (mapType === 'city') ui.aside.load_city(cityData);
                }
            });
        });
    });
}

function initAll() {

    new CustomScroll();
    new CustomAccordion();
    new Slider();
    new Tabs();
    new ToolTips();
    new Draggables();
    new Timer();
    initSelectElements();

}

function Modes(selector) {
    const elem = $(selector);
    if (!elem) return;
    const list = elem.querySelector('.panel_holder');
    const buttons = Array.from(list.children);

    this.activate = activateButton;

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

    enableRenaming(currentCityName);
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
        ev.preventDefault();
        const city = ev.target.closest('a').dataset;
        map.viewport.go_to_hex(city.x, city.y);
    }
}
function Aside(selector) {
    const elem = $(selector);
    if (!elem) return;

    const asideHistory = new DomHistory();
    const closeBtn = elem.querySelector('.close_btn');
    const container = $('div#field_map');
    let mapData;

    if (closeBtn) closeBtn.onclick = close;

    container.addEventListener('map:click:left:response', mapClickSolver);

    if (mapType === 'city' && location.hostname !== 'localhost') loadCity();

    this.elem = elem;
    this.close = close;
    this.load_city = loadCity;

    function close() {
        asideHistory.removeRecord();
        const { history } = asideHistory;

        if (history.length) {
            buildAsideDom(history[history.length - 1], false);
        } else {
            elem.style.display = 'none';
        }
    }

    function open() {
        elem.style.display = 'block';
    }
    function loadCity(cityData) {

        if (cityData) {

            mapClickSolver();

        } else {

            // if ()

            fetch(`/ajax?do=city_info&c=city&city_id=745`)
                .then(res => {
                    if (res.ok) {
                        res.json().then(res => {
                            mapData = res;
                            console.log(mapData);
                            mapClickSolver();
                        });
                    } else {
                        res.json().then(res => console.log(res));
                    }
                });

        }

    }
    function mapClickSolver(event) {
        const elemStyles = window.getComputedStyle(elem);
        if (
            elem.style.display == 'none' ||
            elemStyles.getPropertyValue('display')
        ) {
            open();
        }
        asideHistory.clear();
        // cityClickJson, cityBuildJson, cityInfoJson;
        // console.log(JSON.parse(event.detail).info);
        // buildAsideDom(cityInfoJson.info);
        if (location.hostname == 'localhost') {
            switch (mapType) {
                case 'city':
                    buildAsideDom(cityData);
                    break;
                default:
                    buildAsideDom(cityClickJson);
            }
        } else {
            switch (mapType) {
                case 'city':
                    buildAsideDom(mapData);
                    break;
                default:
                    buildAsideDom(JSON.parse(event.detail));
            }
        }
    }
    function buildAsideDom(structureJson, isPushHistory = true) {
        console.log('structure', structureJson);
        const asideBody = structureJson.info;
        const asideHeader = structureJson['city_header'];

        // Add Structure to History
        if (isPushHistory) asideHistory.addRecord(structureJson);

        // Build Aside Header
        _buildAsideHeader(asideHeader);

        // Build Aside Body
        if (Array.isArray(asideBody) && asideBody.length) {
            _buildAsideBody(asideBody);
        } else {
            console.log('BodyStructure: isArray - false');
        }
    }
    function _buildAsideBody(structure) {
        const asideContinerEl = document.querySelector(
            '.panel_sidebar .content_scroll'
        );

        asideContinerEl.innerHTML = '';

        for (let rootEl of structure) {
            asideContinerEl.insertAdjacentElement(
                'beforeend',
                _getComponentDom(rootEl)
            );
        }
    }
    function _buildAsideHeader(structure) {
        let sidebarlHeaderEl = document.querySelector(
            '.panel_sidebar .panel_header'
        );

        if (sidebarlHeaderEl) sidebarlHeaderEl.remove();

        if (!structure) {
            console.log('Aside header has not been found');
            return false;
        }

        const { flag, character } = structure;

        sidebarlHeaderEl = `
            <div class="panel_header py-10">
                <div class="d-flex align-items-center">
                    <div class="pr-25">
                        <a href="${character.url}" class="circle emblem size_2 size_xl_4 d-block my-4"><img src="${character.image}" alt=""></a>
                        <a href="${flag.url}" class="circle emblem size_2 size_xl_4 d-block my-4"><img src="${flag.image}" alt=""></a>
                    </div>
                    <h3 class="mb-0 fz_25 font-weight-normal">Lorem ipsum dolor sit, amet consectetur</h3>
                </div>
                <div class="decor">
                    <span class="corner"></span>
                    <span class="corner right_top"></span>
                    <span class="corner right_bottom"></span>
                    <span class="corner left_bottom"></span>
                </div>
            </div>`;

        document
            .querySelector('.panel_sidebar .panel_holder')
            .insertAdjacentHTML('afterbegin', sidebarlHeaderEl);
    }
    function _getComponentDom(component) {
        let el = document.createElement('div');
        let childs = [];
        let parentForChildsEl = el;

        // Component DOM
        switch (component.type) {
            case 'tabs':
                el.classList.add('tabs', 'grid_column');
                addClasses(el, component.classNames);

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
                    if (index == 0) navEl.classList.add('active');

                    navEl.innerHTML = `
                        <a href="#t${index}">
                            <span class="link_holder">${tab.name}</span>
                        </a>`;

                    if (tab.icon && tab.icon != 'https://') {
                        navEl.querySelector(
                            '.link_holder'
                        ).innerHTML = `<img src='${tab.icon}'>`;
                    }

                    const tabEl = document.createElement('div');
                    tabEl.classList.add('tab_pane');
                    tabEl.id = 't' + index;

                    if (index == 0) tabEl.classList.add('active');
                    _recursiveBuildDom(tabEl, tab.content);

                    el.querySelector('.list-unstyled').insertAdjacentElement(
                        'beforeend',
                        navEl
                    );
                    el.querySelector('.tab_content').insertAdjacentElement(
                        'beforeend',
                        tabEl
                    );

                    setTimeout(() => {
                        new CustomScroll('.panel_sidebar');
                    }, 16);
                }

                new Tabs(el);

                setTimeout(() => {

                    const panel = $('.panel_sidebar > .panel_holder > .panel_content');
                    const panelHeight = panel.getBoundingClientRect().height;

                    const panelStyles = window.getComputedStyle(panel);
                    const paddingTop = panelStyles.getPropertyValue('padding-top');
                    const paddingTopNumber = parseFloat(paddingTop);

                    const tabsPanelHolder = el.querySelector('.panel_holder');
                    const tabNavHeight = tabsPanelHolder.offsetTop;
                    const contentHeight = panelHeight - tabNavHeight - paddingTopNumber;
                    tabsPanelHolder.style.maxHeight = contentHeight + 'px';

                }, 16);

                break;

            case 'tab':
                childs = component.content;
                el.classList.add('tab');
                addClasses(el, component.classNames);
                el.innerHTML = component.name;

                if (component.icon && component.icon != 'https://') {
                    el.insertAdjacentHTML('afterbegin', `<img src='${component.icon}'>`);
                }
                break;

            case 'section':
                childs = component.components;

                el.classList.add(
                    'section_accordion',
                    'd-flex',
                    'pt-10',
                    'align-items-start',
                    'closed'
                );
                addClasses(el, component.classNames);

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
                const classList = ['mini_info', 'mb-20'];
                if (component.label) classList.push('label');

                el.classList.add('col_item');

                el.innerHTML = `
                    <div>
                        <label>${component.label}</label>
                        <a href="${
                    component.url ? component.url : '#'
                    }" class="item_ico size_1"><img src="${component.icon}" alt=""></a>
                        <div class="mini_holder">
                          <input type="text" name='${component.name}' value="${
                    component.value
                    }" ${!component.editable ? 'disabled' : ''}>
                        </div>
                    </div>
                    `;

                el.firstElementChild.classList.add(...classList);
                addClasses(el.firstElementChild, component.classNames);

                if (!component.icon && el.querySelector('.item_icon')) {
                    el.querySelector('.item_icon').remove();
                }

                break;

            case 'property':
                childs = component.production ? component.production : [];
                el.classList.add('property', 'fold_js');
                addClasses(el, component.classNames);

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
                    <a href="#" class="item_ico size_1"><img src="/images/map/circles/example.png" alt=""></a>
                    <div class="mini_holder">
                      <input type="text" value="${component.amount}" disabled>
                    </div>
                  </div>
                </div>
                <div class="column">
                  <div class="mini_info mini_info_square">
                    <label>.label in parent</label>
                    <a href="#" class="item_ico size_1"><img src="/images/map/circles/example.png" alt=""></a>
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
                el.classList.add('slider', 'my-30');
                addClasses(el, component.classNames);

                if (component.label || component.value)
                    el.classList.add('has_mini_info');

                el.innerHTML = `
          <div class="mini_info mb-20">
            <label>${component.label}</label>
            <div class="mini_holder">
                <input type="text" name='${component.name}' value="${component.value}" class="info">
            </div>
          </div>
          <div class="range_slider">
            <input type="range" name="styled-range" min="${component.min}" max="${component.max}" value="${component.value}" step="5" list="styled-range-list" class="range--progress" style="--min: ${component.min}; --max: ${component.max}; --val: 75">
            <div class="filled" style="width: calc(42.7704% + -3px);"></div>
          </div>
        `;

                new Slider(el);

                break;

            case 'checkbox':
                el.classList.add('checkbox', 'py-10');
                addClasses(el, component.classNames);

                if (!component.label) el.classList.add('checkbox_no_label');

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

                break;

            case 'icon':
                if (component.url) {
                    el = document.createElement('a');
                    el.href = component.url;
                }

                el.classList.add('size_5', component.round ? 'circle' : 'square');
                addClasses(el, component.classNames);

                el.innerHTML = `
          <img src="${component.icon}" alt="">
        `;

                break;

            case 'button':
                el = document.createElement('a');
                el.classList.add('btn');
                addClasses(el, component.classNames);
                el.href = component.url;

                el.innerHTML = `
          <span>${component.name}</span>
        `;

                break;

            case 'text':
                el.classList.add('py-10');
                addClasses(el, component.classNames);
                el.innerHTML = component.content;

                break;

            case 'icon_list':
                childs = component.components;
                el.classList.add('icon_list');
                addClasses(el, component.classNames);

                break;

            case 'color':
                addClasses(el, ['color_picker']);
                el.innerHTML = `<input type="color">`;

                break;
            default:
                el.classList.add(component.type);
                break;
        }

        // Build Childs Components
        if (childs) {
            if (!Array.isArray(childs)) {
                childs = Object.entries(childs).map((item) => item[1]);
            }

            if (childs.length) _recursiveBuildDom(parentForChildsEl, childs);
        }

        // Add Ajax listener
        if (component.url && component.ajax) {
            el.addEventListener('click', async function(e) {
                e.preventDefault();
                let data;

                const url = component.url;
                if (component.redirect) return window.location.replace(url);

                if (location.hostname !== 'localhost') {

                    const res = await fetch();
                    data = await res.json();
                    console.log('ajax response:', data);

                } else if (cityInfoJson) {
                    data = cityInfoJson;
                } else {
                    console.log('Something wrong: incorect data');
                }

                buildAsideDom(data);
            });
        }

        return el;
    }
    function _recursiveBuildDom(parent, childs) {
        for (let childComponent of childs) {
            parent.insertAdjacentElement(
                'beforeend',
                _getComponentDom(childComponent)
            );
        }
    }
    function addClasses(elem, array) {

        if (array) elem.classList.add(...array);

    }
}
function Bottom(selector) {
    const elem = $(selector);
    if (!elem) return;
    const panelname = elem.querySelector('#paneltitle');

    enableRenaming(panelname);
}

/* Utilities ------------------------------------------- */
function DomHistory() {
    this.history = [];
}
DomHistory.prototype.addRecord = function(json) {
    this.history.push(json);
};
DomHistory.prototype.removeRecord = function() {
    this.history.pop();
};
DomHistory.prototype.clear = function() {
    this.history = [];
};

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
function enableRenaming(element) {
    const MAX_LENGTH = 32;

    let object = element.dataset.object;
    let id = element.dataset.id;
    let text = element.innerText;

    element.contentEditable = true;
    element.addEventListener('keydown', handleUpdate);
    element.addEventListener('keyup', handleUpdate);
    element.addEventListener('blur', handleUpdate);

    function handleUpdate(e) {
        if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.type === 'blur') {
            e.preventDefault();
            const newText = element.innerText;

            if (newText === '') {
                element.innerText = text;
                return;
            }
            if (newText === text) return;

            if (textValid(newText)) {
                sendNewText(newText);
                text = newText;
            }
        } else if (element.innerText.length > MAX_LENGTH) {
            e.preventDefault();
            element.innerText = element.innerText.slice(0, MAX_LENGTH);
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

        input.oninput = update;
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
        const navTabs = elem.children[0].firstElementChild.firstElementChild.children;
        const content = elem.children[1].querySelector('.panel_content > div > .tab_content');

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
            };
        });
    }
}
function ToolTips() {

    const TIP_WINDOW_WIDTH = 320;
    const TIP_WINDOW_MARGIN = 0;
    const tipWindow = document.querySelector('.tooltip');
    if (!tipWindow) return;

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

                    if (!thisTipData) {
                        thisTipData = 'Error: there is no text for this tooltip. Please, notify us.';
                    }

                    container.innerHTML = thisTipData;
                    positionTip(elem);
                    revealTip();

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
function Select(elem) {

    const header = elem.querySelector('.select_header');
    const dropdown = elem.querySelector('.drop_down');

    const _ = this;
    this.elem = elem;
    this.value = elem.dataset.value;
    this.set_value = setValue;
    this.toggle = toggle;

    header.onclick = toggle;
    setValue();
    initClicks();
    observeMutation();

    function setValue(val) {

        if (val) {
            _.value = val;
            elem.dataset.value = val;
        } else {
            _.value = elem.dataset.value;
        }

        const title = header.querySelector('.panel_holder span');
        let selectedLi = dropdown.querySelector(`li[data-value="${_.value}"]`);
        if (!selectedLi) selectedLi = dropdown.querySelector('li:first-child');
        if (!selectedLi) return;

        title.innerHTML = selectedLi.querySelector('span').innerHTML;
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

    const SCALE_STEP = 0.1;
    const MAX_SCALE = 1.5;
    const MIN_SCALE = 0.25;

    const draggableEls = $$('.draggable');
    let mouseDownCoord, x, y;

    [...draggableEls].forEach(elem => {

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

            window.addEventListener('mousemove', handleDragging);
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
                const parent = elem.closest('.content_scroll').getBoundingClientRect();

                const cursorDeviationX = ev.clientX - parent.width / 2;
                const cursorDeviationY = ev.clientY - parent.height / 2;

                x = x + cursorDeviationX * shiftRatio;
                y = y + cursorDeviationY * shiftRatio;

                updateTransform();

            }

        }
        function updateTransform() {

            if (x && y) {
                elem.style.transform = `scale3d(${elem.transforms.s}, ${elem.transforms.s}, 1) translate3d(${x}px, ${y}px, 0)`;
            } else {
                elem.style.transform = `scale3d(${elem.transforms.s}, ${elem.transforms.s}, 1)`;
            }

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
    			timer.style.visibility = 'hidden';
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
