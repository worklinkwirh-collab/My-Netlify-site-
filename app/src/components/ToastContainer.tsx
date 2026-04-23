import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast } from '@/types';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-[#2A9D8F]',
  error: 'bg-[#E63946]',
  warning: 'bg-amber-500',
  info: 'bg-[#3A86FF]',
};

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 text-white ${colors[toast.type]} shadow-lg min-w-[300px] max-w-md`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm flex-1">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
