import { __ } from '@wordpress/i18n';

const Install = {
	init() {
		jQuery( document ).on( 'wp-plugin-install-success', ( event, data ) => {
			if ( data ) {
				const selector = document.querySelector( `[data-plugin=${ data.slug }]` );
				const notice = document.createElement( 'div' );
				notice.innerText = '';
				selector.parentNode.appendChild( notice );
				selector.disabled = '';
				selector.addEventListener( 'change', () => this.addToGroup( selector.value, data.activateUrl, selector, notice ) );
			}
		} );
	},
	addSelector( data ) {
		const select = document.createElement( 'select' );
		select.name = 'group_id';
		plgData.forEach( group => {
			const option = document.createElement( 'option' );
			option.value = group.id;
			option.innerText = group.name;
			select.appendChild( option );
		} );
		// Add new group option.
		const optionGroup = document.createElement( 'optgroup' );
		const option = document.createElement( 'option' );
		optionGroup.label = '---------';
		option.value = '__new';
		option.innerText = __( 'New group', 'plugin-groups' );
		optionGroup.appendChild( option );
		select.appendChild( optionGroup );
		return select;
	},
	addToGroup( id, url, selector, notice ) {
		notice.innerText = '';
		const data = {
			id,
			url
		};
		fetch( plgData.url, {
			method: 'POST', // or 'PUT'
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': plgData.nonce,
			},
			body: JSON.stringify( data ),
		} )
			.then( response => response.json() )
			.then( data => {
				notice.innerText = __( 'Plugin added.', 'plugin-groups' );
				selector.value = '_select';
			} );
	}
};

window.addEventListener( 'load', () => Install.init() );

