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

// kna-reward-v1 금액표 (QUESTION_REWARD_RULES.md 2절). 모델은 등급만 고르고 금액은 여기서 계산한다.
export const REWARD_POLICY_VERSION = 'kna-reward-v1';
const BASE_POINTS = { basic: 100, guided: 150, complex: 200 };

// 등록 시 확정 보상 스냅샷 (5절). reward가 없거나 유효하지 않으면 기본 보상(100P/긴급 150P)이다.
function rewardSnapshot(reward, urgent, lockedAt) {
  const llm = reward?.source === 'llm' && reward.policyVersion === REWARD_POLICY_VERSION && Object.hasOwn(BASE_POINTS, reward.tier);
  const basePoints = llm ? BASE_POINTS[reward.tier] : 100;
  const rewardPoints = urgent ? basePoints * 1.5 : basePoints;
  if (!Number.isSafeInteger(rewardPoints) || rewardPoints <= 0) throw new Error('Invalid reward');
  return {
    rewardPolicyVersion: REWARD_POLICY_VERSION,
    rewardSource: llm ? 'llm' : 'default',
    rewardTier: llm ? reward.tier : null,
    basePoints,
    isUrgentAtRegistration: Boolean(urgent),
    rewardPoints,
    rewardLockedAt: lockedAt,
    rewardReason: llm ? String(reward.reason).slice(0, 200) : null,
    rewardDefaultReason: llm ? null : (reward?.defaultReason ?? 'llm_disabled'),
    rewardModel: llm ? reward.model ?? null : null,
    rewardAssessedAt: llm ? reward.assessedAt ?? null : null,
    rewardOutputLocale: llm ? reward.outputLocale ?? null : null,
  };
}

export async function createQuestion({ ownerId, title, body, category, urgent, authorLanguage = 'ko', files = [], reward = null }) {
  validateAttachments(files);
  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();
  const question = { id, ownerId, title, body, category, urgent, authorLanguage, ...rewardSnapshot(reward, urgent, createdAt), status: 'open', revision: 1, createdAt, updatedAt: createdAt };
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
