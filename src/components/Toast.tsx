import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

// Simple global toast state
let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];

function notify(listeners: typeof toastListeners) {
  listeners.forEach((fn) => fn([...toasts]));
}

export function toast(type: ToastType, message: string) {
  const id = Date.now().toString() + Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, type, message }];
  notify(toastListeners);

  // Auto-dismiss after 5s
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify(toastListeners);
  }, 5000);
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify(toastListeners);
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: 'border-green-500/30 bg-green-500/10 text-green-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  info: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
};

export function ToastContainer() {
  const [current, setCurrent] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListeners.push(setCurrent);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setCurrent);
    };
  }, []);

  if (current.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {current.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm animate-[slideIn_0.2s_ease-out] ${colors[t.type]}`}
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-sm flex-1">{t.message}</span>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-zinc-500 hover:text-zinc-300 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
