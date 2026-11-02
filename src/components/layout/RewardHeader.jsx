import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { getUnreadNotificationCount } from '@/data/notificationRepository';
import useAuthStore from '@/store/authStore';
import qaHeaderBg from '@/assets/figma/qa-header-bg.svg';
import qaBackButton from '@/assets/figma/qa-back-button.svg';
import profileIcon from '@/assets/figma/header-icon-profile.svg';
import bellIcon from '@/assets/figma/header-icon-bell.svg';

/**
 * 리워드 페이지 공통 상단바 (Figma 949:851)
 * - 좌측: 뒤로가기
 * - 우측: 프로필 + 알림 아이콘 (BrandHeader와 동일 배치·기능)
 */
export default function RewardHeader({ onBack }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    function refresh() { getUnreadNotificationCount(user.id).then(setUnreadCount); }
    refresh();
    window.addEventListener('kna-notifications-changed', refresh);
    return () => window.removeEventListener('kna-notifications-changed', refresh);
  }, [user.id]);

  return (
    <header className="qa-header">
      <img className="qa-header-bg" src={qaHeaderBg} alt="" aria-hidden="true" />
      <div className="qa-header-inner">
        <button className="qa-header-back" type="button" onClick={onBack} aria-label="뒤로가기">
          <img src={qaBackButton} alt="" />
        </button>
        <div className="qa-header-right header-actions">
          <button onClick={() => navigate('/profile')} aria-label={t('nav.profile')}>
            <img src={profileIcon} alt="" />
          </button>
          <button className="notification-button" onClick={() => navigate('/notifications')} aria-label={t('notification.title')}>
            <img src={bellIcon} alt="" />
            {unreadCount > 0 && <span className="notification-dot" aria-label={`${unreadCount} unread`} />}
          </button>
        </div>
      </div>
    </header>
  );
}
