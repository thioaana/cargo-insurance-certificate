import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/services/profiles';
import { getCertificates } from '@/lib/services/certificates';
import { Button } from '@/components/ui/button';
import { CertificateDeleteButton } from './certificate-delete-button';

export default async function CertificatesPage() {
  const currentProfile = await getCurrentProfile();
  if (!currentProfile) {
    redirect('/auth/login');
  }

  const isAdmin = currentProfile.role === 'admin';

  let certificates;
  try {
    certificates = await getCertificates();
  } catch {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">Failed to load certificates</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isAdmin ? 'All Certificates' : 'My Certificates'}
        </h1>
        <Button asChild>
          <Link href="/certificates/new">New Certificate</Link>
        </Button>
      </div>

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Certificate #</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Contract</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Insured</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Route</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Loading Date</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Value (EUR)</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((certificate) => (
                <tr key={certificate.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-mono text-sm">
                    {certificate.certificate_number}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {certificate.contract.contract_number}
                    </span>
                  </td>
                  <td className="px-4 py-3">{certificate.insured_name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {certificate.departure_country} → {certificate.arrival_country}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(certificate.loading_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {certificate.value_euro.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/certificates/${certificate.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <CertificateDeleteButton
                        certificateId={certificate.id}
                        certificateNumber={certificate.certificate_number}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {certificates.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No certificates found
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
