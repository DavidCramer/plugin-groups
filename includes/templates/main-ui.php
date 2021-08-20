<div class="plugin-groups-main-headercaldera">
		<h2 class="plugin-groups-main-title">
		<?php _e( 'Plugin Groups', 'plugin-groups' ); ?>
		<span class="plugin-groups-version">
			<?php echo PLORG_VER; ?>
		</span>

		<span class="plugin-groups-nav-separator"></span>
		<?php if( !empty( $plugin_groups ) ) { ?>
		<a class="add-new-h2" href="?page=plugin_groups&amp;download=<?php echo $plugin_groups[ 'id' ]; ?>&plugin-groups-export=<?php echo wp_create_nonce( 'plugin-groups' ); ?>"><?php _e('Export', 'plugin-groups'); ?></a>
		<?php } ?>
		<span class="add-new-h2 wp-baldrick" data-modal="import-plugin_groups" data-modal-height="160" data-modal-width="380" data-modal-buttons='<?php _e( 'Import Plugin-groups', 'plugin-groups' ); ?>|{"id":"plorg_import_init", "data-request":"plorg_create_plugin_groups", "data-modal-autoclose" : "import-plugin_groups"}' data-modal-title="<?php _e('Import Plugin-groups', 'plugin-groups') ; ?>" data-request="plorg_start_importer" data-template="#import-plugin_groups-form">
			<?php _e('Import', 'plugin-groups') ; ?>
		</span>

		<span class="plugin-groups-nav-separator"></span>

		<span style="position: absolute; top: 5px;" id="plugin-groups-save-indicator">
			<span style="float: none; margin: 10px 0px -5px 10px;" class="spinner"></span>
		</span>

	</h2>


		<div class="updated_notice_box">
		<?php _e( 'Updated Successfully', 'plugin-groups' ); ?>
	</div>
	<div class="error_notice_box">
		<?php _e( 'Could not save changes.', 'plugin-groups' ); ?>
	</div>
	<ul class="plugin-groups-header-tabs plugin-groups-nav-tabs">



	</ul>

	<span class="wp-baldrick" id="plugin-groups-field-sync" data-event="refresh" data-target="#plugin-groups-main-canvas" data-before="plorg_canvas_reset" data-callback="plorg_canvas_init" data-type="json" data-request="#plugin-groups-live-config" data-template="#main-ui-template"></span>
</div>
<div class="plugin-groups-sub-headercaldera">
	<ul class="plugin-groups-sub-tabs plugin-groups-nav-tabs">
		<li class="{{#is _current_tab value="#plugin-groups-panel-group"}}active {{/is}}plugin-groups-nav-tab">
			<a href="#plugin-groups-panel-group">
				<?php _e('Group', 'plugin-groups') ; ?>
			</a>
		</li>
		<li class="{{#is _current_tab value="#plugin-groups-panel-preset"}}active {{/is}}plugin-groups-nav-tab">
			<a href="#plugin-groups-panel-preset">
				<?php _e('Presets', 'plugin-groups') ; ?>
			</a>
		</li>


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
	<div id="plugin-groups-panel-preset" class="plugin-groups-editor-panel" {{#is _current_tab value="#plugin-groups-panel-preset"}}{{else}} style="display:none;" {{/is}}>
		<h4><?php _e('Presets', 'plugin-groups') ; ?> <small class="description"><?php _e('Preset / Common Groups', 'plugin-groups') ; ?></small></h4>
		<?php
		// pull in the presets template
		include PLORG_PATH . 'includes/templates/presets-panel.php';
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
