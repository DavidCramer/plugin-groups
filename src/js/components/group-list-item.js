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

	return (
		<li
			className={ selected ? 'active' : '' }
			id={ index }
		>
			<div className={ 'ui-body-sidebar-list-item' }>

				<>
					{ ! edit &&
					<span>
						<input type={ 'checkbox' } checked={ selected } onClick={ ( event ) => selectGroup(
							id ) }/>
						<span className={ 'ui-body-sidebar-list-item-title' } onClick={ ( event ) => openGroup(
							id ) }>
							{ name }
						</span>
					</span>
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
					<span className={ 'ui-body-sidebar-list-item-icons' }>
						{ plugins.length }
					</span>
				</>
				

			</div>
			{ ! temp && open &&
			<PluginGroupEdit group={ group } { ...props } />
			}
		</li>
	);
}
