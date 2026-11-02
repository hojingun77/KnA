import qaHeaderBg from '@/assets/figma/qa-header-bg.svg';
import qaBackButton from '@/assets/figma/qa-back-button.svg';
import qaMoreIcon from '@/assets/figma/qa-more-icon.svg';

/**
 * Q&A 계열 화면 공통 상단바
 * - left: 뒤로가기 버튼 (onClick 필수)
 * - title: 중앙 타이틀 (선택)
 * - right: 오른쪽 커스텀 노드 (선택) — 없으면 빈 자리
 * - onMore: ⋮ 버튼 핸들러 (선택) — 전달하면 ⋮ 버튼 표시
 */
export default function QAHeader({ onBack, title, right, onMore }) {
  return (
    <header className="qa-header">
      <img className="qa-header-bg" src={qaHeaderBg} alt="" aria-hidden="true" />
      <div className="qa-header-inner">
        <button className="qa-header-back" type="button" onClick={onBack} aria-label="뒤로가기">
          <img src={qaBackButton} alt="" />
        </button>
        {title && <span className="qa-header-title">{title}</span>}
        <div className="qa-header-right">
          {right}
          {onMore && (
            <button className="qa-header-more" type="button" onClick={onMore} aria-label="더보기">
              <img src={qaMoreIcon} alt="" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
