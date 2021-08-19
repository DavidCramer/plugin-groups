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
							className={'list-control'}
						>
							<button disabled={ ! getSelected().length }
							        type={ 'button' }
							        className={ 'button' }
							        onClick={ () => {
								        deleteGroups( getSelected(), true );
							        } }
							>
								{ __( 'Delete selected', props.slug ) }
							</button>
						</ListItem>


						<RenderList { ...props } />
					</>
					}
					{ 0 === getList().length &&
					<div className={ 'description' }>
						{ __( 'No groups' ) }
					</div>
					}
				</div>
			</Panel>
			<button type={ 'button' }
			        className={ 'button' }
			        onClick={ () => createGroup( '', true ) }>
				<span className="dashicons dashicons-plus-alt"/>
				{ __( 'New Group' ) }
			</button>
		</div>
	);
}
