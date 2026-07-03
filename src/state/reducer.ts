import type { Config } from '@/types/config';
import type { GroupUIState, PersistedGroup } from '@/types/group';
import { getOrderedGroupIds, getShiftedGroupId } from './selectors';

export interface Toast {
  id: number;
  message: string;
  variant: 'success' | 'error';
}

export interface GroupModalState {
  mode: 'create' | 'rename';
  groupId: string | null;
}

export interface AppState {
  config: Config;
  groupUI: Record<string, GroupUIState>;
  activeGroupId: string | null;
  tab: 0 | 1 | 2 | 3;
  isDirty: boolean;
  isSaving: boolean;
  isLoadingSite: boolean;
  toast: Toast | null;
  sendModalOpen: boolean;
  groupModal: GroupModalState | null;
}

export type Action =
  | { type: 'SET_TAB'; tab: 0 | 1 | 2 | 3 }
  | { type: 'REPLACE_CONFIG'; config: Config }
  | { type: 'CREATE_GROUP'; id: string; name: string }
  | { type: 'START_RENAME_GROUP'; ids: string[] }
  | { type: 'CHANGE_GROUP_NAME'; id: string; name: string }
  | { type: 'SET_GROUP_COLOR'; id: string; color: string }
  | { type: 'COMMIT_GROUP_NAME'; id: string }
  | { type: 'REVERT_GROUP_NAME'; id: string }
  | { type: 'DELETE_GROUPS'; ids: string[] }
  | { type: 'TOGGLE_GROUP_OPEN'; id: string }
  | { type: 'SET_GROUPS_OPEN'; ids: string[]; open: boolean }
  | { type: 'SELECT_GROUPS'; ids: string[]; selected: boolean }
  | { type: 'SELECT_ADJACENT_GROUP'; direction: 'next' | 'prev'; extend: boolean }
  | { type: 'REORDER_GROUPS'; orderedIds: string[] }
  | { type: 'ADD_PLUGINS_TO_GROUPS'; groupIds: string[]; pluginFiles: string[] }
  | { type: 'REMOVE_PLUGINS_FROM_GROUP'; groupId: string; pluginFiles: string[] }
  | { type: 'MOVE_PLUGIN_BETWEEN_GROUPS'; pluginFile: string; fromGroupId: string | null; toGroupId: string }
  | { type: 'ADD_KEYWORD'; groupId: string; keyword: string }
  | { type: 'REMOVE_KEYWORD'; groupId: string; keyword: string }
  | { type: 'AUTO_ASSIGN_BY_KEYWORDS'; groupId: string }
  | { type: 'TOGGLE_PRESET'; presetName: string }
  | { type: 'SET_PARAM'; param: keyof Config['params']; value: unknown }
  | { type: 'SET_SITE_ACCESS'; ids: number[]; enabled: boolean }
  | { type: 'IMPORT_GROUPS'; groups: Record<string, PersistedGroup> }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; message: string }
  | { type: 'LOAD_SITE_START' }
  | { type: 'LOAD_SITE_ERROR'; message: string }
  | { type: 'SHOW_TOAST'; message: string; variant: 'success' | 'error' }
  | { type: 'HIDE_TOAST' }
  | { type: 'OPEN_SEND_MODAL' }
  | { type: 'CLOSE_SEND_MODAL' }
  | { type: 'OPEN_GROUP_MODAL'; mode: 'create' | 'rename'; groupId?: string | null }
  | { type: 'CLOSE_GROUP_MODAL' };

function sanitizeGroups(rawGroups: Record<string, unknown> | undefined): Record<string, PersistedGroup> {
  const groups: Record<string, PersistedGroup> = {};
  Object.keys(rawGroups || {}).forEach((id) => {
    if (id === '__ungrouped') {
      return;
    }
    const raw = (rawGroups as Record<string, Partial<PersistedGroup>>)[id];
    groups[id] = {
      id: raw.id ?? id,
      name: raw.name ?? '',
      plugins: Array.isArray(raw.plugins) ? raw.plugins : [],
      keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
      color: typeof raw.color === 'string' ? raw.color : undefined,
    };
  });
  return groups;
}

function buildGroupUI(groups: Record<string, PersistedGroup>): Record<string, GroupUIState> {
  const groupUI: Record<string, GroupUIState> = {};
  Object.keys(groups).forEach((id) => {
    groupUI[id] = {};
  });
  return groupUI;
}

const DEFAULT_PARAMS: Config['params'] = {
  legacyGrouping: false,
  navStyle: 'subsubsub',
  menuGroups: false,
  showUngrouped: false,
};

