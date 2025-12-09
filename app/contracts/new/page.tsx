import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentProfile, getAllBrokers } from '@/lib/services/profiles';
import ContractForm from './contract-form';

export default async function NewContractPage() {
  // Defense-in-depth: verify admin role in page component
  const currentProfile = await getCurrentProfile();
  if (!currentProfile || currentProfile.role !== 'admin') {
    notFound();
  }

  // Fetch brokers for dropdown
  const brokers = await getAllBrokers();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/contracts"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to Contracts
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold">New Contract</h1>

      <div className="rounded-lg border p-6">
        <ContractForm brokers={brokers} />
      </div>
    </div>
  );
}
