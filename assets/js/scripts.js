var plugin_groups_canvas = false,
	plorg_get_config_object,
	plorg_record_change,
	plorg_canvas_init,
	plorg_get_default_setting,
	plorg_code_editor,	
	plorg_rebuild_magics,
	plorg_handle_save,
	init_magic_tags,
	config_object = {},	
	magic_tags = [];

jQuery( function($){

	plorg_handle_save = function( obj ){

		var notice;

		if( obj.data.success ){
			notice = $('.updated_notice_box');
		}else{
			notice = $('.error_notice_box');
		}

		notice.animate({top: 0}, 200, function(){
			setTimeout( function(){
				notice.animate({top: -75}, 200);
			}, 2000);
		});

	}

	init_magic_tags = function(){
		//init magic tags
		var magicfields = jQuery('.magic-tag-enabled');

		magicfields.each(function(k,v){
			var input = jQuery(v);
			
			if(input.hasClass('magic-tag-init-bound')){
				var currentwrapper = input.parent().find('.magic-tag-init');
				if(!input.is(':visible')){
					currentwrapper.hide();
				}else{
					currentwrapper.show();
				}
				return;			
			}
			var magictag = jQuery('<span class="dashicons dashicons-editor-code magic-tag-init"></span>'),
				wrapper = jQuery('<span style="position:relative;display:inline-block; width:100%;"></span>');

			if(input.is('input')){
				magictag.css('borderBottom', 'none');
			}

			if(input.hasClass('plugin-groups-conditional-value-field')){
				wrapper.width('auto');
			}

			//input.wrap(wrapper);
			magictag.insertAfter(input);
			input.addClass('magic-tag-init-bound');
			if(!input.is(':visible')){
				magictag.hide();
			}else{
				magictag.show();
			}
		});

	}

	// internal function declarationas
	plorg_get_config_object = function(el){
		// new sync first
		$('#plugin_groups-id').trigger('change');
		var clicked 	= $(el),
			config 		= $('#plugin-groups-live-config').val(),
			required 	= $('[required]'),
			clean		= true;

		for( var input = 0; input < required.length; input++ ){
			if( required[input].value.length <= 0 && $( required[input] ).is(':visible') ){
				$( required[input] ).addClass('plugin-groups-input-error');
				clean = false;
			}else{
				$( required[input] ).removeClass('plugin-groups-input-error');
			}
		}
		if( clean ){
			plugin_groups_canvas = config;
		}
		clicked.data( 'config', config );
		return clean;
	}

	plorg_record_change = function(){
		// hook and rebuild the fields list
		jQuery(document).trigger('record_change');
		jQuery('#plugin_groups-id').trigger('change');
		if( config_object ){
			jQuery('#plugin-groups-field-sync').trigger('refresh');
		}
	}
	
	plorg_canvas_init = function(){

		if( !plugin_groups_canvas ){
			// bind changes
			jQuery('#plugin-groups-main-canvas').on('keydown keyup change','input, select, textarea', function(e) {
				config_object = jQuery('#plugin-groups-main-form').formJSON(); // perhaps load into memory to keep it live.
				jQuery('#plugin-groups-live-config').val( JSON.stringify( config_object ) ).trigger('change');
			});
			// bind editor
			plorg_init_editor();
			plugin_groups_canvas = jQuery('#plugin-groups-live-config').val();
			config_object = JSON.parse( plugin_groups_canvas ); // perhaps load into memory to keep it live.
		}
		if( $('.color-field').length ){
			$('.color-field').wpColorPicker({
				change: function(obj){
					$('#plugin_groups-id').trigger('change');
				}
			});
		}
		if( $('.plugin-groups-group-wrapper').length ){
			$( ".plugin-groups-group-wrapper" ).sortable({
				handle: ".sortable-item",
				update: function(){
					jQuery('#plugin_groups-id').trigger('change');
				}
			});
			$( ".plugin-groups-fields-list" ).sortable({
				handle: ".sortable-item",
				update: function(){
					jQuery('#plugin_groups-id').trigger('change');
				}
			});
		}
		// live change init
		$('[data-init-change]').trigger('change');
		$('[data-auto-focus]').focus().select();

		// rebuild tags
		plorg_rebuild_magics();
		jQuery(document).trigger('canvas_init');
	}
	plorg_get_default_setting = function(obj){

		var id = 'nd' + Math.round(Math.random() * 99866) + Math.round(Math.random() * 99866),
			trigger = ( obj.trigger ? obj.trigger : obj.params.trigger ),
			sub_id = ( trigger.data('group') ? trigger.data('group') : 'nd' + Math.round(Math.random() * 99766) + Math.round(Math.random() * 99866) ),
			nodes;

		
		// add simple node
		if( trigger.data('addNode') ){
			// new node? add one
			var newnode = { "_id" : id };
			nodes = trigger.data('addNode').split('.');
			var node_point_record = nodes.join('.') + '.' + id,
				node_defaults = JSON.parse( '{ "_id" : "' + id + '", "_node_point" : "' + node_point_record + '" }' );
			if( trigger.data('nodeDefault') && typeof trigger.data('nodeDefault') === 'object' ){				
				$.extend( true, node_defaults, trigger.data('nodeDefault') );
			}			
			var node_string = '{ "' + nodes.join( '": { "') + '" : { "' + id + '" : ' + JSON.stringify( node_defaults );
			for( var cls = 0; cls <= nodes.length; cls++){
				node_string += '}';
			}
			var new_nodes = JSON.parse( node_string );
			$.extend( true, config_object, new_nodes );
		}
		// remove simple node (all)
		if( trigger.data('removeNode') ){
			// new node? add one
			if( config_object[trigger.data('removeNode')] ){
				delete config_object[trigger.data('removeNode')];
			}

		}

		switch( trigger.data('script') ){
			case "add-to-object":
				// add to core object
				//config_object.entry_name = obj.data.value; // ajax method

				break;
			case "add-field-node":
				// add to core object
				if( !config_object[trigger.data('slug')][trigger.data('group')].field ){
					config_object[trigger.data('slug')][trigger.data('group')].field = {};
				}
				config_object[trigger.data('slug')][trigger.data('group')].field[id] = { "_id": id, 'name': 'new field', 'slug': 'new_field' };
				config_object.open_field = id;
				break;				
		}

		jQuery('#plugin-groups-live-config').val( JSON.stringify( config_object ) );
		jQuery('#plugin-groups-field-sync').trigger('refresh');
	}
	// sutocomplete category
	$.widget( "custom.catcomplete", $.ui.autocomplete, {
		_create: function() {
			this._super();
			this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
		},
		_renderMenu: function( ul, items ) {
			var that = this,
			currentCategory = "";
			$.each( items, function( index, item ) {
				var li;
				if ( item.category != currentCategory ) {
					ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
					currentCategory = item.category;
				}
				li = that._renderItemData( ul, item );
				if ( item.category ) {
					li.attr( "aria-label", item.category + " : " + item.label );
				}
			});
		}
	});
	plorg_rebuild_magics = function(){

		function split( val ) {
			return val.split( / \s*/ );
		}
		function extractLast( term ) {
			return split( term ).pop();
		}
		$( ".magic-tag-enabled" ).bind( "keydown", function( event ) {
			if ( event.keyCode === $.ui.keyCode.TAB && $( this ).catcomplete( "instance" ).menu.active ) {
				event.preventDefault();
			}
		}).catcomplete({
			minLength: 0,
			source: function( request, response ) {
				// delegate back to autocomplete, but extract the last term
				magic_tags = [];
				var category = '';
				// Search form fields
				if( config_object.search_form && config_object.form_fields ){
					// set internal tags
					var system_tags = [
						'autocomplete_item',
					];					
					category = $('#plugin-groups-label-tags').text();
					for( f = 0; f < system_tags.length; f++ ){
						magic_tags.push( { label: '{' + system_tags[f] + '}', category: category }  );
					}							
				}
				
				response( $.ui.autocomplete.filter( magic_tags, extractLast( request.term ) ) );
			},
			focus: function() {
				// prevent value inserted on focus
				return false;
			},
			select: function( event, ui ) {
				var terms = split( this.value );
				// remove the current input
				terms.pop();
				// add the selected item
				terms.push( ui.item.value );
				// add placeholder to get the comma-and-space at the end
				//terms.push( "" );
				this.value = terms.join( " " );
				return false;
			}
		});
	}	

	// trash 
	$(document).on('click', '.plugin-groups-card-actions .confirm a', function(e){
		e.preventDefault();
		var parent = $(this).closest('.plugin-groups-card-content');
			actions = parent.find('.row-actions');

		actions.slideToggle(300);
	});

	// bind slugs
	$(document).on('keyup change', '[data-format="slug"]', function(e){

		var input = $(this);

		if( input.data('master') && input.prop('required') && this.value.length <= 0 && e.type === "change" ){
			this.value = $(input.data('master')).val().replace(/[^a-z0-9]/gi, '_').toLowerCase();
			if( this.value.length ){
				input.trigger('change');
			}
			return;
		}

		this.value = this.value.replace(/[^a-z0-9]/gi, '_').toLowerCase();
	});
	
	// bind label update
	$(document).on('keyup change', '[data-sync]', function(){
		var input = $(this),
			syncs = $(input.data('sync')),
			value = input.val();
		
		if( input.is(':checkbox') ){
			if( !input.prop('checked') ){
				value = '';
			}
		}

		syncs.each(function(){
			var sync = $(this);

			if( sync.is('input') ){
				sync.val( value ).trigger('change');
			}else{
				sync.text(value);
			}
		});
	});
	// bind toggles
	$(document).on('click', '[data-toggle]', function(){
		
		var toggle = $(this).data('toggle'),
			target = $(toggle);
		
		target.each(function(){
			var tog = $(this);
			if( tog.is(':checkbox') || tog.is(':radio') ){
				if( tog.prop('checked') ){
					tog.prop('checked', false);
				}else{
					tog.prop('checked', true);
				}
				plorg_record_change();
			}else{
				tog.toggle();
			}
		});

	});	

	// bind tabs
	$(document).on('click', '.plugin-groups-nav-tabs a', function(e){
		
		e.preventDefault();
		var clicked 	= $(this),
			tab_id 		= clicked.attr('href'),
			required 	= $('[required]'),
			clean		= true;

		for( var input = 0; input < required.length; input++ ){
			if( required[input].value.length <= 0 && $( required[input] ).is(':visible') ){
				$( required[input] ).addClass('plugin-groups-input-error');
				clean = false;
			}else{
				$( required[input] ).removeClass('plugin-groups-input-error');
			}
		}
		if( !clean ){
			return;
		}
		$('.plugin-groups-nav-tabs .current').removeClass('current');
		$('.plugin-groups-nav-tabs .active').removeClass('active');
		$('.plugin-groups-nav-tabs .nav-tab-active').removeClass('nav-tab-active');
		if( clicked.parent().is('li') ){
			clicked.parent().addClass('active');			
		}else if( clicked.parent().is('div') ){
			clicked.addClass('current');			
		}else{			
			clicked.addClass('nav-tab-active');
		}
		

		$('.plugin-groups-editor-panel').hide();
		$( tab_id ).show();
		
		if( plorg_code_editor ){
			plorg_code_editor.toTextArea();
			plorg_code_editor = false;
		}

		if( $( tab_id ).find('.plugin-groups-code-editor').length ){

			plorg_init_editor( $( tab_id ).find('.plugin-groups-code-editor').prop('id') );
			plorg_code_editor.refresh();
			plorg_code_editor.focus();
		}

		jQuery('#plugin-groups-active-tab').val(tab_id).trigger('change');

	});

	// row remover global neeto
	$(document).on('click', '[data-remove-parent]', function(e){
		var clicked = $(this),
			parent = clicked.closest(clicked.data('removeParent'));
		if( clicked.data('confirm') ){
			if( !confirm(clicked.data('confirm')) ){
				return;
			}
		}
		parent.remove();
		plorg_record_change();
	});
	
	// row remover global neeto
	$(document).on('click', '[data-remove-element]', function(e){
		var clicked = $(this),
			elements = $(clicked.data('removeElement'));
		if( clicked.data('confirm') ){
			if( !confirm(clicked.data('confirm')) ){
				return;
			}
		}
		elements.remove();
		plorg_record_change();
	});

	// init tags
	$('body').on('click', '.magic-tag-init', function(e){
		var clicked = $(this),
			input = clicked.prev();

		input.focus().trigger('init.magic');

	});
	
	// initialize live sync rebuild
	$(document).on('change', '[data-live-sync]', function(e){
		plorg_record_change();
	});

	// initialise baldrick triggers
	$('.wp-baldrick').baldrick({
		request     : ajaxurl,
		method      : 'POST',
		before		: function(el){
			
			var tr = $(el);

			if( tr.data('addNode') && !tr.data('request') ){
				tr.data('request', 'plorg_get_default_setting');
			}
		}
	});


	window.onbeforeunload = function(e) {

		if( plugin_groups_canvas && plugin_groups_canvas !== jQuery('#plugin-groups-live-config').val() ){
			return true;
		}
	};


});







