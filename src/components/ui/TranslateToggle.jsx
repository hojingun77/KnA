import { useTranslation } from 'react-i18next';

const ENGINE = { google: 'Google', sllm: 'sLLM' };

/**
 * 원문 보기 / 번역문 보기 버튼. 중국어·베트남어 화면은 자동 번역된 글을 먼저 보여 주고,
 * 버튼을 누르면 같은 자리의 글자만 원문 ↔ 번역문으로 바꾼다 (새 창·나란히 보기 없음).
 * translation: useAutoTranslation 결과, item: 이 버튼이 가리키는 콘텐츠
 */
export default function TranslateToggle({ translation, item, showOriginal, onToggle }) {
  const { t } = useTranslation();
  if (!translation.available || !translation.needs(item)) return null;
  const done = translation.translated(item);
  if (!done) {
    // 번역 중이거나 실패: 원문이 보이는 상태라 바꿀 대상이 없으므로 상태만 표시
    return <div className="translate-row" onClick={(event) => event.stopPropagation()}>
      <span className="translate-meta" role="status">{translation.error ? t('ui.llm.translateUnavailable') : t('ui.llm.translating')}</span>
    </div>;
  }
  return <div className="translate-row" onClick={(event) => event.stopPropagation()}>
    <button type="button" className="translate-button" aria-pressed={showOriginal} onClick={onToggle}>
      {showOriginal ? t('ui.llm.translate') : t('ui.llm.original')}
    </button>
    {!showOriginal && <span className="translate-meta">{t('ui.llm.machine', { engine: ENGINE[translation.engine(item)] ?? translation.engine(item) })}</span>}
  </div>;
}
