<?php

	// Panel template for My Tasks

?>
<input id="set_default_group" type="hidden" name="default_group" value="{{default_group}}">
<input id="active_edit_group" data-live-sync="true" type="hidden" value="{{active_edit_group}}" name="active_edit_group">
<div class="plugin-groups-module-side">

	
	<ul class="plugin-groups-module-tabs plugin-groups-group-wrapper" style="box-shadow: 0px 1px 0px rgb(207, 207, 207) inset;">
	{{#each group}}
		<li class="{{_id}} plugin-groups-module-tab {{#is ../active_edit_group value=_id}}active{{/is}}">
			{{:node_point}}
			{{#unless config/group_name}}
				<a><input class="autofocus-input" data-format="key" style="width: 100%; padding: 3px 6px; margin: -3px; background: none repeat scroll 0% 0% rgb(255, 255, 255); border: 0px none; border-radius: 2px;" type="text" data-id="{{_id}}" name="{{:name}}[config][group_name]" data-live-sync="true" data-sync=".group_title_{{_id}}" value="{{config/group_name}}" id="caldera_todo-group_name-{{_id}}"></a>
			{{else}}
				<a href="#" class="sortable-item plugin-groups-edit-group" data-id="{{_id}}"> <span style="display: inline-block; width: 210px;" class="group_title_{{_id}}">{{config/group_name}}</span><span style="float:right;">{{config/plugins.length}}</span></a>
			{{/unless}}

			{{#is ../active_edit_group not=_id}}<input type="hidden" name="{{:name}}[config]" value="{{json config}}">{{/is}}
			{{#if new}}<input class="wp-baldrick" data-request="plorg_record_change" data-autoload="true" data-live-sync="true" type="hidden" value="{{_id}}" name="active_edit_group">{{/if}}

		</li>
	{{/each}}
	{{#unless group}}
		<li class="plugin-groups-module-tab"><p class="description" style="margin: 0px; padding: 9px 22px;"><?php _e( 'No Groups', 'plugin-groups' ); ?></p></li>
	{{/unless}}
		<li class="plugin-groups-module-tab" style="text-align: center; padding: 12px 22px; background-color: rgb(225, 225, 225); box-shadow: -1px 0 0 #cfcfcf inset, 0 1px 0 #cfcfcf inset, 0 -1px 0 #cfcfcf inset;">
			<button style="width: 100%;" class="wp-baldrick button" data-node-default='{ "new" : "true" }' data-add-node="group" type="button"><?php _e( 'Add Group', 'plugin-groups' ); ?></button>
		</li>	 
	</ul>

</div>

{{#find group active_edit_group}}

	{{#if config/group_name}}
	
	<div class="plugin-groups-field-config-wrapper {{_id}}" style="width:580px;">

		<button style="float:right" type="button" class="button" data-confirm="<?php echo esc_attr( __( 'Remove this Group?', 'plugin-groups' ) ); ?>" data-remove-element=".{{_id}}" style="float: right; padding: 3px 6px;"><?php _e( 'Delete Group', 'plugin-groups' ); ?></button>

		<div style="border-bottom: 1px solid rgb(209, 209, 209); margin: 0px 0px 12px; padding: 5px 0px 12px;">
			<input style="box-shadow: none; font-weight: bold; width: 450px; margin: -4px 0px 0px;" type="text" name="{{:name}}[config][group_name]" data-live-sync="true" data-sync=".group_title_{{_id}}" data-format="key" value="{{config/group_name}}" id="caldera_todo-group_name-{{_id}}">
		</div>

		<!-- Add custom code here fields names are {{:name}}[config][field_name] -->
		<div class="plugin-groups-config-group">
			<label for="plugin-groups-plugins-{{_id}}"><?php _e( 'Plugins', 'plugin-groups' ); ?></label>
			<select id="plugin-groups-plugins-{{_id}}" name="{{:name}}[config][plugins][]" multiple="multiple" style="width: 395px;">
				<?php foreach( $plugins as $plugin=>$plugin_info ){ ?>
					<option value="<?php echo $plugin; ?>" {{#find config/plugins '<?php echo $plugin; ?>'}}selected="selected"{{/find}}><?php echo $plugin_info['Name']; ?></option>
				<?php } ?>
			</select>
			<p class="description" style="margin-left:190px;"><?php _e( 'Add plugins to this group for filtering.', 'plugin-groups' ); ?></p>
		</div>

		<div class="plugin-groups-config-group">
			<label for="plugin-keywords-{{_id}}"> </label>
			<label style="width: auto;"><input type="checkbox" data-live-sync="true" id="plugin-keywords-{{_id}}" name="{{:name}}[config][auto_keyword]" value="1" {{#if config/auto_keyword}}checked="checked"{{/if}}> <?php _e( 'Enable Keyword Grouping.', 'plugin-groups' ); ?></label>
		</div>

		<div class="plugin-groups-config-group" {{#unless config/auto_keyword}}style="display:none;"{{/unless}}>
			<label for="plugin-keywords-{{_id}}"><?php _e( 'Keywords', 'plugin-groups' ); ?></label>
			<textarea id="plugin-keywords-{{_id}}" name="{{:name}}[config][keywords]" style="width: 395px; height:120px;">{{config/keywords}}</textarea>
			<p class="description" style="margin-left:190px;"><?php _e( 'Keywords to search for in plugin names & descriptions. 1 phrase per line.', 'plugin-groups' ); ?></p>
		</div>

		{{#script}}	
		jQuery( function($){
			$("#plugin-groups-plugins-{{_id}}").select2();
		});
		{{/script}}
	</div>

	{{/if}}

{{/find}}



{{#script}}
jQuery('.plugin-groups-edit-group').on('click', function(){
	var clicked = jQuery(this),
		active = jQuery('#active_edit_group');

		if( active.val() == clicked.data('id') ){
			active.val('').trigger('change');
		}else{
			active.val( clicked.data('id') ).trigger( 'change' );
		}
});
jQuery('.autofocus-input').focus().on('blur', function(){ 
	console.log(jQuery(this).val());
	if( jQuery(this).val() == '' ){
		jQuery( '.' + jQuery(this).data('id') ).remove();
		plorg_record_change();
	}
});
{{/script}}