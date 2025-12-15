import { jsPDF } from 'jspdf';
import type { CertificateWithContract } from '@/lib/types/certificate';

/**
 * Generate a PDF certificate document
 * @param certificate - Certificate data with contract info
 * @returns PDF as ArrayBuffer
 */
export function generateCertificatePDF(
  certificate: CertificateWithContract
): ArrayBuffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper functions
  const centerText = (text: string, yPos: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    doc.text(text, pageWidth / 2, yPos, { align: 'center' });
  };

  const addLabelValue = (
    label: string,
    value: string,
    yPos: number
  ): number => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 50, yPos);
    return yPos + 7;
  };

  const addSection = (title: string, yPos: number): number => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPos);
    doc.setFont('helvetica', 'normal');
    return yPos + 8;
  };

  // Header - Navy blue matching app theme (#1e3a5f)
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  centerText('CARGO INSURANCE CERTIFICATE', 20, 22);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  centerText(certificate.certificate_number, 32, 14);

  // Reset text color
  doc.setTextColor(0, 0, 0);
  y = 55;

  // Certificate Details Section
  y = addSection('Certificate Details', y);
  y = addLabelValue('Certificate No:', certificate.certificate_number, y);
  y = addLabelValue(
    'Issue Date:',
    formatDate(certificate.issue_date),
    y
  );
  y = addLabelValue('Contract No:', certificate.contract.contract_number, y);
  y = addLabelValue('Coverage Type:', certificate.contract.coverage_type, y);

  y += 5;

  // Insured Information Section
  y = addSection('Insured Information', y);
  y = addLabelValue('Insured Name:', certificate.insured_name, y);

  y += 5;

  // Cargo Details Section
  y = addSection('Cargo Details', y);

  // Handle multi-line cargo description
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Description:', margin, y);
  doc.setFont('helvetica', 'normal');

  const descriptionLines = doc.splitTextToSize(
    certificate.cargo_description,
    contentWidth - 50
  );
  doc.text(descriptionLines, margin + 50, y);
  y += Math.max(7, descriptionLines.length * 5) + 2;

  y = addLabelValue('Transport:', certificate.transport_means, y);

  y += 5;

  // Route Information Section
  y = addSection('Route Information', y);
  y = addLabelValue('Departure:', certificate.departure_country, y);
  y = addLabelValue('Arrival:', certificate.arrival_country, y);
  y = addLabelValue(
    'Loading Date:',
    formatDate(certificate.loading_date),
    y
  );

  y += 5;

  // Value Information Section
  y = addSection('Value Information', y);
  y = addLabelValue(
    'Local Value:',
    `${formatNumber(certificate.value_local)} ${certificate.currency}`,
    y
  );
  y = addLabelValue(
    'Value (EUR):',
    `${formatNumber(certificate.value_euro)} EUR`,
    y
  );
  y = addLabelValue(
    'Exchange Rate:',
    `1 ${certificate.currency} = ${certificate.exchange_rate.toFixed(6)} EUR`,
    y
  );

  y += 10;

  // Contract Validity Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, y, contentWidth, 25, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Contract Validity Period', margin + 5, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${formatDate(certificate.contract.start_date)} to ${formatDate(certificate.contract.end_date)}`,
    margin + 5,
    y + 14
  );
  doc.text(
    `Maximum Sum Insured: ${formatNumber(certificate.contract.sum_insured)} EUR (+${certificate.contract.additional_si_percentage}%)`,
    margin + 5,
    y + 21
  );

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  centerText(
    `Generated on ${new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}`,
    footerY,
    8
  );
  centerText(
    'This certificate is electronically generated and valid without signature.',
    footerY + 5,
    8
  );

  // Return as ArrayBuffer
  return doc.output('arraybuffer');
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format number with thousand separators
 */
function formatNumber(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
