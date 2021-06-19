<?php
/**
 * Plugin Groups Options.
 *
 * @package   Plugin_Groups
 * @author    David Cramer <david@digilab.co.za>
 * @license   GPL-2.0+
 * @link
 * @copyright 2015 David Cramer <david@digilab.co.za>
 */

/**
 * Plugin_Groups_Options class.
 *
 * @package Plugin_Groups
 * @author  David Cramer <david@digilab.co.za>
 */
class Plugin_Groups_Options {

	/**
	 * Option key for storing groups.
	 */
	const OPTION_NAME = 'plugin_groups_plugin_groups';

	/**
	 * Get the config.
	 *
	 * @return array
	 */
	public static function get_config() {
		$config = get_option( self::OPTION_NAME, array( 'id' => self::OPTION_NAME ) );

		/**
		 * Filter a plugin_groups config before returning
		 *
		 * @since 0.0.1
		 *
		 * @param string $option_name The name of the option it was stored in.
		 *
		 * @param array  $config      The config to be returned
		 */
		return apply_filters( 'plugin_groups_get_single', $config, self::OPTION_NAME );
	}

	/**
	 * Get an individual item by its ID.
	 *
	 * @since 0.0.1
	 *
	 * @param string $id plugin_groups ID
	 *
	 * @return null|array Group config or false if not found.
	 */
	public static function get_group( $id ) {
		$config = self::get_config();
		$return = null;
		if ( isset( $config['group'][ $id ] ) ) {
			$return = $config['group'][ $id ];
		}

		return $return;
	}

	/**
	 * Get an individual item by its name.
	 *
	 * @since 0.0.1
	 *
	 * @param string $name Group name to get.
	 *
	 * @return null|array Group config or false if not found.
	 */
	public static function get_group_by_name( $name ) {
		$config = self::get_config();
		$return = null;
		if( !empty( $config['group'] ) ) {
			foreach ( $config['group'] as $group ) {
				if ( $name === $group['config']['group_name'] ) {
					$return = $group;
					break;
				}
			}
		}

		return $return;
	}

	/**
	 * Create a new group.
	 *
	 * @param string $name The new group name.
	 *
	 * @return string The group ID.
	 */
	public static function create_group( $name ) {
		$group_id = uniqid( 'nd' );
		$group    = Plugin_Groups_Options::get_group_by_name( $name );
		if ( $group ) {
			$name = $name . "_" . $group_id;
		}
		$group = array(
			'_id'         => $group_id,
			'_node_point' => 'group.' . $group_id,
			'config'      => array(
				'group_name' => $name,
				'plugins'    => array(),
				'keywords'   => '',
			),
		);
		Plugin_Groups_Options::set_group( $group );

		return $group_id;
	}

	/**
	 * Set an individual item by its ID.
	 *
	 * @since 0.0.1
	 *
	 * @param array $group Group structure.
	 *
	 * @return bool
	 */
	public static function set_group( $group ) {
		$config                 = self::get_config();
		$id                     = isset( $group['_id'] ) ? $group['_id'] : uniqid( 'nd' );
		$config['group'][ $id ] = $group;

		return self::update( $config );
	}

	/**
	 * Update the config.
	 *
	 * @param array $config Array of settings.
	 *
	 * @return bool
	 */
	public static function update( $config ) {
		return update_option( self::OPTION_NAME, $config );
	}
}
