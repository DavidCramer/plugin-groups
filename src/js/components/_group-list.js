import React from 'react';
import { __ } from '@wordpress/i18n';

function GroupNameInput( { name, id, changeName, handleEdit } ) {

	const handleChange = ( event ) => {
		const value = event.target.value;
		changeName( id, event.target.value );
	};
	const checkName = ( event ) => {
		if ( ! event.target.value.length ) {
			event.target.focus();
		} else {
			handleEdit( event, id );
		}
	};
	return (
		<input
			className={ 'ui-body-edit-title' }
			autoFocus={ 'selected' }
			onFocus={ ( event ) => event.target.select() }
			value={ name }
			onInput={ handleChange }
			onBlur={ checkName }
		/>
	);
}


function RenderList( props ) {
	const [ edit, setEdit ] = React.useState( null );
	const
		{ activeGroup, groups, selectGroup, deleteGroup, changeName }
			= props;

	const handleEdit = ( id ) => {
		setEdit( id === edit ? null : id );
	};

	const handleSelect = ( id ) => {
		if ( edit !== id ) {
			selectGroup( id );
		}
	};

	const downHandler = ( event ) => {
		const directions = [ 'ArrowDown', 'ArrowUp', 'Enter' ];
		if ( 0 <= directions.indexOf( event.key ) ) {
			const keys = Object.keys( groups );
			if ( ! activeGroup && keys.length ) {
				selectGroup( keys[ 0 ] );
			}
			if ( activeGroup && 'Enter' === event.key ) {
				event.stopPropagation();
				handleEdit( activeGroup );
			} else {
				if( edit ){
					handleEdit( edit );
				}
				const position = keys.indexOf( activeGroup );
				const next = event.key === 'ArrowUp' ? position - 1 : position + 1;
				if ( keys[ next ] ) {
					selectGroup( keys[ next ] );
				}
			}
		}
	};

	React.useEffect( () => {
		window.addEventListener( 'keydown', downHandler );
		return () => {
			window.removeEventListener( 'keydown', downHandler );
		};
	} );

	return ( Object.keys( groups ).map( ( item, index ) => {
			const
				{ config, _id }
					= groups[ item ];
			const selected = activeGroup === _id ? 'active' : '';

			return (
				<li
					className={ 'ui-body-sidebar-list-item ' + selected }
					id={ index }
					onClick={ ( event ) => handleSelect( _id ) }>
					<span className={ 'ui-body-sidebar-list-item-title' }>
						{ _id !== edit &&
						<>{ config.group_name }</>
						}
						{ _id === edit &&
						<GroupNameInput
							name={ config.group_name }
							id={ _id }
							changeName={ changeName }
							handleEdit={ handleEdit }
						/>
						}
					</span>
					<span className={ 'ui-body-sidebar-list-item-icons' }>
						<span className={ 'dashicons dashicons-edit' } onClick={ ( event ) => handleEdit(
							_id ) }/>
						<span className={ 'dashicons dashicons-trash' }/>
					</span>
				</li>
			);
		} )
	);
}


export default function PluginGroupList( props ) {
	const { createGroup } = props;

	return (
		<div className={ 'ui-body-sidebar' }>
			<h3>{ __( 'Groups' ) }</h3>
			<ul className={ 'ui-body-sidebar-list' }>
				<RenderList { ...props } />
			</ul>
			<hr/>
		</div>
	);
}
