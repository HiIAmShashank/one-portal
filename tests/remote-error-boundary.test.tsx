import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RemoteErrorBoundary } from '../packages/ui/src/components/remote-error-boundary';

describe('RemoteErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <RemoteErrorBoundary>
        <div>Test Content</div>
      </RemoteErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render error UI when an error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RemoteErrorBoundary remoteName="test-remote">
        <ThrowError />
      </RemoteErrorBoundary>
    );

    expect(screen.getByText(/Failed to load test-remote/i)).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('should call onError callback when an error occurs', () => {
    const onError = vi.fn();
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RemoteErrorBoundary onError={onError}>
        <ThrowError />
      </RemoteErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );

    consoleError.mockRestore();
  });

  it('should render custom fallback when provided', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RemoteErrorBoundary fallback={<div>Custom Error Message</div>}>
        <ThrowError />
      </RemoteErrorBoundary>
    );

    expect(screen.getByText('Custom Error Message')).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
