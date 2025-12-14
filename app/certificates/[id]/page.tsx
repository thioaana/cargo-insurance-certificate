import { notFound, redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/services/profiles';
import { getCertificate, getAvailableContracts } from '@/lib/services/certificates';
import { getAvailableCurrencies } from '@/lib/services/currency';
import { EditCertificateForm } from './edit-certificate-form';
import { PDFDownloadButton } from '@/components/pdf-download-button';

interface EditCertificatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCertificatePage({
  params,
}: EditCertificatePageProps) {
  const { id } = await params;

  const currentProfile = await getCurrentProfile();
  if (!currentProfile) {
    redirect('/auth/login');
  }

  let certificate;
  let contracts;
  let currencies;

  try {
    [certificate, contracts, currencies] = await Promise.all([
      getCertificate(id),
      getAvailableContracts(),
      getAvailableCurrencies(),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load data';
    if (message.includes('Unauthorized')) {
      notFound();
    }
    if (message.includes('Currency')) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-6 text-2xl font-bold">Edit Certificate</h1>
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

  if (!certificate) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Edit Certificate: {certificate.certificate_number}
        </h1>
        <PDFDownloadButton
          certificateId={certificate.id}
          certificateNumber={certificate.certificate_number}
          variant="default"
          size="default"
        />
      </div>
      <EditCertificateForm
        certificate={certificate}
        contracts={contracts}
        currencies={currencies}
      />
    </div>
  );
}
