// Navigation
var lang, section, column, page, article;
// Settings
var animation, norefresh;
// Sequence Control
var header_deferred = new $.Deferred(), index_deferred, start_deferred, slide_deferred;
// Shared Data
var map, list;

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getParameters() {
  section = parseInt(getParameterByName('s'));
  if(!$.isNumeric(section) || section < 0) section = 0;
  column = parseInt(getParameterByName('c'));
  if(!$.isNumeric(column) || column < 1 ) column = 1;
  page = parseInt(getParameterByName('p'));
  if(!$.isNumeric(page) || page < 1) page = 1;
  article = parseInt(getParameterByName('a'));
  if(!$.isNumeric(article)) article = 0;
}

function countPage(length, num_per_page) {
  return Math.floor((length - 1) / num_per_page) + 1;
}

function backToTop() {
  $(window.opera ? 'html' : 'html,body').animate({ scrollTop: 0 }, 'slow');
}

function show() {
  $(this).removeClass('hidden');
  $(this).dequeue();
}

function hide() {
  $(this).addClass('hidden');
  $(this).dequeue();
}

function loadFail() {
  $('#loc_entry_3').text('404');
  $('#placeholder').html('<p style="text-align:center;text-indent:0"><img style="display:inline" src="images/404.jpg"></p>');
}

function linkRedirect() {
  // Content to Index
  if($(this).attr('href') == '.') {
    if(section == 0) return false;
    history.pushState({}, '', this.href);
    section = 0;
    backToTop();
    loadMenu();
    if(animation) {
      start_deferred = new $.Deferred();
      loadIndex(animation);
      $('#content .hideable').clearQueue();
      $('#content .hideable').addClass('hidden');
      $('#placeholder').delay(500).queue(function() {
        start_deferred.resolve();
        $(this).dequeue();
      });
    } else {
      loadIndex(animation);
    }
    return false;
  }
  if($(this).attr('href').charAt(0) != '?') return true;
  // Index to Content
  if(section == 0) {
    history.pushState({}, '', this.href);
    backToTop();
    getParameters();
    loadMenu();
    if(animation) {
      start_deferred = new $.Deferred();
      loadContent(animation);
      $('#index .hideable').clearQueue();
      $('.col_header div').addClass('hidden');
      $('.itemlist').addClass('hidden');
      $('.imagelist').addClass('hidden');
      $('.gallery').addClass('hidden');
      $('#slide_container').addClass('hidden');
      $('#index .hideable').delay(500).queue(hide);
      $('#slide_container').delay(700).queue(function() {
        start_deferred.resolve();
        $(this).html('');
        $(this).dequeue();
      });
    } else {
      loadContent(animation);
    }
    return false;
  }
  // Content to Content
  history.pushState({}, '', this.href);
  backToTop();
  getParameters();
  loadMenu();
  if(animation) {
    start_deferred = new $.Deferred();
    $('#content .hideable').clearQueue();
    $('#content .hideable').addClass('hidden');
    $('#placeholder').delay(500).queue(function() {
      start_deferred.resolve();
      loadContent(animation);
      $(this).dequeue();
    });
  } else {
    loadContent(animation);
  }
  return false;
  /*var oldSection = section, oldColumn = column;
  getParameters();
  if(oldSection != section) {
    $('#location_container').css('width', $('#loc_sep_1').position().left + 'px');

    $('#location_container').removeAttr('style');
  }*/
}

/*String.prototype.format = String.prototype.f = function() {
  var s = this,
    i = arguments.length;
  while(i--) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
  }
  return s;
};*/

function renderPageButton(current_page, page_count) {
  if(page_count < 2) return;
  if(current_page == 1) {
    $('#pager').append('<div class="pagebutton pagebutton_disabled">&lt;</div>');
  } else {
    $('#pager').append('<div class="pagebutton">&lt;</div>');
  }
  for(var i = 1; i <= page_count; i++) {
    if(i == current_page) {
      $('#pager').append('<div class="pagebutton nowpage">' + i + '</div>');
    } else {
      $('#pager').append('<div class="pagebutton">' + i + '</div>');
    }
  }
  if(current_page == page_count) {
    $('#pager').append('<div class="pagebutton pagebutton_disabled">&gt;</div>');
  } else {
    $('#pager').append('<div class="pagebutton">&gt;</div>');
  }
}

/*function renderGrid(tag, lang, section, column, page) {
  $.getJSON('content_' + lang + '/' + section + '/' + column + '/0.json', function(data) {
    var page_count = countPage(data.length, 3 * 4);
    if(page > page_count) page = 1;
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
  });
}*/

