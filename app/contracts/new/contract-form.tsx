'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createContractAction } from '../actions';
import type { BrokerInfo } from '@/lib/services/profiles';
import toast from 'react-hot-toast';

interface ContractFormProps {
  brokers: BrokerInfo[];
}

export default function ContractForm({ brokers }: ContractFormProps) {
  const router = useRouter();
  const [contractNumber, setContractNumber] = useState('');
  const [insuredName, setInsuredName] = useState('');
  const [coverageType, setCoverageType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [brokerCode, setBrokerCode] = useState('');
  const [sumInsured, setSumInsured] = useState('');
  const [additionalSiPercentage, setAdditionalSiPercentage] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
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
      const result = await createContractAction({
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
        toast.success('Contract created');
        router.push('/contracts');
      } else {
        setError(result.error || 'Failed to create contract');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
            disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <Label htmlFor="brokerCode">Broker</Label>
          <select
            id="brokerCode"
            value={brokerCode}
            onChange={(e) => setBrokerCode(e.target.value)}
            disabled={isLoading}
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
          {brokers.length === 0 && (
            <p className="mt-1 text-sm text-amber-600">
              No brokers available. Create a user with the broker role first.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
              required
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Extra percentage allowed above sum insured
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading || brokers.length === 0}>
            {isLoading ? 'Creating...' : 'Create Contract'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/contracts')}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
