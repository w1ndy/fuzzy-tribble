var page_404 = '<p style="text-align:center;text-indent:0"><img style="display:inline" src="images/404.jpg"></p>';

function renderColumn(node, lang, section, column) {
	$.get('content_' + lang + '/' + section + '/' + column + '/0.json', function(data) {
		if(typeof data == 'string') data = eval('(' + data + ')');
		for(var i = 0; i < (data.length > 5 ? 5 : data.length); i++) {
			$('.itemlist', node).append('<tr><td class="item_dot"></td><td class="item_title"><a href="' +
				((typeof data[i].url == 'string') ? data[i].url : '?s=' + section + '&amp;c=' +
				column + '&amp;a=' + data[i].url) + '">' + data[i].title + '</a></td><td class="item_date">' +
				data[i].date + '</td></tr>');
		}
	}).error(function(j, s, t) {
		console.log(s);
	});
}

function renderSlide(url) {
	$.get(url, function(data) {
		if(typeof data == 'string') data = eval('(' + data + ')');
		for(var i = 0; i < data.length; i++) {
			$('#slide ul').append(
				'<li>' +
					'<img src="' + data[i].image + '">' +
					'<div class="mask"></div>' +
					'<div class="description">' +
						'<a href="?' + data[i].url + '">' + data[i].title + '</a>' +
						'<p>' + data[i].desc + '</p>' +
					'</div>' +
				'</li>');
		}
		$('#slide').unslider({speed: 500, delay: 4000, keys: true, dots: true, fluid: false});
	}).error(function(j, s, t) {
		console.log(s);
	});
}

String.prototype.format = String.prototype.f = function() {
	var s = this,
		i = arguments.length;
	while(i--) {
		s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
	}
	return s;
};

function renderPageButton(current_page, page_count, link_script) {
	if(current_page != 1)
		$('#pager').append('<div class="pagebutton"><a href="' + link_script(current_page - 1) + '">&lt;</a></div>');
	for(var i = 1; i <= page_count; i++) {
		if(i == current_page) {
			$('#pager').append('<div class="pagebutton nowpage"><a href="' + link_script(i) + '">' + i + '</a></div>');
		} else {
			$('#pager').append('<div class="pagebutton"><a href="' + link_script(i) + '">' + i + '</a></div>');
		}
	}
	if(current_page != page_count) $('#pager').append('<div class="pagebutton"><a href="' + link_script(current_page + 1) + '">&gt;</a></div>');
}

function countPage(length, num_per_page) {
	return Math.floor((length - 1) / num_per_page) + 1;
}

function renderGrid(tag, lang, section, column, page) {
	$.get('content_' + lang + '/' + section + '/' + column + '/0.json').success(function (data) {
		if(typeof data == 'string') data = eval('(' + data + ')');
		var page_count = countPage(data.length, 3 * 4);
		$(tag).html(
			'<div class="gridcont"></div>' +
			'<div id="pager_container"><div id="pager"></div></div>');
		var start = (p - 1) * 12, end = p * 12;
		if(end > data.length) end = data.length;
		var grid = [
			'<div class="grid">',
				'<div class="grid-image">',
					'<img src="{0}">',
				'</div>',
				'<div class="grid-link">',
					'<a href="{1}">{2}</a>',
				'</div>',
			'</div>'
		].join('\n');
		for(var i = start; i < end; i++) {
			if(typeof data[i].url == 'string') {
				$('.gridcont').append(grid.f(
					data[i].image,
					data[i].url,
					data[i].title));
			} else {
				$('.gridcont').append(grid.f(
					data.grids[i].image,
					'?s=' + section + '&amp;c=' + column + '&amp;a=' + data[i].url,
					data.grids[i].title));
			}
		}
			renderPageButton(page, page_count, function(page) {
				return "javascript:renderGrid('" + tag + "','" + lang + "'," + section + "," + column + "," + page + ")";
			});
	}).error(function(j, s, t) {console.log(s); });
}

function renderList(tag, lang, section, column, page) {
	$.get('content_' + lang + '/' + section + '/' + column + '/0.json').success(function (data) {
		if(typeof data == 'string') data = eval('(' + data + ')');
		var page_count = countPage(data.length, 15);
		$(tag).html('<table id="newslist"></table><div id="pager_container"><div id="pager"></div></div>');
		var start = (page - 1) * 15, end = page * 15;
		if(end > data.length) end = data.length;
		for(var i = start; i < end; i++) {
			if(typeof data[i].url == 'string') {
				$('#newslist').append('<tr><td class="newsdot"></td><td class="newstitle"><a href="' + data[i].url +
					'">' + data[i].title + '</a></td><td class="newsdate">' + data[i].date + '</td></tr>');
			} else {
				$('#newslist').append('<tr><td class="newsdot"></td><td class="newstitle"><a href="?s=' + section +
					'&amp;c=' + column + '&amp;a=' + data[i].url + '">' + data[i].title + '</a></td><td class="newsdate">' +
					data[i].date + '</td></tr>');
			}
		}
		renderPageButton(page, page_count, function(page) {
			return "javascript:renderList('" + tag + "','" + lang + "'," + section + "," + column + "," + page + ")";
		});
	}).error(function(j, s, t) {console.log(s); });
}