function renderList(data) {
  $('#placeholder').html('<table id="newslist"></table><div id="pager_container"><div id="pager"></div></div>');
  var start = (page - 1) * 15, end = page * 15;
  if(end > data.length) end = data.length;
  for(var i = start; i < end; i++) {
    if(typeof data[i].url == 'string') {
      $('#newslist').append('<tr><td class="newsdot"></td><td class="newstitle"><a href="' + data[i].url +
        '">' + data[i].title + '</a></td>' + ((data[i].date) ? '<td class="newsdate">' + data[i].date +
        '</td>' : '') + '</tr>');
    } else {
      $('#newslist').append('<tr><td class="newsdot"></td><td class="newstitle"><a href="?s=' + section +
        '&amp;c=' + column + '&amp;a=' + data[i].url + '">' + data[i].title + '</a></td>' + ((data[i].date) ?
        '<td class="newsdate">' + data[i].date + '</td>' : '') + '</tr>');
    }
  }
}

function loadList(filter) {
  list.done(function(data) {
    if(filter) {
      data = $(data).filter(function() {
        return this.title.toLowerCase().indexOf(filter) >= 0;
      });
    }
    var page_count = countPage(data.length, 15);
    if(page > page_count) page = 1;
    renderList(data);
    renderPageButton(page, page_count);
    $('.pagebutton').click(function() {
      var to = $(this).text();
      if(to == '<') to = page - 1;
      if(to == '>') to = +page + 1;
      if((to < 1) || (to > page_count)) return;
      page = to;
      if(norefresh) {
        var loc=window.location.href;
        history.pushState({}, '', loc.substring(0, loc.lastIndexOf('?') + 1) +
          's=' + section + '&c=' + column + '&p=' + page);
      }
      loadList(filter);
    });
  });
}

function renderContent(data, animating) {
  var site_title = data[0].title;
  $('#loc_prompt').text(data[0].loc_prompt);
  if (section >= data.length) window.location.href = '.';
  data = data[section];
  $('#loc_entry_1').text(data[0].page_name);
  if(column >= data.length) column = 1;
  document.title = data[column].name + ' - ' + site_title;
  $('#sidebar_header').text(data[0].page_name);
  $('#sidebar_navi').html('<ul></ul>');
  for(var s = 1; s < data.length; s++) {
    if(s == column) {
      $('#sidebar_navi ul').append('<li><a href="?s=' + section + '&amp;c=' + s
        + '"><strong>' + data[s].name + '</strong></a></li>');
    } else {
      $('#sidebar_navi ul').append('<li><a href="?s=' + section + '&amp;c=' + s
        + '">' + data[s].name + '</a></li>');
    }
  }
  if(article == 0) {
    $('#loc_entry_2').text(data[column].name);
    switch (data[column].type) {
    case 0:
      $('#loc_entry_3').text(data[column].name);
      $.getJSON('content_' + lang + '/' + section + '/' + column + '.json', function(data) {
        $('#placeholder').html(data.html);
      }).fail(loadFail);
      break;
    case 1:
      list = $.getJSON('content_' + lang + '/' + section + '/' + column + '/0.json');
      $('#loc_entry_3').html('<input type="text" id="list_filter">');
      $('#list_filter').on('input', function() {
        loadList($(this).val().toLowerCase());
      });
      loadList('');
      break;
    /*case 2:
      renderGrid('#placeholder', lang, section, column, page, map, header_deferred, sequence, animation, norefresh);
      break;*/
    default:
      loadFail();
    }
  } else {
    $('#loc_entry_2').html('<a href="?s=' + section + '&amp;c=' + column + '">' + data[column].name + '</a>');
    $.getJSON('content_' + lang + '/' + section + '/' + column + '/' + article + '.json', function(data) {
      $('#placeholder').html('');
      $('#placeholder').append('<div class="article_title">' + data.title + '</div>');
      if(data.date) $('#placeholder').append('<div class="article_date">' + data.date + '</div>');
      $('#placeholder').append('<div class="article_content">' + data.html + '</div>');
      var title_node = $('#placeholder .article_title');
      if(title_node.length != 0) {
        var title = title_node.text();
        document.title = title + ' - ' + site_title;
      } else {
        var title = a;
      }
      $('#loc_entry_3').text(title);
    }).fail(loadFail);
  }
  if(animating) {
    start_deferred.done(function() {
      $('#index').hide();
      $('#content').show();
      $('#location_container').delay(0).queue(show);
      $('#sidebar_container').delay(500).queue(show);
      $('#placeholder').delay(800).queue(show);
    });
  } else {
    $('#index').hide();
    $('#content').show();
    $('#content .hidden').removeClass('hidden');
  }
}

