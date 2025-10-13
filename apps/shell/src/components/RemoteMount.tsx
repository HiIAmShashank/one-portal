import { useEffect, useRef, useState } from 'react';
import type { RemoteApp } from '@one-portal/types';
import type { Root } from 'react-dom/client';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorFallback } from './ErrorFallback';
import { useAppStore } from '../stores/appStore';
import { loadAndMountRemote, unmountRemote } from '../services/remoteLoader';

/**
 * RemoteMount Component
 * 
 * Dynamically loads and mounts remote micro-frontend applications using Module Federation
 * with proper lifecycle management (mount/unmount).
 * 
 * This component:
 * 1. Loads the remote module using remoteLoader service
 * 2. Calls the remote's mount() function with a container ID
 * 3. Manages loading and error states
 * 4. Calls unmount() on cleanup to prevent memory leaks
 * 
 * Requirements: FR-003, FR-005, PF-006
 */

interface RemoteMountProps {
  app: RemoteApp;
  className?: string;
}

export function RemoteMount({ app, className = '' }: RemoteMountProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<Root | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { setLoading, setError: setStoreError } = useAppStore();
  const containerId = `remote-app-container-${app.id}`;

  useEffect(() => {
    let isMounted = true;

    const loadAndMount = async () => {
      try {
        setIsLoading(true);
        setLoading(true);

        // Wait for next tick to ensure container is in DOM
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Verify container exists
        const container = document.getElementById(containerId);
        if (!container) {
          throw new Error(`Container element with ID "${containerId}" not found`);
        }

        // Load and mount the remote using the service
        const instance = await loadAndMountRemote(
          app.remoteEntryUrl,
          app.scope,
          containerId
        );

        if (isMounted) {
          instanceRef.current = instance;
          setIsLoading(false);
          setLoading(false);
        }
      } catch (err) {
        console.error(`[RemoteMount] Load failed for ${app.name}:`, err);
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setStoreError(error);
          setIsLoading(false);
          setLoading(false);
        }
      }
    };

    loadAndMount();

    // Cleanup on unmount or when app changes
    return () => {
      isMounted = false;
      
      if (instanceRef.current) {
        unmountRemote(app.scope);
        instanceRef.current = null;
      }
    };
  }, [app.id, app.name, app.remoteEntryUrl, app.scope, containerId, setLoading, setStoreError]);

  // Always render the container div
  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
          <LoadingIndicator />
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <ErrorFallback
            error={error}
            onRetry={() => {
              setError(null);
              setStoreError(null);
              setIsLoading(true);
            }}
          />
        </div>
      )}
      
      {/* Container for remote app - always present */}
      <div
        id={containerId}
        ref={containerRef}
        className={`min-h-[calc(100vh-8rem)] ${className}`}
        aria-label={`${app.name} application`}
      />
    </div>
  );
}
