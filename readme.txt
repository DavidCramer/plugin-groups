=== Plugin Groups ===
Contributors: Desertsnowman, dlcramer
Donate link: https://cramer.co.za
Tags: plugin organizer, plugin status filter, plugin filter, plugin groups, plugin group
Requires at least: 5.3
Tested up to: 6.4.3
Stable tag: 2.0.9
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Organize plugins in the Plugins Admin Page by creating groups and filter types

== Description ==

If you have a lot of plugins installed, it can be difficult to manage them all. Now you can organize the plugins admin page by grouping your plugins by purpose. Each group will be displayed as a plugin status tabs in the plugins admin page, so you can easily filter which plugins you are viewing by group.

A free plugin by [David Cramer](https://cramer.co.za).

[Contribute to the development on GitHub](https://github.com/DavidCramer/plugin-groups)

== Installation ==

Install the plugin through the WordPress Plugins Installer or upload the decompressed folder to the plugins directory of your content directory
1. Activate the plugin through the 'Plugins' menu in WordPress

== Frequently Asked Questions ==

= Does it support Multi-site? =

Yes it does! It has full support from network admin being able to set groups for individual sites, to Giving sites, full access to manage themselves.

== Screenshots ==

1. New groups menu above the plugin status, enables navigating status within groups.
2. New styles give a different feel to the groups navigation.
3. Dropdown navigation instead of a menu to cut space.
4. Admin menu mode to make access to groups from anywhere.
5. Completely redesigned admin.
6. Bulk edit / create groups to speed up creation.

== Changelog ==

= 2.0.9 =
- Fixed missing class.

= 2.0.8 =
- Fixed vulnerability of forced update of settings.

= 2.0.7 =
- [Multisite] Added path to domain for subdirectory sites.
- PHP 8.1 compatibility.
- Added an "Ungrouped" toggle in settings, to filter out plugins that are not in a group yet.
- Added a setting to enable an Ungrouped group in groups nav.

= 2.0.6 =
- [Multisite] You can now set the main sites group management access. This allows the Group management to be disabled on all site, and keeps it in network admin only, if wanted.
- Added a little notice that settings are saved.
- Added an "Ungrouped" toggle in settings, to filter out plugins that are not in a group yet.
- Added a setting to enable an Ungrouped group in groups nav.

= 2.0.5 =
- Fixed an issue that prevented translations from being added.

= 2.0.4 =
- Fixed an issue that if a plugin is removed, the group will cause the admin UI to crash.
- Added "Add to group" when installing a plugin from the add plugin screen.
- Cleaned up the code a bit.

= 2.0.3 =
- Fixed an issue where activating a plugin in a group, you get redirected to all plugins.
- Added Bulk actions to allow adding new groups, adding to groups, and removing from groups.
- Added in sorting to the admin UI to allow ordering groups to you're liking.

= 2.0.2 =
- Fixed an error where the plugin couldn't read the plugin data (I hope).
- Added, Multisite support. Multisite admins can now network active, manage each sites groups individually, or give full access to site to create their own groups.

= 2.0.1 =
- Fixed an error where on upgrade and have no presets, UI broke :(

= 2.0.0 =
- Completely rewritten from scratch for modern browsers and modern WordPress.

= 1.2.1 =
- WordPress 5.6 compatibility.

= 1.2.1 =
- Fixed warnings on activation.
- Fixed bulk action creation when no groups exist.

= 1.2.0 =
Added to Bulk Actions! You can now create and add plugins to groups via the Bulk Actions Dropdown.

= 1.1.3 =
Made editing of Group names more obvious.
Added Export and Import to easily share configs between sites
Added Presets for WooCommerce, Easy Digital Downloads, Ninja Forms and Gravity Forms.
Added Filter `plugin-groups-get-presets` to allow other plugins to register thier own preset groups
Added Keyword Grouping. This allows you to add keywords to a group and will automatically add plugins that match

= 1.0.3 =
Added a notice to confirming saved changes.

= 1.0.2 =
prefixed group slugs to prevent overiding built in status types.

= 1.0.1 =
Fixed issue on 4.2 with plugins having an update

= 1.0.0 =
Initial Version

== Upgrade Notice ==
Nothing to report
