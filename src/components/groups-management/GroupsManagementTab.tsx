import { PluginsColumn } from './PluginsColumn';
import { GroupsColumn } from './GroupsColumn';
import { PresetsColumn } from './PresetsColumn';

/**
 * The "Groups Management" tab: a three-column layout of all installed plugins,
 * the user's groups, and available presets, side by side. Each column manages
 * its own local UI state; shared data lives in the app-level config/reducer.
 */
export function GroupsManagementTab() {
  return (
    <div className="flex flex-row gap-0 h-full overflow-hidden">
      <PluginsColumn />
      <GroupsColumn />
      <PresetsColumn />
    </div>
  );
}
