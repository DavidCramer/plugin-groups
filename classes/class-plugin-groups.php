<?php
/**
 * Core class for Plugin Groups.
 *
 * @package plugin_groups
 */

use Plugin_Groups\Utils;

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
	 * Holds the current group.
	 *
	 * @var string
	 */
	protected $current_group;

	/**
	 * Holds the current status.
	 *
	 * @var string
	 */
	protected $current_status;

	/**
	 * Holds the current group and status path.
	 *
	 * @var string
	 */
	protected $current_nav_path;

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
		add_filter( 'views_plugins', array( $this, 'add_groups' ), PHP_INT_MAX );
		add_filter( 'all_plugins', array( $this, 'filter_status' ) );
		add_action( 'pre_current_active_plugins', array( $this, 'render_group_navigation' ) );
	}

	/**
	 * Render the Group navigation.
	 */
	public function render_group_navigation() {
		$parts   = array();
		$parts[] = $this->make_all_tag();
		foreach ( $this->config['groups'] as $key => $group ) {
			if ( isset( $this->groups[ $key ] ) ) {
				$parts[] = $this->make_group_tag( $group );
			}
		}
		$groups    = implode( " |\n", $parts );
		$group_set = Utils::build_tag( 'ul', array( 'class' => 'subsubsub' ), $groups );
		$html      = Utils::build_tag( 'div', array( 'class' => self::$slug ), $group_set );
		if ( 1 < count( $parts ) ) {
			echo wp_kses( $html, wp_kses_allowed_html( 'post' ) );
		}
	}

	public function filter_status( $plugins ) {
		global $status;

		$this->current_status = $status;
		$selected_group       = filter_input( INPUT_GET, self::$slug, FILTER_SANITIZE_STRING );
		if ( $selected_group && isset( $this->groups[ $selected_group ] ) ) {
			$this->current_group = $selected_group;
			$plugins             = $this->groups[ $selected_group ];

			// Add selection path.
			$this->current_nav_path .= ' | ' . $this->config['groups'][ $selected_group ]['name'];
		}

		// Add our styles.
		wp_enqueue_style( self::$slug );

		return $plugins;
	}

	/**
	 * Make a group tag.
	 *
	 * @param array $group The Groups config structure.
	 *
	 * @return string
	 */
	protected function make_group_tag( $group ) {

		$id      = $group['id'];
		$total   = count( $this->groups[ $id ] );
		$url     = add_query_arg( 'page', self::$slug, 'plugins.php' );
		$counter = '';

		if ( ! empty( $total ) ) {
			$url     = add_query_arg(
				array(
					'plugin_status' => $this->current_status,
					self::$slug     => $id,

				),
				'plugins.php'
			);
			$counter = Utils::build_tag( 'span', array( 'class' => 'count' ), " ({$total})" );
		}
		$link_atts = array(
			'href' => $url,
		);
		if ( $group['id'] === $this->current_group ) {
			$link_atts['class']        = 'current';
			$link_atts['aria-current'] = 'page';
		}
		$link = Utils::build_tag( 'a', $link_atts, $group['name'] . $counter );

		return Utils::build_tag( 'li', array( 'class' => $group['id'] ), $link );
	}

	/**
	 * Make all link tag.
	 *
	 * @return string
	 */
	protected function make_all_tag() {
		$current_url = filter_input( INPUT_SERVER, 'REQUEST_URI', FILTER_SANITIZE_URL );
		$url         = self_admin_url( 'plugins.php' );
		if ( $current_url ) {
			$url = $current_url;
		}
		$url       = remove_query_arg( self::$slug, $url );
		$link_atts = array(
			'href' => $url,
		);
		if ( empty( $this->current_group ) ) {
			$link_atts['class']        = 'current';
			$link_atts['aria-current'] = 'page';
		}
		$link = Utils::build_tag( 'a', $link_atts, __( 'All Groups', self::$slug ) );

		return Utils::build_tag( 'li', array( 'class' => '__allgroups' ), $link );
	}

	/**
	 * Add new filter view
	 *
	 * @return array|Views with added groups
	 */
	public function add_groups( $views ) {

		foreach ( $views as &$tag ) {
			if ( preg_match( '/<a([^>]*?)>{1}/', $tag, $found ) ) {
				$atts = Utils::get_tag_attributes( $found[1] );
				$url  = add_query_arg( self::$slug, $this->current_group, $atts['href'] );
				$tag  = str_replace( $atts['href'], $url, $tag );
				wp_parse_str( wp_parse_url( $atts['href'], PHP_URL_QUERY ), $query );
				if ( isset( $query['plugin_status'] ) && $query['plugin_status'] === $this->current_status ) {
					$names = explode( ' ', wp_kses( $tag, array() ) );
					array_pop( $names );
					$this->current_nav_path .= ' | ' . implode( ' ', $names );
				}
			}
		}
		// @todo: Make method.
		if ( ! empty( $this->current_nav_path ) ) {
			$append = array(
				'name' => $this->current_nav_path,
			);
			wp_add_inline_script(
				'wp-util',
				'var appendHead = ' . wp_json_encode(
					$append
				) . '; var pluginsHead = document.getElementsByClassName(\'wp-heading-inline\' );if( pluginsHead.length ) {pluginsHead[0].innerText += appendHead.name}'
			);
		}

		return $views;
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
		$data                   = $request->get_json_params();
		$this->config['groups'] = $data;
		$success                = update_option( self::CONFIG_KEY, $this->config );

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
				$new_config = $this->convert_legacy_groups( $data );
				update_option( self::CONFIG_KEY, $new_config );
			}
			// Allow for updating.
			do_action( "_plugin_groups_version_upgrade", $previous_version, $new_version );
			// Update version.
			update_option( self::VERSION_KEY, $new_version, true );
		}
	}

	/**
	 * Convert legacy configs.
	 *
	 * @param array $data Array of previous version config.
	 *
	 * @return array
	 */
	protected function convert_legacy_groups( $data ) {
		$groups = array();
		foreach ( $data['group'] as $group ) {
			$keywords                = explode( "\n", $group['config']['keywords'] );
			$new_group               = array(
				'id'       => $group['_id'],
				'name'     => $group['config']['group_name'],
				'plugins'  => isset( $group['config']['plugins'] ) ? $group['config']['plugins'] : array(),
				'keywords' => array_filter( $keywords ),
			);
			$groups[ $group['_id'] ] = $new_group;
		}

		return array(
			'groups'  => $groups,
			'presets' => $data['presets'],
		);
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
		add_submenu_page( 'plugins.php', __( 'Plugin Groups', self::$slug ), __( 'Plugin Groups', self::$slug ), 'manage_options', 'plugin-groups', array( $this, 'render_admin' ), 50 );
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

			// Remove groups if empty so that the script can init the correct object.
			if ( empty( $data['groups'] ) ) {
				unset( $data['groups'] );
			}
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

		if ( ! empty( $this->config['groups'] ) ) {
			foreach ( $this->config['groups'] as $group ) {
				foreach ( $group['plugins'] as $plugin ) {
					if ( isset( $plugins[ $plugin ] ) ) {
						$this->groups[ $group['id'] ][ $plugin ] = $plugins[ $plugin ];
					}
				}
				if ( empty( $group['keywords'] ) ) {
					continue;
				}
				// @todo: move to own method.
				foreach ( $plugins as $plugin_key => $plugin_data ) {
					if ( isset( $this->groups[ $group['id'] ][ $plugin_key ] ) ) {
						continue;
					}
					foreach ( $group['keywords'] as $keyword ) {
						foreach ( $plugin_data as $details ) {
							if ( false !== strpos( strtolower( $details ), strtolower( $keyword ) ) ) {
								$this->groups[ $group['id'] ][ $plugin_key ] = $plugin_data;
								break;
							}
						}
					}
				}
			}
		}
	}

	/**
	 * Render the admin page.
	 */
	public function render_admin() {
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
