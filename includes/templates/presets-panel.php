<?php

	// Presets / Intergrations
	$presetGroups = Plugin_Groups_Settings::get_instance()->get_preset_groups();
	foreach( $presetGroups as $group => $group_keys ){
		$index = uniqid();
?>
	<div class="plugin-groups-config-group">
		<label style="width: auto;"><input type="checkbox" data-live-sync="true" id="plugin-preset-<?php echo $index; ?>" name="presets[]" value="<?php esc_html_e( $group ); ?>" {{#find presets "<?php esc_html_e( $group ); ?>"}}checked="checked"{{/find}}> <?php esc_html_e( $group ); ?></label>
	</div>
<?php } ?>
