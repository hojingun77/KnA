import { inTransaction, readRecord } from './database.js';

export async function getRecentSearches(ownerId) {
  return (await readRecord('settings', ownerId))?.recentSearches ?? [];
}

async function updateRecentSearches(ownerId, update) {
  await inTransaction(['settings'], 'readwrite', (tx) => {
    const store = tx.objectStore('settings');
    const request = store.get(ownerId);
    request.onsuccess = () => {
      const current = request.result ?? { id: ownerId, ownerId, revision: 0 };
      store.put({
        ...current,
        recentSearches: update(current.recentSearches ?? []),
        updatedAt: new Date().toISOString(),
        revision: (current.revision ?? 0) + 1,
      });
    };
  });
  return getRecentSearches(ownerId);
}

export function addRecentSearch(ownerId, value) {
  const term = value.trim();
  if (!term) return getRecentSearches(ownerId);
  return updateRecentSearches(ownerId, (items) => [term, ...items.filter((item) => item.toLocaleLowerCase() !== term.toLocaleLowerCase())].slice(0, 10));
}

export function removeRecentSearch(ownerId, value) {
  return updateRecentSearches(ownerId, (items) => items.filter((item) => item !== value));
}

export function clearRecentSearches(ownerId) {
  return updateRecentSearches(ownerId, () => []);
}
