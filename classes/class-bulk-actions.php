<?php
/**
 * Bulk Actions class for Plugin Groups.
 *
 * @package plugin_groups
 */

namespace Plugin_Groups;

/**
 * Plugin_Groups Class.
 */
class Bulk_Actions {

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

		add_filter( 'bulk_actions-plugins', array( $this, 'add_actions' ) );
		add_filter( 'handle_bulk_actions-plugins', array( $this, 'handle_bulk_action' ), 10, 3 );
	}

	/**
	 * Enqueue our scripts and data for the bulk actions JS.
	 */
	protected function enqueue_script() {

		$asset = include PLGGRP_PATH . 'js/bulk-handler.asset.php';
		wp_enqueue_script( 'plugin-groups-bulk', PLGGRP_URL . 'js/bulk-handler.js', $asset['dependencies'], $asset['version'], true );
		$groups = $this->plugin_groups->get_groups();
		wp_add_inline_script( 'plugin-groups-bulk', 'var plgData = ' . wp_json_encode( $groups ), 'before' );
	}

	/**
	 * Handle our bulk actions.
	 *
	 * @param bool   $sendback always false, we'll return the redirect url.
	 * @param string $action   The action to do.
	 * @param array  $plugins  The list of selected plugins.
	 *
	 * @return false|string
	 */
	public function handle_bulk_action( $sendback, $action, $plugins ) {

		$referer = wp_get_raw_referer();// Get the referer.
		switch ( $action ) {
			case 'add-to-group':
				$selected_group = Utils::get_sanitized_text( INPUT_POST, 'group_id' );
				if ( '__new' === $selected_group ) {
					// Create a new group.
					$new_group_name = Utils::get_sanitized_text( INPUT_POST, 'new_group_name' );
					$succeed        = $this->plugin_groups->create_group( $new_group_name, $plugins );
					if ( $succeed ) {
						$selected_group = $succeed;
					}
				} else {
					// Add to existing group.
					$this->plugin_groups->add_to_group( $selected_group, $plugins );
				}
				// Change the group to the new group.
				$sendback = add_query_arg( Plugin_Groups::$slug, $selected_group, $referer );
				break;
			case 'remove-from-group':
				wp_parse_str( wp_parse_url( $referer, PHP_URL_QUERY ), $query );
				if ( isset( $query[ Plugin_Groups::$slug ] ) ) {
					$selected_group = $query[ Plugin_Groups::$slug ];
					$this->plugin_groups->remove_from_group( $selected_group, $plugins );
				}
				$sendback = $referer;
				break;
		}

		return $sendback;
	}

	/**
	 * Add our actions to the bulk actions.
	 *
	 * @param array $actions Current array of actions.
	 *
	 * @return array
	 */
	public function add_actions( $actions ) {

		$current_group = $this->plugin_groups->get_current_group();
		if ( $current_group ) {
			// Translators: placeholder is group name.
			$actions['remove-from-group'] = sprintf( __( 'Remove from %s', 'plugin-groups' ), $current_group['name'] );
		}
		$actions['add-to-group'] = __( 'Add to group', 'plugin-groups' );

		$this->enqueue_script();

		return $actions;
	}
}
