import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckIcon, XIcon, AlertIcon } from './Icons';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-sky-500 text-white';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckIcon size={18} />;
      case 'error':
        return <XIcon size={18} />;
      case 'warning':
        return <AlertIcon size={18} />;
      default:
        return <AlertIcon size={18} />;
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-1 items-center pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-1 px-2 py-0.5 rounded shadow-md backdrop-blur-none animate-in fade-in slide-in-from-bottom-1 duration-200 pointer-events-auto border border-white/0 ${getToastStyles(toast.type)}`}
        >
          <div className="shrink-0 scale-[0.35] origin-center opacity-70">
            {getIcon(toast.type)}
          </div>
          <span className="text-[7.5px] font-black uppercase tracking-[0.25em] whitespace-nowrap leading-tight opacity-90">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-0.5 p-0 opacity-30 hover:opacity-100"
          >
            <XIcon size={5} />
          </button>
        </div>
      ))}
    </div>
  );
};
