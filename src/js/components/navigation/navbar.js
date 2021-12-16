import { __ } from '@wordpress/i18n';
import NavBarDropdown from './dropdown';

export default function NavBar( props ) {

	const { presets, className, setParam, params, styleName } = props;
	const selected = params.navStyle && className === params.navStyle ? ' selected' : '';
	const preview = [...presets ];
	if( params.showUngrouped ){
		preview.push( __( 'Ungrouped', props.slug ) );
	}
	return (
		<div className={ 'plugin-groups nav-settings' + selected }
		     onClick={ () => {
			     setParam( 'navStyle', className );
		     } }
		>
			<label>{ styleName }</label>
			{ 'groups-dropdown' === className &&
			<NavBarDropdown { ...props } />
			}
			{ 'groups-dropdown' !== className &&
			<ul className={ className }>
				{
					preview.map( ( name, index ) => {
						if ( 5 < index && 'Ungrouped' !== name ) {
							return;
						}
						return (
							<>
								<li>
									<a className={ 0 === index ? 'current' : '' }>
										{ name }
										<span className={ 'count' }> ({ index+1 })</span>
									</a>
								</li>
							</>
						);
					} )
				}
			</ul>
			}
		</div>
	);
}
