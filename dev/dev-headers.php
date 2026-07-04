<?php
/**
 * Dev Headers
 */

register_shutdown_function( function () {
	if ( ! is_admin() && ! wp_is_serving_rest_request() ) {
		echo '<link rel="stylesheet" href="' . CONTENT_STREAM_URL . 'dev/dev.css" type="text/css" />';
	}

} );
