import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  delete: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  like: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  limit: vi.fn(() => mockSupabase),
  single: vi.fn(() => Promise.resolve({ data: null, error: null })),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock profiles service
const mockProfile = {
  id: 'user-123',
  role: 'admin',
  broker_code: 'BRK001',
  full_name: 'Test User',
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
};

vi.mock('@/lib/services/profiles', () => ({
  getCurrentProfile: vi.fn(() => Promise.resolve(mockProfile)),
}));

// Mock contracts service
const mockContract = {
  id: 'contract-123',
  contract_number: 'CON-2025-0001',
  insured_name: 'Test Company',
  coverage_type: 'All Risks',
  start_date: '2025-01-01',
  end_date: '2025-12-31',
  broker_code: 'BRK001',
  sum_insured: 100000,
  additional_si_percentage: 10,
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
};

vi.mock('@/lib/services/contracts', () => ({
  getContract: vi.fn(() => Promise.resolve(mockContract)),
}));

import {
  getCertificates,
  getCertificate,
  getAvailableContracts,
  createCertificate,
  deleteCertificate,
} from '@/lib/services/certificates';
import { getCurrentProfile } from '@/lib/services/profiles';
import { getContract } from '@/lib/services/contracts';

describe('Certificates Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.delete.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.like.mockReturnValue(mockSupabase);
    mockSupabase.order.mockReturnValue(mockSupabase);
    mockSupabase.limit.mockReturnValue(mockSupabase);

    // Reset profile mock to admin
    vi.mocked(getCurrentProfile).mockResolvedValue(mockProfile);
  });

  describe('getCertificates', () => {
    it('should throw error when not authenticated', async () => {
      vi.mocked(getCurrentProfile).mockResolvedValueOnce(null);

      await expect(getCertificates()).rejects.toThrow('Not authenticated');
    });

    it('should fetch all certificates for admin', async () => {
      const mockCertificates = [
        {
          id: 'cert-1',
          certificate_number: 'CERT-2025-0001',
          contract: mockContract,
        },
      ];

      mockSupabase.select.mockReturnValueOnce({
        ...mockSupabase,
        order: vi.fn().mockResolvedValueOnce({
          data: mockCertificates,
          error: null,
        }),
      });

      const certificates = await getCertificates();

      expect(certificates).toHaveLength(1);
      expect(mockSupabase.from).toHaveBeenCalledWith('certificates');
    });

    it('should return empty array for broker without broker_code', async () => {
      vi.mocked(getCurrentProfile).mockResolvedValueOnce({
        ...mockProfile,
        role: 'broker',
        broker_code: null,
      });

      const certificates = await getCertificates();

      expect(certificates).toEqual([]);
    });
  });

  describe('getCertificate', () => {
    it('should throw error when not authenticated', async () => {
      vi.mocked(getCurrentProfile).mockResolvedValueOnce(null);

      await expect(getCertificate('cert-123')).rejects.toThrow('Not authenticated');
    });

    it('should return null for non-existent certificate', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      const certificate = await getCertificate('non-existent');

      expect(certificate).toBeNull();
    });

    it('should throw error when broker tries to access other broker certificate', async () => {
      vi.mocked(getCurrentProfile).mockResolvedValueOnce({
        ...mockProfile,
        role: 'broker',
        broker_code: 'BRK002',
      });

      const mockCertificate = {
        id: 'cert-123',
        contract_id: 'contract-123',
        contract: { broker_code: 'BRK001' },
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockCertificate,
        error: null,
      });

      await expect(getCertificate('cert-123')).rejects.toThrow('Cannot access');
    });
  });

  describe('getAvailableContracts', () => {
    it('should throw error when not authenticated', async () => {
      vi.mocked(getCurrentProfile).mockResolvedValueOnce(null);

      await expect(getAvailableContracts()).rejects.toThrow('Not authenticated');
    });

    it('should return empty array for broker without broker_code', async () => {
      vi.mocked(getCurrentProfile).mockResolvedValueOnce({
        ...mockProfile,
        role: 'broker',
        broker_code: null,
      });

      const contracts = await getAvailableContracts();

      expect(contracts).toEqual([]);
    });
  });

  describe('createCertificate', () => {
    const validCertificateData = {
      contract_id: 'contract-123',
      insured_name: 'Test Company',
      cargo_description: 'Electronic goods',
      departure_country: 'Germany',
      arrival_country: 'Greece',
      transport_means: 'Sea freight',
      loading_date: '2025-06-15',
      currency: 'EUR',
      value_local: 50000,
      value_euro: 50000,
      exchange_rate: 1,
      issue_date: '2025-06-01',
    };

    it('should throw error when not authenticated', async () => {
      vi.mocked(getCurrentProfile).mockResolvedValueOnce(null);

      await expect(createCertificate(validCertificateData)).rejects.toThrow(
        'Not authenticated'
      );
    });

    it('should throw error when loading date is outside contract period', async () => {
      vi.mocked(getContract).mockResolvedValueOnce({
        ...mockContract,
        start_date: '2025-01-01',
        end_date: '2025-03-31',
      });

      await expect(
        createCertificate({
          ...validCertificateData,
          loading_date: '2025-06-15', // Outside contract period
        })
      ).rejects.toThrow('Loading date must be between');
    });

    it('should throw error when value exceeds contract limit', async () => {
      vi.mocked(getContract).mockResolvedValueOnce({
        ...mockContract,
        sum_insured: 10000,
        additional_si_percentage: 10,
      });

      await expect(
        createCertificate({
          ...validCertificateData,
          value_euro: 15000, // Exceeds 10000 * 1.1 = 11000
        })
      ).rejects.toThrow('exceeds contract limit');
    });

    it('should throw error when broker tries to create for other broker contract', async () => {
      vi.mocked(getCurrentProfile).mockResolvedValueOnce({
        ...mockProfile,
        role: 'broker',
        broker_code: 'BRK002',
      });

      vi.mocked(getContract).mockResolvedValueOnce({
        ...mockContract,
        broker_code: 'BRK001',
      });

      await expect(createCertificate(validCertificateData)).rejects.toThrow(
        'Cannot create certificate for this contract'
      );
    });
  });

  describe('deleteCertificate', () => {
    it('should throw error when not authenticated', async () => {
      vi.mocked(getCurrentProfile).mockResolvedValueOnce(null);

      await expect(deleteCertificate('cert-123')).rejects.toThrow(
        'Not authenticated'
      );
    });
  });
});
