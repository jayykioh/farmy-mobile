type SessionExpiredHandler = () => void | Promise<void>;

let onSessionExpired: SessionExpiredHandler | null = null;

export function registerSessionExpiredHandler(handler: SessionExpiredHandler) {
  onSessionExpired = handler;
}

export async function triggerSessionExpired() {
  await onSessionExpired?.();
}