function renderContent(section, lang) {
	$.get('content_' + lang + '/map.json', function(data) {
		if(typeof data == 'string') data = eval('(' + data + ')');
		var site_title = data[0].title;
		$('#loc_prompt').text(data[0].loc_prompt);
		data = data[section];
		$('#sidebar_header').text(data[0].page_name);
		$('#loc_entry_1').text(data[0].page_name);
		var sidebar_navi = $('#sidebar_navi ul');
		for(var s = 1; s < data.length; s++) {
			sidebar_navi.append('<li><a href="?s=' + section + '&amp;c=' + s + '">' + data[s].name + '</a></li>');
		}
		var column = parseInt(getParameterByName('c'));
		if(isNaN(column) || column < 1 || column >= data.length) column = 1;
		document.title = data[column].name + ' - ' + site_title;
		var article = parseInt(getParameterByName('a'));
		if(isNaN(article)) {
			$('#loc_entry_2').text(data[column].name);
			switch (data[column].type) {
			case 0:
				$.get('content_' + lang + '/' + section + '/' + column + '.html', function(data) {
					$('#placeholder').html(data);
				}).error(function(j, s, t) {
					console.log(s);
					$('#loc_entry_2').text('404');
					$('#placeholder').html(page_404);
				});
				break;
			case 1:
				renderList('#placeholder', lang, section, column, 1);
				break;
			case 2:
				renderGrid('#placeholder', lang, section, column, 1);
				break;
			default:
				$('#placeholder').html(page_404);
			}
		} else {
			$('#loc_entry_2').html('<a href="?s=' + section + '&amp;c=' + column + '">' + data[column].name + '</a>');
			$('#loc_sep_2').show();
			$.get('content_' + lang + '/' + section + '/' + column + '/' + article + '.html', function(data) {
				$('#placeholder').html(data);
				var title_node = $('#placeholder .article .article_title');
				if(title_node.length != 0) {
					var title = title_node.text();
					document.title = title + ' - ' + site_title;
				} else {
					var title = a;
				}
				$('#loc_entry_3').text(title);
			}).error(function(j, s, t) {
				console.log(s);
				$('#loc_entry_3').text('404');
				$('#placeholder').html(page_404);
			});
		}
	}).error(function(j, s, t) {
		console.log(s);
		$('#loc_entry_1').text('404');
		$('#placeholder').html(page_404);
	});
}

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(document).ready(function() {
	var lang = $.cookie('language');
	if(!lang) lang = 'cn';
	var section = parseInt(getParameterByName('s'));
	if(isNaN(section) || section < 1) {
		section = 0;
		$.getScript('js/unslider.min.js');
		$('head').append('<link rel="stylesheet" type="text/css" href="css/index.css">');
		Modernizr.load({
			test: Modernizr.csstransitions,
			yep : 'css/index-transition.css',
			nope: 'js/index-transition.js'
		});
		$.get('index_' + lang + '.html', function(data) {
			$('#content').html(data);
			renderSlide('content_' + lang + '/slides.json');
			renderColumn($('#s1c2'), lang, 1, 2);
			renderColumn($('#s1c3'), lang, 1, 3);
			renderColumn($('#s6c1'), lang, 6, 1);
			if (Modernizr.touch) {
				$('.image_popup').css('bottom', '0');
				$('.gallery_container span').css('display', 'inline');
			}
		}).error(function(j, s, t) {
			$('#content').html('<p>Failed to load index.</p>');
			console.log(s);
		});
	} else {
		$.get('content.html', function(data) {
			$('#content').html(data);
			renderContent(section, lang);
		});
		$(window).scroll(function(e) {
			$elem = $('.sidebar');
			if($(window).scrollTop() > 115) {
				if($elem.css('position') != 'fixed') $elem.addClass('sidebar_float');
			} else {
				if($elem.css('position') == 'fixed') $elem.removeClass('sidebar_float');
			}
		});
	}
	$.get('header_' + lang + '.html', function(data) {
		$('#header').html(data);
		renderMenu(section);
	}).error(function(j, s, t) {
		$('#header').html('<p>Failed to load header.</p>');
		console.log(s);
	});
	$.get('footer_' + lang + '.html', function(data) {
		$('#footer').html(data);
	}).error(function(j, s, t) {
		$('#footer').html('<p>Failed to load footer.</p>');
		console.log(s);
	});
});
