(function($) {

  var defaults = { 
    history: false, 
    active_thumb_overlay_url: "/img/fs-thumb-marker.png",
    extra_top_margin_callback: function(){ return 0; },
    show_overlay_callback: function(){}, 
    hide_overlay_callback: function(){}, 
    show_image_callback: function(){},
    title_for_link: function(el){ return $(el).attr('title');
                         },
    subtitle_for_link: function(el){ return $(el).attr('href').split('/').pop(); }
  };
  var options;
  var overlay_showing = false;

  $.fn.phocus = function(new_options) {

    setOptions(new_options);

    if (!$('#fs-overlay').length) {
      append_html_skeleton();
    }

    var links = $(this).parent('a');
    put_thumbs(links);

    // copied thumbs also trigger loading of the image
    $('#fs-thumbs a').click(thumb_click_callback);

    // tell original thumbs to open fullscreen on click
    links.click(thumb_click_callback);

    // close the fullscreen view on click
    $('#fs-stage').click(function() {
      hide_overlay();
    });

    $('#fs-image img, #fs-info').live('mouseover mouseout', function(e) {
      if (e.type == "mouseover")
        $('#fs-info').stop(true, true).fadeIn();
      else
        $('#fs-info').stop(true, true).fadeOut();
    });

    if (options.history) {
      $.history.init(function(hash) {
        if (hash.length > 0) {
          find_and_show_image(hash);
        }
      });
    }

    /**
     * PRIVATE FUNCTIONS
     */

    function thumb_click_callback(e) {
      var hash = $.fn.phocus.get_image_hash(this);
      // find image and show it
      if (options.history) {
        $.history.load(hash)
      } else {
        find_and_show_image(hash);
      }
      
      e.preventDefault();
    }

    function get_full_image_url(a) {
      return a.attr('href');
    }

    function find_dimensions(a) {
      a = $(a);
      a.data('fs-data', { height: a.height(), width: a.width() })
    }

    function put_thumbs(links) {
      links.clone().appendTo('#fs-thumbs');
      $('#fs-thumbs img').height(50).width(50);
      $('#fs-thumbs').css('width', $('#fs-thumbs a').size() * 55);
    }

    // this should also handle strings
    function find_and_show_image(href) {
      if (typeof href == 'object') {
        href = $(href).attr('href').split("/").pop();
      }
      $('#fs-thumbs a').each(function() {
        if ($(this).attr('href').split("/").pop() == href) {
          show_overlay();
          load_img($(this));
          return false;
        }
      });
    }

    function show(img) {
      //fill_info(img);
      $('#fs-image').html($('#fs-temp img').clone());
      $('#fs-image img').data('fs-data', $('#fs-temp img').data('fs-data'));
      //update_overlay();
      fit_stage_image();
    }

    function update_overlay() {
      $('#fs-overlay').css('top', options.extra_top_margin_callback());
      $('#fs-overlay').height($(window).height() - options.extra_top_margin_callback());
      $('#fs-stage').height($('#fs-overlay').height() - $('#fs-thumbs').outerHeight());
      $('#fs-info').css('bottom', $('#fs-thumbs').outerHeight());
      fit_stage_image();  
      if ($('#fs-thumb-marker').length) {
        advance_thumbs($('#fs-thumb-marker'), "hori");
      }
    }

    function fit_stage_image() {
      var img = $('#fs-stage img');

      if (img.length == 0) {
        return;
      }

      var stage = $('#fs-stage');

      var maxh = img.data('fs-data').height;
      var maxw =  img.data('fs-data').width;
      var ratio = (1.0*maxh)/(1.0*maxw);

      var stageh = stage.outerHeight();
      var stagew = stage.outerWidth();
      var stageratio = (1.0*stageh)/(1.0*stagew);

      var newh = 0
      var neww = 0;

      img.removeAttr('height');
      img.removeAttr('width');

      img.css('height', '');
      img.css('width', '');

      if (stageratio > ratio) {
        // stage is taller than image
        if (stagew <= maxw)
          img.width(stagew);
        else
          img.width(maxw);
      } else {
        // stage is wider than image
        if (stageh <= maxh)
          img.height(stageh);
        else
          img.height(maxh);
      }

      $('#fs-image').css('left', (stagew - img.width())/2);
      $('#fs-image').css('top', (stageh - img.height())/2);
    }

    function show_overlay() {
      if (!overlay_showing) {
        $('#fs-overlay').fadeIn('normal');
        update_overlay();
        $(window).resize(update_overlay);

        if (options.show_overlay_callback) {
          options.show_overlay_callback();
        }
        overlay_showing = true;
      }
    }

    function hide_overlay() {
      $('#fs-overlay').fadeOut('normal');
      $(window).unbind('resize');
      if (options.history) {
        window.location.hash = "";
      }

      overlay_showing = false;

      if (options.hide_overlay_callback) {
        options.hide_overlay_callback();
      }
    }

    function fill_info(link) {
      $('#fs-title').html(options.title_for_link(link));
      $('#fs-metadata').html(options.subtitle_for_link(link));
    }

    function display_loading() {
      $('#fs-loading').show();
    }

    function hide_loading() {
      $('#fs-loading').hide();
    }

    function advance_thumbs(img, dir) {
      var curr_offset = img.offset();
      var target_left = $(window).width()/2 - 50/2;
      var curr_thumbs_offset = $('#fs-thumbs').offset();
      var target = target_left - curr_offset.left + curr_thumbs_offset.left;

      if (dir == "hori") {
        $('#fs-thumbs').stop().animate({ left: target });
      } else { // TODO fix this
        $('#fs-thumbs').css('left', target);
        $('#fs-thumbs').css('margin-top', '50px');
        $('#fs-thumbs').animate({ marginTop: 0 });
      }

      if (img.attr('id') == "fs-thumb-marker") { 
        return;
      }
      $('#fs-thumb-marker').remove();
      img.prepend('<img src="' + options.active_thumb_overlay_url + '" id="fs-thumb-marker" />');
    }

    function load_img(link) {
      link = $(link);

      if (options.show_image_callback) {
        options.show_image_callback(link);
      }

      if (options.history) {
        var filename = link.attr('href').split("/").pop();
        $.history.load(filename);
      }

      show_overlay();

      // clear the stage
      $('#fs-image').html('');

      display_loading();
      advance_thumbs(link, "hori");

      // Preload image
      $('#fs-temp').html('<img src="' + get_full_image_url(link) + '" id="minbild"/>');
      fill_info(link);

      // Bind image load event
      $('#fs-temp img')
        .one("load",function(){
          find_dimensions(this);
          hide_loading();
          show(this);
        })
        .each(function(){
          if(this.complete || (jQuery.browser.msie && parseInt(jQuery.browser.version) == 6))
            $(this).trigger("load");
        });
    }

    function append_html_skeleton() {
      var html = '<div id="fs-overlay">' +
        '<div id="fs-stage">' +
          '<div id="fs-image"> ' +
          '</div>' +
        '</div>' +
        '<div id="fs-footer">' +
          '<div id="fs-thumbs">' +
          '</div>' +
        '</div>' +
        '<div id="fs-info">' +
          '<p id="fs-title"></p>' +
          '<p id="fs-metadata"></p>' +
        '</div>' +
        '<div id="fs-loading">' +
          'LOADING' +
        '</div>' +
      '</div>' +
      '<div id="fs-temp">' +
      '</div>';

      $("body").append(html);
    }
  };

  $.fn.phocus.get_image_hash = function(link) {
    return $(link).attr('href').split("/").pop();
  }

  function setOptions(new_options) {
    options = $.extend({}, defaults, options, new_options);
  }

})(jQuery);
