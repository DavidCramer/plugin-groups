import { __ } from '@wordpress/i18n';

const loadSiteConfig = ( props ) => {

	const { id, loadURL, setConfig, restNonce, navTab } = props;
	if ( window.localStorage.getItem( '_plgUnsaved' ) && ! confirm( __( 'Changes that you made may not be saved.', props.slug ) ) ) {
		return;
	}
	navTab( 0 );
	fetch( loadURL + '?siteID=' + id, {
		method: 'GET',
		headers: {
			'X-WP-Nonce': restNonce,
		}
	} ).then( response => response.json() ).then( ( data ) => {
		setConfig( data );
		window.localStorage.removeItem( '_plgUnsaved' );
		navTab( 1 );
	} );
};

export default loadSiteConfig;
