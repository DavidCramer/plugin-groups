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
 *
 * @package Plugin_Groups
 * @author  David Cramer <david@digilab.co.za>
 */
class Plugin_Groups {

	/**
	 * The slug for this plugin
	 *
	 * @since 0.0.1
	 * @var      string
	 */
	protected $plugin_slug = 'plugin-groups';

	/**
	 * Holds class isntance
	 *
	 * @since 0.0.1
	 * @var      object|Plugin_Groups
	 */
	protected static $instance = null;

	/**
	 * Holds the option screen prefix
	 *
	 * @since 0.0.1
	 * @var      string
	 */
	protected $plugin_screen_hook_suffix = null;

	protected $capability = 'manage_options';
	protected $multisite = '';

	/**
	 * Initialize the plugin by setting localization, filters, and
	 * administration functions.
	 *
	 * @since  0.0.1
	 * @access private
	 */
	private function __construct() {

		// Load plugin text domain
		add_action( 'init', array( $this, 'load_plugin_textdomain' ) );

		// Activate plugin when new blog is added
		add_action( 'wpmu_new_blog', array( $this, 'activate_new_site' ) );
		// Replace scripts.

		add_action( 'wp_default_scripts', array( $this, 'replace_scripts' ), - 1 );
		// Load admin style sheet and JavaScript.
		add_action(
			'admin_enqueue_scripts',
			array(
				$this,
				'enqueue_admin_stylescripts',
			)
		);

	}

	/**
	 * Return an instance of this class.
	 *
	 * @since 0.0.1
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

		load_plugin_textdomain( $this->plugin_slug, false, basename( PLORG_PATH ) . '/languages' );

	}

	/**
	 * Migrate compat WP 5.6 +
	 *
	 * @since 1.2.2
	 */
	public function replace_scripts( $scripts ) {
		$ver = get_bloginfo( 'version' );
		if ( ! version_compare( '5.6', $ver, '<=' ) ) {
			return;
		}

		$assets_url = PLORG_URL . '/assets/js/';
		self::set_script( $scripts, 'jquery-migrate', $assets_url . 'jquery-migrate/jquery-migrate-1.4.1-wp.js', array(), '1.4.1-wp' );
		self::set_script( $scripts, 'jquery-core', $assets_url . 'jquery/jquery-1.12.4-wp.js', array(), '1.12.4-wp' );
		self::set_script( $scripts, 'jquery', false, array( 'jquery-core', 'jquery-migrate' ), '1.12.4-wp' );

		// All the jQuery UI stuff comes here.
		self::set_script( $scripts, 'jquery-ui-core', $assets_url . 'jquery-ui/core.min.js', array( 'jquery' ), '1.11.4-wp', 1 );
		self::set_script( $scripts, 'jquery-effects-core', $assets_url . 'jquery-ui/effect.min.js', array( 'jquery' ), '1.11.4-wp', 1 );
		self::set_script( $scripts, 'jquery-ui-autocomplete', $assets_url . 'jquery-ui/autocomplete.min.js', array( 'jquery-ui-menu', 'wp-a11y' ), '1.11.4-wp', 1 );
		self::set_script( $scripts, 'jquery-ui-menu', $assets_url . 'jquery-ui/menu.min.js', array( 'jquery-ui-core', 'jquery-ui-widget', 'jquery-ui-position' ), '1.11.4-wp', 1 );
		self::set_script( $scripts, 'jquery-ui-sortable', $assets_url . 'jquery-ui/sortable.min.js', array( 'jquery-ui-mouse' ), '1.11.4-wp', 1 );
		self::set_script( $scripts, 'jquery-ui-widget', $assets_url . 'jquery-ui/widget.min.js', array( 'jquery' ), '1.11.4-wp', 1 );

	}

	/**
	 * Pre-register scripts on 'wp_default_scripts' action, they won't be overwritten by $wp_scripts->add().
	 *
	 * @since  1.2.2
	 */
	private static function set_script( $scripts, $handle, $src, $deps = array(), $ver = false, $in_footer = false ) {
		$script = $scripts->query( $handle, 'registered' );

		if ( $script ) {
			// If already added
			$script->src  = $src;
			$script->deps = $deps;
			$script->ver  = $ver;
			$script->args = $in_footer;

			unset( $script->extra['group'] );

			if ( $in_footer ) {
				$script->add_data( 'group', 1 );
			}
		} else {
			// Add the script
			if ( $in_footer ) {
				$scripts->add( $handle, $src, $deps, $ver, 1 );
			} else {
				$scripts->add( $handle, $src, $deps, $ver );
			}
		}
	}

	/**
	 * Check if we're in the plugins screen.
	 *
	 * @since 1.2.2
	 * @return bool
	 */
	public static function is_plugin_group_screen() {
		$return = false;
		if ( PLORG_SLUG === self::current_page() ) {
			$return = true;
		}

		return $return;
	}

	/**
	 * Get the name of the current admin page query_var.
	 *
	 * @since 1.2.2
	 * @return string|null
	 */
	public static function current_page() {
		$return = filter_input( INPUT_GET, 'page', FILTER_SANITIZE_STRING );
		if ( is_null( $return ) && function_exists( 'get_current_screen' ) ) {
			$screen = get_current_screen();
			$return = $screen->base;
		}

		return $return;
	}

	/**
	 * Register and enqueue admin-specific style sheet.
	 *
	 * @since 0.0.1
	 * @return    null
	 */
	public function enqueue_admin_stylescripts() {

		if ( self::is_plugin_group_screen() ) {

			wp_enqueue_style( 'plugin_groups-core-style', PLORG_URL . '/assets/css/styles.css' );
			wp_enqueue_style( 'plugin_groups-baldrick-modals', PLORG_URL . '/assets/css/modals.css' );
			wp_enqueue_script( 'plugin_groups-wp-baldrick', PLORG_URL . '/assets/js/wp-baldrick-full.js', array( 'jquery' ), false, true );
			wp_enqueue_script( 'jquery-ui-autocomplete' );
			wp_enqueue_script( 'jquery-ui-sortable' );
			wp_enqueue_script( 'plugin_groups-core-script', PLORG_URL . '/assets/js/scripts.js', array( 'plugin_groups-wp-baldrick' ), false );
			wp_enqueue_style( 'wp-color-picker' );
			wp_enqueue_script( 'wp-color-picker' );
			wp_enqueue_style( 'plugin_groups-select2-style', PLORG_URL . 'assets/css/select2.css' );
			wp_enqueue_script( 'plugin_groups-select2-script', PLORG_URL . 'assets/js/select2.min.js', array( 'jquery' ), false, true );
		}

		if ( 'plugins' === self::current_page() ) {
			wp_enqueue_script( 'plugin_groups-bulk', PLORG_URL . '/assets/js/bulk.js', array( 'jquery' ), false );
			wp_enqueue_style( 'plugin_groups-editor', PLORG_URL . 'assets/css/edit.css' );
		}
	}
}
