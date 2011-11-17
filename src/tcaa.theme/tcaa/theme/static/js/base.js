
var Controller = new (function(){
    var self = this;

    this.options = {
        'pageOffset': { 'top':0, 'left':-20 }
    };

    this.initialised = false;
    this.pageIndicesByUrl = {};
    this.pageData = null;
    this.hashBangRE = /^#!(.*)$/;

    // Seeing issues with popstate, so disabling this for now.
    // this.supportsPushState = !!(window.history && history.pushState);
    this.supportsPushState = false;

    this.init = function(pageData) {
        if (location.pathname != '/' && !this.hashBangRE.test(location.pathname)) {
            location.href = '/#!' + location.pathname;    
        }
        
        this.pageData = pageData;

        this.container = $('.scroll');
        
        var currentContent = this.container.find('.scroll-page').children().remove();
        var currentUrl = this.getHashBangUrl(location.hash);
        
        this.container.html('');

        for (var i=0; i<this.pageData.length; i++) {
            var sect = $('<div class="scroll-sect"></div>');
            sect.data('sect-index', i);
            this.container.append(sect);

            for (var j=0; j<this.pageData[i].length; j++) {
                var obj = this.pageData[i][j];
                var url = obj.url;
                var page = $('<div class="scroll-page"></div>');

                page.data('sect-index', i);
                page.data('page-index', j);
                page.data('loaded', false);

                if (currentContent && !i && !j) {
                    this.loadPage(page, currentContent)
                } else if (currentUrl == url || !j) {
                    this.loadPage(page);
                }

                sect.append(page);

                this.pageIndicesByUrl[url] = [i,j];
            }

            var sectPages = this.pageData[i].length;
            var sectWidth = sectPages * (page.outerWidth() + parseInt(page.css('marginRight'), 10));
            sect.css('width', sectWidth);
        }

        // this.initMenu();
        this.initLinks();
        this.initialised = true;
    }

    this.initMenu = function() {
        this.menu = $('#page-menu');

        var topList = $('<ul></ul>');

        for (var i=0; i<this.pageData.length; i++) {
            var subList = $('<ul></ul>');
            for (var j=0; j<this.pageData[i].length; j++) {
                var obj = this.pageData[i][j];
                var url = obj.url;
                var item = $('<li><a href="' + url + '">' + url + '</a></li>');
                if (j == 0) {
                    topList.append(item.append(subList));
                } else {
                    subList.append(item);
                }
            }
        }

        this.menu.append(topList);
    }

    this.initLinks = function(context) {
        if (!this.initialised && !this.supportsPushState) {
            this.initHashBangChange();
        }
        if (this.supportsPushState) {
            this.initPushStateLinks(context);
        } else {
            this.initHashBangLinks(context);
        }
    }

    this.initPushStateLinks = function(context) {
        $('a', context).each(function(){
            var link = $(this);
            var href = link.attr('href');
            if (self.pageIndicesByUrl.hasOwnProperty(href)) {
                
                link.click(function(e){
                    self.gotoPageByUrl(href);
                    history.pushState({}, document.title, href);
                    e.preventDefault();
                });

            }
        });
    }

    this.initHashBangLinks = function(context) {
        $('a', context).each(function(){
            var link = $(this);
            var href = link.attr('href');
            if (self.pageIndicesByUrl.hasOwnProperty(href) && href.match(self.hashBangRE) === null) {
                
                link.attr('href', '/#!' + href);
                link.click(function(e){
                    if (href == self.getHashBangUrl(location.hash)) {

                        // Normally, we don't have to do anything here, because clicking a hash-bang 
                        // link will trigger our hashchange event by default. But if the href already 
                        // matches our location we need to trigger the animation ourselves (in case the 
                        // user is on the right page, but has scrolled away from it).
                        self.gotoPageByUrl(href);
                        e.preventDefault();
                    
                    }
                });

            }
        });
    }

    this.initHashBangChange = function() {
        $(window).hashchange(function(e, initial){
            var hash = location.hash;
            if (hash) {

                var url = self.getHashBangUrl(hash);
                if (url) self.gotoPageByUrl(url, initial);

            } else {
                
                // If we don't have a location hash but this isn't the initial page 
                // load, then we've probably rewound back to the initial page state.
                if (!initial) self.gotoPage(0,0);

            }
        });
        
        // Set the initial page state. Using the long-hand version of trigger here so
        // we can pass in the "initial" parameter. Short-hand doesn't like arguments.
        $(window).trigger('hashchange', [true]);
    }

    this.getHashBangUrl = function(url) {
        var matches = url.match(this.hashBangRE);
        if (matches && matches.length) {
            return matches[1];
        }
    }

    this.getSect = function(sect) {
        if (typeof sect == 'number') {
            return this.container.find('.scroll-sect').eq(sect);
        } else {
            return sect;
        }
    }

    this.getSectByPage = function(page) {
        return page.closest('.scroll-sect');
    }

    this.getPage = function(sect, page) {
        if (typeof sect == 'number') {
            sect = this.getSect(sect);
        }
        if (typeof page == 'number') {
            return sect.find('.scroll-page').eq(page);
        } else {
            return page;
        }
    }

    this.getSectIndex = function() {
        var sects = this.container.find('.scroll-sect');
        var y1 = $(window).scrollTop() - this.options.pageOffset.top;
        for (var i=0; i<sects.length; i++) {
            var y2 = sects.eq(i).position().top;
            if (y2 == y1) return i;
        }

        // Get page index is reliable, but sect index is less so because the maximum 
        // possible scroll position might not reach the top of the requested section. 
        // If the window as scrolled to the maximum possible y position, we can 
        // presume that the last section was requested. But this may not be correct 
        // in cases where more than one section fits in the viewport.
        
        var y1 = $(window).scrollTop();
        var y2 = $('html').height() - $(window).height();
        if (y1 == y2) return sects.length - 1;
    }

    this.getPageIndex = function(sect) {
        var pages = sect.find('.scroll-page');
        var x1 = -(parseInt(sect.css('left'), 10) || 0);
        for (var i=0; i<pages.length; i++) {
            var x2 = pages.eq(i).position().left
            if (x2 == x1) return i;
        }
    }

    this.getPageByUrl = function(url) {
        var indices = this.pageIndicesByUrl[url];
        if (indices) {
            var sect = indices[0];
            var page = indices[1];
            return this.getPage(sect, page);
        }
    }

    this.getUrlByPage = function(page) {
        var i = page.data('sect-index');
        var j = page.data('page-index');
        var obj = this.pageData[i][j];
        var url = obj.url;
        return url;
    }

    this.gotoPageByUrl = function(url, initial) {
        var page = this.getPageByUrl(url);
        if (page) {
            var sect = this.getSectByPage(page);
            this.gotoPage(sect, page, initial);
        }
    }

    this.gotoPage = function(sect, page, initial) {
        if (typeof sect == 'number') sect = this.getSect(sect);
        if (typeof page == 'number') page = this.getPage(sect, page);

        if (sect.length == 0 || page.length == 0) return;

        this.loadSect(sect);

        var body = $('html, body');
        var bodyCss, sectCss = null;

        if (this.getSectIndex() != sect.data('sect-index')) {
            bodyCss = { 'scrollTop': sect.position().top + this.options.pageOffset.top };
        }
        if (this.getPageIndex(sect) != page.data('page-index')) {
            sectCss = { 'left': -page.position().left };
        }

        if (initial) {
            if (bodyCss) body.scrollTop(bodyCss.scrollTop); // scrollTop isn't actually a css property
            if (sectCss) sect.css(sectCss);
        } else {
            var sectFn = (sectCss) ? function(){ sect.animate(sectCss); } : function(){};
            if (bodyCss) {
                body.animate(bodyCss, { 'complete':sectFn });
            } else {
                sectFn();
            }
        }
    }

    this.loadSect = function(sect) {
        if (sect.data('loaded')) return;
        var pages = sect.find('.scroll-page');
        for (var i=0; i<pages.length; i++) {
            this.loadPage(pages.eq(i));
        }
        sect.data('loaded', true);
    }

    this.loadPage = function(page, content) {
        if (page.data('loaded')) return;
        if (content) {
            page.html(content);
        } else {
            page.load(this.getUrlByPage(page), function(){
                self.initHashBangLinks();
            });
        }
        page.data('loaded', true);
    }

});

/*
// Tried this as $(window).bind('popstate', function(e){ ... }) but my dev
// browser (chrome 12.0.742 on ubuntu) wasn't having it for some reason.
// This way is looking slightly more promising, but e.state is still empty.
window.onpopstate = function(e){
    console.log('popped state');
    console.log(e);
    console.log(e.state);
    console.log(history.state);
}
*/

$(function(){
    Controller.init(pageData);
});

