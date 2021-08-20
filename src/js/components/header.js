import { __, _n } from '@wordpress/i18n';

export default function PluginGroupHeader( props ) {

	const {
		navTab,
		tab,
		pluginName,
		version,
		handleSave,
		handleExport,
		handleImport,
		saving
	} = props;

	return (
		<>
			<header className={ 'ui-header' }>
			<span>
				<h2>{ pluginName }</h2>
			</span>
				<span className={ 'ui-header-version' }>
				{ version }
			</span>

				<button
					className={ 'button button-primary' }
					type={ 'button' }
					onClick={ handleSave }
					disabled={ saving }
				>
					{ __( 'Save Settings', props.slug ) }
				</button>
				<button className={ 'button button-primary' } type={ 'button' } onClick={ handleExport }>
					{ 'Export' }
				</button>
				<label className={ 'button button-primary' } type={ 'button' } onClick={ '' }>
					{ 'Import' }
					<input className={ 'importer-input' } type={ 'file' } onChange={ handleImport }/>
				</label>
			</header>
			<ul className={ 'ui-navigation' }>
				<li className={ 1 === tab ? 'ui-navigation-link active' : 'ui-navigation-link' } onClick={ () => navTab(
					1 ) }>{ __( 'Groups Management', props.slug ) }</li>
				<li className={ 2 === tab ? 'ui-navigation-link active' : 'ui-navigation-link' } onClick={ () => navTab(
					2 ) }>{ __( 'Settings', props.slug ) }</li>
			</ul>
		</>
	);
}
