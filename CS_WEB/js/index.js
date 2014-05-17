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
		$.get('index_' + lang + '.html', function(data) {
			$('#content').html(data);
			Modernizr.load({
				test: Modernizr.csstransitions,
				yep : 'css/index-transition.css',
				nope: 'js/index-transition.js'
			});
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
		var column = parseInt(getParameterByName('c'));
		var article = parseInt(getParameterByName('a'));
		$.get('content.html', function(data) {
			$('#content').html(data);
			renderContent(section, column, article, lang);
		});
		$(window).scroll(function(e) {
			$elem = $('#sidebar');
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
