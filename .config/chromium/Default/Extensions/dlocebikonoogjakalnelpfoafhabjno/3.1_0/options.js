// API_END_POINT = "http://s.tpclub.com:8000/";
API_END_POINT = "https://s.edclub.com/api/";

function set_portal(domain){
	$(".final_url span").html(domain);
	goto('#step_success');
	chrome.storage.local.set({'domain':domain});
}

function build_school_btn(rec){
	var _lst = [
		$(".templates .rightarr").clone(),
		$('<span class="bigtext">' + rec.name + '</span>'),
		$('<span class="subtext">' + (rec.state.length == 2 ?(rec.state + ', '):'') + rec.country + '</span>'),
		$('<div />').html('https://<b>' + rec.domain + '</b>.edclub.com')
	];
	var $dv = $("<div />").addClass('aschool').append(_lst);

	$dv.click(function(){
		set_portal(rec.domain);
	});

	return $dv;
}

function guess_accounts(){
	var search_url = API_END_POINT + "guess_accounts_by_ip/";
	$.getJSON( search_url ).done(function( data ) {
		$("#res_guess").empty();
		if(data.length){
			goto("#step1_guess");
			if(data.length == 1)
				$("#step1_guess .caption").html("Is the following your school or district?");
			else
				$("#step1_guess .caption").html("Select your school from the list:");

			$(data).each(function(i, rec){
				$("#res_guess").append(build_school_btn(rec));
			});
		}else{
			goto('#step1');
		}
	});	
}


function query_accounts(query) {
	var search_url = API_END_POINT + "find_account/?q=" + query;
	$("#res").html('<i>Searching...</i>');
	$.getJSON( search_url ).done(function( data ) {
		$("#res").empty();
		if(!data.length)
			$("#res").html("No matching school found");
		else
			$(data).each(function(i, rec){
				$("#res").append(build_school_btn(rec));
			});
	});
}

function lookup_accounts_by_domain(query) {
	var search_url = API_END_POINT + "lookup_domain/?q=" + query;
	$("#res_school_code").html('<i>Searching...</i>');
	$.getJSON( search_url ).done(function( data ) {
		$("#res_school_code").empty();
		if(!data.length)
			$("#res_school_code").html("No matching school found");
		else
			$(data).each(function(i, rec){
				$("#res_school_code").append(build_school_btn(rec));
			});
	});
}


function goto(page_id, in_func, out_func){
	var $curactive = $('.qholder.active');
	var $next = $(page_id);

	if(!in_func){
		in_func = "rotateInDownLeft";
		out_func = "rotateOutUpRight";
	}

	if($curactive){
		$curactive.addClass('animated ' + out_func).removeClass('active');
		$curactive.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			$curactive.removeClass('animated ' + out_func).hide();
		});
	}

	// show next container
	$next.show().addClass('active animated ' + in_func);
	$next.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
		$next.removeClass('animated ' + in_func)
	});

	// focus elements in the new window
	$next.find('.focusme').select();
}


$(function(){

	// general search
	$(".search_account").click(function(){query_accounts($("#q").val()); });
	$("#q").keydown(function(e){
		if(e.which == 13)
			query_accounts($("#q").val());
	});

	$("#q").keyup(function(){
		var txt = $("#q").val();

		if($("#q").data('last_val') == txt)
			return;
		$("#q").data('last_val', txt);

		if(txt.length > 4)
			query_accounts(txt);
		else
			$("#res").empty();
	});

	// lookup by domain
	$(".search_portal_domain").click(function(){lookup_accounts_by_domain($("#q_domain").val()); });
	$("#q_domain").keydown(function(e){
		if(e.which == 13)
			lookup_accounts_by_domain($("#q_domain").val());
	});

	$("#q_domain").keyup(function(){
		var txt = $("#q_domain").val();

		if($("#q_domain").data('last_val') == txt)
			return;

		$("#q_domain").data('last_val', txt);

		if(txt.length > 4)
			lookup_accounts_by_domain(txt);
		else
			$("#res_school_code").empty();
	});


	$("body").addClass("shade");
	setTimeout(function(){
		guess_accounts();
	}, 100);

	$(".goto").click(function(){
		var $this = $(this);
		var $next = "#" + $this.data('where');
		var in_func = "rotateInDownLeft",
			out_func = "rotateOutUpRight";

		if($this.data('dir') == "back"){
			in_func = "rotateInDownRight";
			out_func = "rotateOutUpLeft";
		}

		goto($next, in_func, out_func);
	});

	$(".goto_portal").click(function(){
		goto_portal();
	});
})


function goto_portal(){
	chrome.storage.local.get('domain', function(data){
		var domain = data.domain;
		window.open('https://' + domain + '.edclub.com');
		window.close();
	})


	// chrome.app.window.create('portal.html', {
	// 	id: "portal",
	// 	bounds: {
	// 		width: screen.availWidth,
	// 		height: screen.availHeight,
	// 		left: 0,
	// 		top: 0
	// 	}
	// });
}
