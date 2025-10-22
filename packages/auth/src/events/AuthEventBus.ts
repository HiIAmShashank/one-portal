import type { AuthEvent, AuthEventHandler, AuthEventType, UnsubscribeFn } from './types';
import { isAuthEvent } from './types';

const CHANNEL_NAME = 'oneportal:auth';

let broadcastChannel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel {
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
  return broadcastChannel;
}

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

export function subscribeToAuthEvents(handler: AuthEventHandler,
  eventTypes?: AuthEventType[]
): UnsubscribeFn {
  const channel = getChannel();

  const listener = (event: MessageEvent) => {
    const data = event.data;

    if (!isAuthEvent(data)) {
      return;
    }

    if (eventTypes && !eventTypes.includes(data.type)) {
      return;
    }

    try {
      void handler(data);
    } catch (error) {
      console.error('[AuthEventBus] Handler error:', error);
    }
  };

  channel.addEventListener('message', listener);

  return () => {
    channel.removeEventListener('message', listener);
  };
}

export function closeAuthEventBus(): void {
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
}
