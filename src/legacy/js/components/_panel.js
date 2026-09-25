import React from 'react';

export default function Panel( props ) {
	const { title, collapse, height } = props;
	const [ state, setState ] = React.useState( collapse ? collapse : 'open' );
	const icon = state === 'open' ? 'dashicons-arrow-up-alt2' : 'dashicons-arrow-down-alt2';
	const collapseClass = collapse ? 'collapsible' : '';
	const handleToggle = () => {
		if ( collapse ) {
			setState( state === 'open' ? 'closed' : 'open' );
		}
	};

	return (
		<div className={ 'ui-panel' }>
			<div className={ 'ui-panel-header ' + collapseClass } onClick={ handleToggle }>
				<h3 className={ 'ui-panel-header-title' }>{ title }</h3>
				{ collapse &&
				<span className={ 'dashicons ' + icon }></span>
				}
			</div>
			{ 'open' === state &&
			<div className={ 'ui-panel-body ' + state } >
				{ props.children }
			</div>
			}
		</div>
	);
}
