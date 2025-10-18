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
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Sign in to continue
            </h2>
            <p className="text-gray-600">
              You need to sign in to access OnePortal features
            </p>
          </div>

          <Button
            ref={ref}
            onClick={onSignIn}
            disabled={isLoading}
            size="lg"
            className="w-full sm:w-auto"
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
      </div>
    );
  }
);

SignInPrompt.displayName = 'SignInPrompt';
