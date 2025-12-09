import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentProfile } from '@/lib/services/profiles';
import { getAllContracts } from '@/lib/services/contracts';
import { Button } from '@/components/ui/button';
import { ContractDeleteButton } from './contract-delete-button';

export default async function ContractsPage() {
  // Defense-in-depth: verify admin role in page component
  const currentProfile = await getCurrentProfile();
  if (!currentProfile || currentProfile.role !== 'admin') {
    notFound();
  }

  let contracts;
  try {
    contracts = await getAllContracts();
  } catch {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Failed to load contracts</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contracts</h1>
        <Button asChild>
          <Link href="/contracts/new">New Contract</Link>
        </Button>
      </div>

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Contract #</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Insured Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Coverage</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Period</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Broker</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Sum Insured</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-mono text-sm">
                    {contract.contract_number}
                  </td>
                  <td className="px-4 py-3">{contract.insured_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {contract.coverage_type}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(contract.start_date).toLocaleDateString()} -{' '}
                    {new Date(contract.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {contract.broker_code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {contract.sum_insured.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/contracts/${contract.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <ContractDeleteButton
                        contractId={contract.id}
                        contractNumber={contract.contract_number}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No contracts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
