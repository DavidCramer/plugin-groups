export interface PersistedGroup {
  id: string;
  name: string;
  plugins: string[];
  keywords: string[];
  color?: string;
}

export interface GroupUIState {
  open?: boolean;
  selected?: boolean;
  editing?: boolean;
  focusNameInput?: boolean;
  isTemp?: boolean;
  prevName?: string;
}
