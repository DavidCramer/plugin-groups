<?php
/*
 * Plugin Name: Plugin Groups
 * Plugin URI: https://cramer.co.za
 * Description: Organize Plugins in groups
 * Version: 3.0.0
 * Author: David Cramer
 * Author URI: https://cramer.co.za
 * Text Domain: plugin-groups
 * License: GPL2+
 * Requires PHP: 7.4
 * Requires at least: 6.7
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
define( 'PLGGRP_VERSION', '3.0.0' );
/**
 * Check if we're running dev mode.
 */
if ( file_exists( PLGGRP_PATH . '/.dev-server-running' ) ) {
	$domain = filter_var( $_SERVER['HTTP_HOST'], FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME );
	if ( str_ends_with( $domain, '.local' ) ) {
		$port = trim( file_get_contents( PLGGRP_PATH . '.dev-server-running' ) );
		define( 'PLGGRP_DEV_MODE', $port );
	}
}
if ( ! version_compare( PHP_VERSION, '7.4', '>=' ) ) {
	if ( is_admin() ) {
		add_action( 'admin_notices', 'plugin_groups_php_ver' );
	}
} else {
	// Includes Plugin_Groups and starts instance.
	include_once PLGGRP_PATH . 'bootstrap.php';
}

function plugin_groups_php_ver() {

	$message = __( 'Plugin Groups requires PHP version 7.4 or later. We strongly recommend PHP 7.4 or later for security and performance reasons.', 'plugin-groups' );
	echo sprintf( '<div id="plugin_groups_error" class="error notice notice-error"><p>%s</p></div>', esc_html( $message ) );
}
