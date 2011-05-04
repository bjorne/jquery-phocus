# Phocus

Phocus is a fullscreen jQuery photo gallery.

## Usage

### HTML structure

Phocus works on a jQuery collection of image tags. It assumes each
image is wrapped in an anchor tag which links to the larger version,
like so:

    <div id="gallery">
      <div class="thumb">
        <a href="large-img1.jpg" title="Image 1"
          <img src="thumb-img1.jpg" />
        </a>
      </div>
      <div class="thumb">
        <a href=large-img2.jpg" title="Image 2"
          <img src="thumb-img2.jpg" />
        </a>
      </div>
    </div>

Given this structure you'll be able to call

    $('#gallery img').phocus();

to enable phocus.

### CSS

Include the following CSS to make phocus look as it should:

    #fs-overlay { width: 100%; background: #000; position: fixed; z-index: 3; top: 0; left: 0; display: none;}
    #fs-stage { overflow: hidden; width: 100%; padding-top: 5px; }
    #fs-image { position: relative; }
    #fs-info { text-align: center; opacity:0.7;
    #filter:alpha(opacity=70); background: #000; position: fixed; bottom: 60px; width: 100%; color: #fff; }
    #fs-title { padding-top: 10px;}
    #fs-metadata { font-size: 85%; padding-bottom: 10px;}
    #fs-footer { overflow: hidden; width: 100%; }
    #fs-thumbs { position: fixed; z-index: 11; left: 0;  position: fixed; bottom: 0; padding-top: 10px; }
    #fs-thumbs a { position: relative; }
    #fs-thumb-marker { position: absolute; opacity:0.7; filter:alpha(opacity=70) }
    #fs-temp { overflow: hidden; width: 1px; height: 1px; position: absolute;}
    #fs-loading { position: fixed; top: 40%; width: 100%; text-align: center; z-index: 10; display: none; color: #fff; }

### Options

Phocus takes several options:
 
* `history` (default: `false`) Enable the [jQuery history
  plugin](http://tkyk.github.com/jquery-history-plugin/). When an
  image is selected in phocus a hash will be appended to the end of
  the url, so that individual images can be shared and linked to. By
  default the basename of the `href` value is used. You can change
  this by overriding `$.fn.phocus.get_image_hash`. Be sure to include
  the history plugin before phocus in order to use this.

* `active_thumb_overlay_url` An 50x50 image to use as overlay for the
  active image thumb. See the example.

* `extra_top_margin_callback` A callback function which returns the
  desired top margin of the fullscreen overlay. Useful for a static
  header.

* `show_overlay_callback` A callback function invoked when the overlay
  is shown.

* `hide_overlay_callback` A callback function invoked
  when the overlay is being hidden. 

* `show_image_callback` A callback function invoked when a new image
  is shown in phocus.  

* `title_for_link` A callback function that returns the title for an
  image given the anchor tag. Defaults to the `title` attribute.  

* `subtitle_for_link` A callback function that returns the subtitle
  for an image given the anchor tag. Defaults to the basename of the
  linked image.

You can supply options as a hash, e.g.

    $('#gallery img').phocus({
      history: true,
      subtitle_for_link: function(link) {
        return $(link).attr('data-subtitle');
      }
    });

See `samples` dir for an example.
