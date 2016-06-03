var libs;

var desc_length = 64;
var libs_url = './libs.php';
var sd_converter = new showdown.Converter();

$(document).ready(function() {
	$.get(libs_url, function(resp) {
		libs = resp;
		init();
	});
});


function init() {
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


	if(window.location.hash.substring(1).length>0) {
		$('#search').autocomplete('search', window.location.hash.substring(1));
		$('#ui-id-2').click();
	}
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

	$l.show();

	return false;
}
