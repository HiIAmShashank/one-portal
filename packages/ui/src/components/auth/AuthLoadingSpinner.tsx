// packages/ui/src/components/auth/AuthLoadingSpinner.tsx
// Loading spinner for auth operations

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '../ui/empty';
import { Spinner } from '../ui/spinner';

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
    <div className='flex flex-col gap-2 items-center'>
      {/* a title and a description with a spinner underneath */}
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Spinner size="md" aria-label={title} aria-describedby={description} className={className} />
    </div>
  );
}
