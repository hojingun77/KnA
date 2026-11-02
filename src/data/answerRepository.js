import { inTransaction, readAll, writeRecord } from './database.js';
import { getQuestion } from './questionRepository.js';

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

export async function createAnswer({ questionId, ownerId, body }) {
  const content = body.trim();
  if (!content) throw new Error('Answer content is required');
  if (!await getQuestion(questionId)) throw new Error('Question is unavailable');
  const createdAt = new Date().toISOString();
  const answer = {
    id: crypto.randomUUID(), questionId, ownerId, body: content,
    revision: 1, createdAt, updatedAt: createdAt, adopted: false,
  };
  return writeRecord('answers', answer);
}

export async function adoptAnswer({ answer, question, rewarderId }) {
  if (question.ownerId !== rewarderId) throw new Error('Only the question owner can adopt');
  if (question.status === 'adopted') throw new Error('Already adopted');
  const now = new Date().toISOString();
  const updatedAnswer = { ...answer, adopted: true, adoptedAt: now, updatedAt: now, revision: (answer.revision ?? 1) + 1 };
  const updatedQuestion = { ...question, status: 'adopted', adoptedAnswerId: answer.id, updatedAt: now, revision: (question.revision ?? 1) + 1 };
  const ledgerEntry = {
    id: crypto.randomUUID(),
    ownerId: answer.ownerId,
    amount: question.rewardPoints,
    kind: 'adoption',
    questionId: question.id,
    answerId: answer.id,
    createdAt: now,
  };
  await inTransaction(['answers', 'questions', 'pointLedger'], 'readwrite', (tx) => {
    tx.objectStore('answers').put(updatedAnswer);
    tx.objectStore('questions').put(updatedQuestion);
    tx.objectStore('pointLedger').add(ledgerEntry);
  });
  return { answer: updatedAnswer, question: updatedQuestion, ledgerEntry };
}
