import { __, _n } from '@wordpress/i18n';
import MultiSiteSelector from './multisite-selector';

export default function PluginGroupHeader( props ) {

	const {
		navTab,
		tab,
		pluginName,
		version,
		handleSave,
		handleExport,
		handleImport,
		saving,
		saved,
		sites
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
				{ 0 === tab &&
				<span className={ 'ui-header-multisite' }>
						{ __( 'Loading site config.', props.slug ) }
				</span>
				}
				{ 0 !== tab &&
				<>
					{ sites &&
					<span className={ 'ui-header-multisite' }>
						<MultiSiteSelector { ...props } />
					</span>
					}

					<span className={ saved ? 'ui-saved-notice active' : 'ui-saved-notice' }>
						<span className={ 'ui-saved-notice-panel' } >{ __( 'Settings Saved', 'plugin-groups' ) }</span>
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
					<label className={ 'button button-primary' } type={ 'button' }>
						{ 'Import' }
						<input className={ 'importer-input' } type={ 'file' } onChange={ handleImport }/>
					</label>
				</>
				}
			</header>
			{ 0 !== tab &&
			<ul className={ 'ui-navigation' }>
				<li className={ 1 === tab ? 'ui-navigation-link active' : 'ui-navigation-link' } onClick={ () => navTab(
					1 ) }>{ __( 'Groups Management', props.slug ) }</li>
				{ sites && props.mainSite === props.siteID &&
				<li className={ 3 === tab ? 'ui-navigation-link active' : 'ui-navigation-link' } onClick={ () => navTab(
					3 ) }>{ __( 'Multisite', props.slug ) }</li>
				}
				<li className={ 2 === tab ? 'ui-navigation-link active' : 'ui-navigation-link' } onClick={ () => navTab(
					2 ) }>{ __( 'Settings', props.slug ) }</li>
			</ul>
			}
		</>
	);
}
