import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/services/profiles';
import { getAvailableContracts } from '@/lib/services/certificates';
import { getAvailableCurrencies } from '@/lib/services/currency';
import { CertificateForm } from './certificate-form';

export default async function NewCertificatePage() {
  const currentProfile = await getCurrentProfile();
  if (!currentProfile) {
    redirect('/auth/login');
  }

  let contracts;
  let currencies;

  try {
    [contracts, currencies] = await Promise.all([
      getAvailableContracts(),
      getAvailableCurrencies(),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load data';
    // If currency API is down, block certificate creation
    if (message.includes('Currency')) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-6 text-2xl font-bold">New Certificate</h1>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-700 dark:text-red-400">
              Currency service is currently unavailable. Please try again later.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">{message}</p>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">New Certificate</h1>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <p className="text-yellow-700 dark:text-yellow-400">
            No contracts available. {currentProfile.role === 'admin'
              ? 'Please create a contract first.'
              : 'Please contact an administrator to assign contracts to your broker code.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">New Certificate</h1>
      <CertificateForm contracts={contracts} currencies={currencies} />
    </div>
  );
}
