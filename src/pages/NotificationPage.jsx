import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BrandHeader from '@/components/layout/BrandHeader';
import { listNotifications, markNotificationRead } from '@/data/notificationRepository';
import { getQuestion } from '@/data/questionRepository';
import useAuthStore from '@/store/authStore';
import BackButton from '@/components/ui/BackButton';
import { useEffect, useState } from 'react';

export default function NotificationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => { listNotifications(user.id).then(setNotifications); }, [user.id]);

  async function openNotification(notification) {
    await markNotificationRead(notification.id, user.id);
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item));
    if (await getQuestion(notification.questionId)) navigate(`/qna/${notification.questionId}`);
  }

  function notificationText(notification) {
    if (notification.type === 'adopted') return t('ui.notificationAccepted', { points: notification.points });
    if (notification.type === 'reply') return t('ui.notificationReply');
    return t('ui.notificationAnswer');
  }

  return <div className="screen notification-screen"><BrandHeader /><div className="board-title"><BackButton onClick={() => navigate(-1)} /><h1>{t('notification.title')}</h1></div><div className="notification-list">
    {notifications.length ? notifications.map((notification) => <button className={`notification-row${notification.readAt ? '' : ' unread'}`} key={notification.id} onClick={() => openNotification(notification)}>
      <span className={`notification-icon ${notification.type}`} aria-hidden="true">{notification.type === 'adopted' ? '✓' : notification.type === 'reply' ? '▤' : '♧'}</span>
      <span className="notification-copy"><strong>{notificationText(notification)}</strong><small>{notification.type === 'adopted' ? t('ui.notificationAcceptedDetail') : notification.type === 'reply' ? t('ui.notificationReplyDetail') : t('ui.notificationAnswerDetail')}</small></span>
      {!notification.readAt && <span className="notification-unread" aria-label={t('ui.unread')} />}
    </button>) : <p className="notification-empty">{t('ui.noNotifications')}</p>}
  </div></div>;
}
