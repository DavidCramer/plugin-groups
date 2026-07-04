import { __ } from '@wordpress/i18n';

export default function NavBarDropdown( props ) {

	const { presets, getList, params } = props;
	const preview = [...presets ];
	if( params.showUngrouped ){
		preview.push( __( 'Ungrouped', 'plugin-groups' ) );
	}
	return (
		<div>
			<select>
				{
					preview.map( ( name, index ) => {

						return (
							<option>
								{ name } ({ index+1 })
							</option>
						);
					} )
				}
			</select>
		</div>
	);
}
