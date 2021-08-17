export default function PluginGroupHeader( props ) {

	const { pluginName, version, handleSave, saving } = props;



	return (
		<header className={ 'ui-header' }>
			<span>
				<h2>{ pluginName }</h2>
			</span>
			<span className={ 'ui-header-version' }>
				{ version }
			</span>
			<button className={ 'button button-primary' } type={ 'button' } onClick={ handleSave }>
				{ saving ? 'Saving' : 'Save Settings' }
			</button>
		</header>
	);
}
