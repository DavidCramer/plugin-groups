<?php
/*
 * Plugin Name: Plugin Groups
 * Plugin URI: https://cramer.co.za
 * Description: Organize Plugins in groups
 * Version: 2.0.3
 * Author: David Cramer
 * Author URI: https://cramer.co.za
 * Text Domain: plugin-groups
 * License: GPL2+
*/

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

// Constants.
define( 'PLGGRP_PATH', plugin_dir_path( __FILE__ ) );
define( 'PLGGRP_CORE', __FILE__ );
define( 'PLGGRP_URL', plugin_dir_url( __FILE__ ) );
define( 'PLGGRP_SLUG', basename( __DIR__ ) . '/' . basename( __FILE__ ) );

if ( ! version_compare( PHP_VERSION, '5.6', '>=' ) ) {
	if ( is_admin() ) {
		add_action( 'admin_notices', 'plugin_groups_php_ver' );
	}
} else {
	// Includes Plugin_Groups and starts instance.
	include_once PLGGRP_PATH . 'bootstrap.php';
}

function plugin_groups_php_ver() {

	$message = __( 'Plugin Groups requires PHP version 5.6 or later. We strongly recommend PHP 5.6 or later for security and performance reasons.', 'plugin-groups' );
	echo sprintf( '<div id="plugin_groups_error" class="error notice notice-error"><p>%s</p></div>', esc_html( $message ) );
}

