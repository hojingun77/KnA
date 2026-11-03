import { inTransaction, readAll, readRecord, writeRecord } from './database.js';
import { getQuestion } from './questionRepository.js';

function notificationId(type, answerId, ownerId) {
  return `${type}:${answerId}:${ownerId}`;
}

function addNotification(tx, { ownerId, type, questionId, answerId, points }) {
  const createdAt = new Date().toISOString();
  tx.objectStore('notifications').put({
    id: notificationId(type, answerId, ownerId), ownerId, type, questionId, answerId, points,
    readAt: null, createdAt, updatedAt: createdAt, revision: 1,
  });
}

export async function listAnswers(questionId) {
  return (await readAll('answers'))
    .filter((answer) => answer.questionId === questionId && !answer.deletedAt)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

export async function getAnswerCounts() {
  const counts = {};
  for (const answer of await readAll('answers')) {
    if (!answer.deletedAt) counts[answer.questionId] = (counts[answer.questionId] ?? 0) + 1;
  }
  return counts;
}

export async function createAnswer({ questionId, ownerId, body, parentAnswerId = null, authorLanguage = null }) {
  const content = body.trim();
  if (!content) throw new Error('Answer content is required');
  const question = await getQuestion(questionId);
  if (!question) throw new Error('Question is unavailable');
  let parentAnswer = null;
  if (parentAnswerId) {
    parentAnswer = await readRecord('answers', parentAnswerId);
    if (!parentAnswer || parentAnswer.deletedAt || parentAnswer.questionId !== questionId) throw new Error('Reply target is unavailable');
  }
  const createdAt = new Date().toISOString();
  const answer = {
    id: crypto.randomUUID(), questionId, ownerId, parentAnswerId, body: content, authorLanguage,
    revision: 1, createdAt, updatedAt: createdAt, adopted: false,
  };
  await inTransaction(['answers', 'notifications'], 'readwrite', (tx) => {
    tx.objectStore('answers').add(answer);
    if (question.ownerId !== ownerId) addNotification(tx, { ownerId: question.ownerId, type: 'answer', questionId, answerId: answer.id });
    if (parentAnswer && parentAnswer.ownerId !== ownerId) {
      addNotification(tx, { ownerId: parentAnswer.ownerId, type: 'reply', questionId, answerId: answer.id });
    }
  });
  return answer;
}

export async function updateAnswer({ answerId, ownerId, body }) {
  const answer = await readRecord('answers', answerId);
  const content = body.trim();
  if (!answer || answer.deletedAt || answer.ownerId !== ownerId) throw new Error('Answer is unavailable');
  if (answer.adopted) throw new Error('Adopted answers cannot be edited');
  if (!content) throw new Error('Answer content is required');
  const updatedAt = new Date().toISOString();
  const updated = { ...answer, body: content, updatedAt, revision: (answer.revision ?? 1) + 1 };
  return writeRecord('answers', updated);
}

export async function deleteAnswer({ answerId, ownerId }) {
  const answer = await readRecord('answers', answerId);
  if (!answer || answer.deletedAt || answer.ownerId !== ownerId) throw new Error('Answer is unavailable');
  if (answer.adopted) throw new Error('Adopted answers cannot be deleted');
  const deletedAt = new Date().toISOString();
  const updated = { ...answer, deletedAt, updatedAt: deletedAt, revision: (answer.revision ?? 1) + 1 };
  return writeRecord('answers', updated);
}

export async function adoptAnswer({ answer, question, rewarderId }) {
  if (question.ownerId !== rewarderId) throw new Error('Only the question owner can adopt');
  if (question.status === 'adopted') throw new Error('Already adopted');
  const storedAnswer = await readRecord('answers', answer.id);
  if (!storedAnswer || storedAnswer.questionId !== question.id || storedAnswer.deletedAt || storedAnswer.adopted) throw new Error('Answer is unavailable');
  const now = new Date().toISOString();
  const updatedAnswer = { ...storedAnswer, adopted: true, adoptedAt: now, updatedAt: now, revision: (storedAnswer.revision ?? 1) + 1 };
  const updatedQuestion = { ...question, status: 'adopted', adoptedAnswerId: answer.id, updatedAt: now, revision: (question.revision ?? 1) + 1 };
  const ledgerEntry = {
    id: `adoption:${question.id}:${answer.id}`,
    ownerId: storedAnswer.ownerId,
    amount: question.rewardPoints,
    kind: 'adoption',
    questionId: question.id,
    answerId: answer.id,
    createdAt: now,
  };
  await inTransaction(['answers', 'questions', 'pointLedger', 'notifications'], 'readwrite', (tx) => {
    tx.objectStore('answers').put(updatedAnswer);
    tx.objectStore('questions').put(updatedQuestion);
    tx.objectStore('pointLedger').put(ledgerEntry);
    if (storedAnswer.ownerId !== question.ownerId) addNotification(tx, { ownerId: storedAnswer.ownerId, type: 'adopted', questionId: question.id, answerId: answer.id, points: question.rewardPoints });
  });
  return { answer: updatedAnswer, question: updatedQuestion, ledgerEntry };
}
