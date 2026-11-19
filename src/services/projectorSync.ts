export type ProjectorSlideKind = 'idle' | 'blackout' | 'verse' | 'card' | 'question';

export interface ProjectorSlidePayload {
  kind: ProjectorSlideKind;
  title?: string;
  content?: string;
  reference?: string;
  translation?: string;
  quote?: string;
  imageUrl?: string;
  accentColor?: string;
  sermonTitle?: string;
  sermonScripture?: string;
  updatedAt: number;
}

const CHANNEL_NAME = 'rhema_projector_v1';
const STORAGE_KEY = 'rhema_projector_state_v1';

interface ChannelEnvelope {
  type: 'slide' | 'projector-hello' | 'controller-ping';
  payload?: ProjectorSlidePayload;
}

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }
  try {
    return new BroadcastChannel(CHANNEL_NAME);
  } catch {
    return null;
  }
}

export function getLastProjectorSlide(): ProjectorSlidePayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectorSlidePayload;
    return parsed && typeof parsed === 'object' && parsed.kind ? parsed : null;
  } catch {
    return null;
  }
}

export function broadcastProjectorSlide(
  slide: Omit<ProjectorSlidePayload, 'updatedAt'>
): ProjectorSlidePayload {
  const fullPayload: ProjectorSlidePayload = {
    ...slide,
    updatedAt: Date.now(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullPayload));
    } catch {
      // ignore storage quota errors
    }
  }

  const ch = getChannel();
  if (ch) {
    try {
      const msg: ChannelEnvelope = { type: 'slide', payload: fullPayload };
      ch.postMessage(msg);
    } catch {
      // ignore broadcast errors
    } finally {
      ch.close();
    }
  }

  return fullPayload;
}

export function announceProjectorScreen(): void {
  const ch = getChannel();
  if (!ch) return;
  try {
    const msg: ChannelEnvelope = { type: 'projector-hello' };
    ch.postMessage(msg);
  } catch {
    // ignore
  } finally {
    ch.close();
  }
}

export function pingProjectorScreens(): void {
  const ch = getChannel();
  if (!ch) return;
  try {
    const msg: ChannelEnvelope = { type: 'controller-ping' };
    ch.postMessage(msg);
  } catch {
    // ignore
  } finally {
    ch.close();
  }
}

export function subscribeProjectorSlides(
  onSlide: (slide: ProjectorSlidePayload) => void
): () => void {
  const ch = getChannel();

  const handleMessage = (event: MessageEvent<ChannelEnvelope>) => {
    const data = event.data;
    if (!data) return;
    if (data.type === 'slide' && data.payload) {
      onSlide(data.payload);
    } else if (data.type === 'controller-ping') {
      announceProjectorScreen();
    }
  };

  if (ch) {
    ch.addEventListener('message', handleMessage);
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as ProjectorSlidePayload;
        if (parsed && parsed.kind) {
          onSlide(parsed);
        }
      } catch {
        // ignore parse errors
      }
    }
  };

  window.addEventListener('storage', handleStorage);

  // Announce presence to any open controller window
  announceProjectorScreen();

  return () => {
    if (ch) {
      ch.removeEventListener('message', handleMessage);
      ch.close();
    }
    window.removeEventListener('storage', handleStorage);
  };
}

export function subscribeProjectorPresence(onConnected: () => void): () => void {
  const ch = getChannel();
  if (!ch) return () => {};

  const handleMessage = (event: MessageEvent<ChannelEnvelope>) => {
    if (event.data?.type === 'projector-hello') {
      onConnected();
    }
  };

  ch.addEventListener('message', handleMessage);
  // Ping immediately in case projector window is already open
  try {
    ch.postMessage({ type: 'controller-ping' } as ChannelEnvelope);
  } catch {
    // ignore
  }

  return () => {
    ch.removeEventListener('message', handleMessage);
    ch.close();
  };
}
