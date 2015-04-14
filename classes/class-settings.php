<?php
/**
 * Plugin Groups Setting.
 *
 * @package   Plugin_Groups
 * @author    David Cramer <david@digilab.co.za>
 * @license   GPL-2.0+
 * @link
 * @copyright 2015 David Cramer <david@digilab.co.za>
 */

/**
 * Plugin class.
 * @package Plugin_Groups
 * @author  David Cramer <david@digilab.co.za>
 */
class Plugin_Groups_Settings extends Plugin_Groups{


	/**
	 * Constructor for class
	 *
	 * @since 0.0.1
	 */
	public function __construct(){

		// add admin page
		add_action( 'admin_menu', array( $this, 'add_settings_pages' ), 25 );
		// save config
		add_action( 'wp_ajax_plorg_save_config', array( $this, 'save_config') );
		// get plugins filters
		add_filter( 'all_plugins', array( $this, 'prepare_filter_addons' ) );
		add_filter( 'views_plugins', array( $this, 'filter_addons_filter_addons' ) );
		add_filter( 'show_advanced_plugins', array( $this, 'filter_addons_do_filter_addons' ) );
		add_action( 'after_plugin_row' , array( $this, 'filter_addons_prepare_filter_addons_referer' ), 10, 2 );
		add_action( 'check_admin_referer', array( $this, 'filter_addons_prepare_filter_addons_referer' ), 10, 2 );
	}

	/**
	 * Sets the status back to the group on action ( activate etc.)
	 *
	 * @since 0.0.1
	 */
	public function filter_addons_prepare_filter_addons_referer($a, $b){
		global $status;
		if( !function_exists('get_current_screen')){
			return;
		}

		// work on plugins list 
		$plugin_groups = Plugin_Groups_Options::get_single( 'plugin_groups' );

		$screen = get_current_screen();
		if( is_object($screen) && $screen->base === 'plugins' && isset( $_REQUEST['plugin_status'] ) && !empty( $plugin_groups['group'] ) ){
			foreach( $plugin_groups['group'] as $group ){				
				$key = '_' . sanitize_key( $group['config']['group_name'] );
				if( $_REQUEST['plugin_status'] === $key ){

					$status = $key;
					break;
				}
			}
		}
	}	

	/**
	 * Add new filter group
	 *
	 * @since 0.0.1
	 * @return Bool
	 */
	public function filter_addons_do_filter_addons($a){
		global $plugins, $status;

		// work on plugins list 
		$plugin_groups = Plugin_Groups_Options::get_single( 'plugin_groups' );
		
		
		if( !empty( $plugin_groups['group'] ) ){
			foreach($plugins['all'] as $plugin_slug=>$plugin_data){
				foreach( $plugin_groups['group'] as $group ){
					$key = '_' . sanitize_key( $group['config']['group_name'] );

					if( !empty( $group['config']['plugins'] ) && in_array( $plugin_slug, $group['config']['plugins'] ) ){
						$plugins[ $key ][ $plugin_slug ] = $plugin_data;
						$plugins[ $key ][ $plugin_slug ]['plugin'] =  $plugin_slug;
						// is a remove group?
						if( !empty( $group['config']['remove_base'] ) ){
							foreach( $group['config']['plugins'] as $plugin ){
								unset( $plugins['all'][ $plugin ] );
							}
						}
						// replicate teh next step
						if ( current_user_can( 'update_plugins' ) ) {
							$current = get_site_transient( 'update_plugins' );
							if ( isset( $current->response[ $plugin_slug ] ) ) {
								$plugins[ $key ][ $plugin_slug ]['update'] = true;
							}
						}
					}
				}
			}
		}

		return $a;
	}

	/**
	 * Add new filter view
	 *
	 * @since 0.0.1
	 * @return array|Views with added groups
	 */
	public function filter_addons_filter_addons($views){
		global $status, $plugins;
		
		// work on plugins list 
		$plugin_groups = Plugin_Groups_Options::get_single( 'plugin_groups' );

		if( !empty( $plugin_groups['group'] ) ){
			foreach( $plugin_groups['group'] as $group ){
				if( empty( $group['config']['plugins'] ) ){
					continue;
				}
				$key = '_' . sanitize_key( $group['config']['group_name'] );
				$class = "";
				if( $status == $key ){
					$class = 'current';
				}
				$views[ $key ] = '<a class="' . $class . '" href="plugins.php?plugin_status=' . $key . '">' . $group['config']['group_name'] .' <span class="count">(' . count( $group['config']['plugins'] ) . ')</span></a>';

			}
		}

		return $views;
	}

