import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete Task',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
          id="confirm-cancel-btn"
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
          id="confirm-action-btn"
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
