(function(){
var $jscomp={scope:{},findInternal:function(a,c,b){a instanceof String&&(a=String(a));for(var d=a.length,e=0;e<d;e++){var k=a[e];if(c.call(b,k,e,a))return{i:e,v:k}}return{i:-1,v:void 0}}};$jscomp.defineProperty="function"==typeof Object.defineProperties?Object.defineProperty:function(a,c,b){if(b.get||b.set)throw new TypeError("ES3 does not support getters and setters.");a!=Array.prototype&&a!=Object.prototype&&(a[c]=b.value)};
$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);$jscomp.polyfill=function(a,c,b,d){if(c){b=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var e=a[d];e in b||(b[e]={});b=b[e]}a=a[a.length-1];d=b[a];c=c(d);c!=d&&null!=c&&$jscomp.defineProperty(b,a,{configurable:!0,writable:!0,value:c})}};
$jscomp.polyfill("Array.prototype.find",function(a){return a?a:function(a,b){return $jscomp.findInternal(this,a,b).v}},"es6-impl","es3");$jscomp.SYMBOL_PREFIX="jscomp_symbol_";$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.symbolCounter_=0;$jscomp.Symbol=function(a){return $jscomp.SYMBOL_PREFIX+(a||"")+$jscomp.symbolCounter_++};
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var a=$jscomp.global.Symbol.iterator;a||(a=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&$jscomp.defineProperty(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(a){var c=0;return $jscomp.iteratorPrototype(function(){return c<a.length?{done:!1,value:a[c++]}:{done:!0}})};
$jscomp.iteratorPrototype=function(a){$jscomp.initSymbolIterator();a={next:a};a[$jscomp.global.Symbol.iterator]=function(){return this};return a};$jscomp.array=$jscomp.array||{};$jscomp.iteratorFromArray=function(a,c){$jscomp.initSymbolIterator();a instanceof String&&(a+="");var b=0,d={next:function(){if(b<a.length){var e=b++;return{value:c(e,a[e]),done:!1}}d.next=function(){return{done:!0,value:void 0}};return d.next()}};d[Symbol.iterator]=function(){return d};return d};
$jscomp.polyfill("Array.prototype.keys",function(a){return a?a:function(){return $jscomp.iteratorFromArray(this,function(a){return a})}},"es6-impl","es3");
webpackJsonp([4],[function(a,c,b){(function(a){function c(b){Object.keys(b).forEach(function(f){var c=b[f];Object.keys(c.value).forEach(function(b){var f=n[b];a.isFunction(f)&&f(c.key,c.value[b])})})}function d(b){Object.keys(b.value).forEach(function(c){switch(c){case "features":a.each(b.value.features,function(c){b.value.features[c]=a("#"+c).is(":checked")})}});var c={};c[b.key]=b.value;chrome.storage.sync.set(c,function(){var a=chrome.runtime.lastError;a?(h.error("_save()","An error occurred while persisting to chrome.storage.sync",
c,a),p()):h.info("_save()","Successfully persisted data to chrome.storage.sync",c)})}function p(){a(".title").find("span").remove().end().append(a('<span class="message err">'+chrome.i18n.getMessage("popupSaveSettingsFail")+"</span>").delay(2E3).fadeOut(400,function(){a(this).remove()}))}var g=b(69),h=b(5)("AwesomeDrive","Settings");a(function(){try{g.init(l),l.unblockSettings(),g.trackPageview("/action-page/settings")}catch(m){h.error("onDOMReady()","Unexpected error while loading settings page",
m)}});var l={unblockSettings:function(){g.sendTabMessage("getStatus",function(b){a('.settings input[type="checkbox"]').each(function(c,d){var f=a(d);f.closest("tr").toggleClass("ao-hidden",-1!==b.hiddenFeatures.indexOf(f.attr("id")))})});g.sendTabMessage("getSyncData",function(b){b&&(a(".back").off("click").click(function(){return window.history.back()}).hover(function(b){return a(b.currentTarget).find("a").toggleClass("hover")}),a('input[type="checkbox"]').off("change").change(function(b){b=a(b.currentTarget);
a('td:first-child label[for="'+b.attr("id")+'"]').toggleClass("off",!b.is(":checked"));g.sendTabMessage("getSyncData",function(a){return d(a.userDomainSyncData)});g.trackEvent("action-page","set",b.attr("id"))}),c(b));g.unblock()})}},n={features:function(b,c){h.info("load_features()",c);a.each(c,function(b){a("#"+b).prop("checked",c[b]);a('td:first-child label[for="'+b+'"]').toggleClass("off",!c[b])})}}}).call(c,b(2))}]);
}).call(this)
