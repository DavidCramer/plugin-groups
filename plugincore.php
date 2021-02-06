<?php
/**
 * @package   Plugin_Groups
 * @author    David Cramer <david@digilab.co.za>
 * @license   GPL-2.0+
 * @link      https://cramer.co.za
 * @copyright 2018 David Cramer <david@digilab.co.za>
 *
 * @wordpress-plugin
 * Plugin Name: Plugin Groups
 * Plugin URI:  https://cramer.co.za
 * Description: Organize plugins in the Plugins Admin Page by creating groups and filter types.
 * Version:     1.2.2
 * Author:      David Cramer <david@digilab.co.za>
 * Author URI:  https://cramer.co.za/
 * Text Domain: plugin-groups
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path: /languages
 * Network:     true
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

if ( ! is_admin() )
     return;

define( 'PLORG_PATH', plugin_dir_path( __FILE__ ) );
define( 'PLORG_URL', plugin_dir_url( __FILE__ ) );
define( 'PLORG_VER', '1.2.2' );
define( 'PLORG_SLUG', 'plugin_groups' );

// load internals
require_once( PLORG_PATH . 'classes/class-plugin-groups.php' );
require_once( PLORG_PATH . 'classes/class-options.php' );
require_once( PLORG_PATH . 'classes/class-settings.php' );

// Load instance
add_action( 'plugins_loaded', array( 'Plugin_Groups', 'get_instance' ) );
