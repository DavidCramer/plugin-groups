import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
}

export function Modal({ title, onClose, children, widthClassName = 'w-96' }: ModalProps) {
  return (
    <div
      className="modal-bg fixed inset-0 z-50 flex items-center justify-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`bg-white rounded shadow-xl border border-gray-300 ${widthClassName}`}>
        <div className="bg-brand px-4 py-3 flex items-center justify-between rounded-t">
          <h2 className="text-white! p-0! m-0! font-semibold text-sm">{title}</h2>
          <button
            type="button"
            className="text-white/70 hover:text-white text-lg leading-none"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
