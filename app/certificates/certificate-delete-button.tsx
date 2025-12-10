'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { deleteCertificateAction } from './actions';
import toast from 'react-hot-toast';

interface CertificateDeleteButtonProps {
  certificateId: string;
  certificateNumber: string;
}

export function CertificateDeleteButton({
  certificateId,
  certificateNumber,
}: CertificateDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteCertificateAction(certificateId);

    if (result.success) {
      toast.success('Certificate deleted');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to delete certificate');
    }

    setIsDeleting(false);
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Confirm'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-sm text-destructive hover:underline"
    >
      Delete
    </button>
  );
}
