'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateContractAction, deleteContractAction } from '../actions';
import type { Contract } from '@/lib/types/contract';
import type { BrokerInfo } from '@/lib/services/profiles';
import toast from 'react-hot-toast';

interface EditContractFormProps {
  contract: Contract;
  brokers: BrokerInfo[];
}

export default function EditContractForm({
  contract,
  brokers,
}: EditContractFormProps) {
  const router = useRouter();
  const [contractNumber, setContractNumber] = useState(contract.contract_number);
  const [insuredName, setInsuredName] = useState(contract.insured_name);
  const [coverageType, setCoverageType] = useState(contract.coverage_type);
  const [startDate, setStartDate] = useState(contract.start_date);
  const [endDate, setEndDate] = useState(contract.end_date);
  const [brokerCode, setBrokerCode] = useState(contract.broker_code);
  const [sumInsured, setSumInsured] = useState(contract.sum_insured.toString());
  const [additionalSiPercentage, setAdditionalSiPercentage] = useState(
    contract.additional_si_percentage.toString()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const sumValue = parseFloat(sumInsured);
    const additionalSiValue = parseFloat(additionalSiPercentage);

    if (isNaN(sumValue) || sumValue <= 0) {
      setError('Sum insured must be a valid positive number');
      setIsLoading(false);
      return;
    }

    if (isNaN(additionalSiValue) || additionalSiValue < 0) {
      setError('Additional SI percentage must be a valid non-negative number');
      setIsLoading(false);
      return;
    }

    try {
      const result = await updateContractAction(contract.id, {
        contract_number: contractNumber,
        insured_name: insuredName,
        coverage_type: coverageType,
        start_date: startDate,
        end_date: endDate,
        broker_code: brokerCode,
        sum_insured: sumValue,
        additional_si_percentage: additionalSiValue,
      });

      if (result.success) {
        toast.success('Contract updated');
        router.push('/contracts');
      } else {
        setError(result.error || 'Failed to update contract');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete contract ${contract.contract_number}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteContractAction(contract.id);
      if (result.success) {
        toast.success('Contract deleted');
        router.push('/contracts');
      } else {
        toast.error(result.error || 'Failed to delete contract');
      }
    } catch {
      toast.error('Failed to delete contract');
    } finally {
      setIsDeleting(false);
    }
  };

  const isSubmitting = isLoading || isDeleting;

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="contractNumber">Contract Number</Label>
          <Input
            id="contractNumber"
            type="text"
            value={contractNumber}
            onChange={(e) => setContractNumber(e.target.value)}
            placeholder="e.g., CON-2024-001"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <Label htmlFor="insuredName">Insured Name</Label>
          <Input
            id="insuredName"
            type="text"
            value={insuredName}
            onChange={(e) => setInsuredName(e.target.value)}
            placeholder="Enter insured name"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <Label htmlFor="coverageType">Coverage Type</Label>
          <Input
            id="coverageType"
            type="text"
            value={coverageType}
            onChange={(e) => setCoverageType(e.target.value)}
            placeholder="e.g., All Risks, Named Perils"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <Label htmlFor="brokerCode">Broker</Label>
          <select
            id="brokerCode"
            value={brokerCode}
            onChange={(e) => setBrokerCode(e.target.value)}
            disabled={isSubmitting}
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a broker...</option>
            {brokers.map((broker) => (
              <option key={broker.id} value={broker.broker_code}>
                {broker.broker_code}
                {broker.full_name ? ` - ${broker.full_name}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sumInsured">Sum Insured</Label>
            <Input
              id="sumInsured"
              type="number"
              step="0.01"
              min="0.01"
              value={sumInsured}
              onChange={(e) => setSumInsured(e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <Label htmlFor="additionalSiPercentage">Additional SI %</Label>
            <Input
              id="additionalSiPercentage"
              type="number"
              step="0.01"
              min="0"
              value={additionalSiPercentage}
              onChange={(e) => setAdditionalSiPercentage(e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting}
              required
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Extra percentage allowed above sum insured
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/contracts')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Contract'}
          </Button>
        </div>
      </div>
    </form>
  );
}
