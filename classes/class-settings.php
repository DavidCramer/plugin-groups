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
 *
 * @package Plugin_Groups
 * @author  David Cramer <david@digilab.co.za>
 */
class Plugin_Groups_Settings extends Plugin_Groups {


	/**
	 * Constructor for class
	 *
	 * @since 0.0.1
	 */
	public function __construct() {

		if ( is_multisite() ) {
			$this->multisite = 'network_';
		}

		// add admin page
		add_action( "{$this->multisite}admin_menu", array(
			$this,
			'add_settings_pages',
		), 25 );
		// save config
		add_action( 'wp_ajax_plorg_save_config', array(
			$this,
			'save_config',
		) );
		// get plugins filters
		add_filter( 'all_plugins', array( $this, 'prepare_filter_addons' ) );
		add_filter( 'views_plugins', array(
			$this,
			'filter_addons_filter_addons',
		) );
		add_filter( 'views_plugins-network', array(
			$this,
			'filter_addons_filter_addons',
		) );
		add_filter( 'show_advanced_plugins', array(
			$this,
			'filter_addons_do_filter_addons',
		) );
		add_action( 'after_plugin_row', array(
			$this,
			'filter_addons_prepare_filter_addons_referer',
		), 10, 2 );
		add_action( 'check_admin_referer', array(
			$this,
			'filter_addons_prepare_filter_addons_referer',
		), 10, 2 );

		// presets
		add_filter( 'plugin-groups-get-presets', array(
			$this,
			'get_preset_groups',
		) );

		// exporter
		add_action( 'init', array( $this, 'check_exporter' ) );

		// add to bulk actions.
		add_filter( 'bulk_actions-plugins', array( $this, 'bulk_actions' ) );
		// action handler.
		add_filter( 'handle_bulk_actions-plugins', array(
			$this,
			'bulk_action_handler',
		), 10, 3 );

		// add options.
		add_filter( 'disabled-screen_options_show_submit', array(
			$this,
			'screen_options',
		), 10, 2 );

	}

	/**
	 * Checks if is a group status.
	 *
	 * @since 0.0.1
	 */
	public function screen_options( $opt, $screen ) {
		if ( 'plugins' === $screen->id ) {
			echo '<fieldset class="metabox-prefs plugin-groups">';
			echo '<legend>' . __( 'Preset Groups' ) . '</legend>';
			// Presets / Intergrations
			$presetGroups = apply_filters( 'plugin-groups-get-presets', array() );
			foreach ( $presetGroups as $group => $group_keys ) {
				echo '<label for="list-preset-group">';
				echo '<input id="list-view-mode" type="checkbox" name="group_preset[]" value="' . esc_attr__( $group ) . '" />';
				echo esc_html( $group );
				echo '</label>';
			}
			echo '</fieldset>';
		}

		return false;
	}

	/**
	 * Checks if is a group status.
	 *
	 * @since 0.0.1
	 */
	public function is_group( $status ) {
		$plugin_groups = Plugin_Groups_Options::get_single( 'plugin_groups' );
		$return        = false;
		if ( ! empty( $plugin_groups['presets'] ) ) {
			foreach ( $plugin_groups['presets'] as $preset_key => $preset ) {
				$key = '_' . sanitize_key( $preset );
				if ( $status === $key ) {
					$return = true;
				}
			}
		}
		if ( ! empty( $plugin_groups['group'] ) ) {
			foreach ( $plugin_groups['group'] as $group_key => $group ) {
				$key = '_' . sanitize_key( $group['config']['group_name'] );
				if ( $status === $key ) {
					$return = true;
				}
			}
		}

		return $return;
	}

	/**
	 * Add to bulk actions.
	 *
	 * @since 0.0.1
	 */
	public function bulk_actions( $actions ) {

		$plugin_groups  = Plugin_Groups_Options::get_single( 'plugin_groups' );
		$current_status = filter_input( INPUT_GET, 'plugin_status', FILTER_SANITIZE_STRING );
		if ( $this->is_group( $current_status ) ) {
			$actions['_remove_group'] = __( 'Remove Group' );
		}
		$actions['_add_to_new_group'] = __( 'New Group' );
		if ( ! empty( $plugin_groups['group'] ) ) {
			foreach ( $plugin_groups['group'] as $key => $group ) {
				$actions[ $key ] = __( 'Add to ' ) . $group['config']['group_name'];
			}
		}
		return $actions;
	}

