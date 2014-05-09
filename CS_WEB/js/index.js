Modernizr.load({
	test: Modernizr.csstransitions,
	yep : 'css/transition.css',
	nope: 'js/transition.js'
});

function insertItem(node, data, baseurl) {
	target = $('.itemlist', node);
	if(target.length) {
		target.append('<tr><td class="item_dot"></td><td class="item_title"><a href="' +
			((typeof data.url == 'string') ? data.url : baseurl + '1&a=' + data.url.toString()) +
			'">' + data.title + '</a></td><td class="item_date">' + data.date + '</td></tr>');
	}
}

function insertSlide(data) {
	target = $('#slide ul');
	if(target.length) {
		target.append(
			'<li style="background-image: url(' + data.image +');">' +
				'<div class="mask"></div>' +
						'<div class="description">' +
							'<a href="' + data.url + '">' + data.title + '</a>' +
							'<p>' + data.desc + '</p>' +
						'</div>' +
					'</li>');
	}
}

function renderSlide(url) {
	var rand = (new Date()).toString();
	$.get(url, function(data) {
		if(typeof data == 'string') data = eval('(' + data + ')');
		for(var i = 0; i < data.slides.length; i++) {
			insertSlide(data.slides[i]);
		}
		$('#slide').unslider({
			speed: 500,
			delay: 4000,
			keys: true,
			dots: true,
			fluid: false
		});
	}).fail(function(j, s, t) {
		console.log(s);
	});
}

function renderColumn(node, url) {
	var rand = (new Date()).toString();
	$.get(url, function(data) {
		if(typeof data == 'string') data = eval('(' + data + ')');
		for(var i = 0; i < (data.articles.length > 5 ? 5 : data.articles.length); i++) {
			insertItem(node, data.articles[i], data.base_url);
		}
	}).fail(function(j, s, t) {
		console.log(s);
	});
}

$(document).ready(function() {
	$("#header").load("header.html", function() {
		renderColumn($('#activity'), 'cms/intro/activity.json');
		renderColumn($('#paperwork'), 'cms/paper/paper_list.json');
		renderColumn($('#news'), 'cms/intro/news.json')
		renderSlide('cms/index.json');
		$('#content').show();
		$("#footer").load("footer.html").fail(function(j, s, t) {
			$('#footer').html('<p>Failed to load footer.</p>');
			console.log(s);
		});
	}).fail(function(j, s, t) {
		$('#header').html('<p>Failed to load header.</p>');
		console.log(s);
	});
});