function normalizeConfig(config: Config): Config {
  return {
    ...config,
    groups: sanitizeGroups(config.groups as unknown as Record<string, unknown>),
    plugins: config.plugins ?? {},
    presets: config.presets ?? [],
    preset_groups: config.preset_groups ?? {},
    selectedPresets: config.selectedPresets ?? [],
    params: { ...DEFAULT_PARAMS, ...config.params },
    sitesEnabled: config.sitesEnabled ?? [],
  };
}

let toastCounter = 0;

function makeToast(message: string, variant: 'success' | 'error'): Toast {
  toastCounter += 1;
  return { id: toastCounter, message, variant };
}

export function init(config: Config): AppState {
  const normalized = normalizeConfig(config);
  return {
    config: normalized,
    groupUI: buildGroupUI(normalized.groups),
    activeGroupId: null,
    tab: 1,
    isDirty: false,
    isSaving: false,
    isLoadingSite: false,
    toast: null,
    sendModalOpen: false,
    groupModal: null,
  };
}

function clearSelectionFlags(ui: GroupUIState): GroupUIState {
  return { ...ui, open: undefined, editing: undefined, focusNameInput: undefined };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, tab: action.tab };

    case 'REPLACE_CONFIG': {
      const normalized = normalizeConfig(action.config);
      return {
        ...state,
        config: normalized,
        groupUI: buildGroupUI(normalized.groups),
        activeGroupId: null,
        tab: 1,
        isDirty: false,
        isSaving: false,
        isLoadingSite: false,
        sendModalOpen: false,
        groupModal: null,
      };
    }

    case 'CREATE_GROUP': {
      const group: PersistedGroup = { id: action.id, name: action.name, plugins: [], keywords: [] };
      return {
        ...state,
        config: {
          ...state.config,
          groups: { ...state.config.groups, [action.id]: group },
        },
        groupUI: {
          ...state.groupUI,
          [action.id]: { selected: true, editing: true, focusNameInput: true, isTemp: true },
        },
        activeGroupId: action.id,
        isDirty: true,
      };
    }

    case 'START_RENAME_GROUP': {
      const groupUI = { ...state.groupUI };
      let focused = false;
      action.ids.forEach((id) => {
        const current = groupUI[id] ?? {};
        const prevName = current.prevName ?? state.config.groups[id]?.name;
        groupUI[id] = {
          ...current,
          selected: true,
          editing: true,
          prevName,
          focusNameInput: !focused,
        };
        focused = true;
      });
      return { ...state, groupUI };
    }

    case 'CHANGE_GROUP_NAME': {
      const group = state.config.groups[action.id];
      if (!group) {
        return state;
      }
      return {
        ...state,
        config: {
          ...state.config,
          groups: {
            ...state.config.groups,
            [action.id]: { ...group, name: action.name },
          },
        },
        isDirty: true,
      };
    }

    case 'SET_GROUP_COLOR': {
      const group = state.config.groups[action.id];
      if (!group) {
        return state;
      }
      return {
        ...state,
        config: {
          ...state.config,
          groups: {
            ...state.config.groups,
            [action.id]: { ...group, color: action.color },
          },
        },
        isDirty: true,
      };
    }

    case 'COMMIT_GROUP_NAME': {
      const group = state.config.groups[action.id];
      const ui = state.groupUI[action.id];
      if (!group || !ui) {
        return state;
      }
      if (group.name.trim().length === 0) {
        return { ...state, groupUI: { ...state.groupUI, [action.id]: { ...ui, focusNameInput: true } } };
      }
      const keepSelected = !!ui.open;
      return {
        ...state,
        groupUI: {
          ...state.groupUI,
          [action.id]: {
            ...ui,
            editing: undefined,
            focusNameInput: undefined,
            isTemp: undefined,
            prevName: undefined,
            selected: keepSelected,
          },
        },
      };
    }

    case 'REVERT_GROUP_NAME': {
      const ui = state.groupUI[action.id];
      if (!ui) {
        return state;
      }
      if (ui.isTemp) {
        const groups = { ...state.config.groups };
        delete groups[action.id];
        const groupUI = { ...state.groupUI };
        delete groupUI[action.id];
        return { ...state, config: { ...state.config, groups }, groupUI };
      }
      const group = state.config.groups[action.id];
      const restoredName = ui.prevName ?? group?.name ?? '';
      return {
        ...state,
        config: {
          ...state.config,
          groups: {
            ...state.config.groups,
            [action.id]: { ...group, name: restoredName },
          },
        },
        groupUI: {
          ...state.groupUI,
          [action.id]: {
            ...ui,
            editing: undefined,
            focusNameInput: undefined,
            selected: undefined,
            open: undefined,
            prevName: undefined,
          },
        },
      };
    }

    case 'DELETE_GROUPS': {
      const groups = { ...state.config.groups };
      const groupUI = { ...state.groupUI };
      action.ids.forEach((id) => {
        delete groups[id];
        delete groupUI[id];
      });
      return {
        ...state,
        config: { ...state.config, groups },
        groupUI,
        activeGroupId: action.ids.includes(state.activeGroupId ?? '') ? null : state.activeGroupId,
        isDirty: true,
      };
    }

    case 'TOGGLE_GROUP_OPEN': {
      const ui = state.groupUI[action.id] ?? {};
      return {
        ...state,
        groupUI: {
          ...state.groupUI,
          [action.id]: { ...ui, open: !ui.open},
        },
        activeGroupId: action.id,
      };
    }

    case 'SET_GROUPS_OPEN': {
      const groupUI = { ...state.groupUI };
      action.ids.forEach((id) => {
        groupUI[id] = { ...(groupUI[id] ?? {}), open: action.open };
      });
      return { ...state, groupUI };
    }

    case 'SELECT_GROUPS': {
      const groupUI = { ...state.groupUI };
      let activeGroupId = state.activeGroupId;
      action.ids.forEach((id) => {
        const current = groupUI[id] ?? {};
        groupUI[id] = action.selected ? { ...current, selected: true } : clearSelectionFlags({ ...current, selected: false });
        activeGroupId = id;
      });
      return { ...state, groupUI, activeGroupId };
    }

    case 'SELECT_ADJACENT_GROUP': {
      const ids = getOrderedGroupIds(state.config);
      let groupUI = state.groupUI;
      if (!action.extend) {
        groupUI = { ...groupUI };
        ids.forEach((id) => {
          groupUI[id] = clearSelectionFlags({ ...(groupUI[id] ?? {}), selected: false });
        });
      }
      const nextId = getShiftedGroupId(ids, state.activeGroupId, action.direction);
      if (!nextId) {
        return { ...state, groupUI };
      }
      groupUI = { ...groupUI, [nextId]: { ...(groupUI[nextId] ?? {}), selected: true } };
      return { ...state, groupUI, activeGroupId: nextId };
    }

    case 'REORDER_GROUPS': {
      const groups: Record<string, PersistedGroup> = {};
      action.orderedIds.forEach((id) => {
        if (state.config.groups[id]) {
          groups[id] = state.config.groups[id];
        }
      });
      return { ...state, config: { ...state.config, groups }, isDirty: true };
    }

    case 'ADD_PLUGINS_TO_GROUPS': {
      const groups = { ...state.config.groups };
      action.groupIds.forEach((groupId) => {
        const group = groups[groupId];
        if (!group) {
          return;
        }
        const plugins = [...group.plugins];
        action.pluginFiles.forEach((file) => {
          if (!plugins.includes(file)) {
            plugins.push(file);
          }
        });
        groups[groupId] = { ...group, plugins };
      });
      return { ...state, config: { ...state.config, groups }, isDirty: true };
    }

    case 'REMOVE_PLUGINS_FROM_GROUP': {
      const group = state.config.groups[action.groupId];
      if (!group) {
        return state;
      }
      const plugins = group.plugins.filter((file) => !action.pluginFiles.includes(file));
      return {
        ...state,
        config: {
          ...state.config,
          groups: { ...state.config.groups, [action.groupId]: { ...group, plugins } },
        },
        isDirty: true,
      };
    }

    case 'MOVE_PLUGIN_BETWEEN_GROUPS': {
      const groups = { ...state.config.groups };
      if (action.fromGroupId && action.fromGroupId !== action.toGroupId && groups[action.fromGroupId]) {
        groups[action.fromGroupId] = {
          ...groups[action.fromGroupId],
          plugins: groups[action.fromGroupId].plugins.filter((file) => file !== action.pluginFile),
        };
      }
      const target = groups[action.toGroupId];
      if (!target) {
        return state;
      }
      if (!target.plugins.includes(action.pluginFile)) {
        groups[action.toGroupId] = { ...target, plugins: [...target.plugins, action.pluginFile] };
      }
      return {
        ...state,
        config: { ...state.config, groups },
        groupUI: {
          ...state.groupUI,
          [action.toGroupId]: { ...(state.groupUI[action.toGroupId] ?? {}), open: true },
        },
        isDirty: true,
      };
    }

    case 'ADD_KEYWORD': {
      const group = state.config.groups[action.groupId];
      const keyword = action.keyword.trim();
      if (!group || !keyword || group.keywords.includes(keyword)) {
        return state;
      }
      return {
        ...state,
        config: {
          ...state.config,
          groups: {
            ...state.config.groups,
            [action.groupId]: { ...group, keywords: [...group.keywords, keyword] },
          },
        },
        isDirty: true,
      };
    }

    case 'REMOVE_KEYWORD': {
      const group = state.config.groups[action.groupId];
      if (!group) {
        return state;
      }
      return {
        ...state,
        config: {
          ...state.config,
          groups: {
            ...state.config.groups,
            [action.groupId]: {
              ...group,
              keywords: group.keywords.filter((keyword) => keyword !== action.keyword),
            },
          },
        },
        isDirty: true,
      };
    }

    case 'AUTO_ASSIGN_BY_KEYWORDS': {
      const group = state.config.groups[action.groupId];
      if (!group || group.keywords.length === 0) {
        return state;
      }
      const keywords = group.keywords.map((keyword) => keyword.toLowerCase());
      const claimed = new Set<string>();
      Object.values(state.config.groups).forEach((g) => {
        g.plugins.forEach((file) => claimed.add(file));
      });
      const newPlugins: string[] = [];
      Object.entries(state.config.plugins).forEach(([file, meta]) => {
        if (claimed.has(file)) {
          return;
        }
        const pluginString = Object.values(meta)
          .filter((value): value is string => typeof value === 'string')
          .join(' ')
          .toLowerCase();
        if (keywords.some((keyword) => pluginString.includes(keyword))) {
          newPlugins.push(file);
        }
      });
      if (newPlugins.length === 0) {
        return { ...state, toast: makeToast('No new matching plugins found', 'success') };
      }
      return {
        ...state,
        config: {
          ...state.config,
          groups: {
            ...state.config.groups,
            [action.groupId]: { ...group, plugins: [...group.plugins, ...newPlugins] },
          },
        },
        isDirty: true,
        toast: makeToast(`Added ${newPlugins.length} matching plugin(s)`, 'success'),
      };
    }

    case 'TOGGLE_PRESET': {
      const selectedPresets = state.config.selectedPresets.includes(action.presetName)
        ? state.config.selectedPresets.filter((name) => name !== action.presetName)
        : [...state.config.selectedPresets, action.presetName];
      return { ...state, config: { ...state.config, selectedPresets }, isDirty: true };
    }

    case 'SET_PARAM': {
      return {
        ...state,
        config: {
          ...state.config,
          params: { ...state.config.params, [action.param]: action.value },
        },
        isDirty: true,
      };
    }

    case 'SET_SITE_ACCESS': {
      const current = state.config.sitesEnabled ?? [];
      const sitesEnabled = action.enabled
        ? Array.from(new Set([...current, ...action.ids]))
        : current.filter((id) => !action.ids.includes(id));
      return { ...state, config: { ...state.config, sitesEnabled }, isDirty: true };
    }

    case 'IMPORT_GROUPS': {
      return {
        ...state,
        config: { ...state.config, groups: action.groups },
        groupUI: buildGroupUI(action.groups),
        isDirty: true,
      };
    }

    case 'SAVE_START':
      return { ...state, isSaving: true };

    case 'SAVE_SUCCESS':
      return { ...state, isSaving: false, isDirty: false, toast: makeToast('Settings saved', 'success') };

    case 'SAVE_ERROR':
      return { ...state, isSaving: false, toast: makeToast(action.message, 'error') };

    case 'LOAD_SITE_START':
      return { ...state, isLoadingSite: true, tab: 0 };

    case 'LOAD_SITE_ERROR':
      return { ...state, isLoadingSite: false, tab: 1, toast: makeToast(action.message, 'error') };

    case 'SHOW_TOAST':
      return { ...state, toast: makeToast(action.message, action.variant) };

    case 'HIDE_TOAST':
      return { ...state, toast: null };

    case 'OPEN_SEND_MODAL':
      return { ...state, sendModalOpen: true };

    case 'CLOSE_SEND_MODAL':
      return { ...state, sendModalOpen: false };

    case 'OPEN_GROUP_MODAL':
      return { ...state, groupModal: { mode: action.mode, groupId: action.groupId ?? null } };

    case 'CLOSE_GROUP_MODAL':
      return { ...state, groupModal: null };

    default:
      return state;
  }
}
