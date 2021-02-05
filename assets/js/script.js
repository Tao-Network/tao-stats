function addMarkersToMap(map) {
  var parisMarker = new H.map.Marker({lat:48.8567, lng:2.3508});
  map.addObject(parisMarker);

  var romeMarker = new H.map.Marker({lat:41.9, lng: 12.5});
  map.addObject(romeMarker);

  var berlinMarker = new H.map.Marker({lat:52.5166, lng:13.3833});
  map.addObject(berlinMarker);

  var madridMarker = new H.map.Marker({lat:40.4, lng: -3.6833});
  map.addObject(madridMarker);

  var londonMarker = new H.map.Marker({lat:51.5008, lng:-0.1224});
  map.addObject(londonMarker);
}
(function($) {
    "use strict";
    $(".mobile-toggle").click(function(){
        $(".nav-menus").toggleClass("open");
    });
})(jQuery);

$('.loader-wrapper').slideUp('slow', function() {
    $(this).remove();
});

$(window).on('scroll', function() {
    if ($(this).scrollTop() > 600) {
        $('.tap-top').fadeIn();
    } else {
        $('.tap-top').fadeOut();
    }
});
$('.tap-top').click( function() {
    $("html, body").animate({
        scrollTop: 0
    }, 600);
    return false;
});

function toggleFullScreen() {
    if ((document.fullScreenElement && document.fullScreenElement !== null) ||
        (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        if (document.documentElement.requestFullScreen) {
            document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
            document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
}
(function($, window, document, undefined) {
    "use strict";
    var $ripple = $(".js-ripple");
    $ripple.on("click.ui.ripple", function(e) {
        var $this = $(this);
        var $offset = $this.parent().offset();
        var $circle = $this.find(".c-ripple__circle");
        var x = e.pageX - $offset.left;
        var y = e.pageY - $offset.top;
        $circle.css({
            top: y + "px",
            left: x + "px"
        });
        $this.addClass("is-active");
    });
    $ripple.on(
        "animationend webkitAnimationEnd oanimationend MSAnimationEnd",
        function(e) {
            $(this).removeClass("is-active");
        });
})(jQuery, window, document);

$(".chat-menu-icons .toogle-bar").click(function(){
    $(".chat-menu").toggleClass("show");
});


$("#flip-btn").click(function(){
    $(".flip-card-inner").addClass("flipped")
});

$("#flip-back").click(function(){
    $(".flip-card-inner").removeClass("flipped")
})

$("#document-toggle").click(function(){
    $("#myScrollspy").toggleClass("close");
    $(".document-header").toggleClass("close-header");
})

// Common settings
var platform = new H.service.Platform({
  app_id: 'devportal-demo-20180625',
  app_code: '9v2BkviRwi9Ot26kp2IysQ',
  useHTTPS: true
});
var pixelRatio = window.devicePixelRatio || 1;
var defaultLayers = platform.createDefaultLayers({
  tileSize: pixelRatio === 1 ? 256 : 512,
  ppi: pixelRatio === 1 ? undefined : 320
});

$( document ).ready(function() {
    var map = new H.Map(document.getElementById('location_map'),
      defaultLayers.satellite.map,{
      center: {lat: 20, lng: 0},
      zoom: 1,
      pixelRatio: pixelRatio
    });
    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    var ui = H.ui.UI.createDefault(map, defaultLayers);
    //addMarkersToMap(map);

    $(".both-side-scroll").perfectScrollbar({
        suppressScrollX: !0,
        wheelPropagation: !0
    })


});