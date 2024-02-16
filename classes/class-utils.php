<?php
/**
 * Utils for Plugin Groups.
 *
 * @package plugin_groups
 */

namespace Plugin_Groups;

/**
 * Class Plugin_Groups_Utils
 */
class Utils {

	/**
	 * Get all the attributes from an HTML tag.
	 *
	 * @param string $tag HTML tag to get attributes from.
	 *
	 * @return array
	 */
	public static function get_tag_attributes( $tag ) {

		$tag    = strstr( $tag, ' ', false );
		$tag    = trim( $tag, '> ' );
		$args   = shortcode_parse_atts( $tag );
		$return = array();
		foreach ( $args as $key => $value ) {
			if ( is_int( $key ) ) {
				$return[ $value ] = 'true';
				continue;
			}
			$return[ $key ] = $value;
		}

		return $return;
	}

	/**
	 * Check if an element type is a void elements.
	 *
	 * @param string $element The element to check.
	 *
	 * @return bool
	 */
	public static function is_void_element( $element ) {

		$void_elements = array(
			'area',
			'base',
			'br',
			'col',
			'embed',
			'hr',
			'img',
			'input',
			'link',
			'meta',
			'param',
			'source',
			'track',
			'wbr',
		);

		return in_array( strtolower( $element ), $void_elements, true );
	}

	/**
	 * Build an HTML tag.
	 *
	 * @param string $element    The element to build.
	 * @param array  $attributes The attributes for the tags.
	 * @param string $content    The element content.
	 *
	 * @return string
	 */
	public static function build_tag( $element, $attributes = array(), $content = '' ) {

		$parts = array(
			'<' . $element,
		);
		if ( ! empty( $attributes ) ) {
			$parts[] = self::build_attributes( $attributes );
		}
		$suffix = null;
		if ( self::is_void_element( $element ) ) {
			$parts[] = '/>';
		} else {
			$parts[] = '>';
			$suffix  = $content . '</' . $element . '>';
		}

		return implode( ' ', $parts ) . $suffix;
	}

	/**
	 * Builds and sanitizes attributes for an HTML tag.
	 *
	 * @param array $attributes Array of key value attributes to build.
	 *
	 * @return string
	 */
	public static function build_attributes( $attributes ) {

		$parts = array();
		foreach ( $attributes as $attribute => $value ) {
			if ( is_array( $value ) ) {
				if ( count( $value ) !== count( $value, COUNT_RECURSIVE ) ) {
					$value = wp_json_encode( $value );
				} else {
					$value = implode( ' ', $value );
				}
			}
			$parts[] = esc_attr( $attribute ) . '="' . esc_attr( $value ) . '"';
		}

		return implode( ' ', $parts );
	}

	/**
	 * Generate a new ID for a group.
	 *
	 * @return string
	 */
	public static function generate_id() {

		return uniqid( 'nd' );
	}

	/**
	 * Get a sanitized input text field.
	 *
	 * @param int    $type The type to get.
	 * @param string $var  The value to get.
	 *
	 * @return mixed
	 */
	public static function get_sanitized_text( $type, $var ) {
		return filter_input( $type, $var, FILTER_CALLBACK, array( 'options' => 'sanitize_text_field' ) );
	}

}
