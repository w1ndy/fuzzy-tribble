String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function renderPageButton(current_page, page_count, base_url) {
	var b = 0;
	if(current_page != 1) {
		$('.pager').append('<div class="pagebutton"><a href="' +
			base_url + (current_page - 1) + '">&lt;</a></div>');
		b++;
	}
	for(var i = 1; i <= page_count; i++) {
		if(i == current_page) {
			$('.pager').append('<div class="pagebutton nowpage"><a href="#">' + i + '</a></div>');
		} else {
			$('.pager').append('<div class="pagebutton"><a href="' + base_url + i + '">' +
				i + '</a></div>');
		}
		b++;
	}
	if(current_page != page_count) {
		$('.pager').append('<div class="pagebutton"><a href="' +
			base_url + (current_page + 1) + '">&gt;</a></div>');
		b++;
	}
	b = Math.round((760 - (b * 35)) / 2);
	$('.pager').css('margin-left', b.toString() + 'px');
}

function countPage(array, num_per_page) {
	return Math.floor((array.length - 1) / num_per_page) + 1;
}

function renderGrid(tag, desc) {
	var rand = (new Date()).toString();
	console.log(rand.toString());
	$.get(desc).success(function (data) {
		if(typeof data == 'string')
			data = eval('(' + data + ')');

		var sp = getParameterByName('p');
		var p = parseInt(sp, 10);
		var page_count = countPage(data.grids, 3 * 4);

		if(sp == '' || p == 0 || p > page_count)
			p = 1;
		$(tag).html(
			'<div class="gridcont"></div>' +
			'<div class="pager"></div>');

		var start = (p - 1) * 12, end = p * 12;
		end = (end > data.grids.length) ? data.grids.length : end;

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
			if(typeof data.grids[i].url == 'string') {
				$('.gridcont').append(grid.f(
					data.grids[i].image,
					data.grids[i].url,
					data.title));
			} else {
				$('.gridcont').append(grid.f(
					data.grids[i].image,
					data.base_url + p + '&a=' + data.grids[i].url, 
					data.grids[i].title));
			}
		}
		renderPageButton(p, page_count, data.base_url);
	}).error(function(j, s, t) {console.log(s); });
}

function renderList(tag, desc) {
	var rand = (new Date()).toString();
	console.log(rand.toString());
	$.get(desc).success(function (data) {
		if(typeof data == 'string') data = eval('(' + data + ')');
		//console.log('json fetched');
		console.log(data);
		//var data = $.parseJSON(json_raw);
		var sp = getParameterByName('p');
		var p = parseInt(sp, 10);
		var art_count = data.articles.length;
		var page_count = Math.floor((art_count - 1) / 15) + 1;

		if(sp == '' || p == 0 || p > page_count)
			p = 1;
		$(tag).html('<div class="newscont"><table class="newslist"></table></div><div class="pager"></div>');

		var start = (p - 1) * 15, end = p * 15;
		if(end > data.articles.length)
			end = data.articles.length;
		for(var i = start; i < end; i++) {
			if(typeof data.articles[i].url == 'string') {
				$('.newslist').append('<tr><td class="newsdot"></td><td class="newstitle"><a href="'
					+ data.articles[i].url + '">' + data.articles[i].title + '</a></td><td class="newsdate">' +
					data.articles[i].date + '</td></tr>');
			} else {
				$('.newslist').append('<tr><td class="newsdot"></td><td class="newstitle"><a href="'
					+ data.base_url + p.toString() + '&a=' + data.articles[i].url + '">' + data.articles[i].title + '</a></td><td class="newsdate">' +
					data.articles[i].date + '</td></tr>');
			}
		}
		renderPageButton(p, page_count, data.base_url);
	}).error(function(j, s, t) {console.log(s); });
}

