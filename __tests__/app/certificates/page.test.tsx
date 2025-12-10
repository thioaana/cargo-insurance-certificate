import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock profiles service
const mockProfile = {
  id: 'user-123',
  role: 'admin',
  broker_code: 'BRK001',
  full_name: 'Test Admin',
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
};

vi.mock('@/lib/services/profiles', () => ({
  getCurrentProfile: vi.fn(() => Promise.resolve(mockProfile)),
}));

// Mock certificates service
const mockCertificates = [
  {
    id: 'cert-1',
    certificate_number: 'CERT-2025-0001',
    contract_id: 'contract-1',
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
    created_by: 'user-123',
    created_at: '2025-06-01',
    updated_at: '2025-06-01',
    contract: {
      contract_number: 'CON-2025-0001',
      insured_name: 'Test Company',
      coverage_type: 'All Risks',
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      broker_code: 'BRK001',
      sum_insured: 100000,
      additional_si_percentage: 10,
    },
  },
];

vi.mock('@/lib/services/certificates', () => ({
  getCertificates: vi.fn(() => Promise.resolve(mockCertificates)),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import CertificatesPage from '@/app/certificates/page';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/services/profiles';
import { getCertificates } from '@/lib/services/certificates';

describe('Certificates Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentProfile).mockResolvedValue(mockProfile);
    vi.mocked(getCertificates).mockResolvedValue(mockCertificates);
  });

  it('should redirect to login when not authenticated', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValueOnce(null);
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });

    await expect(CertificatesPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('should render page title for admin', async () => {
    const page = await CertificatesPage();
    render(page);

    expect(screen.getByText('All Certificates')).toBeInTheDocument();
  });

  it('should render page title for broker', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValueOnce({
      ...mockProfile,
      role: 'broker',
    });

    const page = await CertificatesPage();
    render(page);

    expect(screen.getByText('My Certificates')).toBeInTheDocument();
  });

  it('should render New Certificate button', async () => {
    const page = await CertificatesPage();
    render(page);

    expect(screen.getByText('New Certificate')).toBeInTheDocument();
    expect(screen.getByText('New Certificate').closest('a')).toHaveAttribute(
      'href',
      '/certificates/new'
    );
  });

  it('should render certificate table with data', async () => {
    const page = await CertificatesPage();
    render(page);

    expect(screen.getByText('CERT-2025-0001')).toBeInTheDocument();
    expect(screen.getByText('CON-2025-0001')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Germany → Greece')).toBeInTheDocument();
  });

  it('should show empty state when no certificates', async () => {
    vi.mocked(getCertificates).mockResolvedValueOnce([]);

    const page = await CertificatesPage();
    render(page);

    expect(screen.getByText('No certificates found')).toBeInTheDocument();
  });

  it('should show error message when fetch fails', async () => {
    vi.mocked(getCertificates).mockRejectedValueOnce(new Error('Database error'));

    const page = await CertificatesPage();
    render(page);

    expect(screen.getByText('Failed to load certificates')).toBeInTheDocument();
  });

  it('should render Edit link for each certificate', async () => {
    const page = await CertificatesPage();
    render(page);

    const editLink = screen.getByText('Edit');
    expect(editLink).toBeInTheDocument();
    expect(editLink.closest('a')).toHaveAttribute('href', '/certificates/cert-1');
  });

  it('should render Delete button for each certificate', async () => {
    const page = await CertificatesPage();
    render(page);

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
