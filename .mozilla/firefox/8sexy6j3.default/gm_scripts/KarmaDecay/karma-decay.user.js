// ==UserScript==
// @name           KarmaDecay
// @description    Reverse image search of Reddit.com
// @version        1.5
// @author         KarmaDecay.com
// @namespace      http://karmadecay.com/
// @homepageURL    http://karmadecay.com/
// @updateURL      https://static.karmadecay.com/js/karma-decay.meta.js
// @downloadURL    https://static.karmadecay.com/js/karma-decay.user.js
// @grant          none
// @include        http://www.reddit.com/*
// @include        https://www.reddit.com/*
// ==/UserScript==

(function(){
 function kd_testForImageLink(){
 var url = $('#url').val();
 if ( url.match(reImg) ) $('.karmaDecayLink').attr('href', 'http://karmadecay.com/search?kdtoolver=b1&q=' + encodeURIComponent(url)).show();
 else $('.karmaDecayLink').hide();
 }
 function kd_updatePosts() {
 $('.linklisting .link').each(function() {
   var $this = $(this);
   if ( !$this.prop('KDLinksAdded') ) {
   var url = $this.find('p.title a.title').attr('href');
   var story = $this.find('ul.flat-list a.comments').attr('href');
   if ( url.match(reImg) ) $this.find('ul.flat-list').append('<li><a href="http://karmadecay.com/search?kdtoolver=b1&q=' + encodeURIComponent(story) + '" title="Reverse image search - Use KarmaDecay to search Reddit for other posts of the same or similar image." target=_blank>kd</a></li>');
   $this.prop('KDLinksAdded', true);
   }
   });
 }

 var w = ( typeof unsafeWindow != 'undefined' ) ? unsafeWindow : window;
 var reImg = /^https?:\/\/((www|i)\.)?((imgur|gfycat|reddituploads)\.com\/.+|(.+)\.(jpeg|jpg|gif|png))$/i;

 if ( !w.KarmaDecayLinksAdded ) {
   w.KarmaDecayLinksAdded = true;
   if ( document.location.href.match(/reddit\.com\/(?:r\/.+)?submit(\/|\?|$)/i) ) {
     if ( !$('#url').prop('KDLinksAdded') ) {
       var $btns = $('button[onclick="fetch_title()"],button[name="submit"]');
       $btns.css('margin-right', '10px').after('<a href="" class="karmaDecayLink" target="_blank" style="display: none">search reddit for picture</a>');
       $('#url').on('input', kd_testForImageLink).prop('KDLinksAdded', true);
       kd_testForImageLink();
     }
   } else {
     setInterval(kd_updatePosts, 2000);
     kd_updatePosts();
   }
 }
})();
