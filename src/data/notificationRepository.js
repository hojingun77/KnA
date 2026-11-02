import { readAll, readRecord, writeRecord } from './database.js';

export async function listNotifications(ownerId) {
  return (await readAll('notifications'))
    .filter((notification) => notification.ownerId === ownerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
}

export async function getUnreadNotificationCount(ownerId) {
  return (await listNotifications(ownerId)).filter((notification) => !notification.readAt).length;
}

export async function markNotificationRead(notificationId, ownerId) {
  const notification = await readRecord('notifications', notificationId);
  if (!notification || notification.ownerId !== ownerId || notification.readAt) return notification;
  const readAt = new Date().toISOString();
  const updated = await writeRecord('notifications', { ...notification, readAt, updatedAt: readAt, revision: (notification.revision ?? 1) + 1 });
  window.dispatchEvent(new Event('kna-notifications-changed'));
  return updated;
}