<?php
$plugin_groups = Plugin_Groups_Options::get_single( 'plugin_groups' );
$plugins = get_plugins();

?>
<div class="wrap plugin-groups-calderamain-canvas" id="plugin-groups-main-canvas">
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
<script type="text/javascript">
	function plorg_start_importer(){
		return {};
	}
	function plorg_create_plugin_groups(){
		jQuery('#plugin-groups-field-sync').trigger('refresh');
		jQuery('#plorg-save-button').trigger('click');
	}
</script>
<script type="text/html" id="import-plugin_groups-form">
	<div class="import-tester-config-group">
		<input id="new-plugin-groups-import-file" type="file" class="regular-text">
		<input id="new-plugin_groups-import" value="" name="import" type="hidden">
	</div>
	{{#script}}
		jQuery( function($){

			$('#plorg_import_init').prop('disabled', true).addClass('disabled');

			$('#new-plugin-groups-import-file').on('change', function(){
				$('#plorg_import_init').prop('disabled', true).addClass('disabled');
				var input = $(this),
					f = this.files[0],
				contents;

				if (f) {
					var r = new FileReader();
					r.onload = function(e) { 
						contents = e.target.result;
						var data;
						 try{ 
						 	data = JSON.parse( contents );
						 } catch(e){};
						 
						 if( !data || ! data['plugin-groups-setup'] ){
						 	alert("<?php echo esc_attr( __('Not a valid Plugin-groups export file.', 'plugin-groups') ); ?>");
						 	input[0].value = null;
							return false;
						 }

						$('#plugin-groups-live-config').val( contents );						
						$('#plorg_import_init').prop('disabled', false).removeClass('disabled');
					}
					if( f.type !== 'application/json' ){
						alert("<?php echo esc_attr( __('Not a valid Plugin-groups export file.', 'plugin-groups') ); ?>");
						this.value = null;
						return false;
					}
					r.readAsText(f);
				} else { 
					alert("Failed to load file");
					return false;
				}
			});

		});
	{{/script}}
</script>