	/**
	 * alter and set the current status.
	 *
	 * @since 0.0.1
	 * @return array|plugins - no change
	 */
	public function prepare_filter_addons($plugins){
		global $wp_list_table, $status;

		// work on plugins list 
		$plugin_groups = Plugin_Groups_Options::get_single( 'plugin_groups' );

		if( isset( $_REQUEST['plugin_status'] ) && !empty( $plugin_groups['group'] ) ){
			foreach( $plugin_groups['group'] as $group ){
				$key = '_' . sanitize_key( $group['config']['group_name'] );
				if( $_REQUEST['plugin_status'] === $key ){
					$status = $key;
					break;
				}				
			}
		}

		return $plugins;
	}

	/**
	 * Saves a config
	 *
	 * @uses "wp_ajax_plorg_save_config" hook
	 *
	 * @since 0.0.1
	 */
	public function save_config(){

		if( empty( $_POST[ 'plugin-groups-setup' ] ) || ! wp_verify_nonce( $_POST[ 'plugin-groups-setup' ], 'plugin-groups' ) ){
			if( empty( $_POST['config'] ) ){
				return;
			}
		}

		if( !empty( $_POST[ 'plugin-groups-setup' ] ) && empty( $_POST[ 'config' ] ) ){
			$config = stripslashes_deep( $_POST['config'] );

			Plugin_Groups_Options::update( $config );


			wp_redirect( '?page=plugin_groups&updated=true' );
			exit;
		}

		if( !empty( $_POST['config'] ) ){

			$config = json_decode( stripslashes_deep( $_POST['config'] ), true );

			if(	wp_verify_nonce( $config['plugin-groups-setup'], 'plugin-groups' ) ){
				Plugin_Groups_Options::update( $config );
				wp_send_json_success( $config );
			}

		}

		// nope
		wp_send_json_error( $config );

	}

	/**
	 * Array of "internal" fields not to mess with
	 *
	 * @since 0.0.1
	 *
	 * @return array
	 */
	public function internal_config_fields() {
		return array( '_wp_http_referer', 'id', '_current_tab' );
	}


	/**
	 * Deletes an item
	 *
	 *
	 * @uses 'wp_ajax_plorg_create_plugin_groups' action
	 *
	 * @since 0.0.1
	 */
	public function delete_plugin_groups(){

		$deleted = Plugin_Groups_Options::delete( strip_tags( $_POST['block'] ) );

		if ( $deleted ) {
			wp_send_json_success( $_POST );
		}else{
			wp_send_json_error( $_POST );
		}



	}

	/**
	 * Create a new item
	 *
	 * @uses "wp_ajax_plorg_create_plugin_groups"  action
	 *
	 * @since 0.0.1
	 */
	public function create_new_plugin_groups(){
		$new = Plugin_Groups_Options::create( $_POST[ 'name' ], $_POST[ 'slug' ] );

		if ( is_array( $new ) ) {
			wp_send_json_success( $new );
		}else {
			wp_send_json_error( $_POST );
		}

	}


	/**
	 * Add options page
	 *
	 * @since 0.0.1
	 *
	 * @uses "admin_menu" hook
	 */
	public function add_settings_pages(){
		// This page will be under "Settings"
		
	
			$this->plugin_screen_hook_suffix['plugin_groups'] =  add_submenu_page( 'plugins.php', __( 'Plugin Groups', $this->plugin_slug ), __( 'Groups', $this->plugin_slug ), 'manage_options', 'plugin_groups', array( $this, 'create_admin_page' ) );
			add_action( 'admin_print_styles-' . $this->plugin_screen_hook_suffix['plugin_groups'], array( $this, 'enqueue_admin_stylescripts' ) );

	}

	/**
	 * Options page callback
	 *
	 * @since 0.0.1
	 */
	public function create_admin_page(){
		// Set class property        
		$screen = get_current_screen();
		$base = array_search($screen->id, $this->plugin_screen_hook_suffix);
			
		// include main template
		include PLORG_PATH .'includes/edit.php';

		// php based script include
		if( file_exists( PLORG_PATH .'assets/js/inline-scripts.php' ) ){
			echo "<script type=\"text/javascript\">\r\n";
				include PLORG_PATH .'assets/js/inline-scripts.php';
			echo "</script>\r\n";
		}

	}


}

if( is_admin() ) {
	global $settings_plugin_groups;
	$settings_plugin_groups = new Plugin_Groups_Settings();
}
