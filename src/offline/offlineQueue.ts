import { addPendingAction, deletePendingAction, getPendingActions } from './indexedDb';

export interface OfflineAction {
  id: string;
  method: string;
  endpoint: string;
  body?: string;
  headers?: Record<string, string>;
  createdAt: number;
}

let baseUrl = '';
const listeners: Array<(pending: OfflineAction[]) => void> = [];
let isProcessing = false;

const notify = async () => {
  const pending = await getPendingActions<OfflineAction>();
  listeners.forEach((listener) => listener(pending));
};

export const configureOfflineQueue = (options: { baseUrl: string }) => {
  baseUrl = options.baseUrl.replace(/\/$/, '');
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const subscribeToQueue = (listener: (pending: OfflineAction[]) => void) => {
  listeners.push(listener);
  void notify();
  return () => {
    const index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  };
};

export const enqueueOfflineAction = async (action: Omit<OfflineAction, 'id' | 'createdAt'>) => {
  const payload: OfflineAction = {
    id: generateId(),
    createdAt: Date.now(),
    ...action,
  };
  await addPendingAction(payload);
  await notify();
};

const sendAction = async (action: OfflineAction) => {
  const response = await fetch(`${baseUrl}${action.endpoint}`, {
    method: action.method,
    headers: {
      'Content-Type': 'application/json',
      ...(action.headers ?? {}),
    },
    body: action.body,
  });

  if (!response.ok) {
    throw new Error(`Failed to replay offline action: ${response.status}`);
  }
};

export const processOfflineQueue = async () => {
  if (isProcessing) {
    return;
  }
  isProcessing = true;

  try {
    const pending = await getPendingActions<OfflineAction>();
    for (const action of pending) {
      try {
        await sendAction(action);
        await deletePendingAction(action.id);
      } catch (error) {
        // Stop processing if network fails; will retry later
        console.warn('Failed to process offline action', error);
        break;
      }
    }
  } finally {
    isProcessing = false;
    await notify();
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void processOfflineQueue();
  });
}
