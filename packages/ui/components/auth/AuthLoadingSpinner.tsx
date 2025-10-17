// packages/ui/components/auth/AuthLoadingSpinner.tsx
// Loading spinner for auth operations

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '../../src/components/ui/empty';
import { Spinner } from '../../src/components/ui/spinner';

interface AuthLoadingSpinnerProps {
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Auth loading spinner component
 * Used during authentication initialization and operations
 * Uses shadcn/ui Empty component pattern with Spinner
 * Requirements: T117 (US7) - Proper ARIA attributes for screen readers
 */
export function AuthLoadingSpinner({
  title = 'Initializing authentication...',
  description = 'Please wait while we set up your session.',
  className = ''
}: AuthLoadingSpinnerProps) {
  return (
    <Empty className={className} role="status" aria-live="polite" aria-busy="true">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner size="lg" aria-label="Loading" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
