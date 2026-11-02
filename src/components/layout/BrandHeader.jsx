import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { getUnreadNotificationCount } from '@/data/notificationRepository';
import useAuthStore from '@/store/authStore';
import profileIcon from '@/assets/figma/header-icon-profile.svg';
import bellIcon from '@/assets/figma/header-icon-bell.svg';

export default function BrandHeader() {
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
    <header className="brand-header">
      <button className="brand-home" onClick={() => navigate('/home')} aria-label={t('nav.home')}>K&A</button>
      <div className="header-actions">
        <button onClick={() => navigate('/profile')} aria-label={t('nav.profile')}>
          <img src={profileIcon} alt="" />
        </button>
        <button className="notification-button" onClick={() => navigate('/notifications')} aria-label={t('notification.title')}>
          <img src={bellIcon} alt="" />
          {unreadCount > 0 && <span className="notification-dot" aria-label={`${unreadCount} unread`} />}
        </button>
      </div>
    </header>
  );
}
