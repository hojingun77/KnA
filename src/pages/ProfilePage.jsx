import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BrandHeader from '@/components/layout/BrandHeader';
import { deviceLanguage } from '@/i18n';
import useAuthStore from '@/store/authStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, setUser } = useAuthStore();
  async function logout() {
    setUser(null);
    await i18n.changeLanguage(deviceLanguage);
    navigate('/login', { replace: true });
  }
  return <div className="screen profile-screen"><BrandHeader /><div className="profile-content">
    <h1>{t('profile.title')}</h1>
    <div className="profile-card"><span className="profile-avatar" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg></span><div><strong>{user.nickname}</strong><span>{user.email}</span></div></div>
    <button className="profile-row" onClick={() => navigate('/reward')}>{t('nav.points')} <span aria-hidden="true">›</span></button>
    <button className="profile-logout" onClick={logout}>{t('auth.logout')}</button>
  </div></div>;
}
