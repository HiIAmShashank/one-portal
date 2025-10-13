// packages/auth/src/events/AuthEventBus.ts
// Cross-app event communication using BroadcastChannel API

import type { AuthEvent, AuthEventHandler, AuthEventType, UnsubscribeFn } from './types';
import { isAuthEvent } from './types';

const CHANNEL_NAME = 'oneportal:auth';

/**
 * Singleton BroadcastChannel for auth events
 * Shared across all micro-frontends in the same browser context
 */
let broadcastChannel: BroadcastChannel | null = null;

/**
 * Get or create the auth event BroadcastChannel
 */
function getChannel(): BroadcastChannel {
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
  return broadcastChannel;
}

/**
 * Publish an authentication event to all listening apps
 * @param type - Type of auth event
 * @param payload - Optional event payload with context
 */
export function publishAuthEvent(
  type: AuthEventType,
  payload?: AuthEvent['payload']
): void {
  const event: AuthEvent = {
    type,
    timestamp: Date.now(),
    payload,
  };

  try {
    const channel = getChannel();
    channel.postMessage(event);
  } catch (error) {
    console.error('[AuthEventBus] Publish failed:', error);
  }
}

/**
 * Subscribe to authentication events from other apps
 * @param handler - Callback function to handle events
 * @param eventTypes - Optional filter for specific event types
 * @returns Unsubscribe function
 */
export function subscribeToAuthEvents(
  handler: AuthEventHandler,
  eventTypes?: AuthEventType[]
): UnsubscribeFn {
  const channel = getChannel();
  
  const listener = (event: MessageEvent) => {
    const data = event.data;
    
    // Validate event structure
    if (!isAuthEvent(data)) {
      return;
    }
    
    // Filter by event type if specified
    if (eventTypes && !eventTypes.includes(data.type)) {
      return;
    }
    
    // Call handler
    try {
      void handler(data);
    } catch (error) {
      console.error('[AuthEventBus] Handler error:', error);
    }
  };
  
  channel.addEventListener('message', listener);
  
  // Return cleanup function
  return () => {
    channel.removeEventListener('message', listener);
  };
}

/**
 * Clean up BroadcastChannel (typically on app unmount)
 */
export function closeAuthEventBus(): void {
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
}
