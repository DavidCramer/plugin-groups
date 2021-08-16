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
class Plugin_Groups_Utils {

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
	 * @param string $state      The element state.
	 *
	 * @return string
	 */
	public static function build_tag( $element, $attributes = array(), $state = 'open' ) {

		$prefix_element = 'close' === $state ? '/' : '';
		$tag            = array();
		$tag[]          = $prefix_element . $element;
		if ( 'close' !== $state ) {
			$tag[] = self::build_attributes( $attributes );
		}
		$tag[] = self::is_void_element( $element ) ? '/' : null;

		return self::compile_tag( $tag );
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
	 * Compiles a tag from a parts array into a string.
	 *
	 * @param array $tag Tag parts array.
	 *
	 * @return string
	 */
	public static function compile_tag( $tag ) {
		$tag = array_filter( $tag );

		return '<' . implode( ' ', $tag ) . '>';
	}

	/**
	 * Build an array of tags.
	 *
	 * @param array $array The array of tags to build.
	 *
	 * @return string
	 */
	public static function build_tags_array( $array ) {
		$default = array(
			'tag'   => '',
			'atts'  => array(),
			'state' => 'open',
		);
		$html    = array();
		foreach ( $array as $tag ) {
			if ( is_array( $tag ) ) {
				$tag = wp_parse_args( $tag, $default );
				$tag = self::build_tag( $tag['tag'], $tag['atts'], $tag['state'] );
			}
			$html[] = $tag;
		}

		return implode( '', $html );
	}
}
