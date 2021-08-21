import React from 'react';

export default function ListItem( props ) {
	const {
		name,
		version,
		id,
		callback,
		checked,
		bold,
		subname,
		className,
		disabled
	} = props;
	const title = () => {
		if ( bold ) {
			return (
				<strong>
					{ name }
				</strong>
			);
		}
		return (
			<span>
				{ name }
			</span>
		);
	};
	const setClass = className ? className : '';
	return (
		<div className={ 'ui-body-sidebar-list-item ' + setClass }>
			<label>
				<input type={ 'checkbox' }
				       checked={ checked }
				       value={ id }
				       onChange={ callback }
				       disabled={ disabled }
				/>
				<span>
					{ title() }
					{ subname &&
					<div>{ subname }</div>
					}
				</span>
			</label>
			<span className={ 'children' }>
				{ version &&
				<span className={ 'version' }>{ version }</span>
				}
				{ props.children }
			</span>
		</div>
	);
}
