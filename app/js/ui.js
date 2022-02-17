window.ui = {};
window.ui.modes = new Modes('.panel_game_modes');
window.ui.city = new City('.panel_town > .panel > .panel_holder > .part_txt');
window.ui.customScroll = new CustomScroll();

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
    const part_txt = $(selector);    
    const h3 = part_txt.querySelector('h3');
    const link = h3.querySelector('a');

    if (link.offsetWidth > h3.offsetWidth) {
        h3.style.fontSize = '16px';
    }     
}

/* CUSTOM SCROLL
------------------------------------------- */
function CustomScroll() {
    const _this = this;
    const scrolls = document.querySelectorAll('.panel_holder');

    this.content = null;
    this.contentScroll = null;
    this.scrollBar = null;
    this.bar = null;
    this.thumb = null;
    this.up = null;
    this.down = null;
    this.moveY = 0;

    this.init = function(scroll) {
        scroll.classList.add('scroll_js');

        this.content = scroll.querySelector('.panel_content'),
        this.contentScroll = scroll.querySelector('.content_scroll'),
        this.scrollBar = scroll.querySelector('.scrollbar'),
        this.bar = scroll.querySelector('.bar'),
        this.thumb = scroll.querySelector('.handler'),
        this.up = scroll.querySelector('.arrow_prev'),
        this.down = scroll.querySelector('.arrow_next');

        this.thumb.style.transition = 'none';

        this.thumb.onmousedown = (e) => {
            e.preventDefault();

            this.contentScroll.removeEventListener('scroll', onScrollMove);

            let shiftY = e.clientY - _this.thumb.getBoundingClientRect().top;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            function onMouseMove(e) {                
                _this.moveY = e.clientY - shiftY - _this.bar.getBoundingClientRect().top;
                _this.moveScroll(e);
            }

            function onMouseUp() {
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('mousemove', onMouseMove);
            }
        }

        this.contentScroll.onmouseover = () => this.contentScroll.addEventListener('scroll', onScrollMove);
        
        function onScrollMove(e) {
            const maxContentScroll = _this.contentScroll.scrollHeight - _this.content.scrollHeight;
            const maxThumbScroll = _this.bar.offsetHeight - _this.thumb.offsetHeight;

            const ratio = e.target.scrollTop / maxContentScroll;
            let thumbScroll = maxThumbScroll * ratio;

            if (thumbScroll >= maxThumbScroll) thumbScroll = maxThumbScroll;

            _this.moveY = thumbScroll;
            _this.thumb.style.top = `${thumbScroll}px`;
        }

        this.up.onclick = (e) => {
            e.preventDefault();

            this.contentScroll.removeEventListener('scroll', onScrollMove);

            _this.moveY = _this.moveY - 10;
            _this.moveScroll(e);
        }

        this.down.onclick = (e) => {
            e.preventDefault();

            this.contentScroll.removeEventListener('scroll', onScrollMove);

            _this.moveY = _this.moveY + 10;
            _this.moveScroll(e);
        }
    }

    this.moveScroll = function(e) {
        e.preventDefault();

        let end = this.bar.offsetHeight - this.thumb.offsetHeight;  

        if (this.moveY <= 0) this.moveY = 0;
        if (this.moveY >= end) this.moveY = end; 

        let handPos = this.moveY / end;
        let scrollAmout = (this.contentScroll.scrollHeight - this.bar.offsetHeight)*handPos;

        this.thumb.style.top = this.moveY + 'px';
        this.contentScroll.scrollTo(0, scrollAmout);
    }

    scrolls.forEach(scroll => {
        const panel_content = scroll.querySelector('.panel_content');

        if (panel_content != null) {
            const content_scroll = scroll.querySelector('.content_scroll');

            if (content_scroll.offsetHeight > panel_content.offsetHeight) {
                _this.init(scroll);
            }
        }        
    });

    window.onresize = () => {
        scrolls.forEach(scroll => {
            const panel_content = scroll.querySelector('.panel_content');

            if (panel_content != null) {
                const content_scroll = scroll.querySelector('.content_scroll');

                if (content_scroll.offsetHeight > panel_content.offsetHeight) {
                    _this.init(scroll);
                }
            }        
        });
    }
}

function $(selector) {
    return document.querySelector(selector);
}
