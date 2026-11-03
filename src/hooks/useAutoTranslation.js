import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCapabilities } from '@/api/llm';
import { normalizeLanguage } from '@/i18n';
import { translationKey } from '@/data/translationRepository';
import { AUTO_TRANSLATE_LANGUAGES, peekTranslation, translateItems } from '@/data/contentTranslator';

/**
 * 사용자 콘텐츠 자동 번역 (중국어·베트남어 화면만).
 * items: [{ kind, id, revision, text, sourceLanguage }]
 * 반환: text(item) → 번역문(없으면 원문), translated(item), status(item), busy, error, available
 */
export default function useAutoTranslation(items) {
  const { i18n } = useTranslation();
  const target = normalizeLanguage(i18n.language);
  const auto = AUTO_TRANSLATE_LANGUAGES.has(target);
  const needs = (item) => auto && Boolean(item.text?.trim())
    && (!item.sourceLanguage || normalizeLanguage(item.sourceLanguage) !== target);
  const wanted = items.filter(needs);
  const signature = `${target}|${wanted.map((item) => translationKey(item, target)).join('|')}`;

  const [capable, setCapable] = useState(null); // null: 확인 중
  const [, setVersion] = useState(0);
  const [failedSignature, setFailedSignature] = useState(null);
  const wantedRef = useRef(wanted);
  useEffect(() => { wantedRef.current = wanted; });

  useEffect(() => {
    let active = true;
    getCapabilities().then((caps) => { if (active) setCapable(caps.translate); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const list = wantedRef.current;
    if (!capable || !list.length) return undefined;
    let active = true;
    const [lang] = signature.split('|');
    translateItems(list, lang).then((ok) => {
      if (!active) return;
      setVersion((value) => value + 1);
      if (!ok) setFailedSignature(signature);
    });
    return () => { active = false; };
  }, [capable, signature]);

  const lookup = (item) => (needs(item) ? peekTranslation(translationKey(item, target)) : null);
  const missing = wanted.some((item) => !peekTranslation(translationKey(item, target)));
  const error = Boolean(capable) && missing && failedSignature === signature;
  return {
    available: auto && capable !== false,
    busy: auto && capable !== false && missing && !error,
    error,
    text: (item) => lookup(item)?.text ?? item.text,
    translated: (item) => Boolean(lookup(item)),
    engine: (item) => lookup(item)?.engine ?? null,
    needs,
  };
}

// 목록 카드용: 질문 제목만 번역한다 (상세 화면과 같은 저장 키를 공유)
export function questionTitleItem(question) {
  return { kind: 'question_title', id: question.id, revision: question.revision, text: question.title, sourceLanguage: question.authorLanguage };
}
