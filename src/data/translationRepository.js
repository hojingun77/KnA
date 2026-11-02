import { readRecord, writeRecord } from './database.js';

// 저장 키: 대상 종류 + 대상 ID + revision + 목표 언어 (TRANSLATION_RULES.md 4절)
export function translationKey({ kind, id, revision }, target) {
  return `${kind}:${id}:${revision ?? 1}:${target}`;
}

export function getTranslation(key) {
  return readRecord('translations', key);
}

export function saveTranslation(record) {
  return writeRecord('translations', record);
}
