import Panel from './_panel';
import { __ } from '@wordpress/i18n';
import React from 'react';
import ListItem from './list-item';

export default function PluginsList( props ) {
	const { plugins, addPlugins, groups } = props;
	const [ state, setState ] = React.useState( {
		checkedAll: false,
		search: '',
		ungrouped: false,
		checked: []
	} );
	const keys = Object.keys( plugins );
	let grouped = [];
	const updateChange = ( change ) => {
		setState( { ...state, ...change } );
	};

	const searchText = ( event ) => {
		updateChange( { search: event.target.value } );
	};

	const checkAll = ( check ) => {
		const checked = {
			checked: [],
		};
		if ( check ) {
			keys.forEach( ( item ) => {
				const plugin = plugins[ item ];
				if ( isMatched( plugin.Name ) ) {
					checked.checked.push( item );
				}
			} );
		}
		checked.checkedAll = checked.checked.length;
		updateChange( checked );
	};
	for ( const group in groups ) {
		grouped = grouped.concat( groups[ group ].plugins );
	}

	const showUngrouped = ( event ) => {
		const newState = { ...state };
		newState.ungrouped = event.target.checked;
		updateChange( newState );
	};

	const checkItem = ( event ) => {
		const newState = { ...state };
		const index = newState.checked.indexOf( event.target.value );
		if ( event.target.checked && -1 === index ) {
			newState.checked.push( event.target.value );
		} else if ( ! event.target.checked && -1 < index ) {
			newState.checked.splice( index, 1 );
		}
		if ( newState.checked.length !== newState.checkedAll ) {
			newState.checkedAll = 0;
		}
		if ( newState.checked.length === keys.length ) {
			checkAll( true );

		} else {
			updateChange( newState );
		}
	};

	const addSelected = () => {
		Object.keys( props.groups ).forEach( ( group ) => {
			if ( props.groups[ group ].selected ) {
				addPlugins( group, state.checked );
			}
		} );
		checkAll( false );
	};

	const isMatched = ( item ) => {
		return state.search ? -1 < item.toLowerCase().indexOf( state.search.toLowerCase() ) : true;
	};

	const hasSelected = () => {
		for ( const ID in props.groups ) {
			if ( props.groups[ ID ].selected ) {
				return true;
			}
		}
		return false;
	};

	const enabledButton = state.checked.length && hasSelected();

	return (
		<div className={ 'ui-body-sidebar' }>
			<Panel key={ 'plist-panel' } title={ __( 'Plugins', props.slug ) }>
				<div style={ { display: 'flex' } }>
					<input className={ 'regular-text search' } placeholder={ __(
						'Search',
						props.slug
					) } type={ 'search' } onInput={ searchText } value={ state.search }/>
					<label style={ { 'white-space': 'nowrap', padding: '12px 0 12px 12px' } }>
						<input
							type={ 'checkbox' }
							checked={ state.ungrouped }
							onChange={ showUngrouped }
						/>
						<strong>{ __( 'Ungrouped', props.slug ) }</strong>
					</label>
				</div>
				<ListItem
					name={ __( 'Select all', props.slug ) }
					id={ 'all' }
					key={ '_master' }
					callback={ ( event ) => checkAll( event.target.checked ) }
					checked={ state.checkedAll }
					bold={ true }
					className={ 'list-control' }
				>
					<button className={ 'button' } type={ 'button' } onClick={ addSelected } disabled={ ! enabledButton }>
						<span className={ 'text' }>{ __( 'Send to Selected Groups' ) }</span>
						<span className="dashicons dashicons-arrow-right-alt2"></span>
					</button>
				</ListItem>
				<div key={ 'plist' } className={ 'plugins-list' }>
					<div key={ 'plist-main' } className={ 'ui-body-sidebar-list' }>

						{ keys.map( ( item, index ) => {
							const plugin = plugins[ item ];
							const match = isMatched( plugin.Name );
							const checked = -1 < state.checked.indexOf(
								item ) && isMatched( plugin.Name );
							if ( state.ungrouped && -1 !== grouped.indexOf( item ) ) {
								return;
							}
							return (
								<>
									{ match &&
									<ListItem
										key={ item }
										name={ plugin.Name }
										id={ item }
										version={ plugin.Version }
										checked={ checked }
										callback={ checkItem }
									/>
									}
								</>
							);
						} ) }
					</div>
				</div>
			</Panel>
		</div>
	);
}
