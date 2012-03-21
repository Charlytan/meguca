var $name, $email;
var options, inputMinSize = 300, nashi;

var themes = [
	{name: 'moe', val: 'moe-v2'},
	{name: 'gar', val: 'gar-v2'},
	{name: 'mawaru', val: 'meta-v1'},
];

(function () {
	try {
		options = JSON.parse(localStorage.options);
	}
	catch (e) { }
	if (!options)
		options = {};

	nashi = {
		opts: [],
		upload: !!$('<input type="file"/>').prop('disabled'),
	};
	if (window.screen && screen.width <= 320)
		inputMinSize = 50;
	if ('ontouchstart' in window)
		nashi.opts.push('preview');
})();


function load_ident() {
	try {
		var id = JSON.parse(localStorage.ident);
		if (id.name)
			$name.val(id.name);
		if (id.email)
			$email.val(id.email);
	}
	catch (e) {}
}

function save_ident() {
	try {
		var name = $name.val(), email = $email.val();
		if (is_sage(email) && !is_noko(email))
			email = false;
		var id = {};
		if (name || email) {
			if (name)
				id.name = name;
			if (email)
				id.email = email;
			localStorage.setItem('ident', JSON.stringify(id));
		}
		else
			localStorage.removeItem('ident');
	}
	catch (e) {}
}

function save_opts() {
	try {
		localStorage.options = JSON.stringify(options);
	}
	catch (e) {}
}

function hover_shita(event) {
	if (event.target.tagName.match(/^A$/i)) {
		var m = $(event.target).text().match(/^>>(\d+)$/);
		if (m && preview_miru(event, parseInt(m[1], 10)))
			return;
	}
	if (preview) {
		preview.remove();
		preview = previewNum = null;
	}
}

function mouseup_shita(event) {
	/* Bypass expansion for non-left mouse clicks */
	if (options.inline && event.which > 1) {
		var img = $(event.target);
		if (img.is('img')) {
			img.data('skipExpand', true);
			setTimeout(function () {
				img.removeData('skipExpand');
			}, 100);
		}
	}
}

var optSpecs = [];
function add_spec(id, label, func, type) {
	id = id.replace(/\$BOARD/g, BOARD);
	optSpecs.push({id: id, label: label, func: func, type: type});
}

add_spec('inline', 'Inline image expansion', function (b) {
	if (b)
		$(document).mouseup(mouseup_shita);
	else
		$(document).unbind('mouseup', mouseup_shita);
}, 'checkbox');

add_spec('preview', 'Hover preview', function (b) {
	if (b)
		$(document).mousemove(hover_shita);
	else
		$(document).unbind('mousemove', hover_shita);
}, 'checkbox');

add_spec('board.$BOARD.theme', 'Theme', function (theme) {
	if (!theme)
		return;
	var $link = $('head link[rel=stylesheet]:last');
	$link.attr('href', MEDIA_URL + theme + '.css');
}, themes);

$(function () {
	$name = $('input[name=name]');
	$email = $('input[name=email]');
	load_ident();
	var save = _.debounce(save_ident, 1000);
	function prop() {
		if (postForm)
			postForm.propagate_ident();
		save();
	}
	$name.input(prop);
	$email.input(prop);

	var $opts = $('<div class="modal"/>').change(function (event) {
		var $o = $(event.target), id = $o.attr('id'), val;
		var spec = _.find(optSpecs, function (s) {
			return s.id == id;
		});
		if (spec.type == 'checkbox')
			val = !!$o.prop('checked');
		else
			val = $o.val();
		options[id] = val;
		save_opts();
		(spec.func)(val);
	});
	_.each(optSpecs, function (spec) {
		var id = spec.id;
		if (nashi.opts.indexOf(id) >= 0)
			return;
		var val = options[id], $input, type = spec.type;
		if (type == 'checkbox') {
			$input = $('<input type="checkbox" />')
				.prop('checked', val ? 'checked' : null);
		}
		else if (type instanceof Array) {
			$input = $('<select/>');
			_.each(type, function (item) {
				$('<option/>')
					.text(item.name)
					.val(item.val)
					.appendTo($input);
			});
			if (type.indexOf(val) >= 0)
				$input.val(val);
		}
		var $label = $('<label/>').attr('for', id).text(spec.label);
		$opts.append($input.attr('id', id), ' ', $label, '<br>');
		(spec.func)(val);
	});
	$opts.hide().appendTo(document.body);
	$('<a id="options">Options</a>').click(function () {
		$opts.toggle('fast');
	}).insertAfter('#sync');
});