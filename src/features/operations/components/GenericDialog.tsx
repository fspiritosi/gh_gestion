import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import React from 'react';

interface GenericDialogProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const GenericDialog: React.FC<GenericDialogProps> = ({ title, description, isOpen, onClose, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[30vw] max-w-[97vw] w-auto">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        {children}
        <DialogClose asChild>
          {/* <Button variant="outline" onClick={onClose}>
        Cerrar
          </Button> */}
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default GenericDialog;
