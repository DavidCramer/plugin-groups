import { __ } from '@wordpress/i18n';
import Panel from './_panel';
import ListItem from './list-item';
import React from 'react';

export default function Presets( props ) {
	const { togglePreset, selectedPresets,presets,slug } = props;
	return (
		<div className={ 'ui-body-sidebar narrow' }>

			<Panel
				title={ __( 'Presets', slug ) }
			>
				{ presets.map( ( preset ) => {

					return (
						<ListItem
							name={ preset }
							id={ preset }
							checked={ -1 < selectedPresets.indexOf(
								preset ) }
							callback={ ()=>togglePreset( preset) }
						/>
					);
				} ) }

			</Panel>
		</div>
	);
}
