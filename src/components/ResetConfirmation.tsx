
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UseDisclosureReturn } from '@/components/ui/use-disclosure';

interface ResetConfirmationProps {
  disclosure: UseDisclosureReturn;
  onClearAll: () => void;
}

const ResetConfirmation: React.FC<ResetConfirmationProps> = ({
  disclosure,
  onClearAll
}) => {
  const handleConfirm = () => {
    onClearAll();
    disclosure.onClose();
  };

  return (
    <Dialog open={disclosure.isOpen} onOpenChange={disclosure.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Floor Plan</DialogTitle>
          <DialogDescription>
            Are you sure you want to clear all items from the canvas? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button variant="outline" onClick={disclosure.onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Clear All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetConfirmation;
