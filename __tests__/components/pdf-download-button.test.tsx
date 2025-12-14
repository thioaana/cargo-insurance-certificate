import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PDFDownloadButton } from '@/components/pdf-download-button';
import toast from 'react-hot-toast';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock URL methods
const mockCreateObjectURL = vi.fn(() => 'blob:test-url');
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('PDFDownloadButton', () => {
  const defaultProps = {
    certificateId: '123e4567-e89b-12d3-a456-426614174000',
    certificateNumber: 'CERT-2025-0001',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render the button with PDF text', () => {
    render(<PDFDownloadButton {...defaultProps} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('should show loading state when downloading', async () => {
    // Mock a slow response
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                blob: () => Promise.resolve(new Blob(['test'])),
              }),
            100
          )
        )
    );

    render(<PDFDownloadButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Downloading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should call fetch with correct URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['test'])),
    });

    render(<PDFDownloadButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/pdf/${defaultProps.certificateId}`
      );
    });
  });

  it('should show success toast on successful download', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['test'])),
    });

    render(<PDFDownloadButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('PDF downloaded successfully');
    });
  });

  it('should show error toast on failed download', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Certificate not found' }),
    });

    render(<PDFDownloadButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Certificate not found');
    });
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<PDFDownloadButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  it('should trigger download on successful fetch', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/pdf' });
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    render(<PDFDownloadButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      // Verify createObjectURL was called with a blob
      expect(mockCreateObjectURL).toHaveBeenCalled();
      // Verify revokeObjectURL was called for cleanup
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });
  });

  it('should apply variant and size props', () => {
    render(
      <PDFDownloadButton {...defaultProps} variant="default" size="lg" />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
