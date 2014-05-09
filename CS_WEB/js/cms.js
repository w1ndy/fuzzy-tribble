function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
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
		var b = 0;
		if(p != 1) {
			$('.pager').append('<div class="pagebutton"><a href="' +
				data.base_url + (p - 1) + '">&lt;</a></div>');
			b++;
		}
		for(var i = 1; i <= page_count; i++) {
			if(i == p) {
				$('.pager').append('<div class="pagebutton nowpage"><a href="#">' + i + '</a></div>');
			} else {
				$('.pager').append('<div class="pagebutton"><a href="' + data.base_url + i + '">' +
					i + '</a></div>');
			}
			b++;
		}
		if(p != page_count) {
			$('.pager').append('<div class="pagebutton"><a href="' +
				data.base_url + (p + 1) + '">&gt;</a></div>');
			b++;
		}
		b = Math.round((760 - (b * 35)) / 2);
		$('.pager').css('margin-left', b.toString() + 'px');
	}).fail(function(j, s, t) {console.log(s); });
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
			}).fail(function(j, s, t) {
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
				}).fail(function(j, s, t) {
					console.log(s);
					$('#loc_entry_3').html('<p>404</p>');
					$.get('cms/pending.html', function(data) {
						$('.placeholder').html(data);
					});
				});
			}
		}
		$('.placeholder').show();
	}).fail(function(j, s, t) {
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
		$("#header").load("header.html");
		$("#content").load("cms/cms_template.html", function() {
			var loc = $(location).attr('pathname');
			var start = loc.lastIndexOf('/'), end = loc.lastIndexOf('.');
			if(start == -1 || end == -1) {
				$("#content").load("cms/pending.html");
			} else {
				renderContent(loc.substring(start + 1, end));
			}
		});
		$("#footer").load("footer.html");
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

