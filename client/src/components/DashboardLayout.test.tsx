/**
 * Tests Critiques — Dashboard Layout
 *
 * Teste le layout principal de l'application
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from '../components/DashboardLayout';

// Mock trpc
const mockTrpc = {
  auth: {
    me: {
      useQuery: () => ({
        data: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'CLIENT',
        },
        isLoading: false,
      },
    },
  },
};

vi.mock('../lib/trpc', () => ({
  trpc: mockTrpc,
}));

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/dashboard', () => {}],
}));

function renderWithQueryClient(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
}

describe('DashboardLayout - Navigation Principale', () => {
  it('devrait afficher le header', () => {
    renderWithQueryClient(<DashboardLayout>Content</DashboardLayout>);
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('devrait afficher le footer', () => {
    renderWithQueryClient(<DashboardLayout>Content</DashboardLayout>);
    
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('devrait afficher le contenu enfant', () => {
    renderWithQueryClient(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('devrait avoir une navigation accessible', () => {
    renderWithQueryClient(<DashboardLayout>Content</DashboardLayout>);
    
    const nav = screen.getByRole('navigation', { hidden: true });
    expect(nav).toBeInTheDocument();
  });
});
