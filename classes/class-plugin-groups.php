<?php
/**
 * Core class for Plugin Groups.
 *
 * @package plugin_groups
 */

use Plugin_Groups\Plugin_Groups_Utils;

/**
 * Plugin_Groups Class.
 */
class Plugin_Groups {

	/**
	 * The single instance of the class.
	 *
	 * @var Plugin_Groups
	 */
	protected static $instance = null;

	/**
	 * Holds the version of the plugin.
	 *
	 * @var string
	 */
	protected $version;

	/**
	 * Holds the plugin name.
	 *
	 * @var string
	 */
	protected $plugin_name;

	/**
	 * Holds the plugin config.
	 *
	 * @var array
	 */
	protected $config = array();

	/**
	 * Holds the Groups.
	 *
	 * @var array
	 */
	protected $groups = array();

	/**
	 * Holds the menu slug.
	 *
	 * @var string
	 */
	public static $slug;

	/**
	 * Hold the record of the plugins current version for upgrade.
	 *
	 * @var string
	 */
	const VERSION_KEY = '_plugin_groups_version';

	/**
	 * Hold the config storage key.
	 *
	 * @var string
	 */
	const CONFIG_KEY = '_plugin_groups_config';

	/**
	 * Initiate the plugin_groups object.
	 */
	public function __construct() {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
		$plugin            = get_file_data( PLGGRP_CORE, array( 'Plugin Name', 'Version', 'Text Domain' ), 'plugin' );
		$this->plugin_name = array_shift( $plugin );
		$this->version     = array_shift( $plugin );
		self::$slug        = array_shift( $plugin );
		spl_autoload_register( array( $this, 'autoload_class' ), true, false );

		// Start hooks.
		$this->setup_hooks();
	}