function plorg_init_editor(el){
	if( !jQuery('#' + el).length ){
		return;
	}	
	// custom modes
	var mustache = function(plugin_groups, state) {

		var ch;

		if (plugin_groups.match("{{")) {
			while ((ch = plugin_groups.next()) != null){
				if (ch == "}" && plugin_groups.next() == "}") break;
			}
			plugin_groups.eat("}");
			return "mustache";
		}
		/*
		if (plugin_groups.match("{")) {
			while ((ch = plugin_groups.next()) != null)
				if (ch == "}") break;
			plugin_groups.eat("}");
			return "mustacheinternal";
		}*/
		if (plugin_groups.match("%")) {
			while ((ch = plugin_groups.next()) != null)
				if (ch == "%") break;
			plugin_groups.eat("%");
			return "command";
		}

		/*
		if (plugin_groups.match("[[")) {
			while ((ch = plugin_groups.next()) != null)
				if (ch == "]" && plugin_groups.next() == "]") break;
			plugin_groups.eat("]");
			return "include";
		}*/
		while (plugin_groups.next() != null && 
			//!plugin_groups.match("{", false) && 
			!plugin_groups.match("{{", false) && 
			!plugin_groups.match("%", false) ) {}
			return null;
	};

	var options = {
		lineNumbers: true,
		matchBrackets: true,
		tabSize: 2,
		indentUnit: 2,
		indentWithTabs: true,
		enterMode: "keep",
		tabMode: "shift",
		lineWrapping: true,
		extraKeys: {"Ctrl-Space": "autocomplete"},
		};
	// base mode

	CodeMirror.defineMode("mustache", function(config, parserConfig) {
		var mustacheOverlay = {
			token: mustache
		};
		return CodeMirror.overlayMode(CodeMirror.getMode(config, parserConfig.backdrop || 'text/html' ), mustacheOverlay);
	});
	options.mode = jQuery('#' + el).data('mode') ? jQuery('#' + el).data('mode') : "mustache";

	plorg_code_editor = CodeMirror.fromTextArea(document.getElementById(el), options);
	plorg_code_editor.on('keyup', tagFields);
	plorg_code_editor.on('blur', function(cm){
		cm.save();
		jQuery( cm.getInputField() ).trigger('change');
	});

	return plorg_code_editor;

}
(function() {
	"use strict";

	if( typeof CodeMirror === 'undefined' || plugin_groups_canvas === false ){
		return;
	}

	var Pos         = CodeMirror.Pos;

	function getFields(cm, options) {

		var cur = cm.getCursor(), token = cm.getTokenAt(cur),
		result = [],
		fields = options.fields;

		if( cm.getMode().name === 'sqlmustache' ){
			options.mode = 'sqlmustache';
		}
		switch (options.mode){
			case 'mustache':
			var wrap = {start: "{{", end: "}}"},
			prefix = token.string.slice(2);
			break;
			case 'command':
			var wrap = {start: "%", end: "%"},
			prefix = token.string.slice(1);
			break;
			default:
			var wrap = {start: "", end: "}}"},
			prefix = token.string;
			break;
		}
		for( var field in fields){			
			if (field.indexOf(prefix) == 0 || prefix === '{' || fields[field].indexOf(prefix) == 0){
				if(prefix === '{'){
					wrap.start = '{';
				}
				result.push({text: wrap.start + field + wrap.end, displayText: fields[field]});
			}
		};

		return {
			list: result,
			from: Pos(cur.line, token.start),
			to: Pos(cur.line, token.end)
		};
	}
	CodeMirror.registerHelper("hint", "elementfield", getFields);
})();

