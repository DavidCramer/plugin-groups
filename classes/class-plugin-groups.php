<?php
/**
 * Core class for Plugin Groups.
 *
 * @package plugin_groups
 */

namespace Plugin_Groups;

use WP_Admin_Bar;

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
	protected $config = [];

	/**
	 * Holds the Groups.
	 *
	 * @var array
	 */
	protected $groups = [];

	/**
	 * Holds the menu slug.
	 *
	 * @var string
	 */
	public static $slug = 'plugin-groups';

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
	 * Holds a list of missing plugins.
	 *
	 * @var array
	 */
	protected $missing = [];

	/**
	 * Holds the current group and status path.
	 *
	 * @var string
	 */
	protected $current_nav_path;

	/**
	 * Development mode flag.
	 *
	 * @since 3.0.0
	 * @var bool|string
	 */
	private bool|string $dev_mode = false;

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
		$plugin            = get_plugin_data( PLGGRP_CORE );
		$this->plugin_name = $plugin['Name'];
		$this->version     = $plugin['Version'];

		spl_autoload_register( [ $this, 'autoload_class' ], true, false );

		$this->dev_mode = defined( 'PLGGRP_DEV_MODE' ) ? PLGGRP_DEV_MODE : false;

		// Start hooks.
		$this->setup_hooks();

		// Init the bulk actions.
		new Bulk_Actions( $this );
		new Extras( $this );
		new Rest( $this );
	}

	/**
	 * Setup and register WordPress hooks.
	 */
	protected function setup_hooks() {

		// Load plugin text domain
		add_action( 'init', [ $this, 'plugin_groups_init' ], PHP_INT_MAX ); // Always the last thing to init.
		add_action( 'admin_init', [ $this, 'admin_init' ] );
		add_action( 'admin_menu', [ $this, 'admin_menu' ] );
		add_action( 'network_admin_menu', [ $this, 'admin_menu' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
		add_filter( 'views_plugins', [ $this, 'add_groups' ], PHP_INT_MAX );
		add_filter( 'views_plugins-network', [ $this, 'add_groups' ], PHP_INT_MAX );
		add_filter( 'all_plugins', [ $this, 'catch_selected_group' ] );
		add_filter( 'show_advanced_plugins', [ $this, 'filter_shown_status' ], 10, 2 );
		add_filter( 'site_transient_update_plugins', [ $this, 'alter_update_plugins' ] );
		add_action( 'pre_current_active_plugins', [ $this, 'render_group_navigation' ] );
		add_filter( 'bulk_actions-plugins', [ $this, 'bulk_actions' ] );
		add_action( 'admin_bar_menu', [ $this, 'admin_bar_item' ], 100 );
		add_filter( 'self_admin_url', [ $this, 'append_group_to_self' ], 10, 3 );
		add_filter( 'plugin_action_links', [ $this, 'append_group_to_actions' ] );
		add_action( 'activated_plugin', [ $this, 'auto_assign_by_keywords' ], 10, 0 );
		add_action( 'upgrader_process_complete', [ $this, 'after_plugin_upgrade' ], 10, 2 );
	}

	/**
	 * Append the current group id to plugin action links to maintain selection on activation and deactivation of plugins.
	 *
	 * @param array $actions Array of action links.
	 *
	 * @return array
	 */
	public function append_group_to_actions( $actions ) {

		if ( isset( $this->current_group ) ) {
			foreach ( $actions as &$tag ) {
				$parts = shortcode_parse_atts( $tag );
				if ( isset( $parts['href'] ) ) {
					$url = html_entity_decode( $parts['href'] );
					$url = add_query_arg( self::$slug, $this->current_group, $url );

					$tag = str_replace( $parts['href'], htmlentities( $url ), $tag );
				}
			}
		}

		return $actions;
	}

	/**
	 * Append the group to redirect URLS after activation and deactivation of plugins.
	 *
	 * @param string $url  The url to append to.
	 * @param string $path The path location.
	 *
	 * @return string
	 */
	public function append_group_to_self( $url, $path ) {

		if ( 'plugins.php' === wp_parse_url( $path, PHP_URL_PATH ) ) {
			if ( ! isset( $this->current_group ) ) {
				// Init the current group if not set yet.
				$this->catch_selected_group();
			}
			// If we found a group, then append it to the self URL on the plugins page to maintain groups in nav.
			if ( isset( $this->current_group ) ) {
				$url = add_query_arg( self::$slug, $this->current_group, $url );
			}
		}

		return $url;
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

		static $removes = [
			'mustuse',
			'dropins',
		];
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
			$parts   = [];
			$parts[] = $this->make_all_tag();
			foreach ( $this->groups as $key => $plugins ) {
				$parts[] = $this->make_group_tag( $key );
			}

			$groups    = implode( "", $parts );
			$group_set = Utils::build_tag( 'ul', [ 'class' => [ $this->config['params']['navStyle'] ] ], $groups );
			$html      = Utils::build_tag( 'div', [ 'class' => self::$slug ], $group_set );
			if ( 1 < count( $parts ) ) {
				echo wp_kses( $html, wp_kses_allowed_html( 'post' ) );
				$this->render_group_bulk_actions();
			}
		}
	}

	/**
	 * Add dropdown navigation on bulk actions.
	 *
	 * @param array $actions Unchanged actions.
	 *
	 * @return array
	 */
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

		$html   = [];
		$html[] = '<label for="bulk-action-selector-groups" class="screen-reader-text">' . __( 'All groups', self::$slug ) . '</label>';
		$html[] = '<select id="bulk-action-selector-groups" onChange="window.location = this.value">';
		$html[] = '<option value="' . esc_url( $this->get_nav_url() ) . '" ' . ( ! empty( $this->current_group ) ? 'selected="selected"' : '' ) . '>' . __( 'All groups', self::$slug ) . '</option>';

		foreach ( $this->groups as $key => $plugins ) {
			$group    = $this->config['groups'][ $key ];
			$selected = '';
			if ( $this->current_group === $key ) {
				$selected = ' selected="selected"';
			}

			$html[] = "\t" . '<option value="' . esc_url( $this->get_nav_url( $key ) ) . '"' . $selected . '>' . esc_html( $group['name'] ) . ' (' . count( $plugins ) . ')</option>' . "\n";
		}

		$html[] = "</select>\n";
		$html   = implode( $html );
		if ( false === $echo ) {
			return $html;
		}
		echo wp_kses(
			$html,
			[
				'label'  => [
					'for'   => true,
					'class' => true,
				],
				'select' => [
					'id'       => true,
					'onchange' => true,
				],
				'option' => [
					'value'    => true,
					'selected' => true,
				],
			]
		);
		$this->render_group_bulk_actions();
	}

	/**
	 * Render bulk activate/deactivate/update controls for the currently selected group.
	 */
	protected function render_group_bulk_actions() {

		if ( empty( $this->config['params']['groupBulkActions'] ) || true === $this->config['params']['legacyGrouping'] || empty( $this->current_group ) || empty( $this->groups[ $this->current_group ] ) ) {
			return;
		}

		$plugin_files = array_keys( $this->groups[ $this->current_group ] );
		$controls     = [];
		$button_class = $this->config['params']['navStyle'] === 'groups-dropdown' ? 'action' : 'button-small';

		if ( current_user_can( 'activate_plugins' ) ) {
			$inactive = array_filter(
				$plugin_files,
				function ( $plugin ) {

					return ! is_plugin_active( $plugin );
				}
			);
			if ( ! empty( $inactive ) ) {
				$controls[] = $this->build_bulk_action_form( 'activate-selected', $inactive, __( 'Activate All', self::$slug ) );
			}
		}

		if ( current_user_can( 'deactivate_plugins' ) ) {
			$active = array_filter( $plugin_files, 'is_plugin_active' );
			if ( ! empty( $active ) ) {
				$controls[] = $this->build_bulk_action_form( 'deactivate-selected', $active, __( 'Deactivate All', self::$slug ) );
			}
		}

		if ( current_user_can( 'update_plugins' ) ) {
			$updates   = get_site_transient( 'update_plugins' );
			$updatable = ! empty( $updates->response ) ? array_intersect( $plugin_files, array_keys( $updates->response ) ) : [];
			if ( ! empty( $updatable ) ) {
				$url = wp_nonce_url(
					self_admin_url( 'update.php?action=update-selected&plugins=' . rawurlencode( implode( ',', $updatable ) ) ),
					'bulk-update-plugins'
				);

				$controls[] = Utils::build_tag(
					'a',
					[
						'href'  => $url,
						'class' => 'button button-secondary '. $button_class,
					],
					esc_html__( 'Update All', self::$slug )
				);
			}
		}

		if ( empty( $controls ) ) {
			return;
		}

		echo wp_kses(
			Utils::build_tag( 'div', [ 'class' => 'group-bulk-actions' ], implode( ' ', $controls ) ),
			array_merge(
				wp_kses_allowed_html( 'post' ),
				[
					'form'   => [
						'method' => true,
						'action' => true,
						'style'  => true,
					],
					'input'  => [
						'type'  => true,
						'name'  => true,
						'value' => true,
					],
					'button' => [
						'type'  => true,
						'class' => true,
					],
				]
			)
		);
	}

	/**
	 * Build a small inline POST form for a plugins.php bulk action (activate/deactivate-selected).
	 *
	 * @param string $action       The plugins.php bulk action slug.
	 * @param array  $plugin_files The plugin files to act on.
	 * @param string $label        The button label.
	 *
	 * @return string
	 */
	protected function build_bulk_action_form( $action, array $plugin_files, $label ) {

		$inputs = '';
		$button_class = $this->config['params']['navStyle'] === 'groups-dropdown' ? 'action' : 'button-small';
		foreach ( $plugin_files as $plugin_file ) {
			$inputs .= Utils::build_tag(
				'input',
				[
					'type'  => 'hidden',
					'name'  => 'checked[]',
					'value' => $plugin_file,
				]
			);
		}
		$inputs .= wp_nonce_field( 'bulk-plugins', '_wpnonce', true, false );
		$inputs .= Utils::build_tag(
			'input',
			[
				'type'  => 'hidden',
				'name'  => 'action',
				'value' => $action,
			]
		);
		$inputs .= Utils::build_tag( 'button', [ 'type' => 'submit', 'class' => 'button button-secondary '. $button_class ], esc_html( $label ) );

		return Utils::build_tag(
			'form',
			[
				'method' => 'post',
				'action' => self_admin_url( 'plugins.php' ),
				'style'  => 'display:inline-block;',
			],
			$inputs
		);
	}

	/**
	 * Catch the selected group.
	 *
	 * @param array $plugins List of plugins.
	 *
	 * @return array
	 */
	public function catch_selected_group( $plugins = [] ) {

		global $status;

		$this->current_status = $status;
		$selected_group       = Utils::get_sanitized_text( INPUT_GET, self::$slug );
		if ( $selected_group && isset( $this->groups[ $selected_group ] ) ) {
			$this->current_group = $selected_group;
			if ( ! empty( $plugins ) ) {
				$plugins = $this->groups[ $selected_group ];

				// Add selection path.
				$this->current_nav_path .= ' | ' . $this->config['groups'][ $selected_group ]['name'];
			}
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

		$url = Utils::get_sanitized_text( INPUT_SERVER, 'REQUEST_URI' );
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
			[
				'plugin_status' => $this->current_status,
				self::$slug     => $id,

			],
			$url
		);
	}

	/**
	 * Get the current group.
	 *
	 * @return array|null
	 */
	public function get_current_group() {

		if ( ! isset( $this->current_group ) ) {
			$this->catch_selected_group();
		}

		return $this->current_group ? $this->config['groups'][ $this->current_group ] : null;
	}

	/**
	 * Get the groups.
	 *
	 * @return array
	 */
	public function get_groups() {

		return array_values( $this->config['groups'] );
	}

	/**
	 * Make a group tag.
	 *
	 * @param string $id The Group ID.
	 *
	 * @return string
	 */
	protected function make_group_tag( $id ) {

		$group   = $this->config['groups'][ $id ];
		$total   = count( $this->groups[ $id ] );
		$counter = '';

		if ( ! empty( $total ) ) {

			$counter = Utils::build_tag( 'span', [ 'class' => 'count' ], " ({$total})" );
		}
		$li_atts   = [
			'class' => [
				'group-link',
				$group['id'],
			],
		];
		$link_atts = [
			'href' => $this->get_nav_url( $id ),
		];
		if ( $group['id'] === $this->current_group ) {
			$li_atts['class'][]        = 'current';
			$link_atts['class']        = 'current';
			$link_atts['aria-current'] = 'page';
		}

		$color_dot = '';
		if ( ! empty( $group['color'] ) ) {
			$color_dot = Utils::build_tag(
				'span',
				[
					'class' => 'group-color-dot',
					'style' => 'background-color: ' . $group['color'],
				],
				''
			);
		}

		$link = Utils::build_tag( 'a', $link_atts, $color_dot . $group['name'] . $counter );

		return Utils::build_tag( 'li', $li_atts, $link );
	}

	/**
	 * Load presets into groups for built-in and filtered presets.
	 *
	 * @return array
	 */
	protected function load_presets() {

		$groups = [
			'WooCommerce'            => [ 'WooCommerce' ],
			'Easy Digital Downloads' => [ 'Easy Digital Downloads' ],
			'Ninja Forms'            => [ 'Ninja Forms' ],
			'Gravity Forms'          => [ 'Gravity Forms' ],
			'WPForms'                => [ 'WPForms' ],
			'E-Commerce'             => [
				'WooCommerce',
				'Easy Digital Downloads',
			],
			'Forms'                  => [
				'Ninja Forms',
				'Gravity Forms',
				'WPForms',
				'Formidable Forms',
			],
			'SEO'                    => [
				'All in One SEO',
				'Yoast SEO',
			],
			'Security'               => [
				'Wordfence',
				'Sucuri',
				'iThemes Security',
			],
			'Caching'                => [
				'WP Rocket',
				'W3 Total Cache',
				'WP Super Cache',
				'WP Fastest Cache',
			],
			'Backups'                => [
				'UpdraftPlus',
				'BackWPup',
				'Duplicator',
			],
			'Page Builders'          => [
				'Elementor',
				'Beaver Builder',
				'Divi Builder',
			],
			'Email/SMTP'             => [
				'WP Mail SMTP',
				'FluentSMTP',
				'Post SMTP',
			],
		];

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
		 *
		 * @param $groups {array}   The preset groups.
		 *
		 * @return  array
		 * @since   2.0.0
		 *
		 */
		$presets       = apply_filters( 'get_preset_plugin_groups', $groups );
		$preset_groups = [];
		foreach ( $presets as $name => $keywords ) {
			$id                   = sanitize_title( $name );
			$preset_groups[ $id ] = [
				'id'       => $id,
				'name'     => $name,
				'plugins'  => [],
				'keywords' => $keywords,
			];
		}

		return [
			'preset_groups' => $preset_groups,
			'presets'       => array_keys( $groups ),
		];
	}

	/**
	 * Make all link tag.
	 *
	 * @return string
	 */
	protected function make_all_tag() {

		$link_atts = [
			'href' => $this->get_nav_url(),
		];
		if ( empty( $this->current_group ) ) {
			$link_atts['class']        = 'current';
			$link_atts['aria-current'] = 'page';
		}
		$link = Utils::build_tag( 'a', $link_atts, __( 'All Groups', self::$slug ) );

		return Utils::build_tag( 'li', [ 'class' => [ 'group-link', '__allgroups' ] ], $link );
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
					$names = explode( ' ', wp_kses( $tag, [] ) );
					array_pop( $names );
					$this->current_nav_path .= ' | ' . implode( ' ', $names );
				}
			}
		}

		// Legacy.
		if ( true === $this->config['params']['legacyGrouping'] ) {
			foreach ( $this->groups as $key => $plugins ) {
				$views[ $key ] = $this->make_group_tag( $key );
			}
		}

		// @todo: Make method.
		if ( ! empty( $this->current_nav_path ) ) {
			$append = [
				'name' => $this->current_nav_path,
			];
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
	 * Save the current config.
	 *
	 * @param null|int $site_id The site ID to save for.
	 *
	 * @return bool
	 */
	public function save_config( $site_id = null ) {

		if ( is_multisite() ) {
			if ( null === $site_id ) {
				$site_id = get_current_blog_id();
			}
			$success = update_network_option( $site_id, self::CONFIG_KEY, $this->config );
		} else {
			$success = update_option( self::CONFIG_KEY, $this->config );
		}

		return $success;
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
		if ( $core === self::$slug ) {
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
				$data = get_option( 'plugin_groups_plugin_groups', [] );
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

		$groups = [];
		foreach ( $data['group'] as $group ) {
			$keywords                = explode( "\n", $group['config']['keywords'] );
			$new_group               = [
				'id'       => $group['_id'],
				'name'     => $group['config']['group_name'],
				'plugins'  => isset( $group['config']['plugins'] ) ? $group['config']['plugins'] : [],
				'keywords' => array_filter( $keywords ),
			];
			$groups[ $group['_id'] ] = $new_group;
		}

		// Set up the new config.
		$config                             = $this->get_default_config();
		$config['groups']                   = $groups;
		$config['selectedPresets']          = isset( $data['presets'] ) ? $data['presets'] : [];
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
		$config = $this->load_config();
		$this->set_config( $config );

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

		$manifest_path = PLGGRP_PATH . 'build/manifest.json';
		if ( ! file_exists( $manifest_path ) ) {
			wp_die(
				__( 'The Plugin Groups build is missing. Please run the build process.', 'plugin-groups' )
			);
		}
		$manifest = json_decode( file_get_contents( $manifest_path ), true );
		if ( ! isset( $manifest['src/main.tsx'] ) ) {
			wp_die(
				__( 'The Plugin Groups build is invalid. Please run the build process again.', 'plugin-groups' )
			);
		}
		$js_path = PLGGRP_URL . 'build/' . $manifest['src/main.tsx']['file'];
		wp_register_script( self::$slug, $js_path, [], PLGGRP_VERSION, ['in_footer' => true] );

		if ( ! empty( $manifest['src/main.tsx']['css'] ) ) {
			$css_path = PLGGRP_URL . 'build/' . $manifest['src/main.tsx']['css'][0] ?? '';
			wp_register_style( self::$slug, $css_path, [], PLGGRP_VERSION );
		}
		wp_register_style( self::$slug . '-navbar', PLGGRP_URL . 'static/' . self::$slug . '-navbar.css', [], PLGGRP_VERSION );
	}

	/**
	 * Hook into the admin_menu.
	 */
	public function admin_menu() {

		if ( ! $this->network_active() || $this->site_enabled() || is_network_admin() ) {
			add_submenu_page( 'plugins.php', __( 'Plugin Groups', self::$slug ), __( 'Plugin Groups', self::$slug ), 'manage_options', 'plugin-groups', [
				$this,
				'render_admin',
			], 50 );
		}
	}

	/**
	 * Check if the plugin is network activated.
	 *
	 * @return bool
	 */
	protected function network_active() {

		return is_plugin_active_for_network( PLGGRP_SLUG );
	}

	/**
	 * Check to see if the site is allowed to use this.
	 *
	 * @return bool
	 */
	protected function site_enabled() {

		$site_id     = get_current_blog_id();
		$main_config = get_network_option( get_main_site_id(), self::CONFIG_KEY, $this->get_default_config() );

		return in_array( $site_id, $main_config['sitesEnabled'], true );
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

		$groups = [
			'parent' => [
				'id'    => self::$slug,
				'title' => $this->plugin_name,
				'href'  => $this->get_nav_url( 'dashboard' ),
				'meta'  => [
					'title' => $this->plugin_name,
				],
			],
		];

		foreach ( $this->groups as $key => $plugins ) {
			$group          = $this->config['groups'][ $key ];
			$groups[ $key ] = [
				'id'     => $key,
				'parent' => self::$slug,
				'title'  => $group['name'] . ' (' . count( $plugins ) . ')',
				'href'   => $this->get_nav_url( $key ),
			];
		}

		foreach ( $groups as $option ) {
			$admin_bar->add_menu( $option );
		}
	}

	/**
	 * Enqueue assets where needed.
	 */
	public function enqueue_assets() {

		$page = Utils::get_sanitized_text( INPUT_GET, 'page' );
		if ( $page && self::$slug === $page ) {

			// In development mode, load from Vite dev server.
			if ( $this->dev_mode && file_exists( PLGGRP_PATH . '/dev/dev-server-asset.php' ) ) {
				require_once PLGGRP_PATH . '/dev/dev-server-asset.php';
			} else {
				wp_enqueue_script( self::$slug );
				wp_enqueue_style( self::$slug );
				wp_set_script_translations( self::$slug, self::$slug );
			}
		}
	}

	/**
	 * Build the json config object.
	 *
	 * @param int|null $site_id The site to get config for, ir null for current.
	 *
	 * @return string|false
	 */
	public function build_config_object( $site_id = null ) {

		if ( null === $site_id ) {
			$data = $this->config;
		} else {
			$data = $this->load_config( $site_id );
		}

		// Prep config data.
		$data['saveURL']   = rest_url( self::$slug . '/save' );
		$data['legacyURL'] = add_query_arg( 'reactivate-legacy', true, $this->get_nav_url( 'dashboard' ) );
		$data['restNonce'] = wp_create_nonce( 'wp_rest' );
		// Multisite.
		if ( $this->network_active() && ( is_network_admin() || defined( 'REST_REQUEST' ) && true === REST_REQUEST ) ) {
			$data['loadURL']  = rest_url( self::$slug . '/load' );
			$data['sites']    = get_sites();
			$data['mainSite'] = get_main_site_id();
		}

		// Add plugins.
		$data['plugins'] = get_plugins();

		// Remove presets from groups for admin.
		$data['groups'] = array_diff_key( $data['groups'], $data['preset_groups'] );

		// Remove ungrouped.
		unset( $data['groups']['__ungrouped'] );

		return wp_json_encode( $data );
	}

	/**
	 * Get the default config.
	 *
	 * @return array
	 */
	protected function get_default_config() {

		return [
			'groups'          => [],
			'selectedPresets' => [],
			'params'          => [
				'legacyGrouping'   => false,
				'navStyle'         => 'subsubsub',
				'menuGroups'       => false,
				'groupBulkActions' => false,
			],

			'sitesEnabled' => [], // Used for multisite.
		];
	}

	/**
	 * Load the UI config.
	 *
	 * @param int|null $site_id The site ID to load. Null for current site.
	 *
	 * @return array;
	 */
	public function load_config( $site_id = null ) {

		// Load the config.
		if ( is_multisite() ) {
			if ( ! $site_id ) {
				$site_id = get_current_blog_id();
			}
			$config           = get_network_option( $site_id, self::CONFIG_KEY, $this->get_default_config() );
			$config['siteID'] = (int) $site_id;
		} else {
			$config = get_option( self::CONFIG_KEY, $this->get_default_config() );
		}
		$config['pluginName'] = $this->plugin_name;
		$config['version']    = $this->version;
		$config['slug']       = self::$slug;

		// Flag if network admin vs main site.
		if ( is_network_admin() && is_main_site() ) {
			$config['networkAdmin'] = true;
		}

		// Load the presets. Use array_merge (not +=) so freshly computed presets
		// always win over a stale 'presets'/'preset_groups' pair persisted into
		// the option by a previous save (set_config()/save_config() store the
		// whole $this->config array, presets included).
		$config = array_merge( $config, $this->load_presets() );

		return $config;
	}

	/**
	 * Set the config.
	 *
	 * @param array    $config  The config to set.
	 * @param int|null $site_id The site ID to load. Null for current site.
	 */
	public function set_config( $config, $site_id = null ) {

		$this->config = $config;
		if ( ! empty( $this->config['params']['showUngrouped'] ) ) {
			$ungrouped = $this->create_ungrouped();
			if ( ! empty( $ungrouped['plugins'] ) ) {
				$this->config['groups']['__ungrouped'] = $ungrouped;
			}
		}
		// Populate groups with plugins.
		array_map( [ $this, 'populate_plugins' ], $this->config['groups'] );
		// register selected presets.
		if ( ! empty( $this->config['selectedPresets'] ) ) {
			array_map( [ $this, 'register_preset' ], $this->config['selectedPresets'] );
		}
	}

	/**
	 * Create the Ungrouped, group.
	 *
	 * @return array
	 */
	protected function create_ungrouped() {
		$plugins   = array_keys( get_plugins() );
		$new_group = [
			'id'      => '__ungrouped',
			'name'    => __( 'Ungrouped', self::$slug ),
			'plugins' => [],
		];
		$grouped   = [];
		foreach ( $this->config['groups'] as $group ) {
			$grouped = array_merge( $grouped, $group['plugins'] );
		}
		$grouped              = array_unique( $grouped );
		$new_group['plugins'] = array_diff( $plugins, $grouped );

		return $new_group;
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
			if ( ! isset( $plugins[ $plugin ] ) ) {
				$this->missing[ $plugin ] = [
					'Version' => '0.0',
				];
				continue;
			}
			$this->groups[ $group['id'] ][ $plugin ] = $plugins[ $plugin ];
		}
		// Populate keywords now to keep ordering.
		$this->populate_keywords( $group['id'] );
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
		$matches = $this->match_plugins_by_keywords( $this->config['groups'][ $id ]['keywords'], get_plugins() );
		foreach ( $matches as $plugin_key => $plugin_data ) {
			if ( ! isset( $this->groups[ $id ][ $plugin_key ] ) ) {
				$this->groups[ $id ][ $plugin_key ] = $plugin_data;
			}
		}
	}

	/**
	 * Match plugins against a list of keywords, substring-matched (case-insensitive)
	 * against each plugin's concatenated header metadata.
	 *
	 * @param array $keywords The keywords to match.
	 * @param array $plugins  Plugin file => plugin data map, as returned by get_plugins().
	 *
	 * @return array Plugin file => plugin data map of matched plugins.
	 */
	protected function match_plugins_by_keywords( array $keywords, array $plugins ) {

		$keywords = array_map( 'strtolower', $keywords );
		$matches  = [];
		foreach ( $plugins as $plugin_key => $plugin_data ) {
			$plugin_string = strtolower( implode( ' ', $plugin_data ) );
			$matched       = array_filter(
				$keywords,
				function ( $keyword ) use ( $plugin_string ) {

					return false !== strpos( $plugin_string, $keyword );
				}
			);
			if ( ! empty( $matched ) ) {
				$matches[ $plugin_key ] = $plugin_data;
			}
		}

		return $matches;
	}

	/**
	 * Persist keyword-matched plugins into a group's (or all groups') saved plugin list.
	 *
	 * Unlike populate_keywords(), which only affects the runtime nav/count state, this
	 * writes matches into $this->config['groups'][$id]['plugins'] and saves the config.
	 *
	 * @param string|null $group_id Optional group ID to limit to; null runs for every group with keywords.
	 *
	 * @return bool True if any group was updated and saved.
	 */
	public function auto_assign_by_keywords( $group_id = null ) {

		$plugins   = get_plugins();
		$group_ids = null !== $group_id ? [ $group_id ] : array_keys( $this->config['groups'] );

		$claimed = [];
		foreach ( $this->config['groups'] as $group ) {
			$claimed = array_merge( $claimed, $group['plugins'] );
		}

		$updated = false;
		foreach ( $group_ids as $id ) {
			if ( ! isset( $this->config['groups'][ $id ] ) || empty( $this->config['groups'][ $id ]['keywords'] ) ) {
				continue;
			}
			$matches     = $this->match_plugins_by_keywords( $this->config['groups'][ $id ]['keywords'], $plugins );
			$new_plugins = array_diff( array_keys( $matches ), $claimed );
			if ( empty( $new_plugins ) ) {
				continue;
			}
			$this->config['groups'][ $id ]['plugins'] = array_values(
				array_unique( array_merge( $this->config['groups'][ $id ]['plugins'], $new_plugins ) )
			);
			$claimed = array_merge( $claimed, $new_plugins );
			$updated = true;
		}

		if ( $updated ) {
			$this->save_config();
		}

		return $updated;
	}

	/**
	 * Re-run keyword auto-assignment for all groups after a plugin is installed or updated.
	 *
	 * @param \WP_Upgrader $upgrader   The upgrader instance (unused).
	 * @param array        $hook_extra Extra data describing the upgrade action.
	 */
	public function after_plugin_upgrade( $upgrader, $hook_extra ) {

		if ( ! isset( $hook_extra['type'] ) || 'plugin' !== $hook_extra['type'] ) {
			return;
		}
		$this->auto_assign_by_keywords();
	}

	/**
	 * Create a new Group.
	 *
	 * @param string $name         The group name to create.
	 * @param array  $plugin_slugs Plugin slug or list of slugs to add to the group.
	 *
	 * @return string|bool
	 */
	public function create_group( $name, array $plugin_slugs = [] ) {

		$success                           = false;
		$new_id                            = Utils::generate_id();
		$group                             = [
			'id'       => $new_id,
			'color'    => '',
			'keywords' => [],
			'name'     => trim( $name ),
			'open'     => false,
			'plugins'  => $plugin_slugs,
		];
		$this->config['groups'][ $new_id ] = $group;
		if ( $this->save_config() ) {
			$success = $new_id;
		}

		return $success;
	}

	/**
	 * Add plugins to a group.
	 *
	 * @param string $group_id     The group ID to add plugin to.
	 * @param array  $plugin_slugs Plugin slug or list of slugs to add to the group.
	 *
	 * @return bool
	 */
	public function add_to_group( $group_id, array $plugin_slugs ) {

		$success = false;
		if ( isset( $this->config['groups'][ $group_id ] ) ) {
			$new_plugins                                    = array_merge( $this->config['groups'][ $group_id ]['plugins'], $plugin_slugs );
			$this->config['groups'][ $group_id ]['plugins'] = array_unique( $new_plugins );
			$success                                        = $this->save_config();
		}

		return $success;
	}

	/**
	 * Remove Plugins from a group.
	 *
	 * @param string $group_id     The group ID to add plugin to.
	 * @param array  $plugin_slugs Plugin slug or list of slugs to add to the group.
	 *
	 * @return bool
	 */
	public function remove_from_group( $group_id, array $plugin_slugs ) {

		$success = false;
		if ( isset( $this->config['groups'][ $group_id ] ) ) {
			$this->config['groups'][ $group_id ]['plugins'] = array_diff( $this->config['groups'][ $group_id ]['plugins'], $plugin_slugs );
			$success                                        = $this->save_config();
		}

		return $success;
	}

	/**
	 * Render the admin page.
	 */
	public function render_admin() {
		$bootstrap = array(
			'loadURL'   => rest_url( self::$slug . '/load' ),
			'restNonce' => wp_create_nonce( 'wp_rest' ),
			'siteID'    => get_current_blog_id(),
		);

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
