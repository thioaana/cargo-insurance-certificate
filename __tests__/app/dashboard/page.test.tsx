import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock profiles service
vi.mock('@/lib/services/profiles', () => ({
  getCurrentProfile: vi.fn(),
}));

import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/services/profiles';

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to login if not authenticated', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValue(null);
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });

    await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('should render welcome message with user name', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValue({
      id: '123',
      full_name: 'John Doe',
      role: 'broker',
      broker_code: 'BRK001',
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    });

    const page = await DashboardPage();
    render(page);

    expect(screen.getByText(/Welcome back, John Doe/)).toBeInTheDocument();
    expect(screen.getByText('Broker Dashboard')).toBeInTheDocument();
  });

  it('should show admin dashboard for admin users', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValue({
      id: '123',
      full_name: 'Admin User',
      role: 'admin',
      broker_code: null,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    });

    const page = await DashboardPage();
    render(page);

    expect(screen.getByText('Administrator Dashboard')).toBeInTheDocument();
  });

  it('should show New Certificate card for all users', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValue({
      id: '123',
      full_name: 'Test User',
      role: 'broker',
      broker_code: 'BRK001',
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    });

    const page = await DashboardPage();
    render(page);

    expect(screen.getByText('New Certificate')).toBeInTheDocument();
    expect(screen.getByText('Create Certificate')).toBeInTheDocument();
  });

  it('should show My Certificates for broker users', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValue({
      id: '123',
      full_name: 'Broker User',
      role: 'broker',
      broker_code: 'BRK001',
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    });

    const page = await DashboardPage();
    render(page);

    expect(screen.getByText('My Certificates')).toBeInTheDocument();
  });

  it('should show All Certificates for admin users', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValue({
      id: '123',
      full_name: 'Admin User',
      role: 'admin',
      broker_code: null,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    });

    const page = await DashboardPage();
    render(page);

    expect(screen.getByText('All Certificates')).toBeInTheDocument();
  });

  it('should show Contracts and Users cards for admin only', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValue({
      id: '123',
      full_name: 'Admin User',
      role: 'admin',
      broker_code: null,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    });

    const page = await DashboardPage();
    render(page);

    expect(screen.getByText('Contracts')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Manage Contracts')).toBeInTheDocument();
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
  });

  it('should NOT show Contracts and Users cards for brokers', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValue({
      id: '123',
      full_name: 'Broker User',
      role: 'broker',
      broker_code: 'BRK001',
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    });

    const page = await DashboardPage();
    render(page);

    expect(screen.queryByText('Contracts')).not.toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });
});
