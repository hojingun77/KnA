import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/figma/login-logo.svg';
import wordmark from '@/assets/figma/login-wordmark.svg';

export default function LoadingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const timeout = setTimeout(() => navigate('/home', { replace: true }), 250);
      return () => clearTimeout(timeout);
    }
    let value = 0;
    const interval = setInterval(() => {
      value += 12;
      setProgress(Math.min(value, 100));
      if (value >= 108) {
        clearInterval(interval);
        navigate('/home', { replace: true });
      }
    }, 320);
    return () => clearInterval(interval);
  }, [navigate]);

  return <main className="loading-screen" aria-label={t('common.loading')}>
    <div className="loading-brand"><img src={logo} alt="" /><img src={wordmark} alt="K&A" /><p>{t('demo.tagline')}</p></div>
    <div className="loading-bottom"><div className="loading-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={t('common.loading')}><i style={{ width: `${progress}%` }} /></div><span>{t('common.loading')}</span></div>
  </main>;
}
