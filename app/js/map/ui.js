window.ui = {};
window.ui.modes = new Modes('.panel_game_modes');
window.ui.city = new City('.panel_town');
window.ui.aside = new Aside('.panel_sidebar');
window.ui.bottom = new Bottom('.panel_army');

new CustomScroll();
new CustomAccordion();
new Tabs();

function Modes(selector) {
    const elem = $(selector);
    if (!elem) return;
    const list = elem.querySelector('.panel_holder');
    const buttons = Array.from(list.children);

    buttons.forEach(btn => {
        btn.onclick = () => {
            map.mode(btn.name);
            buttons.forEach(btn => btn.classList.remove('active'));
            btn.classList.add('active');
        }

    });
}
function City(selector) {

    const elem = $(selector);
    if (!elem) return;
    const currentCityNameContainer = elem.querySelector('.panel_holder > .part_txt');
    const currentCityName = currentCityNameContainer.querySelector('h3');

    enableRenaming(currentCityName);
    watchTextSize();

    function watchTextSize() {

        const initialStyles = getComputedStyle(currentCityName);
        const initialFontSize = initialStyles.fontSize;
        const initialMaxWidth = initialStyles.maxWidth;

        let minified = false;
        let previousStringLength = currentCityName.innerText.length;

        const titleWidth = currentCityName.getBoundingClientRect().width;
        const containerWidth = currentCityNameContainer.getBoundingClientRect().width;
        sizeSolver(titleWidth, containerWidth);

        currentCityName.addEventListener('input', () => {

            const titleWidth = currentCityName.getBoundingClientRect().width;
            const containerWidth = currentCityNameContainer.getBoundingClientRect().width;
            const newStringLength = currentCityName.innerText.length;

            if ((!minified && newStringLength > previousStringLength) || (minified && newStringLength < previousStringLength)) {
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

}
function Aside(selector) {

    const elem = $(selector);
    if (!elem) return;
    const closeBtn = elem.querySelector('.close_btn');
    const container = $('div#field_map');

    if (closeBtn) closeBtn.onclick = close;

    container.addEventListener('map:click:left:response', mapClickSolver);

    this.close = close;

    function close() {

        elem.style.display = 'none';

    }
    function mapClickSolver(event) {

        console.log(JSON.parse(event.detail));

    }


}
function Bottom(selector) {

    const elem = $(selector);
    if (!elem) return;
    const panelname = elem.querySelector('#paneltitle');

    enableRenaming(panelname);

}

/* Utilities ------------------------------------------- */
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

        content = scroll.querySelector('.panel_content'),
            contentScroll = scroll.querySelector('.content_scroll'),
            scrollBar = scroll.querySelector('.scrollbar'),
            bar = scroll.querySelector('.bar'),
            thumb = scroll.querySelector('.handler'),
            up = scroll.querySelector('.arrow_prev'),
            down = scroll.querySelector('.arrow_next');

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
        }

        contentScroll.onmouseover = () => contentScroll.addEventListener('scroll', onScrollMove);

        function onScrollMove(e) {
            const maxContentScroll = contentScroll.scrollHeight - content.scrollHeight;
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
        }

        down.onclick = (e) => {
            e.preventDefault();

            contentScroll.removeEventListener('scroll', onScrollMove);

            moveY = moveY + 10;
            moveScroll(e);
        }

        moveScroll = function(e) {
            e.preventDefault();

            let end = bar.offsetHeight - thumb.offsetHeight;

            if (moveY <= 0) moveY = 0;
            if (moveY >= end) moveY = end;

            let handPos = moveY / end;
            let scrollAmout = (contentScroll.scrollHeight - bar.offsetHeight) * handPos;

            thumb.style.top = moveY + 'px';
            contentScroll.scrollTo(0, scrollAmout);
        }
    }

    const resizeObserver = new ResizeObserver(entries => {

        for (const element of entries) {

            const elem = element.target;
            const panel_holder = elem.closest('.panel_holder');

            if (elem.classList.contains('content_scroll')) {
                if (element.target.scrollHeight > element.target.parentElement.offsetHeight) {
                    start(panel_holder);
                } else {
                    panel_holder.classList.remove('scroll_js');
                }
            } else if (elem.classList.contains('panel_content')) {
                if (element.contentRect.height < elem.querySelector('.content_scroll').scrollHeight) {
                    start(panel_holder);
                } else {
                    panel_holder.classList.remove('scroll_js');
                }
            }

        }

    });

    scrolls.forEach(scroll => {
        const panel_content = scroll.querySelector('.panel_content');

        if (panel_content) {
            const content_scroll = scroll.querySelector('.content_scroll');

            resizeObserver.observe(content_scroll);
            resizeObserver.observe(panel_content);
        }
    });
}
function CustomAccordion() {
    let acc = $$('.section_accordion');
    for (i = 0; i < acc.length; i++) {
        acc[i].lastElementChild.addEventListener("click", function() {
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
            };
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
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                if (res.ok) {
                    res.json().then(res => {
                        console.log(res);
                    });
                } else {
                    res.json().then(res => {
                        console.log(res);
                    });
                }
            });

    }

}
function Tabs() {

    const allTabs = $$('.tabs');

    allTabs.forEach(tab => new Tab(tab));

    function Tab(elem) {

        const navTabs = elem.children[0].firstElementChild.children;
        const content = elem.children[1];

        [...navTabs].forEach(tab => {
            tab.onclick = ev => {
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
            }
        });

    }

}

function $(selector) {
    return document.querySelector(selector);
}
function $$(selector) {
    return document.querySelectorAll(selector);
}
