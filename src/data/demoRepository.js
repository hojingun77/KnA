import { DEMO_CREDENTIALS, DEMO_USERS } from './demoAccounts.js';
import { inTransaction, readAll, readRecord, writeRecord } from './database.js';

const now = () => new Date().toISOString();
const LEGACY_TEST_QUESTION_ID = '84da28f1-738a-4c45-a8cc-db75b96b634f';

export async function ensureDemoData() {
  await inTransaction(['users', 'settings', 'pointLedger', 'pointSnapshots', 'questions', 'attachments'], 'readwrite', (tx) => {
    const questions = tx.objectStore('questions');
    const snapshots = tx.objectStore('pointSnapshots');
    snapshots.get('history-demo-cutetl123').onsuccess = (event) => {
      if (event.target.result?.ownerId === 'demo-cutetl123') snapshots.delete('history-demo-cutetl123');
    };
    questions.get(LEGACY_TEST_QUESTION_ID).onsuccess = (event) => {
      const question = event.target.result;
      if (question?.title !== '시연 동작 확인 질문' || question.ownerId !== 'demo-cutetl123' || question.deletedAt) return;
      const deletedAt = now();
      questions.put({ ...question, status: 'deleted', deletedAt, updatedAt: deletedAt, revision: question.revision + 1 });
      const attachments = tx.objectStore('attachments');
      attachments.getAll().onsuccess = (filesEvent) => {
        for (const file of filesEvent.target.result) if (file.questionId === question.id) attachments.delete(file.id);
      };
    };
    for (const user of DEMO_USERS) {
      const users = tx.objectStore('users');
      const settings = tx.objectStore('settings');
      const ledger = tx.objectStore('pointLedger');
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
        if (!event.target.result) ledger.add({ id: openingId, ownerId: user.id, amount: user.openingPoints, kind: 'opening', createdAt });
      };
      if (user.id === 'demo-ghwlsrns03') {
        const id = 'history-demo-ghwlsrns03';
        snapshots.get(id).onsuccess = (event) => {
          if (!event.target.result) snapshots.add({ id, ownerId: user.id, monthlyPoints: 400, monthlyAdoptions: 3, createdAt, entries: [
            { id: 'visa', amount: 150, label: '답변 채택됨 · 비자', dateLabel: '어제' },
            { id: 'telecom', amount: 100, label: '답변 채택됨 · 통신', dateLabel: '10월 12일' },
            { id: 'voucher', amount: -2000, label: '포인트 전환 신청', dateLabel: '10월 11일 · 온누리상품권' },
            { id: 'medical', amount: 150, label: '답변 채택됨 · 의료', dateLabel: '' },
          ] });
        };
      }
    }
  });
}

export async function authenticateDemo(email, password) {
  const credential = DEMO_CREDENTIALS.find((entry) => entry.email === email);
  if (!credential) return null;
  const user = await readRecord('users', credential.id);
  const passwordSalt = user?.passwordSalt ?? credential.salt;
  const passwordHash = user?.passwordHash ?? credential.passwordHash;
  if (passwordHash) {
    const bytes = new TextEncoder().encode(`${passwordSalt}:${password}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    if (hash !== passwordHash) return null;
  } else if (credential.password !== password) return null;
  return user;
}

async function passwordMatches(userId, password) {
  const credential = DEMO_CREDENTIALS.find((entry) => entry.id === userId);
  const user = await readRecord('users', userId);
  if (!credential || !user) return false;
  const salt = user.passwordSalt ?? credential.salt;
  const expectedHash = user.passwordHash ?? credential.passwordHash;
  if (!expectedHash) return credential.password === password;
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return hash === expectedHash;
}

function createPasswordSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(salt, password) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function updateDemoNickname(userId, nickname) {
  const value = nickname.trim();
  if (!/^[\p{L}\p{N}._-]{2,12}$/u.test(value)) throw new Error('Invalid nickname');
  const user = await readRecord('users', userId);
  if (!user) throw new Error('User is unavailable');
  const updated = { ...user, nickname: value, updatedAt: now(), revision: (user.revision ?? 1) + 1 };
  return writeRecord('users', updated);
}

export async function updateDemoPassword(userId, currentPassword, newPassword) {
  if (!/^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/.test(newPassword)) throw new Error('Password does not meet requirements');
  if (!await passwordMatches(userId, currentPassword)) throw new Error('Current password is incorrect');
  if (currentPassword === newPassword) throw new Error('Password is unchanged');
  const user = await readRecord('users', userId);
  const salt = createPasswordSalt();
  const passwordHash = await hashPassword(salt, newPassword);
  const updated = { ...user, passwordSalt: salt, passwordHash, updatedAt: now(), revision: (user.revision ?? 1) + 1 };
  return writeRecord('users', updated);
}

export function getDemoUser(id) { return readRecord('users', id); }
export function getDemoUserSettings(id) { return readRecord('settings', id); }

export async function getPointOverview(ownerId) {
  const [entries, snapshot] = await Promise.all([readAll('pointLedger'), ownerId === 'demo-ghwlsrns03' ? readRecord('pointSnapshots', 'history-demo-ghwlsrns03') : Promise.resolve(null)]);
  const ledger = entries.filter((entry) => entry.ownerId === ownerId);
  return { balance: ledger.reduce((sum, entry) => sum + entry.amount, 0), ledger, snapshot: snapshot?.ownerId === ownerId ? snapshot : null };
}

export async function resetDemoData() {
  await inTransaction(['users', 'settings', 'questions', 'answers', 'attachments', 'pointLedger', 'pointSnapshots', 'blocks', 'notifications', 'translations'], 'readwrite', (tx) => {
    for (const name of Array.from(tx.objectStoreNames)) tx.objectStore(name).clear();
  });
  await ensureDemoData();
}
