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
  try {
    if (api.dashboard && typeof api.dashboard.markNotificationAsRead === 'function') {
      await api.dashboard.markNotificationAsRead(id);
      return true;
    }
    // fallback
    return false;
  } catch (e) {
    throw e;
  }
};

const markAllRead = async () => {
  // try API first; API doesn't currently expose mark-all, so use mock fallback
  try {
    if (api.notifications && typeof api.notifications.markAllRead === 'function') {
      await api.notifications.markAllRead();
      return true;
    }
    // if not present, call mockDb via api if available
    if (api.dashboard && typeof api.dashboard.getNotifications === 'function') {
      // best-effort: mark each as read via markNotificationAsRead
      const listRes = await api.dashboard.getNotifications();
      if (listRes.success) {
        const list = listRes.data || [];
        for (const n of list) {
          try { await api.dashboard.markNotificationAsRead(n.id); } catch (e) { /* ignore per-item errors */ }
        }
        return true;
      }
    }
    return false;
  } catch (e) {
    throw e;
  }
};

const clearNotifications = async () => {
  try {
    if (api.notifications && typeof api.notifications.clear === 'function') {
      await api.notifications.clear();
      return true;
    }
    // fallback: mark by deleting all via mock behaviors is not exposed; attempt markAllRead then clear local storage via api if available
    return false;
  } catch (e) {
    throw e;
  }
};

export const notifications = {
  getNotifications,
  markAsRead,
  markAllRead,
  clearNotifications
};

export default notifications;
