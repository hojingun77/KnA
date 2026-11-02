import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BrandHeader from '@/components/layout/BrandHeader';
import { deviceLanguage } from '@/i18n';
import { resetDemoData } from '@/data/demoRepository';
import useAuthStore from '@/store/authStore';
import avatarBackground from '@/assets/figma/profile-avatar-bg.svg';
import avatarIcon from '@/assets/figma/profile-avatar-icon.svg';
import chevron from '@/assets/figma/profile-chevron.svg';

const SECTIONS = [
  { title: 'personalSection', rows: ['changeNickname', 'changePassword', 'changeTitle'] },
  { title: 'rewardsSection', rows: ['digitalOnnuriLink'] },
  { title: 'appSettings', rows: ['notificationSettings', 'privacyPolicy'] },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [resetPending, setResetPending] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState('');
  const resetTimer = useRef(null);
  useEffect(() => () => clearTimeout(resetTimer.current), []);
  async function logout() {
    clearTimeout(resetTimer.current);
    setUser(null);
    await i18n.changeLanguage(deviceLanguage);
    navigate('/login', { replace: true });
  }
  async function resetAll() {
    if (resetBusy) return;
    if (!resetPending) {
      setResetError('');
      setResetPending(true);
      resetTimer.current = setTimeout(() => setResetPending(false), 3000);
      return;
    }
    clearTimeout(resetTimer.current);
    setResetBusy(true);
    try {
      await resetDemoData();
      setUser(null);
      await i18n.changeLanguage(deviceLanguage);
      navigate('/login', { replace: true });
    } catch {
      setResetPending(false);
      setResetError(t('profile.resetError'));
    } finally {
      setResetBusy(false);
    }
  }
  return <div className="screen profile-screen"><BrandHeader /><div className="profile-content">
    <div className="profile-card"><span className="profile-avatar" aria-hidden="true"><img src={avatarBackground} alt="" /><img src={avatarIcon} alt="" /></span><div><strong>{user.nickname}</strong><span>{user.email}</span></div></div>
    {SECTIONS.map((section) => <section className="profile-section" key={section.title}><h2>{t(`profile.${section.title}`)}</h2>{section.rows.map((row) => row === 'changeTitle' ? <button className="profile-static-row profile-link-row" key={row} onClick={() => navigate('/profile/titles')}><span>{t(`profile.${row}`)}</span><img src={chevron} alt="" /></button> : <div className="profile-static-row" key={row}><span>{t(`profile.${row}`)}</span><img src={chevron} alt="" /></div>)}</section>)}
    <button className="profile-logout" onClick={logout}>{t('auth.logout')}</button>
    <button className="profile-reset" onClick={resetAll} disabled={resetBusy}>{resetBusy ? t('profile.resetting') : resetPending ? t('profile.resetAgain') : t('profile.resetAll')}</button>
    {resetError && <p className="form-error" role="alert">{resetError}</p>}
  </div></div>;
}
