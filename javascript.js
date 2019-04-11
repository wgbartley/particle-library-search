var libs;

var desc_length = 64;
var libs_url = './libs.json';
var sd_converter = new showdown.Converter();
var max_row_shown = 0;

$(document).ready(function() {
	$.get(libs_url, function(resp) {
		libs = resp;

		libs.sort(function(a, b) {
			return b.overall_popularity-a.overall_popularity;
		});

		init();
	});
});


function init() {
	init_search();
	init_home();

	on_hash_change();
	window.onhashchange = on_hash_change;
}


function on_hash_change() {
	if(window.location.hash.substring(1).length>0) {
		$('#search').autocomplete('search', window.location.hash.substring(1));
		$('ul.ui-autocomplete').find('li:first').click();
	}
}


function init_search() {
	$('#search').autocomplete({
		minLength: 1,
		focus: function(e, u) {
			$('#search').val(u.item.title);
			return false;
		},
		source: search_libs,
		select: search_select
	}).autocomplete('instance')._renderItem = function(ul, item) {
		return $('<li>').append(item.title+'<span class="autocomplete_popularity">'+item.overall_popularity+'</span><br><span class="autocomplete_desc">'+item.short_desc+'</span>').appendTo(ul);
	}


	$('#search').change(function() {
		if($(this).val().length==0) {
			$('#library').hide();
			$('#home').show();

			window.location.hash = '';
		}
	});
}


function init_home() {
	var html = '';

	for(var i=0; i<libs.length;) {
		html = '';
		var css_display = '';

		if(window.document.body.offsetHeight>=window.innerHeight)
			css_display = 'display:none';

		html += '<div class="row" style="'+css_display+'" data-rownum="'+Math.floor(i/3)+'">';
		html += '<div class="col-md-2"></div>';

		for(var j=0; j<3; j++) {
			if(libs[i]==undefined)
				break;

			if(libs[i].description==undefined)
				libs[i].description = '';

			if(libs[i].description==null)
				libs[i].description = '';

			html += '<div class="col-md-2">';
			html += '<h3><a href="#'+libs[i].title+'">'+libs[i].name+'</a></h3>';
			html += '<div class="description">'+sd_converter.makeHtml(libs[i].description)+'</div>';
			html += '</div>';

			if(j<2)
				html += '<div class="col-md-1"></div>';

			i++;
		}

		html += '<div class="col-md-2"></div>';
		html += '</div>';

		$('#home .more').before(html);
	}

	// max_row_shown = Math.ceil(home_height/150);
}


function home_show_more() {
	// for(var i=max_row_shown; i<max_row_shown+Math.ceil(home_height/150); i++) {
	// 	$('div.row[data-rownum="'+i+'"]').show();
	// }

	// max_row_shown = i;
}


function search_libs(str, cb) {
	var retval = [];

	for(var i in libs) {
		if(libs[i].title.toUpperCase().includes(str.term.toUpperCase())) {
			libs[i].short_desc = libs[i].description;

			if(libs[i].short_desc==undefined || libs[i].short_desc==null)
				libs[i].short_desc = 'No description';

			if(libs[i].short_desc.length>desc_length) {
				libs[i].short_desc = libs[i].short_desc.substring(0, desc_length)+'...';
			}

			retval.push(libs[i]);
		}
	}

	cb(retval);
}


function search_select(e, u) {
	var lib = u.item;
	$('#search').val(lib.title);

	window.location.hash = '#'+lib.title;

	if(!lib.git_clone_url.startsWith('https://'))
		lib.git_clone_url = 'https://github.com/'+lib.git_clone_url;

	if(lib.description==undefined || lib.description==null)
		lib.description = '';

	if(lib.description.length==0)
		lib.description = '<span class="no_description">No description</span>';

	lib.description = sd_converter.makeHtml(lib.description);


	$l = $('#library');
	$l.find('h1').html(lib.title+'&nbsp;<span style="font-weight:normal">'+lib.version+'</span>');
	$l.find('.description').html(lib.description);
	$l.find('.github').html('<a href="'+lib.git_clone_url+'" target="_blank">'+lib.git_clone_url+'</a>');
	$l.find('.published').html('Published '+lib.published_at);


	$l.find('.issues').empty();
	var issues = '';

	for(var i in lib.known_issues) {
		var issue_device, issue_icon, issue_class;

		switch(i) {
			case '0':
				issue_device = 'Core';
				break;

			case '6':
				issue_device = 'Photon';
				break;

			case '8':
				issue_device ='P1';
				break;

			case '10':
				issue_device = 'Electron';
				break;
		}

		if(lib.known_issues[i].toUpperCase()=='PASS') {
			issue_icon = 'ok';
			issue_class = 'success';
		} else {
			issue_icon = 'remove';
			issue_class = 'danger';
		}

		$l.find('.issues').append('<span class="label label-'+issue_class+'"><span class="glyphicon glyphicon-'+issue_icon+'"></span> '+issue_device+'</span>&nbsp;');
	}


	// Readme?
	$('#readme').empty();
	$.get('https://raw.githubusercontent.com/'+lib.home_url+'/master/README.md', function(resp) {
		$('#readme').html(sd_converter.makeHtml(resp));
	});

	$('#home').hide();
	$l.show();

	return false;
}