	/**
	 * Handle bulk action.
	 *
	 * @since 0.0.1
	 */
	public function bulk_action_handler( $sendback, $action, $plugins ) {


		$plugin_groups = Plugin_Groups_Options::get_single( 'plugin_groups' );
		if ( ! empty( $plugin_groups['group'][ $action ] ) ) {

			foreach ( $plugins as $plugin ) {
				if ( ! in_array( $plugin, $plugin_groups['group'][ $action ]['config']['plugins'], true ) ) {
					$plugin_groups['group'][ $action ]['config']['plugins'][] = $plugin;
				}
			}
			Plugin_Groups_Options::update( $plugin_groups );
			$key      = '_' . sanitize_key( $plugin_groups['group'][ $action ]['config']['group_name'] );
			$sendback = admin_url( 'plugins.php?plugin_status=' . $key );

		}
		if ( '_add_to_new_group' === $action ) {

			$group_id                            = uniqid( 'nd' );
			$new_name                            = filter_input( INPUT_POST, 'new_group', FILTER_SANITIZE_STRING );
			$plugin_groups['group'][ $group_id ] = array(
				'_id'         => $group_id,
				'_node_point' => 'group.' . $group_id,
				'config'      => array(
					'group_name' => $new_name,
					'plugins'    => $plugins,
					'keywords'   => '',
				),
			);
			$key                                 = '_' . sanitize_key( $new_name );
			$sendback                            = admin_url( 'plugins.php?plugin_status=' . $key );
			Plugin_Groups_Options::update( $plugin_groups );
		}
		if ( '_remove_group' === $action ) {
			$to_remove = filter_input( INPUT_POST, 'plugin_status', FILTER_SANITIZE_STRING );
			// presets.
			if ( ! empty( $plugin_groups['presets'] ) ) {
				foreach ( $plugin_groups['presets'] as $preset_key => $preset ) {
					$key = '_' . sanitize_key( $preset );
					if ( $to_remove === $key ) {
						unset( $plugin_groups['presets'][ $preset_key ] );
					}
				}
			}

			foreach ( $plugin_groups['group'] as $group_key => $group ) {
				$key = '_' . sanitize_key( $group['config']['group_name'] );
				if ( $to_remove === $key ) {
					unset( $plugin_groups['group'][ $group_key ] );
				}
			}
			$sendback = admin_url( 'plugins.php' );
			Plugin_Groups_Options::update( $plugin_groups );
		}

		return $sendback;
	}

	/**
	 * builds an export
	 *
	 * @uses  "wp_ajax_plorg_check_exporter" hook
	 * @since 0.0.1
	 */
	public function check_exporter() {

		if ( current_user_can( 'manage_options' ) ) {

			if ( ! empty( $_REQUEST['download'] ) && ! empty( $_REQUEST['plugin-groups-export'] ) && wp_verify_nonce( $_REQUEST['plugin-groups-export'], 'plugin-groups' ) ) {

				$data = Plugin_Groups_Options::get_single( $_REQUEST['download'] );

				header( 'Content-Type: application/json' );
				header( 'Content-Disposition: attachment; filename="plugin-groups-export.json"' );
				echo wp_json_encode( $data );
				exit;

			}

		}
	}

