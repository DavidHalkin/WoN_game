window.ui = {};
window.ui.aside = new Aside('.panel_sidebar');

new CustomScroll();
new CustomAccordion();

/* MODES
------------------------------------------- */
function Aside(selector) {

    const panel = $(selector);
    const mapObjects = document.querySelector('#map_objects').children;
    const toggleMountains = document.querySelector('.toggle.mountains_area input');

    const _ = this;
    this.active_object = undefined;

    [...mapObjects].forEach(item => {
        if (item.classList.contains('radio')) {
            item.querySelector('input').onclick = e => {
                _.active_object = e.target.id;
            }
        }
    });

    toggleMountains.onchange = () => {
        map.toggle_mountains_area(toggleMountains.checked)
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
