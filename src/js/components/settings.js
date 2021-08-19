import { __ } from '@wordpress/i18n';
import Panel from './_panel';
import React from 'react';
import ListItem from './list-item';

export default function Settings( props ) {

	return (
		<div className={ 'ui-body' }>
			<div className={ 'ui-body-sidebar' }>

				<Panel title={ 'Settings' }>
					<ListItem name={ __( 'Use Legacy status based grouping', props.slug ) }/>
					<ListItem name={ __( 'Enable menu groups', props.slug ) }></ListItem>
				</Panel>
			</div>
		</div>
	);
}
