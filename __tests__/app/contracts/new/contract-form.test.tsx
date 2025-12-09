import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContractForm from '@/app/contracts/new/contract-form';
import { createContractAction } from '@/app/contracts/actions';
import toast from 'react-hot-toast';

// Mock the server action
vi.mock('@/app/contracts/actions', () => ({
  createContractAction: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockCreateContractAction = vi.mocked(createContractAction);

const mockBrokers = [
  { id: 'broker-1', broker_code: 'BRK001', full_name: 'John Broker' },
  { id: 'broker-2', broker_code: 'BRK002', full_name: 'Jane Broker' },
];

describe('ContractForm component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all form fields', () => {
      render(<ContractForm brokers={mockBrokers} />);

      expect(screen.getByLabelText('Contract Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Insured Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Coverage Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Broker')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Sum Insured')).toBeInTheDocument();
      expect(screen.getByLabelText('Additional SI %')).toBeInTheDocument();
    });

    it('should render broker dropdown with options', () => {
      render(<ContractForm brokers={mockBrokers} />);

      const select = screen.getByLabelText('Broker');
      expect(select).toBeInTheDocument();
      expect(screen.getByText('BRK001 - John Broker')).toBeInTheDocument();
      expect(screen.getByText('BRK002 - Jane Broker')).toBeInTheDocument();
    });

    it('should render create button', () => {
      render(<ContractForm brokers={mockBrokers} />);

      expect(
        screen.getByRole('button', { name: 'Create Contract' })
      ).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<ContractForm brokers={mockBrokers} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should show warning when no brokers available', () => {
      render(<ContractForm brokers={[]} />);

      expect(
        screen.getByText(/No brokers available/i)
      ).toBeInTheDocument();
    });

    it('should disable create button when no brokers available', () => {
      render(<ContractForm brokers={[]} />);

      expect(
        screen.getByRole('button', { name: 'Create Contract' })
      ).toBeDisabled();
    });
  });

  describe('form submission', () => {
    it('should call createContractAction on submit with valid data', async () => {
      const user = userEvent.setup();
      mockCreateContractAction.mockResolvedValue({ success: true, id: 'new-id' });

      render(<ContractForm brokers={mockBrokers} />);

      await user.type(screen.getByLabelText('Contract Number'), 'CON-2024-001');
      await user.type(screen.getByLabelText('Insured Name'), 'Test Company');
      await user.type(screen.getByLabelText('Coverage Type'), 'All Risks');
      await user.selectOptions(screen.getByLabelText('Broker'), 'BRK001');
      await user.type(screen.getByLabelText('Start Date'), '2024-01-01');
      await user.type(screen.getByLabelText('End Date'), '2024-12-31');
      await user.type(screen.getByLabelText('Sum Insured'), '100000');

      await user.click(screen.getByRole('button', { name: 'Create Contract' }));

      await waitFor(() => {
        expect(mockCreateContractAction).toHaveBeenCalledWith({
          contract_number: 'CON-2024-001',
          insured_name: 'Test Company',
          coverage_type: 'All Risks',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          broker_code: 'BRK001',
          sum_insured: 100000,
          additional_si_percentage: 0,
        });
      });
    });

    it('should show success toast on successful creation', async () => {
      const user = userEvent.setup();
      mockCreateContractAction.mockResolvedValue({ success: true, id: 'new-id' });

      render(<ContractForm brokers={mockBrokers} />);

      await user.type(screen.getByLabelText('Contract Number'), 'CON-2024-001');
      await user.type(screen.getByLabelText('Insured Name'), 'Test Company');
      await user.type(screen.getByLabelText('Coverage Type'), 'All Risks');
      await user.selectOptions(screen.getByLabelText('Broker'), 'BRK001');
      await user.type(screen.getByLabelText('Start Date'), '2024-01-01');
      await user.type(screen.getByLabelText('End Date'), '2024-12-31');
      await user.type(screen.getByLabelText('Sum Insured'), '100000');

      await user.click(screen.getByRole('button', { name: 'Create Contract' }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Contract created');
      });
    });

    it('should show error message on failed creation', async () => {
      const user = userEvent.setup();
      mockCreateContractAction.mockResolvedValue({
        success: false,
        error: 'Contract number already exists',
      });

      render(<ContractForm brokers={mockBrokers} />);

      await user.type(screen.getByLabelText('Contract Number'), 'CON-2024-001');
      await user.type(screen.getByLabelText('Insured Name'), 'Test Company');
      await user.type(screen.getByLabelText('Coverage Type'), 'All Risks');
      await user.selectOptions(screen.getByLabelText('Broker'), 'BRK001');
      await user.type(screen.getByLabelText('Start Date'), '2024-01-01');
      await user.type(screen.getByLabelText('End Date'), '2024-12-31');
      await user.type(screen.getByLabelText('Sum Insured'), '100000');

      await user.click(screen.getByRole('button', { name: 'Create Contract' }));

      await waitFor(() => {
        expect(
          screen.getByText('Contract number already exists')
        ).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockCreateContractAction.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true, id: 'new-id' }), 100)
          )
      );

      render(<ContractForm brokers={mockBrokers} />);

      await user.type(screen.getByLabelText('Contract Number'), 'CON-2024-001');
      await user.type(screen.getByLabelText('Insured Name'), 'Test Company');
      await user.type(screen.getByLabelText('Coverage Type'), 'All Risks');
      await user.selectOptions(screen.getByLabelText('Broker'), 'BRK001');
      await user.type(screen.getByLabelText('Start Date'), '2024-01-01');
      await user.type(screen.getByLabelText('End Date'), '2024-12-31');
      await user.type(screen.getByLabelText('Sum Insured'), '100000');

      await user.click(screen.getByRole('button', { name: 'Create Contract' }));

      expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled();
    });
  });
});
