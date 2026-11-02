import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authenticateDemo } from '@/data/demoRepository';
import useAuthStore from '@/store/authStore';
import logo from '@/assets/figma/login-logo.svg';
import wordmark from '@/assets/figma/login-wordmark.svg';
import kakao from '@/assets/figma/kakao-icon.svg';
import google from '@/assets/figma/google-icon.svg';
import apple from '@/assets/figma/apple-icon.svg';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await authenticateDemo(email, password);
      if (!user) { setError(t('auth.loginFailed')); return; }
      await i18n.changeLanguage(user.uiLanguage);
      navigate('/loading', { replace: true });
      setUser(user);
    } catch { setError(t('common.error')); }
    finally { setBusy(false); }
  }

  return <main className="login-page">
    <div className="login-brand"><img className="login-logo" src={logo} alt="" /><img className="login-wordmark" src={wordmark} alt="K&A" /><p>{t('demo.tagline')}</p></div>
    <form className="login-form" onSubmit={submit}>
      <label className="sr-only" htmlFor="login-email">{t('auth.email')}</label>
      <input id="login-email" type="text" inputMode="email" autoComplete="username" placeholder={t('auth.email')} value={email} onChange={(event) => setEmail(event.target.value)} required />
      <label className="sr-only" htmlFor="login-password">{t('auth.password')}</label>
      <input id="login-password" type="password" autoComplete="current-password" placeholder={t('auth.password')} value={password} onChange={(event) => setPassword(event.target.value)} required />
      {error && <p className="login-error" role="alert">{error}</p>}
      <button className="login-submit" disabled={busy} type="submit">{busy ? t('common.loading') : t('auth.login')}</button>
    </form>
    <div className="login-links"><span>{t('demo.forgot')}</span><span>{t('auth.signup')}</span></div>
    <div className="login-divider"><span>{t('demo.or')}</span></div>
    <div className="social-buttons" aria-hidden="true"><div className="social-kakao"><img src={kakao} alt="" />{t('ui.loginKakao')}</div><div><img src={google} alt="" />{t('ui.loginGoogle')}</div><div><img src={apple} alt="" />{t('ui.loginApple')}</div></div>
  </main>;
}
