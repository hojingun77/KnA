import { inTransaction, readAll, readRecord, writeRecord } from './database.js';

export async function listQuestions(viewerId) {
  const [questions, blocks] = await Promise.all([readAll('questions'), readAll('blocks')]);
  const hidden = new Set(blocks.filter((block) => block.ownerId === viewerId).map((block) => block.questionId));
  return questions.filter((question) => !hidden.has(question.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getQuestion(id) { return readRecord('questions', id); }

export async function blockQuestion(ownerId, questionId) {
  const createdAt = new Date().toISOString();
  await writeRecord('blocks', { id: `${ownerId}:${questionId}`, ownerId, questionId, createdAt, updatedAt: createdAt, revision: 1 });
}

export async function isBlocked(ownerId, questionId) {
  return Boolean(await readRecord('blocks', `${ownerId}:${questionId}`));
}

export async function createQuestion({ ownerId, title, body, category, urgent, files = [] }) {
  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();
  const question = { id, ownerId, title, body, category, urgent, rewardTier: 'basic', rewardPoints: urgent ? 150 : 100, rewardSource: 'default', status: 'open', revision: 1, createdAt, updatedAt: createdAt };
  await inTransaction(['questions', 'attachments'], 'readwrite', (tx) => {
    tx.objectStore('questions').add(question);
    for (const file of files) tx.objectStore('attachments').add({ id: crypto.randomUUID(), ownerId, questionId: id, name: file.name, type: file.type, size: file.size, blob: file, createdAt, updatedAt: createdAt, revision: 1 });
  });
  return question;
}

export async function updateQuestion(question, changes) {
  const updated = { ...question, ...changes, revision: question.revision + 1, updatedAt: new Date().toISOString() };
  return writeRecord('questions', updated);
}

export async function deleteQuestion(question) {
  await inTransaction(['questions', 'attachments'], 'readwrite', (tx) => {
    tx.objectStore('questions').delete(question.id);
    const request = tx.objectStore('attachments').getAll();
    request.onsuccess = () => {
      for (const attachment of request.result) if (attachment.questionId === question.id) tx.objectStore('attachments').delete(attachment.id);
    };
  });
}

export async function listAttachments(questionId) {
  return (await readAll('attachments')).filter((attachment) => attachment.questionId === questionId);
}
