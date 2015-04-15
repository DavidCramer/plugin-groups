<div class="plugin-groups-main-headercaldera">
		<h2>
		<?php _e( 'Plugin Groups', 'plugin-groups' ); ?> <span class="plugin-groups-version"><?php echo PLORG_VER; ?></span>
		<span style="position: absolute; top: 5px;" id="plugin-groups-save-indicator"><span style="float: none; margin: 10px 0px -5px 10px;" class="spinner"></span></span>
	</h2>
	<div class="updated_notice_box"><?php _e( 'Changes saved successfully', 'plugin-groups' ); ?></div>
	<div class="error_notice_box"><?php _e( 'Could not save changes.', 'plugin-groups' ); ?></div>

	<span class="wp-baldrick" id="plugin-groups-field-sync" data-event="refresh" data-target="#plugin-groups-main-canvas" data-callback="plorg_canvas_init" data-type="json" data-request="#plugin-groups-live-config" data-template="#main-ui-template"></span>
</div>
<div class="plugin-groups-sub-headercaldera">
	<ul class="plugin-groups-sub-tabs plugin-groups-nav-tabs">
				<li class="{{#is _current_tab value="#plugin-groups-panel-group"}}active {{/is}}plugin-groups-nav-tab"><a href="#plugin-groups-panel-group"><?php _e('Group Setup', 'plugin-groups') ; ?></a></li>

	</ul>
</div>

<form class="caldera-main-form has-sub-nav" id="plugin-groups-main-form" action="?page=plugin_groups" method="POST">
	<?php wp_nonce_field( 'plugin-groups', 'plugin-groups-setup' ); ?>
	<input type="hidden" value="plugin_groups" name="id" id="plugin_groups-id">
	<input type="hidden" value="{{_current_tab}}" name="_current_tab" id="plugin-groups-active-tab">

		<div id="plugin-groups-panel-group" class="plugin-groups-editor-panel" {{#is _current_tab value="#plugin-groups-panel-group"}}{{else}} style="display:none;" {{/is}}>		
		<h4><?php _e('Create groups for plugins', 'plugin-groups') ; ?> <small class="description"><?php _e('Plugin Groups', 'plugin-groups') ; ?></small></h4>
		<?php
		// pull in the general settings template
		include PLORG_PATH . 'includes/templates/group-panel.php';
		?>
	</div>

	
	<div class="clear"></div>
	<div class="plugin-groups-footer-bar">
		<button type="submit" class="button button-primary wp-baldrick" data-action="plorg_save_config" data-callback="plorg_handle_save" data-active-class="none" data-load-element="#plugin-groups-save-indicator" data-before="plorg_get_config_object" ><?php _e('Save Changes', 'plugin-groups') ; ?></button>
	</div>	

</form>

{{#unless _current_tab}}
	{{#script}}
		jQuery(function($){
			$('.plugin-groups-nav-tab').first().trigger('click').find('a').trigger('click');
		});
	{{/script}}
{{/unless}}