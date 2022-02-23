window.ui = {};
window.ui.modes = new Modes('.panel_game_modes');
window.ui.city = new City('.panel_town');

new CustomScroll();
new CustomAccordion();

/* MODES
------------------------------------------- */
function Modes(selector) {
    const elem = $(selector);
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

/* PANEL CITY
------------------------------------------- */
function City(selector) {
    const elem = $(selector);

    sizeTextCity();

    function sizeTextCity() {
        const part_txt = elem.querySelector('.panel > .panel_holder > .part_txt');
        const h3 = part_txt.querySelector('h3');

        if (h3.offsetWidth > part_txt.offsetWidth) {
            h3.style.fontSize = '16px';
        }
    }
}

/* CUSTOM SCROLL
------------------------------------------- */
function CustomScroll() {
    const scrolls = document.querySelectorAll('.panel_holder');

    let content = null;
    let contentScroll = null;
    let scrollBar = null;
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
            let scrollAmout = (contentScroll.scrollHeight - bar.offsetHeight)*handPos;

            thumb.style.top = moveY + 'px';
            contentScroll.scrollTo(0, scrollAmout);
        }
    }

    const resizeObserver = new ResizeObserver(entries => {
        let content_scroll = entries[0].target.closest('.panel_holder');
        let panel_content = entries[1].target;

        if (entries[0].contentRect.height > panel_content.offsetHeight) {
            start(content_scroll);
        } else {
            content_scroll.classlist.remove('scroll_js');
        }   

        console.log(content_scroll.offsetHeight, panel_content.offsetHeight, entries);
    });

    scrolls.forEach(scroll => {
        const panel_content = scroll.querySelector('.panel_content');

        if (panel_content != null) {
            const content_scroll = scroll.querySelector('.content_scroll');

            resizeObserver.observe(content_scroll);
            resizeObserver.observe(panel_content);
        }
    });
}

/* CUSTOM ACCORDION
------------------------------------------- */
function CustomAccordion() {
    let acc = $$('.section_accordion');
    for (i = 0; i < acc.length; i++) {
        acc[i].lastElementChild.addEventListener("click", function() {
            this.parentNode.firstElementChild.classList.toggle('closed');
        });
    }
}

function $(selector) {
    return document.querySelector(selector);
}
function $$(selector) {
    return document.querySelectorAll(selector);
}
