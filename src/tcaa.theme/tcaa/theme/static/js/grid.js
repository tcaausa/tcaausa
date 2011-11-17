
var Controller = new (function(){
    var self = this;

    this.options = {
        'pageOffset': { 'top':-20, 'left':-20 }
    };

    this.r = 0;
    this.c = 0;

    this.gridCoordsByUrl = {};
    this.gridUrlsByCoord = [
        [
            '/grid/0/0/',
            '/grid/0/1/',
            '/grid/0/2/',
            '/grid/0/3/',
            '/grid/0/4/'
        ],
        [
            '/grid/1/0/',
            '/grid/1/1/',
            '/grid/1/2/'
        ],
        [
            '/grid/2/0/',
            '/grid/2/1/',
            '/grid/2/2/',
            '/grid/2/3/',
            '/grid/2/4/',
            '/grid/2/5/'
        ],
        [
            '/grid/3/0/',
            '/grid/3/1/',
            '/grid/3/2/',
            '/grid/3/3/'
        ],
        [
            '/grid/4/0/',
            '/grid/4/1/'
        ],
        [
            '/grid/5/0/',
            '/grid/5/1/',
            '/grid/5/2/',
            '/grid/5/3/',
            '/grid/5/4/'
        ]
    ];

    this.init = function() {
        this.grid = $('.grid');

        var maxRowLen = 0;
        for (var r=0; r<this.gridUrlsByCoord.length; r++) {
            var row = $('<div class="grid-row"></div>');
            this.grid.append(row);

            var rowLen = this.gridUrlsByCoord[r].length;
            if (rowLen > maxRowLen) maxRowLen = rowLen;

            for (var c=0; c<rowLen; c++) {
                
                var col = $('<div class="grid-col"></div>');
                var url = this.gridUrlsByCoord[r][c];
                
                col.text(url);
                col.data('r', r);
                col.data('c', c);
                row.append(col);

                this.gridCoordsByUrl[url] = [r,c];
            }
        }

        var w = maxRowLen * (col.outerWidth() + parseInt(col.css('marginRight'), 10));
        this.grid.css('width', w);
    }

    this.currentPage = function() {
        return this.pageForCoord([this.r, this.c]);
    }

    this.pageForScroll = function() {
        var y = $(window).scrollTop();
        var x = $(window).scrollLeft();
    }

    this.pageForUrl = function(url) {
        return this.pageForCoord(this.gridCoordsByUrl[url]);
    }

    this.pageForCoord = function(coord) {
        var r = coord[0];
        var c = coord[1];
        return this.grid.find('.grid-row').eq(r).find('.grid-col').eq(c);
    }

    this.gotoUrl = function(url) {
        this.gotoPage(this.pageForUrl(url));
    }

    this.gotoCoord = function(coord) {
        this.gotoPage(this.pageForCoord(coord));
    }

    this.gotoPage = function(page) {
        if (page.length == 0) return;

        var page_r = page.data('r');
        var page_c = page.data('c');

        var positions = [];
        
        // If we aren't exactly aligned with the current page, move to it.
        var props = this.pageScrollCss(this.currentPage());
        if (props.scrollTop != $(window).scrollTop()
        ||  props.scrollLeft != $(window).scrollLeft()) {
            positions.push(props);
        }

        // Then move along the grid rows and cols as neccessary to reach our destination.
        if (page_r != this.r || page_c != this.c) {
            if (page_r != this.r) {
                if (this.c != 0) positions.push(this.pageScrollCss(this.pageForCoord([this.r, 0])));
                positions.push(this.pageScrollCss(this.pageForCoord([page_r, 0])));
                if (page_c != 0) positions.push(this.pageScrollCss(page));
            } else {
                positions.push(this.pageScrollCss(page));
            }
        }

        // Queue each of the positions as animations.
        if (positions.length) {
            var doc = $('html, body');
            var opt = { 'queue':true };
            
            for (var i=0; i<positions.length; i++) {
                doc.animate(positions[i], opt);
            }
        }

        this.r = page_r;
        this.c = page_c;
    }

    this.pageScrollCss = function(page) {
        var pos = page.position();
        var y = pos.top + this.options.pageOffset.top;
        var x = pos.left + this.options.pageOffset.left;
        return { 'scrollTop':y, 'scrollLeft':x };
    }

});

$(function(){
    Controller.init();
});