function renderSlide(animating) {
  $.getJSON('content_' + lang + '/slides.json', function(data) {
    $.when(index_deferred, start_deferred).done(function() {
      $('#content').hide();
      $('#index').show();
      $('#slide_container').html('<div id="slide"><ul></ul></div>');
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
      if(animating) {
        header_deferred.done(function() {
          $('#slide_container').removeClass('hidden');
          $('#slide_container').delay(1000).queue(function() {
            slide_deferred.resolve();
            $(this).dequeue();
          });
        });
      }
    });
  });
}

function renderColumn(node, section, column, animating) {
  $.getJSON('content_' + lang + '/' + section + '/' + column + '/0.json', function(data) {
    index_deferred.done(function() {
      if(animating) {
        $(node + ' .itemlist_container').html('<table class="itemlist hideable hidden"></table>');
      } else {
        $(node + ' .itemlist_container').html('<table class="itemlist hideable"></table>');
      }
      for(var i = 0; i < (data.length > 5 ? 5 : data.length); i++) {
        $(node + ' .itemlist').append('<tr><td class="item_dot"></td><td class="item_title"><a href="' +
          ((typeof data[i].url == 'string') ? data[i].url : '?s=' + section + '&amp;c=' +
          column + '&amp;a=' + data[i].url) + '">' + data[i].title + '</a></td>' + ((data[i].date) ?
          '<td class="item_date">' + data[i].date + '</td>' : '') + '</tr>');
      }
    });
  });
}

function loadMenu() {
  map.done(function(data) {
    renderMenu(data, section);
  });
}

function loadContent(animating) {
  map.done(function(data) {
    renderContent(data, animating)
  });
}

function loadIndex(animating) {
  map.done(function(data) {
    document.title = data[0].title;
  });
  if(!$('#index').html()) {
    index_deferred = new $.Deferred();
    $('#index').load('index_' + lang + '.html', function() {
      index_deferred.resolve();
      Modernizr.load({
        test: Modernizr.csstransitions,
        yep : 'css/index-transition.css',
        nope: 'js/index-transition.js'
      });
      if (Modernizr.touch) {
        $('.image_popup').css('bottom', '0');
        $('.gallery_container span').css('display', 'inline');
      }
    });
  }
  slide_deferred = new $.Deferred();
  index_deferred.done(function() {
    if(animating) {
      slide_deferred.done(function() {
        for(var i = 1; i <= 6; i++) {
          $('#column' + i + ' .col_header').delay((i - 1) * 200).queue(show);
          $('#column' + i + ' .hidden').delay(i * 200).queue(show);
        }
      });
    } else {
      $('#index .hidden').removeClass('hidden');
    }
  });
  renderSlide(animating);
  renderColumn('#column1', 1, 3, animating);
  renderColumn('#column2', 1, 2, animating);
  renderColumn('#column5', 6, 1, animating);
}

function loadPage(animating) {
  getParameters();
  if(section == 0) {
    loadIndex(animating);
  } else {
    loadContent(animating);
  }
}

$(document).ready(function() {
  lang = $.cookie('language');
  if(!lang) lang = 'cn';
  animation = Modernizr.csstransitions && !$.cookie('notransition');
  norefresh = Modernizr.history;
  start_deferred = new $.Deferred();
  map = $.getJSON('content_' + lang + '/map.json');
  if(norefresh) {
    header_deferred.done(function() {
      $(window).on('popstate', function() {
        $('.hideable').addClass('hidden');
        loadPage(false);
        loadMenu();
      });
      $(document).delegate('a', 'click', linkRedirect);
    });
  }
  loadPage(animation);
  $('#header').load('header_' + lang + '.html', function() {
    header_deferred.resolve();
    $('#header').removeClass('hidden');
    if(animation && section != 0) {
      $('#header').delay(1000).queue(function() {
        start_deferred.resolve();
        $(this).dequeue();
      });
    } else {
      start_deferred.resolve();
    }
    loadMenu();
  });
  $('#footer').load('footer_' + lang + '.html', function() {
    header_deferred.done(function() {
      $('#footer').removeClass('hidden');
    });
  });
});

$(window).scroll(function(e) {
  $elem = $('.floatable');
  if($(window).scrollTop() > 115) {
    if($elem.css('position') != 'fixed') $elem.addClass('float');
  } else {
    if($elem.css('position') == 'fixed') $elem.removeClass('float');
  }
});