function renderContent(page) {
	console.log('rendering content for ' + page);
	var rand = new Date().toString();
	$.get('cms/cms_' + page + '.json', function(data) {
		if(typeof data == 'string') data = eval('(' + data + ')');
		$('.sidebar_header').html('<p>' + data.page_name + '</p>');
		$('#loc_entry_1').html('<p>' + data.page_name + '</p>');
		var sidebar_navi = $('.sidebar_navi ul');
		for(var s in data.columns) {
			sidebar_navi.append('<li><a href="'+ data.base_url + '?c=' + s + '">' + data.columns[s].name + '</a></li>');
		}

		var sc = getParameterByName('c');
		var sp = getParameterByName('p');
		var sa = getParameterByName('a');
		c = parseInt(sc, 10);
		p = parseInt(sp, 10);
		a = parseInt(sa, 10);

		if(sc == '' || c < 0 || c >= data.columns.length) 
			c = 0;
		if(sp == '')
			p = 0;

		if(sa == '') {
			$('#loc_entry_2').html('<p>' + data.columns[c].name + '</p>');
			$('#loc_sep_1').show();
			$('#loc_entry_2').show();

			$.get(data.columns[c].url + '?_=' + rand, function(data) {
				$('.placeholder').html(data);
			}).error(function(j, s, t) {
				console.log(s);
				$('#loc_entry_2').html('<p>404</p>');
				$.get('cms/pending.html', function(data) {
					$('.placeholder').html(data);
				});
			});
		} else {
			if(sp != '') {
				$('#loc_entry_2').html('<a href="' + data.base_url + '?c=' + c + '&p=' + p + '">' + data.columns[c].name + '</a>');
			} else {
				$('#loc_entry_2').html('<a href="' + data.base_url + '?c=' + c + '">' + data.columns[c].name + '</a>');
			}
			$('#loc_sep_1').show();
			$('#loc_entry_2').show();
			$('#loc_sep_2').show();
			$('#loc_entry_3').show();

			if(a == 404) {
				$('#loc_entry_3').html('<p>404</p>');
				$.get('cms/pending.html', function(data) {
					$('.placeholder').html(data);
				});
			} else {
				$.get('articles/' + a + '.html?_=' + rand, function(data) {
					$('.placeholder').html(data);
					var title;
					var title_node = $('.placeholder .article .article_title');
					if(title_node.length != 0) {
						title = title_node.text();
					} else {
						title = "文章";
					}
					$('#loc_entry_3').html('<p>' + title + '</p>');
				}).error(function(j, s, t) {
					console.log(s);
					$('#loc_entry_3').html('<p>404</p>');
					$.get('cms/pending.html', function(data) {
						$('.placeholder').html(data);
					});
				});
			}
		}
		$('.placeholder').show();
	}).error(function(j, s, t) {
		console.log(s);
		$('#loc_entry_1').html('<p>404</p>');
		$.get('cms/pending.html', function(data) {
			$('.placeholder').html(data);
			$('.placeholder').show();
		});

	});
}

function loadContent() {
	$(document).ready(function() {
		$.get("header.html", function(data) {
			$("#header").html(data);
			$.get("cms/cms_template.html", function(data) {
				$("#content").html(data);
				var loc = $(location).attr('pathname');
				var start = loc.lastIndexOf('/'), end = loc.lastIndexOf('.');
				if(start == -1 || end == -1) {
					$("#content").load("cms/pending.html");
				} else {
					renderContent(loc.substring(start + 1, end));
				}
				$("#content").show();

				$.get("footer.html", function(data) {
					$("#footer").html(data);
				}).error(function(j, s, t) {
					$('#footer').html('<p>Failed to load footer.</p>');
					console.log(s);
				});
			}).error(function(j, s, t) {
				$('#content').html('<p>Failed to load cms template.</p>');
				console.log(s);
			});
		}).error(function(j, s, t) {
			$('#header').html('<p>Failed to load header.</p>');
			console.log(s);
		});
	});
}

$(window).scroll(function(e) {
	$elem = $(".sidebar");
	if($(window).scrollTop() > 105) {
		if($elem.css("position") != "fixed") {
			$elem.css({'position': 'fixed', 'top': '50px', 'right':''+($(window).width() - 1000)/2+'px'});
		}
	} else {
		if($elem.css("position") == "fixed") {
			$elem.css({'position': '','top':'', 'right':''});
		}
	}
});

