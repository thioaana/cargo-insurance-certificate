'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { deleteContractAction } from './actions';

interface ContractDeleteButtonProps {
  contractId: string;
  contractNumber: string;
}

export function ContractDeleteButton({
  contractId,
  contractNumber,
}: ContractDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete contract ${contractNumber}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteContractAction(contractId);
      if (result.success) {
        toast.success('Contract deleted');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete contract');
      }
    } catch {
      toast.error('Failed to delete contract');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
