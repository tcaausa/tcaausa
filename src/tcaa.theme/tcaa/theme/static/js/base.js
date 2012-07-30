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
        this.sidebar = $('#page-sidebar');
        
        var currentContent = this.container.find('.scroll-page').children().remove();
        var currentUrl = this.getHashBangUrl(location.hash);
        
        var pageTemplate = this.container.find('.scroll-page').remove();
        var sectTemplate = this.container.find('.scroll-sect').remove();

        this.container.html('');

        for (var i=0; i<this.pageData.length; i++) {
            var sect = sectTemplate.clone();
            sect.css('z-index', 30-i);
            this.container.append(sect);

            sect = sect.find('.scroll-sect-content');
            sect.data('sect-index', i);

            for (var j=0; j<this.pageData[i].length; j++) {
                var obj = this.pageData[i][j];
                var url = obj.url;
                var page = pageTemplate.clone();

                page.data('sect-index', i);
                page.data('page-index', j);
                page.data('page-title', obj.title);
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
            
            this.initSectFooter(sect, this.pageData[i]);
        }

        this.initMenu();
        this.initLinks();
        this.initResizing();
        this.initialised = true;
    }

    this.initMenu = function() {
        // Set the highlighted and toggled open state of the top-level
        // menu items when clicked on.
        // 
        // This is actually already handled by updateSectFooter, but 
        // that's triggered when the animated scrolling arrives at a 
        // page, rather than when the link is clicked.
        //
        // With this added tweak, the sidebar menu is updated when we
        // click on it, and then the section footer is updated when 
        // the animation finishes. Just feels a bit nicer that way.

        var items = this.sidebar.find('#page-menu ul.top > li');
        items.children('a').click(function(){
            items.removeClass('active');
            $(this).closest('li').addClass('active');
        });
    }

    this.initResizing = function() {
        $(window).resize(function(){

            var fullHeight = self.container.height();
            var pageHeight = fullHeight / self.pageData.length;

            var diff = $(window).height() - pageHeight;
            if (diff > 0) self.container.css({ 'paddingBottom':diff });
        }).resize();
    }

    this.initSectFooter = function(sect, menuData) {
        var footer = this.getSectFooter(sect);
        
        var menu = footer.find('.scroll-sect-menu');
        var itemTemplate = menu.find('li').remove().eq(0);

        itemTemplate.find('a').removeClass('active');

        for (var i=0; i<menuData.length; i++) {
            var data = menuData[i];

            var item = itemTemplate.clone();
            var link = item.find('a');
            var span = item.find('span');
            
            if (i == 0) link.addClass('active');

            link.attr('href', data.url);
            span.text(data.title);

            menu.append(item);
        }

        this.updateSectFooter(sect);
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
            return this.container.find('.scroll-sect-content').eq(sect);
        } else {
            return sect;
        }
    }

    this.getSectFooter = function(sect) {
        return sect.closest('.scroll-sect').find('.scroll-sect-footer');
    }

    this.getSectByPage = function(page) {
        return page.closest('.scroll-sect-content');
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
        var sects = this.container.find('.scroll-sect-content');
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
            var x2 = pages.eq(i).position().left;
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

            // Google analytics page tracking within
            // the main page scroll viewport
            if (typeof(_gat) != "undefined") {
                tracker = _gat._getTrackerByName();
                tracker._trackPageview(url);
            }
        }
    }

    this.gotoPage = function(sect, page, initial) {
        if (typeof sect == 'number') sect = this.getSect(sect);
        if (typeof page == 'number') page = this.getPage(sect, page);

        if (sect.length == 0 || page.length == 0) return;

        this.loadSect(sect);

        var body = $('html, body');
        var bodyCss, sectCss = null;

        var sectIndexA = this.getSectIndex();
        var pageIndexA = this.getPageIndex(sect);

        var sectIndexB = sect.data('sect-index');
        var pageIndexB = page.data('page-index');

        if (sectIndexA != sectIndexB) {
            scrollContainer = sect.parent();
            bodyCss = { 'scrollTop': (sectIndexB * scrollContainer.outerHeight(true)) + this.options.pageOffset.top };
        }
        if (pageIndexA != pageIndexB) {
            sectCss = { 'left': -page.position().left };
        }

        // It this is the initial page load, set everything up immediately
        // otherwise animate it all into place in one or more queued stages. 
        
        var doneFn = function(){ self.updateSectFooter(sectIndexB, pageIndexB); self.updateMenu(sect); }
        var pageFn = (sectCss) ? function(){ sect.animate(sectCss, { 'complete':doneFn }); } : doneFn;
        var sectFn = (bodyCss) ? function(){ body.animate(bodyCss, { 'complete':pageFn }); } : pageFn;

        if (initial) {
            if (bodyCss) body.scrollTop(bodyCss.scrollTop); // scrollTop isn't actually a css property
            if (sectCss) sect.css(sectCss);
            doneFn();
        } else {
            sectFn();
        }
    }

    this.updateSectFooter = function(sect, page) {
        if (typeof sect == 'number') sect = this.getSect(sect);
        if (typeof page == 'number') page = this.getPage(sect, page);
        
        if (typeof page == 'undefined') {
            var page = this.getPage(sect, this.getPageIndex(sect));
        }

        var sectIndex = page.data('sect-index');
        var pageIndex = page.data('page-index');
        var pageTitle = page.data('page-title');

        var footer = this.getSectFooter(sect);
        footer.find('.scroll-sect-title').text(pageTitle);
        footer.find('.scroll-sect-menu li a').removeClass('active').eq(pageIndex).addClass('active');
    }

    this.updateMenu = function(sect) {
        var sectIndex = (typeof sect == 'number') ? sect : sect.data('sect-index');
        this.sidebar.find('#page-menu ul.top > li').removeClass('active').eq(sectIndex).addClass('active');
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
                self.initFlowPlayer(page);
                if (page.find('#contact-form').length > 0){
                    self.initContactFormManager(page);
                }
            });
        }
        page.data('loaded', true);
    }

    this.initFlowPlayer = function(page) {
        if (window.collective_flowplayer !== undefined) {
            var player = page.find('.autoFlowPlayer a');
            player.flowplayer(window.collective_flowplayer.params);
        }
    }

    this.initContactFormManager = function(page) {
        self.contact_form = page.find('#contact-form form');
        self.contact_form.submit(function() {
            var subdata = {
                name: self.contact_form.find('#name').val(),
                email: self.contact_form.find('#email').val(),
                message: self.contact_form.find('#message').val()
            }; 
            $.post('/portal/contact/contact_submit',
                subdata,
                function(data) { self.handleContactFormResponse(data); },
                'json'
            );    
            return false;
        });
    }

    this.handleContactFormResponse = function(data) {
        var message = '<h2>Contact Us Direct</h2><p>'
        if (data['errors'].length) {
            message += 'Sorry, there were errors when sending your message:<ul>';
            for (var i=0; i<data['errors'].length;i++) {
                var error = data['errors'][i];
                if (error.hasOwnProperty('inputerror')){
                    message+='<li>' + error['inputerror'] + '</li>';
                }
                if (error.hasOwnProperty('exception')){
                    message +='<li>' + error['exception'] + ' Please try again.</li>';
                }
            }
            message += '</ul>';
        } else {
            message += 'Thank you. Your message has been sent';
        }
        message += '</p>'
        closebutton = '<a class="close" href="/">Close</a>';
        var info = '<div class="messagepop pop">' + message + closebutton + '</div>';
        $('.contactpage').append(info);
        $('.close').live('click', function() {
            $('.pop').slideFadeToggle(function(){
                    $('.messagepop').remove();
            });
            return false;
        });
        $('.pop').slideFadeToggle();
    }

});

$.fn.slideFadeToggle = function(easing, callback) {
        return this.animate({opacity:'toggle',height:'toggle'}, 'fast', easing, callback);
    }

$(function(){
    Controller.init(pageData);
});



