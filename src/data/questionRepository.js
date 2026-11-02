import { inTransaction, readAll, readRecord, writeRecord } from './database.js';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function validateAttachments(files) {
  if (files.length > 20 || files.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type) || file.size > 10 * 1024 * 1024) || files.reduce((total, file) => total + file.size, 0) > 50 * 1024 * 1024) {
    throw new Error('Invalid question attachments');
  }
}

export async function listQuestions(viewerId) {
  const [questions, blocks] = await Promise.all([readAll('questions'), readAll('blocks')]);
  const hidden = new Set(blocks.filter((block) => block.ownerId === viewerId).map((block) => block.questionId));
  return questions.filter((question) => !question.deletedAt && !hidden.has(question.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getQuestion(id) {
  const question = await readRecord('questions', id);
  return question?.deletedAt ? null : question;
}

export async function blockQuestion(ownerId, questionId) {
  const createdAt = new Date().toISOString();
  await writeRecord('blocks', { id: `${ownerId}:${questionId}`, ownerId, questionId, createdAt, updatedAt: createdAt, revision: 1 });
}

export async function isBlocked(ownerId, questionId) {
  return Boolean(await readRecord('blocks', `${ownerId}:${questionId}`));
}

export async function createQuestion({ ownerId, title, body, category, urgent, authorLanguage = 'ko', files = [] }) {
  validateAttachments(files);
  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();
  const question = { id, ownerId, title, body, category, urgent, authorLanguage, rewardTier: 'basic', rewardPoints: urgent ? 150 : 100, rewardSource: 'default', status: 'open', revision: 1, createdAt, updatedAt: createdAt };
  await inTransaction(['questions', 'attachments'], 'readwrite', (tx) => {
    tx.objectStore('questions').add(question);
    for (const file of files) tx.objectStore('attachments').add({ id: crypto.randomUUID(), ownerId, questionId: id, name: file.name, type: file.type, size: file.size, blob: file, createdAt, updatedAt: createdAt, revision: 1 });
  });
  return question;
}

export async function updateQuestion(question, changes, { files = [], removedAttachmentIds = [] } = {}) {
  const existing = await listAttachments(question.id);
  const existingIds = new Set(existing.map((file) => file.id));
  const removed = new Set(removedAttachmentIds.filter((id) => existingIds.has(id)));
  const kept = existing.filter((file) => !removed.has(file.id));
  validateAttachments([...kept, ...files]);
  const updated = { ...question, ...changes, revision: question.revision + 1, updatedAt: new Date().toISOString() };
  await inTransaction(['questions', 'attachments'], 'readwrite', (tx) => {
    tx.objectStore('questions').put(updated);
    for (const id of removed) tx.objectStore('attachments').delete(id);
    for (const file of files) tx.objectStore('attachments').add({ id: crypto.randomUUID(), ownerId: question.ownerId, questionId: question.id, name: file.name, type: file.type, size: file.size, blob: file, createdAt: updated.updatedAt, updatedAt: updated.updatedAt, revision: 1 });
  });
  return updated;
}

export async function deleteQuestion(question) {
  await inTransaction(['questions', 'attachments'], 'readwrite', (tx) => {
    const deletedAt = new Date().toISOString();
    tx.objectStore('questions').put({ ...question, status: 'deleted', deletedAt, updatedAt: deletedAt, revision: question.revision + 1 });
    const request = tx.objectStore('attachments').getAll();
    request.onsuccess = () => {
      for (const attachment of request.result) if (attachment.questionId === question.id) tx.objectStore('attachments').delete(attachment.id);
    };
  });
}

export async function listAttachments(questionId) {
  return (await readAll('attachments')).filter((attachment) => attachment.questionId === questionId);
}
