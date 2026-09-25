import {__} from '@wordpress/i18n';

const Install = {
	successColor: '#5b8a00',
	errorColor: '#b32d2e',
	init() {

		const selects = document.querySelectorAll('.plugin-groups-selector');
		selects.forEach(select => {
			const pluginSlug = select.dataset.slug;
			const notice = document.querySelector(`.plugin-groups-notice[data-plugin=${pluginSlug}]`);
			notice.innerText = '';
			select.addEventListener('change', () => {
				const plugin = select.dataset.plugin;
				if (plugin) {
					this.addToGroup(select.value, plugin, select, notice)
				}
			});
		});

		jQuery(document).on('wp-plugin-install-success', (event, data) => {
			const selector = document.querySelector(`.plugin-groups-selector[data-slug=${data.slug}]`);
			if (selector) {
				selector.disabled = false;

				if (data && data.activateUrl) {
					const urlObj = new URL(data.activateUrl);
					const pluginSlug = urlObj.searchParams.get('plugin');
					selector.dataset.plugin = pluginSlug;
				}
			}
		});
	},
	addSelector(data) {
		const select = document.createElement('select');
		select.name = 'group_id';
		plgData.forEach(group => {
			const option = document.createElement('option');
			option.value = group.id;
			option.innerText = group.name;
			select.appendChild(option);
		});
		// Add new group option.
		const optionGroup = document.createElement('optgroup');
		const option = document.createElement('option');
		optionGroup.label = '---------';
		option.value = '__new';
		option.innerText = __('New group', 'plugin-groups');
		optionGroup.appendChild(option);
		select.appendChild(optionGroup);
		return select;
	},
	addToGroup(id, plugin, selector, notice) {
		notice.innerText = '';
		const data = {
			id,
			plugin
		};
		fetch(plgData.url, {
			method: 'POST', // or 'PUT'
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': plgData.nonce,
			},
			body: JSON.stringify(data),
		})
			.then(response => response.json())
			.then((data) => {

				notice.style.display = 'block';
				if (true === data.success) {
					notice.style.backgroundColor = this.successColor;
					notice.innerText = __('Plugin added.', 'plugin-groups');
				} else {
					notice.style.backgroundColor = this.errorColor;
					notice.innerText = __('Error: ' + data.message, 'plugin-groups');
				}
				selector.value = '_select';
				// Remove the option from the select.
				const option = selector.querySelector(`option[value="${id}"]`);
				if (option) {
					option.remove();
				}
			});
	}
};

window.addEventListener('load', () => Install.init());
