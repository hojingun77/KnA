import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@/store/authStore';
import useHeaderStore from '@/store/headerStore';
import { getUnreadNotificationCount } from '@/data/notificationRepository';
import qaHeaderBg from '@/assets/figma/qa-header-bg.svg';
import profileIcon from '@/assets/figma/header-icon-profile.svg';
import bellIcon from '@/assets/figma/header-icon-bell.svg';
import qaMoreIcon from '@/assets/figma/qa-more-icon.svg';

const ROOT_PATHS = new Set(['/home', '/profile', '/reward']);
const isRoot = (p) => ROOT_PATHS.has(p);

export default function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { title, onMore, showIcons } = useHeaderStore();
  const [unreadCount, setUnreadCount] = useState(0);

  const root = isRoot(location.pathname);
  const prevRootRef = useRef(null); // null = 최초 렌더 전
  // slot: 'logo' | 'back' | 'logo-in' | 'back-in' | 'logo-out' | 'back-out'
  const [slot, setSlot] = useState(() => root ? 'logo' : 'back');

  useEffect(() => {
    if (prevRootRef.current === null) {
      // 앱 첫 진입: 애니메이션 없이 즉시 표시
      prevRootRef.current = root;
      setSlot(root ? 'logo' : 'back');
      return;
    }
    const wasRoot = prevRootRef.current;
    prevRootRef.current = root;

    if (wasRoot === root) return; // 하위→하위 이동: 변화 없음

    if (!wasRoot && root) {
      // 하위 → 루트 (pop): 뒤로가기 아웃 + 로고 인
      setSlot('logo-in');
    } else {
      // 루트 → 하위 (push): 로고 아웃 + 뒤로가기 인
      setSlot('back-in');
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // 애니메이션 완료 후 정적 상태로 전환
  function onAnimationEnd() {
    setSlot((s) => s === 'back-in' ? 'back' : s === 'logo-in' ? 'logo' : s);
  }

  useEffect(() => {
    if (!user) return;
    function refresh() { getUnreadNotificationCount(user.id).then(setUnreadCount); }
    refresh();
    window.addEventListener('kna-notifications-changed', refresh);
    return () => window.removeEventListener('kna-notifications-changed', refresh);
  }, [user]);

  if (location.pathname === '/search') return null;

  const logoClass = slot === 'logo'    ? 'appbar-logo appbar-logo--visible'
                  : slot === 'logo-in' ? 'appbar-logo appbar-logo--in'
                  : 'appbar-logo appbar-logo--out';

  const backClass = slot === 'back'    ? 'appbar-back appbar-back--visible'
                  : slot === 'back-in' ? 'appbar-back appbar-back--in'
                  : 'appbar-back appbar-back--out';

  return (
    <header className="appbar">
      <img className="qa-header-bg" src={qaHeaderBg} alt="" aria-hidden="true" />
      <div className="appbar-inner">
        {/* 좌측 슬롯 */}
        <div className="appbar-left" onAnimationEnd={onAnimationEnd}>
          <button
            className={logoClass}
            onClick={() => navigate('/home')}
            aria-label={t('nav.home')}
            tabIndex={slot === 'logo' || slot === 'logo-in' ? 0 : -1}
          >
            K&amp;A
          </button>
          <button
            className={backClass}
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            tabIndex={slot === 'back' || slot === 'back-in' ? 0 : -1}
          >
            <svg width="11.4" height="20.4" viewBox="0 0 11.4 20.4" fill="none" aria-hidden="true">
              <path d="M10.2 1.2L1.2 10.2L10.2 19.2" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 중앙 타이틀 */}
        {title && <span className="appbar-title">{title}</span>}

        {/* 우측 슬롯 */}
        <div className="appbar-right">
          {showIcons ? (
            <div className="header-actions">
              <button onClick={() => navigate('/profile')} aria-label={t('nav.profile')}>
                <img src={profileIcon} alt="" />
              </button>
              <button className="notification-button" onClick={() => navigate('/notifications')} aria-label={t('notification.title')}>
                <img src={bellIcon} alt="" />
                {unreadCount > 0 && <span className="notification-dot" aria-label={`${unreadCount} unread`} />}
              </button>
            </div>
          ) : onMore ? (
            <button className="qa-header-more" type="button" onClick={onMore} aria-label="더보기">
              <img src={qaMoreIcon} alt="" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
