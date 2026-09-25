<?php
/**
 * Main UI admin page.
 *
 * The full config is fetched client-side from the `load` REST route; this
 * only needs to hand the app enough to make that first request.
 *
 * @package plugin_groups
 * @var $bootstrap array {
 *     @type string $loadURL      REST URL for the `load` route.
 *     @type string $restNonce    Nonce for X-WP-Nonce.
 *     @type int    $siteID       Current site ID.
 * 	   @type bool   $networkAdmin Flag if in network admin.
 * }
 */

?>
<div class="plugin-groups-main flex h-full flex-col overflow-hidden" id="plg-app" data-bootstrap="<?php echo esc_attr( wp_json_encode( $bootstrap ) ); ?>"></div>