function find_if_in_wrapper( open_entry, close_entry, cm ){
	in_entry = false;
	if( open_entry.findPrevious() ){
		


		// is entry. check if closed
		var open_pos  = open_entry.from();

		if( close_entry.findPrevious() ){
			// if closed after open then not in			
			var close_pos = close_entry.from();
			if( open_pos.line > close_pos.line ){
				// open is after close - on entry				
				in_entry = open_pos
			}else if( open_pos.line === close_pos.line ){
				// smame line - what point?
				if( open_pos.ch > close_pos.ch ){
					//after close - in entry
					in_entry = open_pos;
				}
			}else{
				
				open_entry 	= cm.getSearchCursor('{{#each ', open_pos);

				return find_if_in_wrapper( open_entry, close_entry, cm )
			}

		}else{
			
			in_entry = open_pos;
		}

	}

	// set the parent
	if( in_entry ){
		// find what tag is open
		var close_tag 	= cm.getSearchCursor( '}}', in_entry );
		if( close_tag.findNext() ){
			var close_pos	= close_tag.from();
				start_tag	= open_entry.to();
			
			in_entry = cm.getRange( start_tag, close_pos );

		}

	}

	return in_entry;
}

function tagFields(cm, e) {
	if( e.keyCode === 8 ){
		return; // no backspace.
	}
	//console.log( cm );
	var cur = cm.getCursor();

	// test search 
	var open_entry 	= cm.getSearchCursor('{{#each ', cur);
	var close_entry = cm.getSearchCursor('{{/each}}', cur);
	var open_if 	= cm.getSearchCursor('{{#if ', cur);
	var close_if 	= cm.getSearchCursor('{{/if', cur);	

	var in_entry 	= find_if_in_wrapper( open_entry, close_entry, cm );
	var in_if 		= false;





	if( open_if.findPrevious() ){
		// is if. check if closed
		var open_pos  = open_if.from();

		if( close_if.findPrevious() ){
			// if closed after open then not in			
			var close_pos = close_if.from();
			if( open_pos.line > close_pos.line ){
				// open is after close - on if
				in_if = true
			}else if( open_pos.line === close_pos.line ){
				// smame line - what point?
				if( open_pos.ch > close_pos.ch ){
					//after close - in if
					in_if = true;
				}
			}

		}else{
			in_if = true;
		}
	}

	if( in_if ){
		// find what tag is open
		var close_tag 	= cm.getSearchCursor( '}}', open_pos );
		if( close_tag.findNext() ){
			var close_pos	= close_tag.from();
				start_tag	= open_entry.to();
			
			in_if = cm.getRange( start_tag, close_pos );

		}

	}

	if (!cm.state.completionActive || e.keyCode === 18){
		var token = cm.getTokenAt(cur), prefix,
		prefix = token.string.slice(0);
		if(prefix){
			if(token.type){
				var fields = {};
				//console.log( token );
				if( token.type ){
					// only show fields within the entry
					if( in_entry ){
						
						if( !in_if ){
							// dont allow closing #each if in if
							fields = {
								"/each"			:	"/each"
							};
						}

						// ADD INDEX KEY
						fields['@key'] = "@key";

						jQuery('.plugin-groups-autocomplete-in-entry-' + token.type).each(function(){
							var field = jQuery(this);

							if( !field.hasClass('parent-' + in_entry) && !field.hasClass('parant-all') ){
								return;
							}

							fields[field.data('slug')] = field.data('label');
							//fields["#each " + field.data('slug')] = "#each " + field.data('label');
							//if( !in_if ){
								if( field.data('label').indexOf('#') < 0 ){
									fields["#if " + field.data('slug')] = "#if " + field.data('label');
								}
							//}
							//fields["#unless " + field.data('slug')] = "#unless " + field.data('label');
						});
					}else{

						jQuery('.plugin-groups-autocomplete-out-entry-' + token.type).each(function(){
							var field = jQuery(this);
							fields[field.data('slug')] = field.data('label');
							//fields["#each " + field.data('slug')] = "#each " + field.data('label');
							//if( !in_if ){
								if( field.data('label').indexOf('#') < 0 ){
									fields["#if " + field.data('slug')] = "#if " + field.data('label');
								}
							//}
							//fields["#unless " + field.data('slug')] = "#unless " + field.data('label');
						});

					}

					if( in_if ){
						fields['else'] = 'else';
						fields['/if'] = '/if';
					}
				}
				// sort hack
				var keys = [];
				var commands = [];
				var sorted_obj = {};

				for(var key in fields){
				    if(fields.hasOwnProperty(key)){
				    	if( key.indexOf('#') < 0 && key.indexOf('/') < 0 ){
				        	keys.push(key);
				    	}else{
				    		commands.push(key);
				    	}
				    }
				}

				// sort keys
				keys.sort();
				commands.sort();
				keys = keys.concat(commands);
				// create new array based on Sorted Keys
				jQuery.each(keys, function(i, key){
				    sorted_obj[key] = fields[key];
				});
				CodeMirror.showHint(cm, CodeMirror.hint.elementfield, {fields: sorted_obj, mode: token.type});

			}
		}
	}
	return;
}