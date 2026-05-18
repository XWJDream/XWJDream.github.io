var Home = location.href,
    Pages = 4,
    xhr,
    xhrUrl = '';

var Diaspora = {
    L: function(url, f, err) {
        if (url == xhrUrl) {
            return false;
        }
        xhrUrl = url;
        if (xhr) {
            xhr.abort();
        }
        xhr = $.ajax({
            type: 'GET',
            url: url,
            timeout: 10000,
            success: function(data) {
                f(data);
                xhrUrl = '';
            },
            error: function(a, b, c) {
                if (b == 'abort') {
                    err && err()
                } else {
                    window.location.href = url;
                }
                xhrUrl = '';
            }
        });
    },
    P: function() {
        return !!('ontouchstart' in window);
    },
    PS: function() {
        if (!(window.history && history.pushState)){
            return;
        }
        history.replaceState({u: Home, t: document.title}, document.title, Home);
        window.addEventListener('popstate', function(e) {
            var state = e.state;
            if (!state) return;
            document.title = state.t;

            if (state.u == Home) {
                $('#preview').css('position', 'fixed');
                setTimeout(function() {
                    $('#preview').removeClass('show');
                    $('#container').show();
                    window.scrollTo(0, parseInt($('#container').data('scroll')));
                    setTimeout(function() {
                        $('#preview').html('');
                        $(window).trigger('resize');
                    }, 300);
                }, 0);
            } else {
                Diaspora.loading();
                Diaspora.L(state.u, function(data) {
                    document.title = state.t;
                    $('#preview').html($(data).filter('#single'));
                    Diaspora.preview();
                    setTimeout(function() { Diaspora.player(); }, 0);
                });
            }
        });
    },
    HS: function(tag, flag) {
        var id = tag.data('id') || 0,
            url = tag.attr('href'),
            title = tag.attr('title') + " - " + $("#config-title").text();

        if (!$('#preview').length || !(window.history && history.pushState)) location.href = url;
        Diaspora.loading()
        var state = {d: id, t: title, u: url};
        Diaspora.L(url, function(data) {
            if (!$(data).filter('#single').length) {
                location.href = url;
                return
            }
            switch (flag) {
                case 'push':
                    history.pushState(state, title, url)
                    break;
                case 'replace':
                    history.replaceState(state, title, url)
                    break;
            }
            document.title = title;
            $('#preview').html($(data).filter('#single'))
            switch (flag) {
                case 'push':
                    Diaspora.preview()
                    break;
                case 'replace':
                    window.scrollTo(0, 0)
                    Diaspora.loaded()
                    break;
            }
            setTimeout(function() {
                Diaspora.player();
                $('#top').show();
                comment = $("#gitalk-container");
                if (comment.data('ae') == true){
                    comment.click();
                }
            }, 0)
            var math = document.getElementById("single")
            if (typeof MathJax !== 'undefined' && MathJax.Hub) {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, math])
            }
        })
    },
    preview: function() {
        // preview toggle
        $("#preview").one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
            var previewVisible = $('#preview').hasClass('show');
            if (!!previewVisible) {
                $('#container').hide();
            }else{
                $('#container').show();
            }
            Diaspora.loaded();
        });
        setTimeout(function() {
            $('#preview').addClass('show');
            $('#container').data('scroll', window.scrollY);
            setTimeout(function() {
                $('#preview').css({
                    'position': 'static',
                    'overflow-y': 'auto'
                });
            }, 500);
        }, 0);
    },
    player: function() {
        var p = $('#audio');
        if (!p.length) {
            $('.icon-play').css({
                'color': '#dedede',
                'cursor': 'not-allowed'
            })
            return
        }
        var sourceSrc= $("#audio source").eq(0).attr('src')
        if (sourceSrc == '' && p[0].src == ''){
            audiolist = $('#audio-list li');
            mp3 = audiolist.eq([Math.floor(Math.random() * audiolist.length)])
            p[0].src = mp3.data('url')
        }

        if (p.eq(0).data("autoplay") == true) {
            p[0].play();
        }

        p.on({
            'timeupdate': function() {
                var progress = p[0].currentTime / p[0].duration * 100;
                $('.bar').css('width', progress + '%');
                if (progress / 5 <= 1) {
                    p[0].volume = progress / 5;
                }else {
                    p[0].volume = 1;
                }
            },
            'ended': function() {
                $('.icon-pause').removeClass('icon-pause').addClass('icon-play')
            },
            'playing': function() {
                $('.icon-play').removeClass('icon-play').addClass('icon-pause')
            }
        })
    },
    loading: function() {
        var w = window.innerWidth;
        var css = '<style class="loaderstyle" id="loaderstyle'+ w +'">'+
            '@-moz-keyframes loader'+ w +'{100%{background-position:'+ w +'px 0}}'+
            '@-webkit-keyframes loader'+ w +'{100%{background-position:'+ w +'px 0}}'+
            '.loader'+ w +'{-webkit-animation:loader'+ w +' 3s linear infinite;-moz-animation:loader'+ w +' 3s linear infinite;}'+
            '</style>';
        $('.loaderstyle').remove()
        $('head').append(css)
        $('#loader').removeClass().addClass('loader'+ w).show()
    },
    loaded: function() {
        $('#loader').removeClass().hide()
    },
    F: function(id, w, h) {
        var _height = $(id).parent().height(),
            _width = $(id).parent().width(),
            ratio = h / w;
        if (_height / _width > ratio) {
            id.style.height = _height +'px';
            id.style.width = _height / ratio +'px';
        } else {
            id.style.width = _width +'px';
            id.style.height = _width * ratio +'px';
        }
        id.style.left = (_width - parseInt(id.style.width)) / 2 +'px';
        id.style.top = (_height - parseInt(id.style.height)) / 2 +'px';
    }
};

