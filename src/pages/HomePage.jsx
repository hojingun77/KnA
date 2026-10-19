import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '@/constants/categories';

/**
 * 홈 화면
 * 기획: 8개 주요 카테고리 + 지금 뜨는 질문 목록
 * 현재: 셋팅 확인용 더미 UI (피그마 와이어프레임 확정 후 실제 구현)
 */
export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-ink">{t('home.title')}</h1>
      </div>

      {/* 카테고리 */}
      <div className="px-4 py-2">
        <h2 className="text-sm font-medium text-ink-secondary mb-3">{t('home.categories')}</h2>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-muted border border-border text-center"
            >
              <span className="text-2xl mb-1">📌</span>
              <span className="text-xs font-medium text-ink leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 지금 뜨는 질문 */}
      <div className="px-4 py-2 flex-1">
        <h2 className="text-sm font-medium text-ink-secondary mb-3">{t('home.liveQuestions')}</h2>
        <div className="flex flex-col gap-2">
          {/* 더미 카드 */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-xl bg-surface-card border border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">비자·체류</span>
                <span className="text-xs text-ink-secondary">방금 전</span>
              </div>
              <p className="text-sm font-medium text-ink">더미 질문 {i}: 비자 연장 신청은 어떻게 하나요?</p>
              <p className="text-xs text-ink-secondary mt-1">{t('qna.answerCount', { count: 0 })}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
