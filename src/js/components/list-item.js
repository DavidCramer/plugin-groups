import React from 'react';

export default function ListItem( props ) {
	const { name, version, id, callback, checked, bold } = props;
	const title = () => {
		if ( bold ) {
			return (
				<strong>
					{ name }
					{
						version &&
						<>: { version }</>
					}
				</strong>
			);
		}
		return (
			<>
				{ name }
				{
					version &&
					<>: { version }</>
				}
			</>
		);
	};
	return (
		<div className={ 'ui-body-sidebar-plugins-item' }>
			<label>
				<input type={ 'checkbox' } checked={ checked } value={ id } onChange={ callback }/>
				{ title() }
			</label>
			{ props.children }
		</div>
	);
}
