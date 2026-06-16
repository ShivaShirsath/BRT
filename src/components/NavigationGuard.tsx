import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

interface NavigationGuardProps {
  isDirty: boolean;
}

export function NavigationGuard({ isDirty }: NavigationGuardProps) {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      if (isDirty) {
        // Stop the navigation
        window.history.pushState(null, '', window.location.pathname);
        setShowDialog(true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // We should push an initial state so we can detect the back button
    window.history.pushState(null, '', window.location.pathname);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty]);

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Discard Unsaved Changes?</DialogTitle>
          <DialogDescription>
            You have unsaved changes. Are you sure you want to leave this page?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Stay on Page
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setShowDialog(false);
              // Force navigation
              window.history.back();
            }}
          >
            Discard & Exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
