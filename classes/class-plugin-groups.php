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
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
		add_filter( 'views_plugins', array( $this, 'add_groups' ), PHP_INT_MAX );
		add_filter( 'views_plugins-network', array( $this, 'add_groups' ) );
		add_filter( 'all_plugins', array( $this, 'catch_selected_group' ) );
		add_filter( 'show_advanced_plugins', array( $this, 'filter_shown_status' ), 10, 2 );
		add_filter( 'site_transient_update_plugins', array( $this, 'alter_update_plugins' ) );
		add_action( 'pre_current_active_plugins', array( $this, 'render_group_navigation' ) );
		add_filter( 'bulk_actions-plugins', array( $this, 'bulk_actions' ) );
		add_action( 'admin_bar_menu', array( $this, 'admin_bar_item' ), 100 );
	}

	/**
	 * Remove plugins from the update available.
	 *
	 * @param object $data The data object.
	 *
	 * @return object
	 */
	public function alter_update_plugins( $data ) {

		if ( $this->current_group ) {
			$keys = array_keys( $this->groups[ $this->current_group ] );
			foreach ( $data->response as $key => $plugin ) {
				if ( ! in_array( $key, $keys, true ) ) {
					unset( $data->response[ $key ] );
				}
			}
		}

		return $data;
	}

	/**
	 * Remove status that are not relevant.
	 *
	 * @param bool   $show   Flag to show.
	 * @param string $status The current status
	 *
	 * @return bool
	 */
	public function filter_shown_status( $show, $status ) {

		global $plugins;

		static $removes = array(
			'mustuse',
			'dropins',
		);
		if ( $this->current_group && in_array( $status, $removes, true ) ) {
			$show = false;
		}
		if ( true === $this->config['params']['legacyGrouping'] ) {
			$plugins += $this->groups;
		}

		return $show;
	}

	/**
	 * Render the Group navigation.
	 */
	public function render_group_navigation() {

		// Use new group system.
		if ( true !== $this->config['params']['legacyGrouping'] && 'groups-dropdown' !== $this->config['params']['navStyle'] ) {
			$parts   = array();
			$parts[] = $this->make_all_tag();
			foreach ( $this->groups as $key => $plugins ) {
				$parts[] = $this->make_group_tag( $key );
			}

			$groups    = implode( "", $parts );
			$group_set = Utils::build_tag( 'ul', array( 'class' => array( $this->config['params']['navStyle'] ) ), $groups );
			$html      = Utils::build_tag( 'div', array( 'class' => self::$slug ), $group_set );
			if ( 1 < count( $parts ) ) {
				echo wp_kses( $html, wp_kses_allowed_html( 'post' ) );
			}
		}
	}

	public function bulk_actions( $actions ) {

		if ( true !== $this->config['params']['legacyGrouping'] && 'groups-dropdown' === $this->config['params']['navStyle'] ) {
			$this->dropdown_navigation();
		}

		return $actions;
	}

	/**
	 * Render a dropdown navigation.
	 *
	 * @param bool $echo Optional flag to echo the field or return the string.
	 *
	 * @return void|string
	 */
	public function dropdown_navigation( $echo = true ) {

		$html   = array();
		$html[] = '<label for="bulk-action-selector-groups" class="screen-reader-text">' . __( 'All groups', self::$slug ) . '</label>';
		$html[] = '<select id="bulk-action-selector-groups" onChange="window.location = this.value">';
		$html[] = '<option value="' . esc_url( $this->get_nav_url() ) . '" ' . ( ! empty( $this->current_group ) ? 'selected="selected"' : '' ) . '>' . __( 'All groups', self::$slug ) . '</option>';

		foreach ( $this->groups as $key => $plugins ) {
			$group = $this->config['groups'][ $key ];
			$selected = '';
			if ( $this->current_group === $key ) {
				$selected = ' selected="selected"';
			}

			$html[] = "\t" . '<option value="' . esc_url( $this->get_nav_url( $key ) ) . '"' . $selected . '>' . $group['name'] . ' (' . count( $plugins ) . ')</option>' . "\n";
		}

		$html[] = "</select>\n";
		$html   = implode( $html );
		if ( false === $echo ) {
			return $html;
		}
		echo $html;
	}

	/**
	 * Catch the selected group.
	 *
	 * @param array $plugins List of plugins.
	 *
	 * @return array
	 */
	public function catch_selected_group( $plugins ) {

		global $status;

		$this->current_status = $status;
		$selected_group       = filter_input( INPUT_GET, self::$slug, FILTER_SANITIZE_STRING );
		if ( $selected_group && isset( $this->groups[ $selected_group ] ) ) {
			$this->current_group = $selected_group;
			$plugins             = $this->groups[ $selected_group ];

			// Add selection path.
			$this->current_nav_path .= ' | ' . $this->config['groups'][ $selected_group ]['name'];
		}

		// Add our styles if we have groups;
		if ( ! empty( $this->groups ) ) {
			wp_enqueue_style( self::$slug . '-navbar' );
		}

		return $plugins;
	}

	/**
	 * Get a url link for group navigation.
	 *
	 * @param null|string $id The group ID or null for all.
	 *
	 * @return string
	 */
	protected function get_nav_url( $id = null ) {

		$url = filter_input( INPUT_SERVER, 'REQUEST_URI', FILTER_SANITIZE_URL );
		if ( ! $url || false === strpos( 'plugins.php', $url ) ) {
			// Just in case.
			$url = self_admin_url( 'plugins.php' );
		}
		if ( null === $id ) {
			// Null id is for the 'All groups'.
			return remove_query_arg( self::$slug, $url );
		}

		// If no plugins get a link back to admin.
		if ( empty( $this->groups[ $id ] ) ) {
			return add_query_arg( 'page', self::$slug, $url );
		}

		return add_query_arg(
			array(
				'plugin_status' => $this->current_status,
				self::$slug     => $id,

			),
			$url
		);
	}

	/**
	 * Make a group tag.
	 *
	 * @param string $id The Group ID.
	 *
	 * @return string
	 */
	protected function make_group_tag( $id ) {

		$group   = $this->config['groups'][ $id ] ? $this->config['groups'][ $id ] : $this->make_preset( $id );
		$total   = count( $this->groups[ $id ] );
		$counter = '';

		if ( ! empty( $total ) ) {

			$counter = Utils::build_tag( 'span', array( 'class' => 'count' ), " ({$total})" );
		}
		$li_atts   = array(
			'class' => array(
				'group-link',
				$group['id'],
			),
		);
		$link_atts = array(
			'href' => $this->get_nav_url( $id ),
		);
		if ( $group['id'] === $this->current_group ) {
			$li_atts['class'][]        = 'current';
			$link_atts['class']        = 'current';
			$link_atts['aria-current'] = 'page';
		}

		$link = Utils::build_tag( 'a', $link_atts, $group['name'] . $counter );

		return Utils::build_tag( 'li', $li_atts, $link );
	}

	/**
	 *
	 * @param string $id The group ID to make a preset for.
	 */
	public function make_preset( $id ) {

		var_dump( $id );
		$group = array(
			'id'   => $id,
			'name' => $this->config['preset'],
		);
	}

	/**
	 * Load presets into groups for built-in and filtered presets.
	 *
	 * @return array
	 */
	protected function load_presets() {

		$groups = array(
			'WooCommerce'            => array( 'WooCommerce' ),
			'Easy Digital Downloads' => array( 'Easy Digital Downloads' ),
			'Ninja Forms'            => array( 'Ninja Forms' ),
			'Gravity Forms'          => array( 'Gravity Forms' ),
			'WPForms'                => array( 'WPForms' ),
			'E-Commerce'             => array(
				'WooCommerce',
				'Easy Digital Downloads',
			),
			'Forms'                  => array(
				'Ninja Forms',
				'Gravity Forms',
				'WPForms',
				'Formidable Forms',
			),
			'SEO'                    => array(
				'All in One SEO',
				'Yoast SEO',
			),
			// @todo: Add more categories for presets.
		);

		/**
		 * Filter the presets (legacy)
		 *
		 * @deprecated 2.0.0
		 */
		$groups = apply_filters( 'plugin-groups-get-presets', $groups );

		/**
		 * Filter preset plugin groups.
		 *
		 * @hook    get_preset_plugin_groups
		 * @since   2.0.0
		 *
		 * @param $groups {array}   The preset groups.
		 *
		 * @return  array
		 */
		$presets                       = apply_filters( 'get_preset_plugin_groups', $groups );
		$this->config['preset_groups'] = array();
		foreach ( $presets as $name => $keywords ) {
			$id                                   = sanitize_title( $name );
			$this->config['preset_groups'][ $id ] = array(
				'id'       => $id,
				'name'     => $name,
				'plugins'  => array(),
				'keywords' => $keywords,
			);
		}

		return array_keys( $groups );
	}

	/**
	 * Make all link tag.
	 *
	 * @return string
	 */
	protected function make_all_tag() {

		$link_atts = array(
			'href' => $this->get_nav_url(),
		);
		if ( empty( $this->current_group ) ) {
			$link_atts['class']        = 'current';
			$link_atts['aria-current'] = 'page';
		}
		$link = Utils::build_tag( 'a', $link_atts, __( 'All Groups', self::$slug ) );

		return Utils::build_tag( 'li', array( 'class' => array( 'group-link', '__allgroups' ) ), $link );
	}

	/**
	 * Add new filter view
	 *
	 * @param array $views The list of nav tags for plugin statuses.
	 *
	 * @return array
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

		// Legacy.
		if ( true === $this->config['params']['legacyGrouping'] ) {
			foreach ( $this->groups as $key => $plugins ) {
				if ( isset( $views[ $key ] ) ) {
					$views[ $key ] = $this->make_group_tag( $key );
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
	public function register_routes() {

		register_rest_route(
			self::$slug,
			'save',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'args'                => array(),
				'callback'            => array( $this, 'save_config' ),
				'permission_callback' => function() {

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

		$data                            = $request->get_json_params();
		$this->config['groups']          = $data['groups'];
		$this->config['selectedPresets'] = $data['selectedPresets'];
		$this->config['params']          = $data['params'];
		$success                         = update_option( self::CONFIG_KEY, $this->config );

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
				$data = get_option( 'plugin_groups_plugin_groups', array() );
				if ( ! empty( $data ) ) {
					$new_config = $this->convert_legacy_groups( $data );
					update_option( self::CONFIG_KEY, $new_config );
				}
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

		// Set up the new config.
		$config                             = $this->get_default_config();
		$config['groups']                   = $groups;
		$config['selectedPresets']          = $data['presets'];
		$config['params']['legacyGrouping'] = true;
		$config['params']['navStyle']       = 'subsubsub';

		return $config;
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
		wp_register_style( self::$slug . '-navbar', PLGGRP_URL . 'css/' . self::$slug . '-navbar.css', array(), $asset['version'] );
	}

	/**
	 * Hook into the admin_menu.
	 */
	public function admin_menu() {

		add_submenu_page( 'plugins.php', __( 'Plugin Groups', self::$slug ), __( 'Plugin Groups', self::$slug ), 'manage_options', 'plugin-groups', array( $this, 'render_admin' ), 50 );
	}

	/**
	 * Add Groups to the admin bar.
	 *
	 * @param WP_Admin_Bar $admin_bar
	 */
	public function admin_bar_item( $admin_bar ) {

		if ( ! $this->config['params']['menuGroups'] || ! current_user_can( 'activate_plugins' ) ) {
			return;
		}

		$groups = array(
			'parent' => array(
				'id'    => self::$slug,
				'title' => $this->plugin_name,
				'href'  => $this->get_nav_url( 'dashboard' ),
				'meta'  => array(
					'title' => $this->plugin_name,
				),
			),
		);

		foreach ( $this->groups as $key => $plugins ) {
			$group          = $this->config['groups'][ $key ];
			$groups[ $key ] = array(
				'id'     => $key,
				'parent' => self::$slug,
				'title'  => $group['name'] . ' (' . count( $plugins ) . ')',
				'href'   => $this->get_nav_url( $key ),
			);
		}

		foreach ( $groups as $option ) {
			$admin_bar->add_menu( $option );
		}
	}

	/**
	 * Enqueue assets where needed.
	 */
	public function enqueue_assets() {

		$page = filter_input( INPUT_GET, 'page', FILTER_SANITIZE_STRING );
		if ( $page && self::$slug === $page ) {
			wp_enqueue_script( self::$slug );
			wp_enqueue_style( self::$slug );

			$this->prep_config();
		}
	}

	/**
	 * Prepare the config data for output to the admin UI.
	 */
	protected function prep_config() {

		// Prep config data.
		$data              = $this->config;
		$data['saveURL']   = rest_url( self::$slug . '/save' );
		$data['exportURL'] = add_query_arg( 'nonce', wp_create_nonce( 'group_export' ), rest_url( self::$slug . '/export' ) );
		$data['restNonce'] = wp_create_nonce( 'wp_rest' );

		// Add plugins.
		$data['plugins'] = get_plugins();

		// Remove presets from groups for admin.
		$data['groups'] = array_diff_key( $data['groups'], $this->config['preset_groups'] );

		// Remove empty groups to allow JS to init them.
		if ( empty( $data['groups'] ) ) {
			unset( $data['groups'] );
		}

		// Add config data.
		wp_add_inline_script( self::$slug, 'var plgData = ' . wp_json_encode( $data ), 'before' );
	}

	/**
	 * Get the default config.
	 *
	 * @return array
	 */
	protected function get_default_config() {

		return array(
			'groups'          => array(),
			'selectedPresets' => array(),
			'params'          => array(
				'legacyGrouping' => false,
				'navStyle'       => 'subsubsub',
				'menuGroups'     => false,
			),
		);
	}

	/**
	 * Load the UI config.
	 */
	protected function load_config() {

		// Load the config.
		$this->config               = get_option( self::CONFIG_KEY, $this->get_default_config() );
		$this->config['pluginName'] = $this->plugin_name;
		$this->config['version']    = $this->version;
		$this->config['slug']       = self::$slug;

		// Load the presets.
		$this->config['presets'] = $this->load_presets();

		// Populate groups with plugins.
		array_map( array( $this, 'populate_plugins' ), $this->config['groups'] );
		// register selected presets.
		if ( ! empty( $this->config['selectedPresets'] ) ) {
			array_map( array( $this, 'register_preset' ), $this->config['selectedPresets'] );
		}

		// Populate groups with keywords.
		array_map( array( $this, 'populate_keywords' ), array_keys( $this->config['groups'] ) );
	}

	/**
	 * Register a preset.
	 *
	 * @param string $preset The preset name to register.
	 */
	protected function register_preset( $preset ) {

		$key = sanitize_title( $preset );
		if ( isset( $this->config['preset_groups'][ $key ] ) ) {
			$this->config['groups'][ $key ] = $this->config['preset_groups'][ $key ];
		}
	}

	/**
	 * Populate a group with selected plugins.
	 *
	 * @param array $group The group array.
	 */
	protected function populate_plugins( $group ) {

		static $plugins;
		if ( ! $plugins ) {
			$plugins = get_plugins();
		}
		foreach ( $group['plugins'] as $plugin ) {
			if ( isset( $plugins[ $plugin ] ) ) {
				$this->groups[ $group['id'] ][ $plugin ] = $plugins[ $plugin ];
			}
		}
	}

	/**
	 * Populate a group from keywords.
	 *
	 * @param string $id The group ID.
	 */
	protected function populate_keywords( $id ) {

		if ( ! isset( $this->config['groups'][ $id ] ) || empty( $this->config['groups'][ $id ]['keywords'] ) ) {
			return;
		}
		$keywords = array_map( 'strtolower', $this->config['groups'][ $id ]['keywords'] );
		$plugins  = get_plugins();
		foreach ( $plugins as $plugin_key => $plugin_data ) {
			if ( isset( $this->groups[ $id ][ $plugin_key ] ) ) {
				continue;
			}
			$plugin_string = strtolower( implode( ' ', $plugin_data ) );
			$matched       = array_filter(
				$keywords,
				function( $keyword ) use ( $plugin_string ) {

					return false !== strpos( $plugin_string, $keyword );
				}
			);
			if ( ! empty( $matched ) ) {
				$this->groups[ $id ][ $plugin_key ] = $plugin_data;
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
