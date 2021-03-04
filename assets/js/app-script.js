
$(function() {
    "use strict";
     
	 
// === horizontal menu js	 
	 
$(document).ready(function () {
		 $("#respMenu").horizontalMenu({
			 resizeWidth: '1024', // Set the same in Media query
			 animationSpeed: 'fast', //slow, medium, fast
			 accoridonExpAll: false //Expands all the accordion menu on click
		 });
	 });

	   
// === sidebar menu activation js

$(function() {
        for (var i = window.location, o = $(".horizontal-menu a").filter(function() {
            return this.href == i;
        }).addClass("menu-active").parent().addClass("menu-active"); ;) {
            if (!o.is("li")) break;
            o = o.parent().addClass("in").parent().addClass("menu-active");
        }
    }), 	   
	

/* Back To Top */

$(document).ready(function(){ 
    $(window).on("scroll", function(){ 
        if ($(this).scrollTop() > 300) { 
            $('.back-to-top').fadeIn(); 
        } else { 
            $('.back-to-top').fadeOut(); 
        } 
    }); 

    $('.back-to-top').on("click", function(){ 
        $("html, body").animate({ scrollTop: 0 }, 600); 
        return false; 
    }); 
});	   
	   

   
	$(function () {
	  $('[data-toggle="popover"]').popover()
	})


	$(function () {
	  $('[data-toggle="tooltip"]').tooltip()
	})


	
	// mobile menu
	
	 $("#mobile-btn").on("click", function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("sidenav");
    });
	
	 
	$(".close-btn").on("click", function(e) {
        e.preventDefault();
        $("#wrapper").removeClass("sidenav");
    }); 
	
	$(".overlay").on("click", function(e) {
        e.preventDefault();
        $("#wrapper").removeClass("sidenav");
    }); 
	
	
	
	
	
	
	

});