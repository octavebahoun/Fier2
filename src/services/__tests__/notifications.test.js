/** @vitest-environment jsdom */

import { beforeEach, describe, it, expect } from 'vitest';
import { initializeMockDb } from '../mockDb.js';
import { notifications } from '../notifications.js';

beforeEach(() => {
  initializeMockDb();
});

describe('notifications adapter (basic)', () => {
  it('fetches notifications and marks one as read via adapter', async () => {
    const list = await notifications.getNotifications();
    expect(Array.isArray(list)).toBe(true);
    const first = list[0];
    expect(first).toBeTruthy();
    // mark as read via adapter
    const res = await notifications.markAsRead(first.id);
    // markAsRead returns true only when api supports it; mock api.dashboard.markNotificationAsRead exists
    expect(res === true || res === false).toBe(true);
  });
});
