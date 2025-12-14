import { describe, it, expect } from 'vitest';
import { generateCertificatePDF } from '@/lib/pdf/certificate-pdf';
import type { CertificateWithContract } from '@/lib/types/certificate';

// Mock certificate data for testing
const mockCertificate: CertificateWithContract = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  certificate_number: 'CERT-2025-0001',
  contract_id: '123e4567-e89b-12d3-a456-426614174001',
  insured_name: 'Test Company Ltd',
  cargo_description: 'Electronic equipment and computer parts',
  departure_country: 'Germany',
  arrival_country: 'Greece',
  transport_means: 'Sea Freight',
  loading_date: '2025-01-15',
  currency: 'USD',
  value_local: 50000,
  value_euro: 45000,
  exchange_rate: 0.9,
  issue_date: '2025-01-10',
  created_by: '123e4567-e89b-12d3-a456-426614174002',
  created_at: '2025-01-10T10:00:00Z',
  updated_at: '2025-01-10T10:00:00Z',
  contract: {
    contract_number: 'CON-2025-001',
    insured_name: 'Test Company Ltd',
    coverage_type: 'All Risk',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    broker_code: 'BRK001',
    sum_insured: 1000000,
    additional_si_percentage: 10,
  },
};

describe('generateCertificatePDF', () => {
  it('should generate a PDF buffer', () => {
    const result = generateCertificatePDF(mockCertificate);

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBeGreaterThan(0);
  });

  it('should generate a valid PDF (starts with PDF magic bytes)', () => {
    const result = generateCertificatePDF(mockCertificate);
    const uint8Array = new Uint8Array(result);

    // PDF files start with %PDF
    const header = String.fromCharCode(...uint8Array.slice(0, 4));
    expect(header).toBe('%PDF');
  });

  it('should handle long cargo descriptions', () => {
    const longDescription = 'A'.repeat(500);
    const certificateWithLongDesc = {
      ...mockCertificate,
      cargo_description: longDescription,
    };

    const result = generateCertificatePDF(certificateWithLongDesc);

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBeGreaterThan(0);
  });

  it('should handle special characters in text', () => {
    const certificateWithSpecialChars = {
      ...mockCertificate,
      insured_name: 'Müller & Söhne GmbH',
      cargo_description: 'Équipement électronique & composants',
    };

    const result = generateCertificatePDF(certificateWithSpecialChars);

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBeGreaterThan(0);
  });

  it('should handle EUR currency (exchange rate 1)', () => {
    const certificateWithEUR = {
      ...mockCertificate,
      currency: 'EUR',
      value_local: 45000,
      value_euro: 45000,
      exchange_rate: 1,
    };

    const result = generateCertificatePDF(certificateWithEUR);

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBeGreaterThan(0);
  });

  it('should handle large values', () => {
    const certificateWithLargeValues = {
      ...mockCertificate,
      value_local: 999999999.99,
      value_euro: 899999999.99,
    };

    const result = generateCertificatePDF(certificateWithLargeValues);

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBeGreaterThan(0);
  });
});
