import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
  insert: vi.fn(() => mockSupabaseClient),
  update: vi.fn(() => mockSupabaseClient),
  delete: vi.fn(() => mockSupabaseClient),
  eq: vi.fn(() => mockSupabaseClient),
  order: vi.fn(() => mockSupabaseClient),
  single: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

// Mock getCurrentProfile
vi.mock('@/lib/services/profiles', () => ({
  getCurrentProfile: vi.fn(),
}));

import {
  getAllContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
} from '@/lib/services/contracts';
import { getCurrentProfile } from '@/lib/services/profiles';

const mockGetCurrentProfile = vi.mocked(getCurrentProfile);

const mockContract = {
  id: 'contract-1',
  contract_number: 'CON-2024-001',
  insured_name: 'Test Company',
  coverage_type: 'All Risks',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  broker_code: 'BRK001',
  sum_insured: 100000,
  additional_si_percentage: 10,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockAdminProfile = {
  id: 'admin-1',
  full_name: 'Admin User',
  role: 'admin' as const,
  broker_code: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockBrokerProfile = {
  id: 'broker-1',
  full_name: 'Broker User',
  role: 'broker' as const,
  broker_code: 'BRK001',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('Contracts Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain methods
    mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.update.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.delete.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.order.mockReturnValue(mockSupabaseClient);
  });

  describe('getAllContracts', () => {
    it('should return all contracts for admin user', async () => {
      mockGetCurrentProfile.mockResolvedValue(mockAdminProfile);
      mockSupabaseClient.order.mockResolvedValue({
        data: [mockContract],
        error: null,
      });

      const result = await getAllContracts();

      expect(result).toEqual([mockContract]);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contracts');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
    });

    it('should throw error for non-admin user', async () => {
      mockGetCurrentProfile.mockResolvedValue(mockBrokerProfile);

      await expect(getAllContracts()).rejects.toThrow(
        'Unauthorized: Admin access required'
      );
    });

    it('should throw error when user is not authenticated', async () => {
      mockGetCurrentProfile.mockResolvedValue(null);

      await expect(getAllContracts()).rejects.toThrow(
        'Unauthorized: Admin access required'
      );
    });
  });

  describe('getContract', () => {
    it('should return contract by id', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: mockContract,
        error: null,
      });

      const result = await getContract('contract-1');

      expect(result).toEqual(mockContract);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contracts');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'contract-1');
    });

    it('should return null when contract not found', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' },
      });

      const result = await getContract('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createContract', () => {
    it('should create contract for admin user', async () => {
      mockGetCurrentProfile.mockResolvedValue(mockAdminProfile);
      mockSupabaseClient.single.mockResolvedValue({
        data: mockContract,
        error: null,
      });

      const contractData = {
        contract_number: 'CON-2024-001',
        insured_name: 'Test Company',
        coverage_type: 'All Risks',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        broker_code: 'BRK001',
        sum_insured: 100000,
        additional_si_percentage: 10,
      };

      const result = await createContract(contractData);

      expect(result).toEqual(mockContract);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contracts');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(contractData);
    });

    it('should throw error for non-admin user', async () => {
      mockGetCurrentProfile.mockResolvedValue(mockBrokerProfile);

      await expect(
        createContract({
          contract_number: 'CON-2024-001',
          insured_name: 'Test Company',
          coverage_type: 'All Risks',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          broker_code: 'BRK001',
          sum_insured: 100000,
          additional_si_percentage: 10,
        })
      ).rejects.toThrow('Unauthorized: Admin access required');
    });

    it('should throw specific error for duplicate contract number', async () => {
      mockGetCurrentProfile.mockResolvedValue(mockAdminProfile);
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Duplicate key' },
      });

      await expect(
        createContract({
          contract_number: 'CON-2024-001',
          insured_name: 'Test Company',
          coverage_type: 'All Risks',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          broker_code: 'BRK001',
          sum_insured: 100000,
          additional_si_percentage: 10,
        })
      ).rejects.toThrow('Contract number already exists');
    });
  });

  describe('updateContract', () => {
    it('should update contract for admin user', async () => {
      mockGetCurrentProfile.mockResolvedValue(mockAdminProfile);
      const updatedContract = { ...mockContract, insured_name: 'Updated Company' };
      mockSupabaseClient.single.mockResolvedValue({
        data: updatedContract,
        error: null,
      });

      const result = await updateContract('contract-1', {
        insured_name: 'Updated Company',
      });

      expect(result).toEqual(updatedContract);
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        insured_name: 'Updated Company',
      });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'contract-1');
    });

    it('should throw error for non-admin user', async () => {
      mockGetCurrentProfile.mockResolvedValue(mockBrokerProfile);

      await expect(
        updateContract('contract-1', { insured_name: 'Updated Company' })
      ).rejects.toThrow('Unauthorized: Admin access required');
    });
  });

  describe('deleteContract', () => {
    it('should delete contract for admin user', async () => {
      mockGetCurrentProfile.mockResolvedValue(mockAdminProfile);
      mockSupabaseClient.eq.mockResolvedValue({
        error: null,
      });

      await expect(deleteContract('contract-1')).resolves.toBeUndefined();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('contracts');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'contract-1');
    });

    it('should throw error for non-admin user', async () => {
      mockGetCurrentProfile.mockResolvedValue(mockBrokerProfile);

      await expect(deleteContract('contract-1')).rejects.toThrow(
        'Unauthorized: Admin access required'
      );
    });
  });
});
