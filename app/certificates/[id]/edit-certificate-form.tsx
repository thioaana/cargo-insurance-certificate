'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateCertificateAction } from '../actions';
import type { Contract } from '@/lib/types/contract';
import type { CertificateWithContract } from '@/lib/types/certificate';
import type { CurrencyInfo } from '@/lib/services/currency';
import toast from 'react-hot-toast';

interface EditCertificateFormProps {
  certificate: CertificateWithContract;
  contracts: Contract[];
  currencies: CurrencyInfo[];
}

export function EditCertificateForm({
  certificate,
  contracts,
  currencies,
}: EditCertificateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state initialized with certificate values
  const [contractId, setContractId] = useState(certificate.contract_id);
  const [insuredName, setInsuredName] = useState(certificate.insured_name);
  const [cargoDescription, setCargoDescription] = useState(
    certificate.cargo_description
  );
  const [departureCountry, setDepartureCountry] = useState(
    certificate.departure_country
  );
  const [arrivalCountry, setArrivalCountry] = useState(certificate.arrival_country);
  const [transportMeans, setTransportMeans] = useState(certificate.transport_means);
  const [loadingDate, setLoadingDate] = useState(certificate.loading_date);
  const [currency, setCurrency] = useState(certificate.currency);
  const [valueLocal, setValueLocal] = useState(certificate.value_local.toString());
  const [issueDate, setIssueDate] = useState(certificate.issue_date);

  // Selected contract details for validation hints
  const selectedContract = contracts.find((c) => c.id === contractId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await updateCertificateAction(certificate.id, {
      contract_id: contractId,
      insured_name: insuredName,
      cargo_description: cargoDescription,
      departure_country: departureCountry,
      arrival_country: arrivalCountry,
      transport_means: transportMeans,
      loading_date: loadingDate,
      currency,
      value_local: parseFloat(valueLocal),
      issue_date: issueDate,
    });

    if (result.success) {
      toast.success('Certificate updated');
      router.push('/certificates');
    } else {
      setError(result.error || 'Failed to update certificate');
      toast.error(result.error || 'Failed to update certificate');
    }

    setIsSubmitting(false);
  };

  // Calculate max value for hints
  const maxValueEur = selectedContract
    ? selectedContract.sum_insured *
      (1 + selectedContract.additional_si_percentage / 100)
    : 0;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Certificate Number (read-only) */}
      <div className="space-y-2">
        <Label>Certificate Number</Label>
        <Input value={certificate.certificate_number} disabled />
      </div>

      {/* Contract Selection */}
      <div className="space-y-2">
        <Label htmlFor="contract">Contract *</Label>
        <select
          id="contract"
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          {contracts.map((contract) => (
            <option key={contract.id} value={contract.id}>
              {contract.contract_number} - {contract.insured_name}
            </option>
          ))}
        </select>
        {selectedContract && (
          <p className="text-xs text-muted-foreground">
            Valid: {selectedContract.start_date} to {selectedContract.end_date} |
            Max value: {maxValueEur.toLocaleString('en-US', { minimumFractionDigits: 2 })} EUR
          </p>
        )}
      </div>

      {/* Insured Name */}
      <div className="space-y-2">
        <Label htmlFor="insuredName">Insured Name *</Label>
        <Input
          id="insuredName"
          value={insuredName}
          onChange={(e) => setInsuredName(e.target.value)}
          required
        />
      </div>

      {/* Cargo Description */}
      <div className="space-y-2">
        <Label htmlFor="cargoDescription">Cargo Description *</Label>
        <textarea
          id="cargoDescription"
          value={cargoDescription}
          onChange={(e) => setCargoDescription(e.target.value)}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        />
      </div>

      {/* Route */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="departureCountry">Departure Country *</Label>
          <Input
            id="departureCountry"
            value={departureCountry}
            onChange={(e) => setDepartureCountry(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrivalCountry">Arrival Country *</Label>
          <Input
            id="arrivalCountry"
            value={arrivalCountry}
            onChange={(e) => setArrivalCountry(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Transport Means */}
      <div className="space-y-2">
        <Label htmlFor="transportMeans">Transport Means *</Label>
        <Input
          id="transportMeans"
          value={transportMeans}
          onChange={(e) => setTransportMeans(e.target.value)}
          placeholder="e.g., Sea freight, Air freight, Road transport"
          required
        />
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="loadingDate">Loading Date *</Label>
          <Input
            id="loadingDate"
            type="date"
            value={loadingDate}
            onChange={(e) => setLoadingDate(e.target.value)}
            min={selectedContract?.start_date}
            max={selectedContract?.end_date}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="issueDate">Issue Date *</Label>
          <Input
            id="issueDate"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Currency and Value */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          >
            {currencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.code} - {curr.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="valueLocal">Value ({currency}) *</Label>
          <Input
            id="valueLocal"
            type="number"
            step="0.01"
            min="0"
            value={valueLocal}
            onChange={(e) => setValueLocal(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Current exchange info (read-only) */}
      <div className="rounded-lg border bg-muted/50 p-3 text-sm">
        <p className="text-muted-foreground">
          Current stored values: {certificate.value_euro.toFixed(2)} EUR at rate{' '}
          {certificate.exchange_rate.toFixed(6)}
        </p>
        <p className="text-xs text-muted-foreground">
          Exchange rate will be updated on save if currency or value changes.
        </p>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