	/**
	 * Setup and register WordPress hooks.
	 */
	protected function setup_hooks() {
		add_action( 'init', array( $this, 'plugin_groups_init' ), PHP_INT_MAX ); // Always the last thing to init.
		add_action( 'admin_init', array( $this, 'admin_init' ) );
		add_action( 'admin_menu', array( $this, 'admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'rest_api_init', array( $this, 'register_route' ) );
		add_filter( 'views_plugins', array( $this, 'add_groups' ) );
		add_filter( 'show_advanced_plugins', array( $this, 'populate_group' ) );
		add_filter( 'all_plugins', array( $this, 'filter_status' ) );

	}

	public function filter_status( $plugins ) {
		global $status;
		$actual_status = filter_input( INPUT_GET, 'plugin_status', FILTER_SANITIZE_STRING );
		if ( $actual_status && $actual_status !== $status && isset( $this->groups[ $actual_status ] ) ) {
			//$plugins = $this->groups[ $actual_status ];
			$status = $actual_status;
		}

		return $plugins;
	}

	/**
	 * Make a group tag.
	 *
	 * @param array $group   The Groups config structure.
	 * @param bool  $current If it's the current status.
	 *
	 * @return string
	 */
	protected function make_group_tag( $group, $current ) {
		$id      = $group['_id'];
		$total   = count( $group['config']['plugins'] );
		$url     = add_query_arg( 'plugin_status', $id, 'plugins.php' );
		$element = array(
			'open'      => array(
				'tag'  => 'a',
				'atts' => array(
					'href' => $url,
				),
			),
			$group['config']['group_name'],
			'count'     => array(
				'tag'  => 'span',
				'atts' => array(
					'class' => 'count',
				),
			),
			"({$total})",
			'end_count' => array(
				'tag'   => 'span',
				'atts'  => array(),
				'state' => 'close',
			),
			'close'     => array(
				'tag'   => 'a',
				'atts'  => array(),
				'state' => 'close',
			),
		);
		// Add current.
		if ( true === $current ) {
			$element['open']['atts']['class']        = 'current';
			$element['open']['atts']['aria-current'] = 'page';
		}

		return Plugin_Groups_Utils::build_tags_array( $element );
	}

	/**
	 * Add new filter view
	 *
	 * @return array|Views with added groups
	 */
	public function add_groups( $views ) {
		global $status, $plugins;
		//<a href='plugins.php?plugin_status=all' class="current" aria-current="page">
		$base_url = 'plugins.php';
		foreach ( $this->groups as $key => $group ) {
			$views[ $key ] = $this->make_group_tag( $this->config['groups'][ $key ], $status === $key );
		}

		return $views;
	}

	/**
	 * @param $groups
	 *
	 * @return mixed
	 */
	public function populate_group( $groups ) {
		global $plugins, $status;
		if ( isset( $this->groups[ $status ] ) ) {
			$plugins[ $status ] = $this->groups[ $status ];
		}

		//var_dump( $status );

		return $groups;
	}

	/**
	 * Register REST Endpoint for saving config.
	 */
	public function register_route() {
		register_rest_route(
			self::$slug,
			'save',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'args'                => array(),
				'callback'            => array( $this, 'save_config' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			)
		);
	}

	/**
	 * Save endpoint.
	 *
	 * @param \WP_REST_Request $request The request.
	 *
	 * @return \WP_Error|\WP_HTTP_Response|\WP_REST_Response
	 */
	public function save_config( \WP_REST_Request $request ) {
		$data    = $request->get_json_params();
		$success = update_option( self::CONFIG_KEY, $data );

		return rest_ensure_response( array( 'success' => $success ) );
	}

	/**
	 * Autoloader by Locating and finding classes via folder structure.
	 *
	 * @param string $class class name to be checked and autoloaded.
	 */

	function autoload_class( $class ) {

		$class_location = self::locate_class_file( $class );
		if ( $class_location ) {
			include_once $class_location;
		}
	}

	/**
	 * Locates the path to a requested class name.
	 *
	 * @param string $class The class name to locate.
	 *
	 * @return string|null
	 */
	static public function locate_class_file( $class ) {

		$return = null;
		$parts  = explode( '\\', strtolower( str_replace( '_', '-', $class ) ) );
		$core   = array_shift( $parts );
		$self   = strtolower( str_replace( '_', '-', __CLASS__ ) );
		if ( $core === $self ) {
			$name    = 'class-' . strtolower( array_pop( $parts ) ) . '.php';
			$parts[] = $name;
			$path    = PLGGRP_PATH . 'classes/' . implode( '/', $parts );
			if ( file_exists( $path ) ) {
				$return = $path;
			}
		}

		return $return;
	}

	/**
	 * Get the plugin version
	 */
	public function version() {
		return $this->version;
	}

	/**
	 * Check plugin_groups version to allow 3rd party implementations to update or upgrade.
	 */
	protected function check_version() {
		$previous_version = get_option( self::VERSION_KEY, 0.0 );
		$new_version      = $this->version();
		if ( version_compare( $previous_version, $new_version, '<' ) ) {
			if ( version_compare( $previous_version, '2.0.0', '<' ) ) {
				$data       = get_option( 'plugin_groups_plugin_groups', array() );
				$new_config = array(
					'activeGroup' => null,
					'groups'      => $data['group'],
				);
				update_option( self::CONFIG_KEY, $new_config );
			}
			// Allow for updating.
			do_action( "_plugin_groups_version_upgrade", $previous_version, $new_version );
			// Update version.
			update_option( self::VERSION_KEY, $new_version, true );
		}
	}

	/**
	 * Initialise plugin_groups.
	 */
	public function plugin_groups_init() {
		// Check version.
		$this->check_version();

		// Load config.
		$this->load_config();

		/**
		 * Init the settings system
		 *
		 * @param Plugin_Groups ${slug} The core object.
		 */
		do_action( 'plugin_groups_init' );
	}

	/**
	 * Hook into admin_init.
	 */
	public function admin_init() {
		if ( ! empty( $_POST['plugin-group-config'] ) ) {
			$data = stripslashes( $_POST['plugin-group-config'] );
			$data = json_decode( $data, true );
			update_option( Plugin_Groups::CONFIG_KEY, $data );
			wp_safe_redirect( admin_url( 'plugins.php?page=plugin-groups' ) );
		}
		$asset = include PLGGRP_PATH . 'js/' . self::$slug . '.asset.php';
		wp_register_script( self::$slug, PLGGRP_URL . 'js/' . self::$slug . '.js', $asset['dependencies'], $asset['version'], true );
		wp_register_style( self::$slug, PLGGRP_URL . 'css/' . self::$slug . '.css', array(), $asset['version'] );
	}

	/**
	 * Hook into the admin_menu.
	 */
	public function admin_menu() {
		add_submenu_page( 'plugins.php', __( 'Plugin Groups', 'plugin-groups' ), __( 'Plugin Groups', 'plugin-groups' ), 'manage_options', 'plugin-groups', array( $this, 'render' ), 50 );
	}

	/**
	 * Enqueue assets where needed.
	 */
	public function enqueue_assets() {
		$page = filter_input( INPUT_GET, 'page', FILTER_SANITIZE_STRING );
		if ( $page && self::$slug === $page ) {
			wp_enqueue_script( self::$slug );
			wp_enqueue_style( self::$slug );

			// Prep data.
			$data              = $this->config;
			$data['saveURL']   = rest_url( self::$slug . '/save' );
			$data['restNonce'] = wp_create_nonce( 'wp_rest' );

			// Add plugins.
			$data['plugins'] = get_plugins();

			// Add config data.
			wp_add_inline_script( self::$slug, 'var plgData = ' . wp_json_encode( $data ), 'before' );
		}
	}

	/**
	 * Load the UI config.
	 */
	protected function load_config() {
		$this->config               = get_option( self::CONFIG_KEY );
		$this->config['pluginName'] = $this->plugin_name;
		$this->config['version']    = $this->version;
		$this->config['slug']       = self::$slug;

		$plugins = get_plugins();
		foreach ( $this->config['groups'] as $group ) {
			foreach ( $group['config']['plugins'] as $plugin ) {
				$this->groups[ $group['_id'] ][ $plugin ] = $plugins[ $plugin ];
			}
		}
	}

	/**
	 * Render the admin page.
	 */
	public function render() {
		include PLGGRP_PATH . 'includes/main.php';
	}

	/**
	 * Get the instance of the class.
	 *
	 * @return Plugin_Groups
	 */
	public static function get_instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}
}
