// Navigation
var lang, section, column, page, article;
// Settings
var animation, norefresh;
// Sequence Control
var header_deferred, sequence = new Array(8);
// Shared Data
var map;

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

function backToTop() {
  $(window.opera ? 'html' : 'html, body').animate({ scrollTop: 0 }, 'slow');
}

function linkRedirect(href, link) {
  // Content to Index
  if(href.charAt(0) == '.') {
    if(section == 0) return false;
    history.pushState({}, '', link);
    section = 0;
    backToTop();
    loadMenu();
    if(animation) {
      $('#placeholder').bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
        $('#placeholder').unbind();
        $('#content').hide();
        loadIndex(animation);
      });
      $('#content .hideable').addClass('hidden');
    } else {
      loadIndex(animation);
    }
    return false;
  }
  if(href.charAt(0) != '?') return true;
  // Index to Content
  if(section == 0) {
    history.pushState({}, '', link);
    backToTop();
    getParameters();
    loadMenu();
    if(animation) {
      $('#slide_container').bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
        $('#slide_container').unbind();
        $('#index').hide();
        loadContent(animation);
      });
      $('#index .hideable').addClass('hidden');
    } else {
      loadContent(animation);
    }
    return false;
  }
  // Content to Content
  history.pushState({}, '', link);
  backToTop();
  getParameters();
  loadMenu();
  if(animation) {
    $('#placeholder').bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
      $('#placeholder').unbind();
      loadContent(animation);
    });
    $('#content .hideable').addClass('hidden');
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

var page_404 = '<p style="text-align:center;text-indent:0"><img style="display:inline" src="images/404.jpg"></p>';

String.prototype.format = String.prototype.f = function() {
  var s = this,
    i = arguments.length;
  while(i--) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
  }
  return s;
};

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

function countPage(length, num_per_page) {
  return Math.floor((length - 1) / num_per_page) + 1;
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
  $.getJSON('content_' + lang + '/' + section + '/' + column + '/0.json', function(data) {
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
    if(norefresh) {
      $('#newslist a').click(function() {
        return linkRedirect($(this).attr('href'), this.href);
      });
    }
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
  if(norefresh) {
    $('#sidebar_navi a').click(function() {
      return linkRedirect($(this).attr('href'), this.href);
    });
  }
  if(article == 0) {
    $('#loc_entry_2').text(data[column].name);
    switch (data[column].type) {
    case 0:
      $('#loc_entry_3').text(data[column].name);
      $.getJSON('content_' + lang + '/' + section + '/' + column + '.json', function(data) {
        $('#placeholder').html(data.html);
      }).fail(function() {
        $('#loc_entry_2').text('404');
        $('#placeholder').html(page_404);
      });
      break;
    case 1:
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
      $('#placeholder').html(page_404);
    }
  } else {
    $('#loc_entry_2').html('<a href="?s=' + section + '&amp;c=' + column + '">' + data[column].name + '</a>');
    if(norefresh) {
      $('#loc_entry_2 a').click(function() {
        return linkRedirect($(this).attr('href'), this.href);
      });
    }
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
    }).fail(function() {
      $('#loc_entry_3').text('404');
      $('#placeholder').html(page_404);
    });
  }
  if(animating) {
    //for(var i = 1; i < 8; i++) sequence[i] = new $.Deferred();
    sequence[0].done(function() {
      $('#location_container').delay(0).queue(function() {
        $(this).removeClass('hidden');
        $(this).dequeue();
      });
      $('#sidebar_container').delay(500).queue(function() {
        $(this).removeClass('hidden');
        $(this).dequeue();
      });
      $('#placeholder').delay(800).queue(function() {
        $(this).removeClass('hidden');
        $(this).dequeue();
      });
    });
  } else {
    $('#content .hidden').removeClass('hidden');
  }
}

function renderSlide(content_deferred, url, animating) {
  $.getJSON(url, function(data) {
    content_deferred.done(function() {
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
          $('#slide_container').bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
            $('#slide_container').unbind();
            sequence[1].resolve(1);
          });
          $('#slide_container').removeClass('hidden');
        });
      }
    });
  });
}

function renderColumn(content_deferred, node, section, column) {
  return $.getJSON('content_' + lang + '/' + section + '/' + column + '/0.json', function(data) {
    content_deferred.done(function() {
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
    if(norefresh) {
      $('.menubar-content-menu a').click(function() {
        return linkRedirect($(this).attr('href'), this.href);
      });
    }
  });
}

function loadContent(animating) {
  $('#content').show();
  map.done(function(data) {
    renderContent(data, animating)
  });
}

function loadIndex(animating) {
  $('#index').show();
  map.done(function(data) {
    document.title = data[0].title;
  });
  for(var i = 1; i < 8; i++) sequence[i] = new $.Deferred();
  var content_deferred = new $.Deferred();
  $('#index').load('index_' + lang + '.html', function() {
    content_deferred.resolve();
    Modernizr.load({
      test: Modernizr.csstransitions,
      yep : 'css/index-transition.css',
      nope: 'js/index-transition.js'
    });
    if (Modernizr.touch) {
      $('.image_popup').css('bottom', '0');
      $('.gallery_container span').css('display', 'inline');
    }
    if(animating) {
      for(var i = 1; i <= 6; i++) {
        sequence[i].done(function(seq) {
          $('#column' + seq + ' .col_header').bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
            $('#column' + seq + ' .col_header').unbind();
            sequence[seq + 1].resolve(seq + 1);
            $('#column' + seq + ' .hidden').removeClass('hidden');
          });
          $('#column' + seq + ' .col_header').removeClass('hidden');
        });
      }
    } else {
      $('#index .hidden').removeClass('hidden');
    }
  });
  renderSlide(content_deferred, 'content_' + lang + '/slides.json', animating);
  $.when(renderColumn(content_deferred, '#column1', 1, 3),
    renderColumn(content_deferred, '#column2', 1, 2),
    renderColumn(content_deferred, '#column5', 6, 1)).then(function() {
      if(norefresh) {
        $('#index a').click(function() {
          return linkRedirect($(this).attr('href'), this.href);
        });
      }
    });
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
  sequence[0] = new $.Deferred();
  header_deferred = new $.Deferred();
  map = $.getJSON('content_' + lang + '/map.json');
  if(norefresh) {
    header_deferred.done(function() {
      $(window).bind('popstate', function() {
        loadPage(false);
        loadMenu();
      });
    });
  }
  loadPage(animation);
  $('#header').load('header_' + lang + '.html', function() {
    header_deferred.resolve();
    if(animation) {
      $('#header').bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
        $('#header').unbind();
        sequence[0].resolve();
      });
      $('#header').removeClass('hidden');
    }
    loadMenu();
  });
  $('#footer').load('footer_' + lang + '.html', function() {
    if(animation) {
      header_deferred.done(function() {
        $('#footer').removeClass('hidden');
      });
    }
  });
});

$(window).scroll(function(e) {
  $elem = $(".floatable");
  if($(window).scrollTop() > 115) {
    if($elem.css("position") != "fixed") $elem.addClass("float");
  } else {
    if($elem.css("position") == "fixed") $elem.removeClass("float");
  }
});
