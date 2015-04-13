<?php
/**
 * Plugin Groups.
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
class Plugin_Groups {

	/**
	 * The slug for this plugin
	 *
	 * @since 0.0.1
	 *
	 * @var      string
	 */
	protected $plugin_slug = 'plugin-groups';

	/**
	 * Holds class isntance
	 *
	 * @since 0.0.1
	 *
	 * @var      object|Plugin_Groups
	 */
	protected static $instance = null;

	/**
	 * Holds the option screen prefix
	 *
	 * @since 0.0.1
	 *
	 * @var      string
	 */
	protected $plugin_screen_hook_suffix = null;

	/**
	 * Initialize the plugin by setting localization, filters, and administration functions.
	 *
	 * @since 0.0.1
	 *
	 * @access private
	 */
	private function __construct() {

		// Load plugin text domain
		add_action( 'init', array( $this, 'load_plugin_textdomain' ) );

		// Activate plugin when new blog is added
		add_action( 'wpmu_new_blog', array( $this, 'activate_new_site' ) );

		// Load admin style sheet and JavaScript.
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_stylescripts' ) );

		
	}


	/**
	 * Return an instance of this class.
	 *
	 * @since 0.0.1
	 *
	 * @return    object|Plugin_Groups    A single instance of this class.
	 */
	public static function get_instance() {

		// If the single instance hasn't been set, set it now.
		if ( null == self::$instance ) {
			self::$instance = new self;
		}

		return self::$instance;
	}

	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since 0.0.1
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain( $this->plugin_slug, FALSE, basename( PLORG_PATH ) . '/languages');

	}
	
	/**
	 * Register and enqueue admin-specific style sheet.
	 *
	 * @since 0.0.1
	 *
	 * @return    null
	 */
	public function enqueue_admin_stylescripts() {

		$screen = get_current_screen();

		if( !is_object( $screen ) ){
			return;
		}

		
		
		if( false !== strpos( $screen->base, 'plugin_groups' ) ){

			wp_enqueue_style( 'plugin_groups-core-style', PLORG_URL . '/assets/css/styles.css' );
			wp_enqueue_style( 'plugin_groups-baldrick-modals', PLORG_URL . '/assets/css/modals.css' );
			wp_enqueue_script( 'plugin_groups-wp-baldrick', PLORG_URL . '/assets/js/wp-baldrick-full.js', array( 'jquery' ) , false, true );
			wp_enqueue_script( 'jquery-ui-autocomplete' );
			wp_enqueue_script( 'jquery-ui-sortable' );
			wp_enqueue_style( 'plugin_groups-codemirror-style', PLORG_URL . '/assets/css/codemirror.css' );
			wp_enqueue_script( 'plugin_groups-codemirror-script', PLORG_URL . '/assets/js/codemirror.js', array( 'jquery' ) , false );
			wp_enqueue_script( 'plugin_groups-core-script', PLORG_URL . '/assets/js/scripts.js', array( 'plugin_groups-wp-baldrick' ) , false );
			wp_enqueue_style( 'wp-color-picker' );
			wp_enqueue_script( 'wp-color-picker' );			
			wp_enqueue_style( 'plugin_groups-select2-style', PLORG_URL . 'assets/css/select2.css' );
			wp_enqueue_script( 'plugin_groups-select2-script', PLORG_URL . 'assets/js/select2.min.js', array( 'jquery' ) , false, true );		
		}


	}



}















