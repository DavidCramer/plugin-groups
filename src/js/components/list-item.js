import React from 'react';

export default function ListItem( props ) {
	const { name, version, id, callback, checked, bold, subname, className } = props;
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
			<span>
				{ name }
				{
					version &&
					<>: { version }</>
				}
			</span>
		);
	};
	return (
		<div className={ 'ui-body-sidebar-list-item ' + className }>
			<label>
				<input type={ 'checkbox' } checked={ checked } value={ id } onChange={ callback }/>
				<span>
					{ title() }
					{ subname &&
					<div>{ subname }</div>
					}
				</span>
			</label>
			{ props.children }
		</div>
	);
}
