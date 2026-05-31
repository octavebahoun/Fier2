import api from './api.js';

/**
 * Lightweight adapter for notifications used by UI components.
 * Delegates to `api.dashboard` endpoints when available, falling back to mock behavior handled by `api`/`mockDb`.
 */

const getNotifications = async ({ limit = 20, offset = 0 } = {}) => {
  // api.dashboard.getNotifications returns { success, data }
  const res = await api.dashboard.getNotifications();
  return res.success ? res.data.slice(offset, offset + limit) : [];
};

const markAsRead = async (id) => {
  if (api.dashboard && typeof api.dashboard.markNotificationAsRead === 'function') {
    await api.dashboard.markNotificationAsRead(id);
    return true;
  }
  // fallback
  return false;
};

const _emitUpdate = () => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('fieri:notifications:updated'))
    } catch {
      // ignore
    }
  }
}

const markAllRead = async () => {
  // try API first; API doesn't currently expose mark-all, so use mock fallback
  if (api.notifications && typeof api.notifications.markAllRead === 'function') {
    await api.notifications.markAllRead();
    _emitUpdate()
    return true;
  }
  // if not present, call mockDb via api if available
  if (api.dashboard && typeof api.dashboard.getNotifications === 'function') {
    // best-effort: mark each as read via markNotificationAsRead
    const listRes = await api.dashboard.getNotifications();
    if (listRes.success) {
      const list = listRes.data || [];
      for (const n of list) {
        try { await api.dashboard.markNotificationAsRead(n.id); } catch { /* ignore per-item errors */ }
      }
      return true;
    }
  }
  return false;
};

const clearNotifications = async () => {
  if (api.notifications && typeof api.notifications.clear === 'function') {
    await api.notifications.clear();
    _emitUpdate()
    return true;
  }
  // fallback: mark by deleting all via mock behaviors is not exposed; attempt markAllRead then clear local storage via api if available
  return false;
};

// emit updates after operations
const _wrapEmit = (fn) => async (...args) => {
  const r = await fn(...args)
  try { _emitUpdate() } catch {}
  return r
}

// attach emitters where appropriate
const markAsReadWithEmit = _wrapEmit(markAsRead)
const markAllReadWithEmit = _wrapEmit(markAllRead)
const clearNotificationsWithEmit = _wrapEmit(clearNotifications)

export const notifications = {
  getNotifications,
  markAsRead: markAsReadWithEmit,
  markAllRead: markAllReadWithEmit,
  clearNotifications: clearNotificationsWithEmit
};

export default notifications;
