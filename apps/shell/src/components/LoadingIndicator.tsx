import { useEffect, useState } from 'react';
import { Spinner } from '@one-portal/ui';

/**
 * LoadingIndicator Component
 * Displays loading state with 200ms delay to prevent flashing
 * Requirements: UX-003
 */

interface LoadingIndicatorProps {
  delay?: number; // Delay in milliseconds before showing the indicator
  className?: string;
  message?: string;
}

export function LoadingIndicator({
  delay = 200,
  className = '',
  message = 'Loading application...',
}: LoadingIndicatorProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show loading indicator if loading takes longer than delay
    const timer = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) {
    return null;
  }

  return (
    <div
      className={`flex min-h-[400px] flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <Spinner className="h-12 w-12" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
