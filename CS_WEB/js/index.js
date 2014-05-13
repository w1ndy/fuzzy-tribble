Modernizr.load({
	test: Modernizr.csstransitions,
	yep : 'css/index-transition.css',
	nope: 'js/index-transition.js'
});

function insertItem(node, data, baseurl) {
	target = $('.itemlist', node);
	if(target.length) {
		target.append('<tr><td class="item_dot"></td><td class="item_title"><a href="' +
			((typeof data.url == 'string') ? data.url : baseurl + '&amp;a=' + data.url) +
			'">' + data.title + '</a></td><td class="item_date">' + data.date + '</td></tr>');
	}
}

function renderColumn(node, lang, section, column) {
	$.get('content_' + lang + '/' + section + '/' + column + '/0.json', function(data) {
		if(typeof data == 'string') data = eval('(' + data + ')');
		for(var i = 0; i < (data.length > 5 ? 5 : data.length); i++) {
			insertItem(node, data[i], 'content.html?s=' + section + '&amp;c=' + column);
		}
	}).error(function(j, s, t) {
		console.log(s);
	});
}

function insertSlide(data) {
	target = $('#slide ul');
	if(target.length) {
		target.append(
			'<li>' +
				'<img src="' + data.image + '">' +
				'<div class="mask"></div>' +
						'<div class="description">' +
							'<a href="content.html?' + data.url + '">' + data.title + '</a>' +
							'<p>' + data.desc + '</p>' +
						'</div>' +
					'</li>');
	}
}

function renderSlide(url) {
	$.get(url, function(data) {
		if(typeof data == 'string') data = eval('(' + data + ')');
		for(var i = 0; i < data.length; i++) {
			insertSlide(data[i]);
		}
		$('#slide').unslider({
			speed: 500,
			delay: 4000,
			keys: true,
			dots: true,
			fluid: false
		});
	}).error(function(j, s, t) {
		console.log(s);
	});
}

$(document).ready(function() {
	var lang = $.cookie('language');
	if(!lang) lang = 'cn';
	$.get('index_' + lang + '.html', function(data) {
		$("#content").html(data);
		$.get('header_' + lang + '.html', function(data) {
			$("#header").html(data);
			renderMenu(0);
			renderColumn($('#s1c2'), lang, 1, 2);
			renderColumn($('#s1c3'), lang, 1, 3);
			renderColumn($('#s6c1'), lang, 6, 1)
			renderSlide('content_' + lang + '/slides.json');
			$('#content').show();
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
	}).error(function(j, s, t) {
		$('#content').html('<p>Failed to load index.</p>');
		console.log(s);
	});
});
