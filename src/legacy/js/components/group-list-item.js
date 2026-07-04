import GroupNameInput from './group-name-input';
import PluginGroupEdit from './group-edit';

import React from 'react';

export default function GroupListItem( props ) {
	const {
		selectGroup,
		openGroup,
		group,
		changeName,
		editGroup,
		index,
	} = props;
	const { temp, name, id, plugins, selected, open, edit, focus } = group;
	const handleEdit = ( event ) => {
		event.stopPropagation();
		editGroup( id );
	};
	const active = selected ? 'active' : '';
	return (
		<div key={id} data-id={id} >
			<div className={ 'plugin-group ui-body-sidebar-list-item ' + active }>
				{ ! edit &&
				<>
					<span>
						<span className="sort-handle dashicons dashicons-menu"></span>
						<input type={ 'checkbox' } checked={ selected } onClick={ ( event ) => selectGroup(
							id ) }/>
						<span className={ 'ui-body-sidebar-list-item-title' } onClick={ ( event ) => openGroup(
							id ) }>
							{ name }
						</span>
					</span>
					<span className={ 'ui-body-sidebar-list-item-icons' }>
						<span
							className="dashicons dashicons-edit"
							onClick={ () => editGroup( id ) }
						></span>
						{ plugins.length }
					</span>
				</>
				}
				{ edit &&
				<GroupNameInput
					temp={ temp }
					name={ name }
					id={ id }
					changeName={ changeName }
					editGroup={ editGroup }
					focus={ focus }
				/>
				}


			</div>
			{ ! temp && open &&
			<PluginGroupEdit group={ group } { ...props } />
			}
		</div>
	);
}
