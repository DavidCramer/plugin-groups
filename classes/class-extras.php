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

		$asset = include PLGGRP_PATH . 'js/install.asset.php';
		wp_enqueue_script( 'plugin-groups-install', PLGGRP_URL . 'js/install.js', $asset['dependencies'], $asset['version'], true );

		$data = array(
			'url'   => rest_url( Plugin_Groups::$slug . '/add' ),
			'nonce' => wp_create_nonce( 'wp_rest' ),
		);
		wp_add_inline_script( 'plugin-groups-install', 'var plgData = ' . wp_json_encode( $data ), 'before' );
	}

	/**
	 * Add our actions to the bulk actions.
	 *
	 * @param array $actions Current array of actions.
	 *
	 * @return array
	 */
	public function add_actions( $actions, $plugin ) {
		// @todo: Clean up to use the HMTL builder.
		$groups      = $this->plugin_groups->get_groups();
		$last        = array_pop( $actions );
		$newaction   = array();
		$newaction[] = '<select disabled=disabled data-plugin="' . $plugin['slug'] . '" style="width:120px;">';
		$newaction[] = '<option value="_select">';
		$newaction[] = __( 'Add to group', 'plugin-groups' );
		$newaction[] = '</option>';
		foreach ( $groups as $group ) {
			$newaction[] = '<option value="' . $group['id'] . '">';
			$newaction[] = $group['name'];
			$newaction[] = '</option>';
		}
		$newaction[] = '</select>';

		$actions[] = implode( $newaction );
		$actions[] = $last;

		return $actions;
	}
}
