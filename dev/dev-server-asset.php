<?php
/**
 * Dev server asset loader.
 * Separates dev server assets from production assets.
 */
$port = file_get_contents( PLGGRP_PATH . '.dev-server-running' );

?>
	<script type="module">
			import RefreshRuntime from 'http://localhost:<?php echo $port; ?>/@react-refresh';

			RefreshRuntime.injectIntoGlobalHook(window);
			window.$RefreshReg$ = () => { };
			window.$RefreshSig$ = () => (type) => type;
			window.__vite_plugin_react_preamble_installed__ = true;
	</script>
<?php

// Vite client for HMR.
wp_enqueue_script_module( 'plugin-vite-client', 'http://localhost:' . $port . '/@vite/client', [], null );

// Main app.
wp_enqueue_script_module( 'plugin-app', 'http://localhost:' . $port . '/src/main.tsx', [], null, [ 'in_footer' => true ] );
