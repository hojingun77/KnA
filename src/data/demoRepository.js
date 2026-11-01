import { DEMO_CREDENTIALS, DEMO_USERS } from './demoAccounts.js';
import { inTransaction, readAll, readRecord } from './database.js';

const now = () => new Date().toISOString();

export async function ensureDemoData() {
  await inTransaction(['users', 'settings', 'pointLedger', 'pointSnapshots'], 'readwrite', (tx) => {
    for (const user of DEMO_USERS) {
      const users = tx.objectStore('users');
      const settings = tx.objectStore('settings');
      const ledger = tx.objectStore('pointLedger');
      const snapshots = tx.objectStore('pointSnapshots');
      const createdAt = now();
      users.get(user.id).onsuccess = (event) => {
        const existing = event.target.result;
        if (!existing) users.add({ ...user, createdAt, updatedAt: createdAt, revision: 1 });
        else if (existing.email !== user.email) users.put({ ...existing, email: user.email, updatedAt: createdAt, revision: (existing.revision ?? 1) + 1 });
      };
      settings.get(user.id).onsuccess = (event) => {
        if (!event.target.result) settings.add({ id: user.id, ownerId: user.id, uiLanguage: user.uiLanguage, createdAt, updatedAt: createdAt, revision: 1 });
      };
      const openingId = `opening-${user.id}`;
      ledger.get(openingId).onsuccess = (event) => {
        if (!event.target.result) ledger.add({ id: openingId, ownerId: user.id, amount: 1000, kind: 'opening', createdAt });
      };
      if (user.id === 'demo-cutetl123') {
        const id = 'history-demo-cutetl123';
        snapshots.get(id).onsuccess = (event) => {
          if (!event.target.result) snapshots.add({ id, ownerId: user.id, monthlyPoints: 400, monthlyAdoptions: 3, createdAt, entries: [
            { id: 'visa', amount: 150, label: '비자 질문 답변 채택', dateLabel: '어제' },
            { id: 'telecom', amount: 100, label: '통신 질문 답변 채택', dateLabel: '10월 12일' },
            { id: 'voucher', amount: -2000, label: '온누리 전환', dateLabel: '10월 11일' },
            { id: 'medical', amount: 150, label: '의료 질문 답변 채택', dateLabel: '' },
          ] });
        };
      }
    }
  });
}

export async function authenticateDemo(email, password) {
  const credential = DEMO_CREDENTIALS.find((entry) => entry.email === email && entry.password === password);
  return credential ? readRecord('users', credential.id) : null;
}

export function getDemoUser(id) { return readRecord('users', id); }

export async function getPointOverview(ownerId) {
  const [entries, snapshot] = await Promise.all([readAll('pointLedger'), readRecord('pointSnapshots', 'history-demo-cutetl123')]);
  const ledger = entries.filter((entry) => entry.ownerId === ownerId);
  return { balance: ledger.reduce((sum, entry) => sum + entry.amount, 0), ledger, snapshot: snapshot?.ownerId === ownerId ? snapshot : null };
}

export async function resetDemoData() {
  await inTransaction(['users', 'settings', 'questions', 'answers', 'attachments', 'pointLedger', 'pointSnapshots', 'blocks'], 'readwrite', (tx) => {
    for (const name of tx.objectStoreNames) tx.objectStore(name).clear();
  });
  await ensureDemoData();
}
