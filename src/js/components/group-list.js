import React from 'react';
import { __ } from '@wordpress/i18n';
import RenderList from './render-list';

export default function PluginGroupList( props ) {
	const { getList } = props;
	return (
		<div className={ 'ui-body-sidebar' }>
			<h3>{ __( 'Groups' ) }</h3>
			<ul className={ 'ui-body-sidebar-list' }>
				{ 0 !== getList().length &&
				<RenderList { ...props } />
				}
				{ 0 === getList().length &&
					<div className={'description'}>
						{__('No groups' ) }
					</div>
				}
			</ul>
			<hr/>
		</div>
	);
}
