$(document).ready(function() {
	$('.image_container').hover(function() {
		$('.image_popup', this).animate({'bottom':'0px'}, 300);
	}, function() {
		$('.image_popup', this).animate({'bottom':'-45px'}, 100);
	});
        $('.gallery_container').hover(function() {
		$(this).css({
			'z-index': 2,
			'box-shadow':'0 0 20px rgba(0, 0, 0, .5)'
		});
		$(this).animate({
			'left': '-10px',
			'top':'-10px',
			'width':'135px',
			'height':'130px'
		},100); 
		$('.gallery_image .gallery_padding', this).animate({
			'opacity': 0
		}, 100);
		var padnode = $('.gallery_image', this);
		$({opacity_filter: 30, blur_radius:0}).animate({opacity_filter: 0, blur_radius: 2}, {
			duration: 100,
			easing: 'swing',
			step: function() {
				padnode.css({
					"filter": "opacity("+this.opacity_filter+") blur("+this.blur_radius+"px)",
					"-webkit-filter": "blur("+this.blur_radius+"px)"
				});
			}
		});
		$('a', this).fadeIn(100);
	}, function() { 
		$(this).css({
			'z-index':1,
			'box-shadow':'none'
		}); 
		$(this).animate({
			'left': '0px',
			'top':'0px',
			'width':'115px',
			'height':'110px'
		},100,'swing',function(){
			$(this).css({
				'z-index':0});
		}); 
		$('.gallery_image .gallery_padding', this).animate({
			'opacity': 0.3
		}, 100);
		var padnode = $('.gallery_image', this);
		$({opacity_filter: 0, blur_radius:2}).animate({opacity_filter: 30, blur_radius:0}, {
			duration: 100,
			easing: 'swing',
			step: function() {
				padnode.css({
					"filter": "opacity("+this.opacity_filter+") blur("+this.blur_radius+"px)",
					"-webkit-filter": "blur("+this.blur_radius+"px)"
				});
			},
			complete: function() {
				padnode.css({
					"-webkit-filter":"",
					"filter":"opacity(30)"
				});
			}
		});
		$('a', this).fadeOut(100);
	});
});
