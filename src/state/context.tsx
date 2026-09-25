import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { Config } from '@/types/config';
import { init, reducer, type Action, type AppState } from './reducer';

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ initialConfig, children }: { initialConfig: Config; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialConfig, init);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState/useAppDispatch must be used within an AppProvider');
  }
  return context;
}

export function useAppState(): AppState {
  return useAppContext().state;
}

export function useAppDispatch(): Dispatch<Action> {
  return useAppContext().dispatch;
}
