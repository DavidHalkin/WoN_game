window.ui = {};
window.ui.modes = new Modes('.panel_game_modes');
window.ui.city = new City('.panel_town');
window.ui.aside = new Aside('.panel_sidebar');
window.ui.bottom = new Bottom('.panel_army');

new CustomScroll();
new CustomAccordion();
new Tabs();
new Slider('.test');

let cityClickJson, cityBuildJson, cityInfoJson;



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

  if (closeBtn) closeBtn.onclick = close;

  container.addEventListener('map:click:left:response', mapClickSolver);

  this.close = close;

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

  function mapClickSolver(event) {
    const elemStyles = window.getComputedStyle(elem);
    if (elem.style.display == 'none' || elemStyles.getPropertyValue('display')) {
      open();
    }
    asideHistory.clear();
    // cityClickJson, cityBuildJson, cityInfoJson;
    // console.log(JSON.parse(event.detail).info);
    // buildAsideDom(cityInfoJson.info);
    buildAsideDom(JSON.parse(event.detail).info);
  }

  function buildAsideDom(structure, isPushHistory = true) {
    const asideContinerEl = document.querySelector(
      '.panel_sidebar .content_scroll'
    );

    if (isPushHistory) asideHistory.addRecord(structure);

    asideContinerEl.innerHTML = '';
    for (let rootEl of structure) {
      asideContinerEl.insertAdjacentElement(
        'beforeend',
        _getComponentDom(rootEl)
      );
    }
  }

  function _getComponentDom(component) {
    let debug = true;
    let el = document.createElement('div');
    let childs = [];
    let parentForChildsEl = el;

    if (debug) {
      if (component.icon && !component.icon.includes('https')) {
        component.icon = 'https://game.wealthofnations.uk' + component.icon;
      }

      if (component.url && !component.url != 'https://') {
        component.url = 'https://game.wealthofnations.uk' + component.url;
      }
    }

    // Component DOM
    switch (component.type) {
      case 'tabs':
        el.classList.add('tabs');

        el.innerHTML = `
          <div class="tab_nav">
            <ul class="list-unstyled d-flex"></ul>
          </div>
          <div class="tab_content"></div>
        `;

        for (let [index, tab] of component.tabs.entries()) {
          const navEl = document.createElement('li');
          if (index == 0) navEl.classList.add('active');

          navEl.innerHTML = `
            <a href="#t${index}">
              <span class="link_holder">${tab.name}</span>
            </a>
          `;

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
        }

        new Tabs(el);

        break;

      case 'tab':
        childs = component.content;
        el.classList.add('tab');
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

        el.classList.add(...classList);

        el.innerHTML = `
          <label>${component.label}</label>
          <a href="${
            component.url ? component.url : '#'
          }" class="item_ico size_1"><img src="${component.icon}" alt=""></a>
          <div class="mini_holder">
            <input type="text" name='${component.name}' value="${
          component.value
        }" ${!component.editable ? 'disabled' : ''}>
          </div>
        `;

        if (!component.icon) {
          el.querySelector('.item_icon').remove();
        }

        break;

      case 'property':
        childs = component.production ? component.production : [];
        el.classList.add('property', 'fold_js');

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

        if (component.label || component.value)
          el.classList.add('has_mini_info');

        el.innerHTML = `
          <div class="mini_info mb-20">
            <label>${component.label}</label>
            <div class="mini_holder">
              <input type="text" name='${component.name}' value="${component.value}">
            </div>
          </div>
          <div class="slider_holder">
            <div class="decor_slider slider_prev"></div>
            <div class="slider_bar">
              <div class="slider_progress" style="width:50%;">
                <div class="handler"></div>
              </div>
            </div>
            <div class="decor_slider slider_next"></div>
          </div>
        `;

        break;

      case 'checkbox':
        el.classList.add('checkbox', 'py-10');

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

        el.innerHTML = `
          <img src="${component.icon}" alt="">
        `;

        break;

      case 'button':
        el = document.createElement('a');
        el.classList.add('btn');
        el.href = component.url;

        el.innerHTML = `
          <span>${component.name}</span>
        `;

        break;

      case 'text':
        el.classList.add('py-10');
        el.innerHTML = component.content;

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
      el.addEventListener('click', async function (e) {
        e.preventDefault();
        let data = cityInfoJson.info;

        if (location.hostname !== 'localhost') {
          const res = await fetch(component.url);
          data = await res.json();
          console.log(data);
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
DomHistory.prototype.addRecord = function (json) {
  this.history.push(json);
};
DomHistory.prototype.removeRecord = function () {
  this.history.pop();
};
DomHistory.prototype.clear = function () {
  this.history = [];
};
function CustomScroll() {
  const scrolls = document.querySelectorAll('.panel_holder');

  let content = null;
  let contentScroll = null;
  let bar = null;
  let thumb = null;
  let up = null;
  let down = null;
  let moveY = 0;

  function start(scroll) {
    scroll.classList.add('scroll_js');

    (content = scroll.querySelector('.panel_content')),
      (contentScroll = scroll.querySelector('.content_scroll')),
      (scrollBar = scroll.querySelector('.scrollbar')),
      (bar = scroll.querySelector('.bar')),
      (thumb = scroll.querySelector('.handler')),
      (up = scroll.querySelector('.arrow_prev')),
      (down = scroll.querySelector('.arrow_next'));

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

    contentScroll.onmouseover = () =>
      contentScroll.addEventListener('scroll', onScrollMove);

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

    moveScroll = function (e) {
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
  }

  const resizeObserver = new ResizeObserver((entries) => {
    for (const element of entries) {
      const elem = element.target;
      const panel_holder = elem.closest('.panel_holder');

      if (elem.classList.contains('content_scroll')) {
        if (
          element.target.scrollHeight >
          element.target.parentElement.offsetHeight
        ) {
          start(panel_holder);
        } else {
          panel_holder.classList.remove('scroll_js');
        }
      } else if (elem.classList.contains('panel_content')) {
        if (
          element.contentRect.height <
          elem.querySelector('.content_scroll').scrollHeight
        ) {
          start(panel_holder);
        } else {
          panel_holder.classList.remove('scroll_js');
        }
      }
    }
  });

  scrolls.forEach((scroll) => {
    const panel_content = scroll.querySelector('.panel_content');

    if (panel_content) {
      const content_scroll = scroll.querySelector('.content_scroll');
      if (!content_scroll) return;

      resizeObserver.observe(content_scroll);
      resizeObserver.observe(panel_content);
    }
  });
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
    el.lastElementChild.addEventListener('click', function () {
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
function Tabs(element) {
  if (element) {
    new Tab(element);
    return;
  }

  const allTabs = $$('.tabs');

  allTabs.forEach((tab) => new Tab(tab));

  function Tab(elem) {
    const navTabs = elem.children[0].firstElementChild.children;
    const content = elem.children[1];

    [...navTabs].forEach((tab) => {
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
function Slider(selector) {

    const sliders = $$(selector);
    if (sliders.length > 0) initSliders();

    function initSliders() {

        sliders.forEach(slider => {

            const input = slider.querySelector('input[type="range"]');
            const info = slider.querySelector('.info');

            input.addEventListener('input', () => {
                input.style.setProperty('--val', input.value);
                info.value = input.value;
            });

        });

    }

}
function $(selector) {
  return document.querySelector(selector);
}
function $$(selector) {
  return document.querySelectorAll(selector);
}
