export default function NavBarDropdown( props ) {

	const { presets, getList } = props;

	return (
		<div>
			<select>
				{
					presets.map( ( name, index ) => {
						if ( 5 < index ) {
							return;
						}
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
