<?php
/**
 * Plugin Groups Bootstrap.
 *
 * @package   plugin_groups
 * @author    David Cramer
 * @license   GPL-2.0+
 * @copyright 2021/08/15 David Cramer
 */

/**
 * Activate the plugin core.
 */
function activate_plugin_groups() {

	if( empty( get_option( '_plugin_groups_beta'))){
		include PLGGRP_PATH . 'legacy/plugincore.php';
		return;
	}
	// Include the core class.
	include_once PLGGRP_PATH . 'classes/class-plugin-groups.php';
	Plugin_Groups::get_instance();
}

add_action( 'plugins_loaded', 'activate_plugin_groups' );
