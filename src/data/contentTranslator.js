import { translateTexts } from '@/api/llm';
import { getTranslation, saveTranslation, translationKey } from './translationRepository.js';

// 자동 번역 대상 화면 언어 (2026-11-03 사용자 지시: 중국어·베트남어 계정만, 한국어 제외)
export const AUTO_TRANSLATE_LANGUAGES = new Set(['zh-CN', 'vi']);

const BATCH = 5; // 서버 /api/translate 한 번에 최대 5문장
const memory = new Map(); // key -> { text, engine }
const inflight = new Map(); // key -> Promise

// 화면을 그릴 때 동기로 읽는 캐시 (IndexedDB에서 한 번 읽어 온 결과 포함)
export function peekTranslation(key) {
  return memory.get(key) ?? null;
}

async function loadStored(key) {
  const record = await getTranslation(key);
  if (record?.text) memory.set(key, { text: record.text, engine: record.engine });
  return Boolean(record?.text);
}

async function requestBatch(batch, target) {
  const response = await translateTexts(batch.map(({ item }) => item.text), target);
  const now = new Date().toISOString();
  await Promise.all(batch.map(async ({ item, key }, index) => {
    const result = response.results?.[index];
    if (!result?.text) throw new Error('translation_missing');
    memory.set(key, { text: result.text, engine: response.engine });
    await saveTranslation({
      id: key, targetType: item.kind, targetId: item.id, targetRevision: item.revision ?? 1, targetLang: target,
      text: result.text, engine: response.engine, model: response.model ?? null,
      detectedSource: result.detectedSource ?? null, policyVersion: response.policyVersion, createdAt: now,
    });
  }));
}

/**
 * items: [{ kind, id, revision, text }]. 저장된 번역은 재사용하고, 없는 것만 5개씩 묶어 요청한다.
 * 같은 대상을 여러 화면이 동시에 요청해도 한 번만 호출한다. 반환: 모두 성공했는지 여부.
 */
export async function translateItems(items, target) {
  const waits = [];
  const pending = [];
  for (const item of items) {
    const key = translationKey(item, target);
    if (memory.has(key)) continue;
    if (inflight.has(key)) { waits.push(inflight.get(key)); continue; }
    pending.push({ item, key });
  }
  if (pending.length) {
    // 이 호출이 맡은 대상은 즉시 진행 중으로 등록해, 동시에 들어온 요청이 중복 호출하지 않게 한다.
    const work = (async () => {
      // 1) 이 기기에 저장된 번역부터 확인
      const stored = await Promise.all(pending.map(({ key }) => loadStored(key).catch(() => false)));
      const missing = pending.filter((_, index) => !stored[index]);
      // 2) 없는 것만 5개씩 묶어서 요청
      const batches = [];
      for (let start = 0; start < missing.length; start += BATCH) batches.push(requestBatch(missing.slice(start, start + BATCH), target));
      const results = await Promise.allSettled(batches);
      if (results.some((result) => result.status === 'rejected')) throw new Error('translation_failed');
    })();
    for (const { key } of pending) inflight.set(key, work);
    work.finally(() => { for (const { key } of pending) inflight.delete(key); }).catch(() => {});
    waits.push(work);
  }
  const results = await Promise.allSettled(waits);
  return results.every((result) => result.status === 'fulfilled');
}
