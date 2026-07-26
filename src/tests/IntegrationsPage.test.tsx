import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntegrationsPage } from '../pages/dashboard/IntegrationsPage';
import { vi, describe, it, expect } from 'vitest';
import { apiClient } from '../services/apiClient';

// Mock dependencies
vi.mock('../services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  },
  // Set IS_DEMO_MODE initially to true for testing UI locks
  IS_DEMO_MODE: true
}));

describe('IntegrationsPage', () => {
  it('renders connections and handles demo mode locks', async () => {
    // Overriding window.alert and prompt to prevent blocking during test
    window.alert = vi.fn();
    window.prompt = vi.fn().mockReturnValue('dummy-token');

    render(<IntegrationsPage />);

    // Wait for the mock fetch to resolve
    await waitFor(() => {
      expect(screen.getByText('Integration Hub')).toBeInTheDocument();
    });

    // In demo mode, it should auto-load "My Company Bot"
    expect(screen.getByText('My Company Bot')).toBeInTheDocument();

    // Click connect button
    const connectButtons = screen.getAllByText('Connect');
    fireEvent.click(connectButtons[0]);

    // Should call alert because it's in demo mode
    expect(window.alert).toHaveBeenCalledWith('Cannot add real integrations in demo mode');
    expect(apiClient.post).not.toHaveBeenCalled();
  });
});
