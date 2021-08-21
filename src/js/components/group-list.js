import React from 'react';
import { __ } from '@wordpress/i18n';
import RenderList from './render-list';
import Panel from './_panel';
import ListItem from './list-item';

export default function PluginGroupList( props ) {
	const {
		getList,
		createGroup,
		deleteGroups,
		selectGroups,
		getSelected
	} = props;
	const checked = getSelected().length === Object.keys(
		props.groups ).length;
	return (
		<div className={ 'ui-body-sidebar wide' }>
			<Panel title={ __( 'Groups' ) }>
				<div className={ 'ui-body-sidebar-list' }>
					{ 0 !== getList().length &&
					<>

						<ListItem
							name={ __( 'Select All' ) }
							bold={ true }
							callback={ ( event ) => {
								selectGroups(
									Object.keys( props.groups ),
									event.target.checked
								);
							} }
							checked={ checked }
							className={ 'list-control' }
						>
							<button disabled={ ! getSelected().length }
							        type={ 'button' }
							        className={ 'button' }
							        onClick={ () => {
								        deleteGroups( getSelected(), true );
							        } }
							>
								<span className={ 'text' }> { __( 'Delete selected', props.slug ) } </span>
								<span className="dashicons dashicons-trash"/>
							</button>
						</ListItem>


						<RenderList { ...props } />
					</>
					}
					{ 0 === getList().length &&
					<div className={ 'description' }>
						<span className="ui-body-edit-plugins-item">{ __( 'No groups created', props.slug ) }</span>
					</div>
					}
				</div>
			</Panel>
			<button type={ 'button' }
			        className={ 'button' }
			        onClick={ () => createGroup( '', true ) }>
				{ __( 'Create new group', props.slug ) }
			</button>
		</div>
	);
}
