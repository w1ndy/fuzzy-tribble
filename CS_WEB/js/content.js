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
					'content.html?s=' + section + '&amp;c=' + column + '&amp;a=' + data[i].url,
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
				$('#newslist').append('<tr><td class="newsdot"></td><td class="newstitle"><a href="content.html?s=' + section +
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
    $("#loc_prompt").text(data[0].loc_prompt);
    if(data[0].width) $("#loc_prompt").css('width', data[0].width + 'px');
    data = data[section];
		$('#sidebar_header').html('<p>' + data[0].page_name + '</p>');
		$('#loc_entry_1').html('<p>' + data[0].page_name + '</p>');
    if(data[0].width) $('#loc_entry_1').css('width', data[0].width + 'px')
		var sidebar_navi = $('#sidebar_navi ul');
		for(var s = 1; s < data.length; s++) {
			sidebar_navi.append('<li><a href="content?s=' + section + '&amp;c=' + s + '">' + data[s].name + '</a></li>');
		}
    var column = parseInt(getParameterByName('c'));
		if(isNaN(column) || column < 1 || column >= data.length) column = 1;
    if(data[column].width) $('#loc_entry_2').css('width', data[column].width + 'px')
    var article = parseInt(getParameterByName('a'));
		if(isNaN(article)) {
			$('#loc_entry_2').html('<p>' + data[column].name + '</p>');
			$('#loc_sep_1').show();
			$('#loc_entry_2').show();
      switch (data[column].type) {
      case 0:
        $.get('content_' + lang + '/' + section + '/' + column + '.html', function(data) {
          $('#placeholder').html(data);
        }).error(function(j, s, t) {
          console.log(s);
          $('#loc_entry_2').html('<p>404</p>');
          $.get('content_shared/404.html', function(data) {
            $('#placeholder').html(data);
          });
        });
        break;
      case 1:
        renderList('#placeholder', lang, section, column, 1);
        break;
      case 2:
        renderGrid('#placeholder', lang, section, column, 1);
        break;
      default:
        $.get('content_shared/404.html', function(data) {
          $('#placeholder').html(data);
        });
      }
		} else {
			$('#loc_entry_2').html('<a href="content.html?s=' + section + '&amp;c=' + column + '">' + data[column].name + '</a>');
			$('#loc_sep_1').show();
			$('#loc_entry_2').show();
			$('#loc_sep_2').show();
			$('#loc_entry_3').show();
			$.get('content_' + lang + '/' + section + '/' + column + '/' + article + '.html', function(data) {
				$('#placeholder').html(data);
				var title_node = $('#placeholder .article .article_title');
				if(title_node.length != 0) {
					var title = title_node.text();
				} else {
					var title = a;
				}
				$('#loc_entry_3').html('<p>' + title + '</p>');
			}).error(function(j, s, t) {
				console.log(s);
				$('#loc_entry_3').html('<p>404</p>');
				$.get('content_shared/404.html', function(data) {
					$('#placeholder').html(data);
				});
			});
		}
		$('#placeholder').show();
	}).error(function(j, s, t) {
		console.log(s);
		$('#loc_entry_1').html('<p>404</p>');
		$.get('content_shared/404.html', function(data) {
			$('#placeholder').html(data);
			$('#placeholder').show();
		});
	});
}

$(document).ready(function() {
  var lang = $.cookie('language');
  if(!lang) lang = 'cn';
  var section = parseInt(getParameterByName('s'));
  if(isNaN(section) || section < 1) window.location.href = '.'
	$.get('header_' + lang + '.html', function(data) {
		$("#header").html(data);
		renderMenu(section);
		renderContent(section, lang);
		$("#content").show();
		$.get('footer_' + lang + '.html', function(data) {
			$("#footer").html(data);
		}).error(function(j, s, t) {
			$('#footer').html('<p>Failed to load footer.</p>');
			console.log(s);
		});
	}).error(function(j, s, t) {
		$('#header').html('<p>Failed to load header.</p>');
		console.log(s);
	});
});

$(window).scroll(function(e) {
	$elem = $(".sidebar");
	if($(window).scrollTop() > 115) {
		if($elem.css("position") != "fixed") $elem.addClass('sidebar_float');
	} else {
		if($elem.css("position") == "fixed") $elem.removeClass('sidebar_float');
	}
});
