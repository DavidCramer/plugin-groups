export default function PluginGroupHeader( config ) {

	const { saveURL, restNonce } = config;

	const handleSave = ( event ) => {
		const button = event.target;
		button.innerText = 'Saving...';
		fetch( config.saveURL, {
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': restNonce,
			},
			body: JSON.stringify( config )
		} ).then( response => response.json() )
			.then( (data) => {
				button.blur();
				button.innerText = 'Save';
			} );
	};

	return (
		<header className={ 'ui-header' }>
			<span>
				<h2>{ config.pluginName }</h2>
			</span>
			<span className={ 'ui-header-version' }>
				{ config.version }
			</span>
			<button className={ 'button button-primary' } type={ 'button' } onClick={ handleSave }>Save</button>
		</header>
	);
}
