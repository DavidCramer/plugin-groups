import { PluginsColumn } from './PluginsColumn';
import { GroupsColumn } from './GroupsColumn';
import { PresetsColumn } from './PresetsColumn';

export function GroupsManagementTab() {
  return (
    <div className="flex flex-row gap-0 h-full overflow-hidden">
      <PluginsColumn />
      <GroupsColumn />
      <PresetsColumn />
    </div>
  );
}
