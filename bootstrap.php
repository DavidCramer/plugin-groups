<?php
/**
 * Plugin Groups Bootstrap.
 *
 * @package   plugin_groups
 * @author    David Cramer
 * @license   GPL-2.0+
 * @copyright 2021/08/15 David Cramer
 */

namespace Plugin_Groups;

/**
 * Activate the plugin core.
 */
function activate_plugin_groups() {
	// Include the core class.
	include_once PLGGRP_PATH . 'classes/class-plugin-groups.php';
	Plugin_Groups::get_instance();
}

add_action( 'init', 'Plugin_Groups\activate_plugin_groups' );
