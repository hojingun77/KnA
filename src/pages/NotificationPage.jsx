import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BrandHeader from '@/components/layout/BrandHeader';

export default function NotificationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return <div className="screen notification-screen"><BrandHeader /><div className="board-title"><button onClick={() => navigate(-1)} aria-label={t('common.back')}>❮</button><h1>{t('notification.title')}</h1></div><p className="notification-empty">{t('ui.noNotifications')}</p></div>;
}
