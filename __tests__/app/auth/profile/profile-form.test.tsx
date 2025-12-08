import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileForm from '@/app/auth/profile/profile-form';
import { updateProfileAction } from '@/app/auth/profile/actions';
import toast from 'react-hot-toast';

// Mock the server action
vi.mock('@/app/auth/profile/actions', () => ({
  updateProfileAction: vi.fn(),
}));

const mockUpdateProfileAction = vi.mocked(updateProfileAction);

describe('ProfileForm component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the form with full name input', () => {
      render(<ProfileForm userId="user-123" initialFullName="John Doe" />);

      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(<ProfileForm userId="user-123" initialFullName="" />);

      expect(
        screen.getByRole('button', { name: 'Save Changes' })
      ).toBeInTheDocument();
    });

    it('should show empty input when initialFullName is empty', () => {
      render(<ProfileForm userId="user-123" initialFullName="" />);

      const input = screen.getByLabelText('Full Name');
      expect(input).toHaveValue('');
    });
  });

  describe('form submission', () => {
    it('should call updateProfileAction on submit', async () => {
      const user = userEvent.setup();
      mockUpdateProfileAction.mockResolvedValue({ success: true });

      render(<ProfileForm userId="user-123" initialFullName="John Doe" />);

      const input = screen.getByLabelText('Full Name');
      await user.clear(input);
      await user.type(input, 'Jane Smith');
      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => {
        expect(mockUpdateProfileAction).toHaveBeenCalledWith(
          'user-123',
          'Jane Smith'
        );
      });
    });

    it('should show success toast on successful update', async () => {
      const user = userEvent.setup();
      mockUpdateProfileAction.mockResolvedValue({ success: true });

      render(<ProfileForm userId="user-123" initialFullName="John Doe" />);

      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Profile updated');
      });
    });

    it('should show error message on failed update', async () => {
      const user = userEvent.setup();
      mockUpdateProfileAction.mockResolvedValue({
        success: false,
        error: 'Failed to update profile',
      });

      render(<ProfileForm userId="user-123" initialFullName="John Doe" />);

      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => {
        expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockUpdateProfileAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<ProfileForm userId="user-123" initialFullName="John Doe" />);

      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    });
  });
});
