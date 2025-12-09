import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentProfile, getAllBrokers } from '@/lib/services/profiles';
import { getContract } from '@/lib/services/contracts';
import EditContractForm from './edit-contract-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContractPage({ params }: PageProps) {
  const { id } = await params;

  // Defense-in-depth: verify admin role in page component
  const currentProfile = await getCurrentProfile();
  if (!currentProfile || currentProfile.role !== 'admin') {
    notFound();
  }

  // Fetch contract and brokers
  const contract = await getContract(id);
  if (!contract) {
    notFound();
  }

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

      <h1 className="mb-6 text-2xl font-bold">Edit Contract</h1>

      <div className="mb-4 rounded-lg border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">Contract ID</p>
        <p className="font-mono text-sm">{contract.id}</p>
      </div>

      <div className="rounded-lg border p-6">
        <EditContractForm contract={contract} brokers={brokers} />
      </div>
    </div>
  );
}
