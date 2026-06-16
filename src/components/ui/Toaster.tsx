import { useToastStore } from "../../store/toastStore";
import type { ToastType } from "../../store/toastStore";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  error: <AlertCircle className="h-5 w-5 text-destructive" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
};

const bgColors: Record<ToastType, string> = {
  success: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-500/30",
  error: "bg-destructive/10 border-destructive/20 dark:bg-destructive/20",
  info: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-500/30",
  warning: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-500/30",
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full duration-300",
            bgColors[toast.type]
          )}
        >
          <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1 text-sm font-medium text-foreground">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
