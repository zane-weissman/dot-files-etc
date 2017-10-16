// ==UserScript==
// @name           KarmaDecay
// @author         KarmaDecay.com
// @namespace      http://karmadecay.com/
// @description    Reverse image search of Reddit.com
// @version        1.3
// @grant          none
// @include        http://www.reddit.com/*
// @include        https://www.reddit.com/*
// ==/UserScript==

(function(){
  function kd_testForImageLink(){
    var url = $kd('#url').val();
    if ( url.match(reImg) ) $kd(".karmaDecayLink").attr("href", "http://karmadecay.com/search?kdtoolver=b1&q=" + encodeURIComponent(url)).show();
    else $kd('.karmaDecayLink').hide();
  }
  function kd_updatePosts() {
    $kd('.linklisting .link').each(function(i, el) {
      if ( !$kd(this).prop('KDLinksAdded') ) {
        var url = $kd(el).find('p.title a.title').attr('href');
        var story = $kd(el).find('ul.flat-list a.comments').attr('href');
        if ( url.match(reImg) ) {
          $kd(el).find('ul.flat-list').append('<li><a href="http://karmadecay.com/search?kdtoolver=b1&q=' + encodeURIComponent(story) + '" title="Reverse image search - Use KarmaDecay to search Reddit for other posts of the same or similar image." target="_blank">kd</a></li>');
        }
        $kd(this).prop('KDLinksAdded', true);
      }
    });
  }
  
  var w = window, $kd, reImg = /^https?:\/\/((www|i)\.)?(imgur\.com\/.+|gfycat\.com\/.+|(.+)\.(jpeg|jpg|gif|png))$/i;
  if ( typeof unsafeWindow != 'undefined' ) var w = unsafeWindow;
  
  if ( !w.KarmaDecayLinksAdded ) {
    w.KarmaDecayLinksAdded = true;
    if ( typeof unsafeWindow == 'undefined' ) $kd = jQuery;
    else $kd = unsafeWindow.jQuery || jQuery;
    if ( document.location.href.match(/reddit\.com.*\/submit/i) ) {
      if ( !$kd('#url').prop('KDLinksAdded') ) {
        $kd('button[onclick="fetch_title()"],button[name="submit"]')
          .after('<a href="" class="karmaDecayLink" target="_blank" style="display: none">search reddit for picture</a>');
        $kd('button[name="submit"]').css('marginRight', 5);
        $kd('#url').keyup(kd_testForImageLink).prop('KDLinksAdded', true);
        kd_testForImageLink();
      }
    } else {
      setInterval(kd_updatePosts, 2000);
      kd_updatePosts();
    }
  }
})();