$(function() {
    if (Diaspora.P()) {
        $('body').addClass('touch')
    }
    if ($('#preview').length) {
        var cover = {};
        cover.t = $('#cover');
        cover.w = cover.t.attr('width');
        cover.h = cover.t.attr('height');
        ;(cover.o = function() {
            $('#mark').height(window.innerHeight)
        })();
        if (cover.t.prop('complete')) {
            // why setTimeout ?
            setTimeout(function() { cover.t.load() }, 0)
        }
        setTimeout(function() {
            if ($('html').hasClass('loading') || $('body').hasClass('loading')) {
                $('html, body').removeClass('loading')
            }
        }, 5000)
        cover.t.on('load', function() {
            ;(cover.f = function() {
                var _w = $('#mark').width(), _h = $('#mark').height(), x, y, i, e;
                e = (_w >= 1000 || _h >= 1000) ? 1000 : 500;
                if (_w >= _h) {
                    i = _w / e * 50;
                    y = i;
                    x = i * _w / _h;
                } else {
                    i = _h / e * 50;
                    x = i;
                    y = i * _h / _w;
                }
                $('.layer').css({
                    'width': _w + x,
                    'height': _h + y,
                    'marginLeft': - 0.5 * x,
                    'marginTop': - 0.5 * y
                })
                if (!cover.w) {
                    cover.w = cover.t.width();
                    cover.h = cover.t.height();
                }
                Diaspora.F($('#cover')[0], cover.w, cover.h)
            })();
            setTimeout(function() {
                $('html, body').removeClass('loading')
            }, 1000)
            $('#mark').parallax()
            try {
                var vibrant = new Vibrant(cover.t[0]);
                var swatches = vibrant.swatches()
                if (swatches['DarkVibrant']) {
                    $('#vibrant polygon').css('fill', swatches['DarkVibrant'].getHex())
                    $('#vibrant div').css('background-color', swatches['DarkVibrant'].getHex())
                }
                if (swatches['Vibrant']) {
                    $('.icon-menu').css('color', swatches['Vibrant'].getHex())
                    $('.icon-search').css('color', swatches['Vibrant'].getHex())
                }
            } catch(e) {}
        })
        if (!cover.t.attr('src')) {
            alert('Please set the post thumbnail')
        }
        $('#preview').css('min-height', window.innerHeight)
        Diaspora.PS()
        $('.pview a').addClass('pviewa')
        var T;
        $(window).on('resize', function() {
            clearTimeout(T)
            T = setTimeout(function() {
                if (!Diaspora.P() && location.href == Home) {
                    cover.o()
                    cover.f()
                }
                if ($('#loader').attr('class')) {
                    Diaspora.loading()
                }
            }, 500)
        })
    } else {
        $('#single').css('min-height', window.innerHeight)
        setTimeout(function() {
            $('html, body').removeClass('loading')
        }, 1000)
        window.addEventListener('popstate', function(e) {
            if (e.state) location.href = e.state.u;
        })
        Diaspora.player();
        $('.icon-icon, .image-icon').attr('href', '/')
        $('#top').show()
    }
    $(window).on('scroll', function() {
        if ($('.scrollbar').length && !Diaspora.P() && !$('.icon-images').hasClass('active')) {
            var wt = $(window).scrollTop(),
                tw  = $('#top').width(),
                dh = document.body.scrollHeight,
                wh  = $(window).height();
            var width = tw / (dh - wh) * wt;
            $('.scrollbar').width(width)
            if (wt > 80 && window.innerWidth > 800) {
                $('.subtitle').fadeIn()
            } else {
                $('.subtitle').fadeOut()
            }
        }
    })
    $(window).on('touchmove', function(e) {
        if ($('body').hasClass('mu')) {
            e.preventDefault()
        }
    })
	
	// 搜索（JSON 实时索引）
	var searchData = null;
	var searchOverlay = null;

	var loadSearchData = function(callback) {
		if (searchData) { callback(searchData); return; }
		$.getJSON('/search.json', function(data) {
			searchData = data;
			callback(data);
		});
	};

	var highlightText = function(text, keywords) {
		var result = text;
		keywords.forEach(function(kw) {
			if (!kw) return;
			var reg = new RegExp('(' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
			result = result.replace(reg, '<em>$1</em>');
		});
		return result;
	};

	var renderSearchResults = function(keywords, container) {
		var $result = $(container);
		var kw = keywords.filter(function(k) { return k.length > 0; });
		if (kw.length === 0) { $result.html('<div class="search-hint">输入关键词搜索文章</div>'); return; }
		var html = '<ul>';
		var found = 0;
		searchData.forEach(function(item) {
			var titleLower = item.title.toLowerCase();
			var contentLower = item.content.replace(/<[^>]+>/g, '').toLowerCase();
			var matched = kw.every(function(k) { return titleLower.indexOf(k) >= 0 || contentLower.indexOf(k) >= 0; });
			if (!matched) return;
			found++;
			var displayTitle = highlightText(item.title, kw);
			var snippet = '';
			var contentText = item.content.replace(/<[^>]+>/g, '');
			if (contentText.length > 0) {
				var firstIdx = -1;
				for (var i = 0; i < kw.length; i++) {
					var idx = contentLower.indexOf(kw[i]);
					if (idx >= 0) { firstIdx = idx; break; }
				}
				if (firstIdx >= 0) {
					var s = Math.max(0, firstIdx - 20);
					var e = Math.min(contentText.length, firstIdx + 60);
					snippet = (s > 0 ? '...' : '') + contentText.substring(s, e) + (e < contentText.length ? '...' : '');
					snippet = highlightText(snippet, kw);
				}
			}
			html += '<li data-url="' + item.url + '">';
			html += '<span class="search-result-title">' + displayTitle + '</span>';
			if (snippet) html += '<span class="search-result-snippet">' + snippet + '</span>';
			html += '</li>';
		});
		html += '</ul>';
		if (found === 0) html = '<div class="search-empty">未找到相关文章</div>';
		$result.html(html);
	};

	var openSearch = function() {
		if (!searchOverlay) {
			searchOverlay = $(
				'<div class="search-overlay">' +
				'<div class="search-box">' +
				'<div class="search-header">' +
				'<span class="iconfont icon-search"></span>' +
				'<input type="text" id="overlay-search-input" placeholder="搜索文章标题或内容..." autocomplete="off">' +
				'<span class="search-close">ESC</span>' +
				'</div>' +
				'<div class="search-results" id="overlay-search-result">' +
				'<div class="search-hint">输入关键词搜索文章</div>' +
				'</div>' +
				'</div>' +
				'</div>'
			);
			$('body').append(searchOverlay);
			searchOverlay.on('click', function(e) {
				if ($(e.target).is('.search-overlay')) closeSearch();
			});
			searchOverlay.find('.search-close').on('click', closeSearch);
			searchOverlay.find('#overlay-search-input').on('input', function() {
				var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
				renderSearchResults(keywords, '#overlay-search-result');
			});
			searchOverlay.find('#overlay-search-result').on('click', 'li', function() {
				var url = $(this).data('url');
				if (url) window.location.href = url;
			});
		}
		searchOverlay.addClass('active');
		setTimeout(function() { searchOverlay.find('#overlay-search-input').val('').focus(); }, 100);
		loadSearchData(function() {
			$('#overlay-search-result').html('<div class="search-hint">输入关键词搜索文章</div>');
		});
	};

	var closeSearch = function() {
		if (searchOverlay) searchOverlay.removeClass('active');
	};

	$(document).on('keydown', function(e) {
		if (e.key === 'Escape') closeSearch();
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			openSearch();
		}
	});
	
	
    var typed = null;
    $('body').on('click', function(e) {
        var tag = $(e.target).attr('class') || '',
            rel = $(e.target).attr('rel') || '';
        // .content > ... > img
        if (e.target.nodeName == "IMG" && $(e.target).parents('div.content').length > 0) {
            tag = 'pimg';
        }
        if (!tag && !rel) return;
        switch (true) {
            // nav menu
            case (tag.indexOf('switchmenu') != -1):
                window.scrollTo(0, 0)
				
				$('html, body').toggleClass('mu');
				if(typed !== null)
					{typed.destroy(); typed = null;}
				else{
					if($("#hitokoto").data('st') == true){
						$.get("https://v1.hitokoto.cn/", function (data) {
						var data = data;
						var str =  data.hitokoto + " ——  By "		
						var options = {
						  strings: [ 
							//str + "Who??^1000",
							//str + "It's me^2000",
							//str +'Haha, make a joke',
							str + data.from,
						  ],
						  typeSpeed: 90,
						  startDelay: 500,
						  //backDelay: 500,
						  //backSpeed: 50,//回退速度
						  //loop: true,
						}
						typed = new Typed(".hitokoto .typed", options);
						})
					}
				}	
                return false;
                break;
			//search
			case (tag.indexOf('switchsearch') != -1):
                $('body').removeClass('mu')
				if(typed !== null){typed.destroy(); typed = null;}
				openSearch();
                return false;
                break;	
            // next page
            case (tag.indexOf('more') != -1):
                tag = $('.more');
                if (tag.data('status') == 'loading') {
                    return false
                }
                var num = parseInt(tag.data('page')) || 1;
                if (num == 1) {
                    tag.data('page', 1)
                }
                if (num >= Pages) {
                    return
                }
                tag.html('加载中...').data('status', 'loading')
                Diaspora.loading()
                Diaspora.L(tag.attr('href'), function(data) {
                    var link = $(data).find('.more').attr('href');
                    if (link != undefined) {
                        tag.attr('href', link).html('加载更多').data('status', 'loaded')
                        tag.data('page', parseInt(tag.data('page')) + 1)
                    } else {
                        $('#pager').remove()
                    }
                    var tempScrollTop = $(window).scrollTop();
                    var $newPosts = $(data).find('.post').each(function(i) {
                        $(this).addClass('anim-ready anim-fade-up anim-delay-' + Math.min(i + 1, 3));
                    });
                    $('#primary').append($newPosts);
                    // Trigger animation for new posts
                    setTimeout(function() { $newPosts.removeClass('anim-ready'); }, 50);
                    $(window).scrollTop(tempScrollTop + 100);
                    Diaspora.loaded()
                    $('html,body').animate({ scrollTop: tempScrollTop + 400 }, 500);
                }, function() {
                    tag.html('加载更多').data('status', 'loaded')
                })
                return false;
                break;
            // home
            case (tag.indexOf('icon-home') != -1):
                $('.toc').fadeOut(100);
                if ($('#preview').hasClass('show')) {
                    history.back();
                } else {
                    location.href = $('.icon-home').data('url')
                }
                return false;
                break;
            // qrcode
            case (tag.indexOf('icon-scan') != -1):
                if ($('.icon-scan').hasClass('tg')) {
                    $('#qr').toggle()
                } else {
                    $('.icon-scan').addClass('tg')
                    $('#qr').qrcode({ width: 128, height: 128, text: location.href}).toggle()
                }
                return false;
                break;
            // audio play
            case (tag.indexOf('icon-play') != -1):
                $('#audio')[0].play()
                $('.icon-play').removeClass('icon-play').addClass('icon-pause')
                return false;
                break;
            // audio pause
            case (tag.indexOf('icon-pause') != -1):
                $('#audio')[0].pause()
                $('.icon-pause').removeClass('icon-pause').addClass('icon-play')
                return false;
                break;
            // history state
            case (tag.indexOf('cover') != -1):
                Diaspora.HS($(e.target).parent(), 'push')
                return false;
                break;
            // history state
            case (tag.indexOf('posttitle') != -1):
                Diaspora.HS($(e.target), 'push')
                return false;
                break;
            // prev, next post
            case (rel == 'prev' || rel == 'next'):
                if (rel == 'prev') {
                    var t = $('#prev_next a')[0].text
                } else {
                    var t = $('#prev_next a')[1].text
                }
                $(e.target).attr('title', t)
                Diaspora.HS($(e.target), 'replace')
                return false;
                break;
            // toc
            case (tag.indexOf('toc-text') != -1 || tag.indexOf('toc-link') != -1
                  || tag.indexOf('toc-number') != -1):
                hash = '';
                if (e.target.nodeName == 'SPAN'){
                  hash = $(e.target).parent().attr('href')
                }else{
                  hash = $(e.target).attr('href')
                }
                to  = $(decodeURI(hash))
                $("html,body").animate({
                  scrollTop: to.offset().top - 50
                }, 300);
                return false;
                break;
            // quick view
            case (tag.indexOf('pviewa') != -1):
                $('body').removeClass('mu')
				if(typed !== null){typed.destroy(); typed = null;}
                setTimeout(function() {
                    Diaspora.HS($(e.target), 'push')
                    $('.toc').fadeIn(1000);
                }, 300)
                return false;
                break;
            // photoswipe
            case (tag.indexOf('pimg') != -1):
                var pswpElement = $('.pswp').get(0);
                if (pswpElement) {
                    var items = [];
                    var index = 0;
                    var imgs = [];
                    $('.content img').each(function(i, v){
                        // get index
                        if (e.target.src == v.src) {
                            index = i;
                        }
                        var item = {
                            src: v.src,
                            w: v.naturalWidth,
                            h: v.naturalHeight
                        };
                        imgs.push(v);
                        items.push(item);
                    });
                    var options = {
                        index: index,
                        shareEl: false,
                        zoomEl: false,
                        allowRotationOnUserZoom: true,
                        history: false,
                        getThumbBoundsFn: function(index) {
                            // See Options -> getThumbBoundsFn section of documentation for more info
                            var thumbnail = imgs[index],
                                pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                                rect = thumbnail.getBoundingClientRect(); 

                            return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
                        }
                    };
                    var lightBox= new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
                    lightBox.init();
                }
                return false;
                break;
            // comment
            case - 1 != tag.indexOf("comment"): 
				if($('#gitalk-container').data('enable') == true){
					Diaspora.loading(),
					comment = $('#gitalk-container');
					gitalk = new Gitalk({
					  clientID: comment.data('ci'),
					  clientSecret: comment.data('cs'),
					  repo: comment.data('r'),
					  owner: comment.data('o'),
					  admin: comment.data('a'),
					  id: decodeURI(window.location.pathname),
					  distractionFreeMode: comment.data('d')
					})
					$(".comment").removeClass("link")
					gitalk.render('gitalk-container')
					Diaspora.loaded();
				}else{
					$('#gitalk-container').html("评论已关闭");
				}
                return false;
                break;
            default:
                return true;
                break;
        }
    })
    // 是否自动展开评论
    comment = $("#gitalk-container");
    if (comment.data('ae') == true){
        comment.click();
    }

    // 回到顶部按钮
    var $backToTop = $('<button class="back-to-top" title="回到顶部"></button>');
    $backToTop.html('<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>');
    $('body').append($backToTop);
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 300) {
            $backToTop.addClass('show');
        } else {
            $backToTop.removeClass('show');
        }
    });
    $backToTop.on('click', function() {
        $('html, body').animate({scrollTop: 0}, 400);
    });

    // Scroll-triggered entrance animations
    var initAnimations = function() {
        var $posts = $('#primary .post');
        var $projects = $('.project-card');

        // Mark elements as ready to animate
        $posts.each(function(i) {
            $(this).addClass('anim-ready anim-fade-up anim-delay-' + Math.min(i + 1, 5));
        });
        $projects.each(function(i) {
            $(this).addClass('anim-ready anim-scale anim-delay-' + Math.min(i + 1, 5));
        });

        // Use Intersection Observer if available
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        $(entry.target).removeClass('anim-ready');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.05 });

            $('.anim-ready').each(function() {
                observer.observe(this);
            });
        } else {
            // Fallback: just show everything
            $('.anim-ready').removeClass('anim-ready');
        }
    };
    initAnimations();

    console.log("%c Github %c","background:#24272A; color:#ffffff","","https://github.com/Fechin/hexo-theme-diaspora")
})

