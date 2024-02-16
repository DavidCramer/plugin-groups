import { __, _n } from '@wordpress/i18n';
import loadSiteConfig from './methods/loader';

export default function MultiSiteSelector( props ) {
	const { loadURL, setConfig, restNonce, navTab } = props;
	const handleChange = ( id ) => {
		loadSiteConfig( { id, loadURL, setConfig, restNonce, navTab } );
	};
	return (
		<select onChange={ ( event ) => {
			handleChange( event.target.value );
		} }>
			{ props.sites.map( site => {
				const id = parseInt( site.blog_id );
				return (
					<option value={ id } selected={ id === props.siteID }>{ `${ site.domain }${ site.path }` }</option>
				);
			} ) }
		</select>
	);
}
