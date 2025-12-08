import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UnauthorizedPage from '@/app/unauthorized/page';

describe('UnauthorizedPage', () => {
  it('should render 403 heading', () => {
    render(<UnauthorizedPage />);

    expect(screen.getByRole('heading', { name: '403' })).toBeInTheDocument();
  });

  it('should render Access Denied message', () => {
    render(<UnauthorizedPage />);

    expect(
      screen.getByRole('heading', { name: 'Access Denied' })
    ).toBeInTheDocument();
  });

  it('should render permission message', () => {
    render(<UnauthorizedPage />);

    expect(
      screen.getByText("You don't have permission to access this page.")
    ).toBeInTheDocument();
  });

  it('should render Go Home link', () => {
    render(<UnauthorizedPage />);

    const link = screen.getByRole('link', { name: 'Go Home' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
});
