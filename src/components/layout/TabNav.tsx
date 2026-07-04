import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppState } from '@/state/context';

export function TabNav() {
  const { tab, config } = useAppState();
  const dispatch = useAppDispatch();
  const showMultisite = config.networkAdmin;

  const tabButtonClass = (isActive: boolean) =>
    isActive
      ? 'bg-brand text-white text-sm px-4 py-2 font-medium transition-colors'
      : 'text-white/70 text-sm px-4 py-2 hover:text-white transition-colors cursor-pointer';

  return (
    <div className="bg-brand-dark flex border-b border-brand-darker">
      <button type="button" className={tabButtonClass(tab === 1)} onClick={() => dispatch({ type: 'SET_TAB', tab: 1 })}>
        {__('Groups Management', 'plugin-groups')}
      </button>
      {showMultisite && (
        <button type="button" className={tabButtonClass(tab === 3)} onClick={() => dispatch({ type: 'SET_TAB', tab: 3 })}>
          {__('Multisite', 'plugin-groups')}
        </button>
      )}
      <button type="button" className={tabButtonClass(tab === 2)} onClick={() => dispatch({ type: 'SET_TAB', tab: 2 })}>
        {__('Settings', 'plugin-groups')}
      </button>
    </div>
  );
}
