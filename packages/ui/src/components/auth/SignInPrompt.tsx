// packages/ui/src/components/auth/SignInPrompt.tsx
// Sign-in prompt component for unauthenticated users

import React from 'react';
import { Button } from '../ui/button';
import { LogIn } from 'lucide-react';

interface SignInPromptProps {
  onSignIn: () => void;
  isLoading?: boolean;
}

/**
 * Sign-in prompt component
 * Displays when user is not authenticated
 * Uses shadcn Button component for consistency
 * Supports ref forwarding for accessibility (focus management)
 */
export const SignInPrompt = React.forwardRef<HTMLButtonElement, SignInPromptProps>(
  ({ onSignIn, isLoading = false }, ref) => {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-background text-foreground dark:bg-background dark:text-foreground">
        <div className="text-center max-w-md">
        </div>
        <Button
          ref={ref}
          onClick={onSignIn}
          disabled={isLoading}
          size="lg"
          className="w-full sm:w-auto dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign in with Microsoft
            </>
          )}
        </Button>
      </div>
    );
  }
);

SignInPrompt.displayName = 'SignInPrompt';
