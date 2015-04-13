<?php
$plugin_groups = Plugin_Groups_Options::get_single( 'plugin_groups' );
$plugins = get_plugins();

?>
<div class="wrap" id="plugin-groups-main-canvas">
	<span class="wp-baldrick spinner" style="float: none; display: block;" data-target="#plugin-groups-main-canvas" data-callback="plorg_canvas_init" data-type="json" data-request="#plugin-groups-live-config" data-event="click" data-template="#main-ui-template" data-autoload="true"></span>
</div>

<div class="clear"></div>

<input type="hidden" class="clear" autocomplete="off" id="plugin-groups-live-config" style="width:100%;" value="<?php echo esc_attr( json_encode($plugin_groups) ); ?>">

<script type="text/html" id="main-ui-template">
	<?php
	// pull in the join table card template
	include PLORG_PATH . 'includes/templates/main-ui.php';
	?>	
</script>





