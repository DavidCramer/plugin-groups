<?php
/**
 * Extra Actions for Plugin Groups.
 *
 * @package plugin_groups
 */

namespace Plugin_Groups;

/**
 * Plugin_Groups Class.
 */
class Extras {

	/**
	 * The single instance of the class.
	 *
	 * @var Plugin_Groups
	 */
	protected $plugin_groups;

	/**
	 * Initiate the bulk_actions object.
	 *
	 * @param Plugin_Groups $plugin_groups The instance of the main plugin.
	 */
	public function __construct( Plugin_Groups $plugin_groups ) {

		$this->plugin_groups = $plugin_groups;
		// Start hooks.
		$this->setup_hooks();
	}

	/**
	 * Setup and register WordPress hooks.
	 */
	protected function setup_hooks() {

		add_action( 'load-plugin-install.php', array( $this, 'enqueue_script' ) );
		add_filter( 'plugin_install_action_links', array( $this, 'add_actions' ), 10, 2 );
	}

	/**
	 * Enqueue our scripts and data for the bulk actions JS.
	 */
	public function enqueue_script() {



		$manifest_path = PLGGRP_PATH . 'static/manifest.json';
		if ( ! file_exists( $manifest_path ) ) {
			return;
		}
		$manifest = json_decode( file_get_contents( $manifest_path ), true );//phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
		if ( ! isset( $manifest['src/extras.js'] ) ) {
			return;
		}
		$js_path = PLGGRP_URL . 'static/' . $manifest['src/extras.js']['file'];
		wp_enqueue_script( 'plugin-groups-extras', $js_path, [], PLGGRP_VERSION, true );

		// Enqueued in class-extras-actions.php, but we need to add our data here.
		$data = array(
			'url'   => rest_url( Plugin_Groups::$slug . '/add' ),
			'nonce' => wp_create_nonce( 'wp_rest' ),
		);
		wp_add_inline_script( 'plugin-groups-extras', 'var plgData = ' . wp_json_encode( $data ), 'before' );
	}

	/**
	 * Add our actions to the bulk actions.
	 *
	 * @param array $actions Current array of actions.
	 *
	 * @return array
	 */
	public function add_actions( $actions, $plugin ) {

		$groups      = $this->plugin_groups->get_groups();
		if( empty( $groups ) ) {
			return $actions;
		}
		$install_status = install_plugin_install_status( $plugin );
		$disabled       = ( $install_status['status'] === 'install' ) ? 'disabled=disabled' : '';
		$plugin_path    = $install_status['file'] ?? $plugin['slug'];

		$last        = array_pop( $actions );
		$newaction   = array();
		$newaction[] = '<select class="plugin-groups-selector" '.$disabled.' data-plugin="'.esc_attr( $plugin_path ).'" data-slug="' . esc_attr( $plugin['slug'] ) . '" style="width:120px;">';
		$newaction[] = '<option value="_select">';
		$newaction[] = __( 'Add to group', 'plugin-groups' );
		$newaction[] = '</option>';
		foreach ( $groups as $group ) {
			$newaction[] = '<option value="' . esc_attr( $group['id'] ) . '">';
			$newaction[] = esc_html( $group['name'] );
			$newaction[] = '</option>';
		}
		$newaction[] = '</select>';

		$newaction[] = '<div data-plugin="' . esc_attr( $plugin['slug'] ) . '" class="plugin-groups-notice" style="display:none;color: #fff;margin-top: 12px;padding: 6px;border-radius: 4px;text-align: center;box-shadow: 0 3px 2px rgba(0,0,0,0.1);"></div>';



		$actions[] = implode( $newaction );
		$actions[] = $last;

		return $actions;
	}
}
