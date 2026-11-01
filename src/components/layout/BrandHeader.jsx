import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function HeaderIcon({ kind }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'profile' ? <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></> : <><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" /><path d="M10 20a2 2 0 0 0 4 0" /></>}
  </svg>;
}

export default function BrandHeader() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return <header className="brand-header">
    <button className="brand-home" onClick={() => navigate('/home')} aria-label={t('nav.home')}>K&A</button>
    <div className="header-actions">
      <button onClick={() => navigate('/profile')} aria-label={t('nav.profile')}><HeaderIcon kind="profile" /></button>
      <button onClick={() => navigate('/notifications')} aria-label={t('notification.title')}><HeaderIcon kind="bell" /></button>
    </div>
  </header>;
}