	/**
	 * Sets the status back to the group on action ( activate etc.)
	 *
	 * @since 0.0.1
	 */
	public function filter_addons_prepare_filter_addons_referer( $a, $b ) {
		global $status;
		if ( ! function_exists( 'get_current_screen' ) ) {
			return;
		}

		// work on plugins list
		$plugin_groups = Plugin_Groups_Options::get_single( 'plugin_groups' );
		if ( ! empty( $plugin_groups['presets'] ) ) {
			$presets = $this->apply_preset_groups( $plugin_groups['presets'] );
		}
		if ( ! empty( $presets ) ) {
			if ( empty( $plugin_groups['group'] ) ) {
				$plugin_groups['group'] = array();
			}
			$plugin_groups['group'] = array_merge( $plugin_groups['group'], $presets );
		}
		$screen = get_current_screen();
		if ( is_object( $screen ) && $screen->base === 'plugins' && isset( $_REQUEST['plugin_status'] ) && ! empty( $plugin_groups['group'] ) ) {
			foreach ( $plugin_groups['group'] as $group ) {
				$key = '_' . sanitize_key( $group['config']['group_name'] );
				if ( $_REQUEST['plugin_status'] === $key ) {
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
	public function filter_addons_do_filter_addons( $a ) {
		global $plugins, $status;

		// work on plugins list
		$plugin_groups = Plugin_Groups_Options::get_single( 'plugin_groups' );
		if ( ! empty( $plugin_groups['presets'] ) ) {
			$presets = $this->apply_preset_groups( $plugin_groups['presets'] );
		}
		if ( ! empty( $presets ) ) {
			if ( empty( $plugin_groups['group'] ) ) {
				$plugin_groups['group'] = array();
			}
			$plugin_groups['group'] = array_merge( $plugin_groups['group'], $presets );
		}
		if ( ! empty( $plugin_groups['group'] ) && is_array( $plugins ) ) {
			foreach ( $plugins['all'] as $plugin_slug => $plugin_data ) {
				foreach ( $plugin_groups['group'] as $group ) {
					$key = '_' . sanitize_key( $group['config']['group_name'] );
					if ( ! isset( $plugins[ $key ] ) ) {
						$plugins[ $key ] = array();
					}
					if ( ! empty( $group['config']['plugins'] ) && in_array( $plugin_slug, $group['config']['plugins'], true ) ) {
						$plugins[ $key ][ $plugin_slug ]           = $plugin_data;
						$plugins[ $key ][ $plugin_slug ]['plugin'] = $plugin_slug;
						// is a remove group?
						if ( ! empty( $group['config']['remove_base'] ) ) {
							foreach ( $group['config']['plugins'] as $plugin ) {
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
					// do keyword.
					if ( ! empty( $group['config']['auto_keyword'] ) && ! empty( $group['config']['keywords'] ) ) {
						$keywords = explode( "\n", $group['config']['keywords'] );
						foreach ( $keywords as $keyword ) {
							$keyword = strtolower( trim( $keyword ) );
							if ( false !== strpos( strtolower( $plugin_data['Name'] ), $keyword ) || false !== strpos( strtolower( $plugin_data['Description'] ), $keyword ) ) {
								$plugins[ $key ][ $plugin_slug ]           = $plugin_data;
								$plugins[ $key ][ $plugin_slug ]['plugin'] = $plugin_slug;
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
	public function filter_addons_filter_addons( $views ) {
		global $status, $plugins;

		// work on plugins list
		$plugin_groups = Plugin_Groups_Options::get_single( 'plugin_groups' );
		if ( ! empty( $plugin_groups['presets'] ) ) {
			$presets = $this->apply_preset_groups( $plugin_groups['presets'] );
		}
		if ( ! empty( $presets ) ) {
			if ( empty( $plugin_groups['group'] ) ) {
				$plugin_groups['group'] = array();
			}
			$plugin_groups['group'] = array_merge( $plugin_groups['group'], $presets );
		}
		if ( ! empty( $plugin_groups['group'] ) ) {
			foreach ( $plugin_groups['group'] as $group ) {

				$key = '_' . sanitize_key( $group['config']['group_name'] );
				if ( empty( $plugins[ $key ] ) ) {
					$views[ $key ] = $group['config']['group_name'] . ' <span class="count">(0)</span>';
					continue;
				}
				$count = 0;
				foreach ( $plugins[ $key ] as $plugin_data ) {

					if ( file_exists( WP_PLUGIN_DIR . '/' . $plugin_data['plugin'] ) ) {
						$count ++;
					}

				}

				$class = "";
				if ( $status == $key ) {
					$class = 'current';
				}
				$views[ $key ] = '<a class="' . $class . '" href="plugins.php?plugin_status=' . $key . '">' . $group['config']['group_name'] . ' <span class="count">(' . $count . ')</span></a>';

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
	public function prepare_filter_addons( $plugins ) {
		global $wp_list_table, $status;

		// work on plugins list
		$plugin_groups = Plugin_Groups_Options::get_single( 'plugin_groups' );
		if ( ! empty( $plugin_groups['presets'] ) ) {
			$presets = $this->apply_preset_groups( $plugin_groups['presets'] );
		}
		if ( ! empty( $presets ) ) {
			if ( empty( $plugin_groups['group'] ) ) {
				$plugin_groups['group'] = array();
			}
			$plugin_groups['group'] = array_merge( $plugin_groups['group'], $presets );
		}
		if ( isset( $_REQUEST['plugin_status'] ) && ! empty( $plugin_groups['group'] ) ) {
			foreach ( $plugin_groups['group'] as $group ) {
				$key = '_' . sanitize_key( $group['config']['group_name'] );
				if ( $_REQUEST['plugin_status'] === $key ) {
					$status = $key;
					break;
				}
			}
		}

		return $plugins;
	}

	/**
	 * built in presets keywords
	 *
	 * @since 0.0.1
	 * @return array with preset groups
	 */
	public function get_preset_groups( $groups ) {

		$baseGroups = array(
			'WooCommerce'            => array( 'WooCommerce' ),
			'Easy Digital Downloads' => array( 'Easy Digital Downloads' ),
			'Ninja Forms'            => array( 'Ninja Forms' ),
			'Gravity Forms'          => array( 'Gravity Forms' ),
			'CalderaWP'              => array( 'Caldera' ),
		);

		$baseGroups = array_merge( $groups, $baseGroups );

		return $baseGroups;
	}

	/**
	 * get presets keywords
	 *
	 * @since 0.0.1
	 * @return array with preset groups
	 */
	public function apply_preset_groups( $presets ) {

		$presetGroups = apply_filters( 'plugin-groups-get-presets', array() );
		$groups       = array();
		foreach ( $presets as $preset_key => $preset ) {
			if ( empty( $presetGroups[ $preset ] ) ) {
				continue;
			}
			$group_id            = sanitize_key( $preset );
			$groups[ $group_id ] = array(
				'config' => array(
					'group_name'   => $preset,
					'auto_keyword' => true,
					'keywords'     => implode( "/n", (array) $presetGroups[ $preset ] ),
				),
			);
		}

		return $groups;
	}

	/**
	 * Saves a config
	 *
	 * @uses  "wp_ajax_plorg_save_config" hook
	 * @since 0.0.1
	 */
	public function save_config() {

		if ( empty( $_POST['plugin-groups-setup'] ) || ! wp_verify_nonce( $_POST['plugin-groups-setup'], 'plugin-groups' ) ) {
			if ( empty( $_POST['config'] ) ) {
				return;
			}
		}

		if ( ! empty( $_POST['plugin-groups-setup'] ) && empty( $_POST['config'] ) ) {
			$config = stripslashes_deep( $_POST['config'] );

			Plugin_Groups_Options::update( $config );


			wp_redirect( '?page=plugin_groups&updated=true' );
			exit;
		}

		if ( ! empty( $_POST['config'] ) ) {

			$config = json_decode( stripslashes_deep( $_POST['config'] ), true );

			if ( wp_verify_nonce( $config['plugin-groups-setup'], 'plugin-groups' ) ) {
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
	 * @return array
	 */
	public function internal_config_fields() {
		return array( '_wp_http_referer', 'id', '_current_tab' );
	}


	/**
	 * Deletes an item
	 *
	 * @uses  'wp_ajax_plorg_create_plugin_groups' action
	 * @since 0.0.1
	 */
	public function delete_plugin_groups() {

		$deleted = Plugin_Groups_Options::delete( strip_tags( $_POST['block'] ) );

		if ( $deleted ) {
			wp_send_json_success( $_POST );
		} else {
			wp_send_json_error( $_POST );
		}


	}

	/**
	 * Create a new item
	 *
	 * @uses  "wp_ajax_plorg_create_plugin_groups"  action
	 * @since 0.0.1
	 */
	public function create_new_plugin_groups() {
		$new = Plugin_Groups_Options::create( $_POST['name'], $_POST['slug'] );

		if ( is_array( $new ) ) {
			wp_send_json_success( $new );
		} else {
			wp_send_json_error( $_POST );
		}

	}


	/**
	 * Add options page
	 *
	 * @since 0.0.1
	 * @uses  "admin_menu" hook
	 */
	public function add_settings_pages() {
		// This page will be under "Settings"

		$this->plugin_screen_hook_suffix['plugin_groups'] = add_submenu_page( 'plugins.php', __( 'Plugin Groups', $this->plugin_slug ), __( 'Groups', $this->plugin_slug ), $this->capability, 'plugin_groups', array(
			$this,
			'create_admin_page',
		) );
		add_action( 'admin_print_styles-' . $this->plugin_screen_hook_suffix['plugin_groups'], array(
			$this,
			'enqueue_admin_stylescripts',
		) );

	}

	/**
	 * Options page callback
	 *
	 * @since 0.0.1
	 */
	public function create_admin_page() {
		// Set class property
		$screen = get_current_screen();
		$base   = array_search( $screen->id, $this->plugin_screen_hook_suffix );

		// include main template
		include PLORG_PATH . 'includes/edit.php';

		// php based script include
		if ( file_exists( PLORG_PATH . 'assets/js/inline-scripts.php' ) ) {
			echo "<script type=\"text/javascript\">\r\n";
			include PLORG_PATH . 'assets/js/inline-scripts.php';
			echo "</script>\r\n";
		}

	}


}

if ( is_admin() ) {
	global $settings_plugin_groups;
	$settings_plugin_groups = new Plugin_Groups_Settings();
}
