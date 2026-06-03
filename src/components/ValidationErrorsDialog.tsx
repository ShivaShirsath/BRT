import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface ValidationErrorsDialogProps {
  open: boolean;
  onClose: () => void;
  errors: string[];
}

function ErrorIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-destructive shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function ValidationErrorsDialog({ open, onClose, errors }: ValidationErrorsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="sm:max-w-[600px] border-destructive/20 shadow-destructive/5">
        <DialogHeader className="border-b pb-4 flex flex-row items-center space-x-3 space-y-0">
          <ErrorIcon size={32} />
          <DialogTitle className="text-xl font-bold text-destructive">
            Validation Failed
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <DialogDescription className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Please correct the following issues before saving:
          </DialogDescription>
          <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {errors.map((err, idx) => (
              <li key={idx} className="flex items-start text-sm text-slate-700 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-destructive mt-1.5 mr-2 shrink-0" />
                <span>{err}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="destructive" onClick={onClose} className="px-6">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
