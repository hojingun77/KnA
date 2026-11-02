import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BrandHeader from '@/components/layout/BrandHeader';
import { deviceLanguage } from '@/i18n';
import { resetDemoData } from '@/data/demoRepository';
import { updateDemoNickname, updateDemoPassword } from '@/data/demoRepository';
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
  const [sheet, setSheet] = useState(null);
  const [nickname, setNickname] = useState(user.nickname);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [sheetError, setSheetError] = useState('');
  const [sheetBusy, setSheetBusy] = useState(false);
  const resetTimer = useRef(null);
  useEffect(() => () => clearTimeout(resetTimer.current), []);
  function openSheet(type) {
    setSheet(type);
    setSheetError('');
    setNickname(user.nickname);
    setPasswords({ current: '', next: '', confirm: '' });
  }
  function closeSheet() {
    if (!sheetBusy) setSheet(null);
  }
  async function submitSheet(event) {
    event.preventDefault();
    if (sheetBusy) return;
    setSheetBusy(true);
    setSheetError('');
    try {
      if (sheet === 'nickname') {
        const updated = await updateDemoNickname(user.id, nickname);
        setUser(updated);
      } else {
        if (passwords.next !== passwords.confirm) throw new Error('Password confirmation does not match');
        await updateDemoPassword(user.id, passwords.current, passwords.next);
      }
      setSheet(null);
    } catch (error) {
      const message = error.message === 'Invalid nickname' ? t('profile.nicknameInvalid')
        : error.message === 'Current password is incorrect' ? t('profile.currentPasswordInvalid')
          : error.message === 'Password confirmation does not match' ? t('profile.passwordMismatch')
            : error.message === 'Password does not meet requirements' ? t('profile.passwordInvalid')
            : error.message === 'Password is unchanged' ? t('profile.passwordUnchanged')
            : t('profile.changeError');
      setSheetError(message);
    } finally { setSheetBusy(false); }
  }
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
    {SECTIONS.map((section) => <section className="profile-section" key={section.title}><h2>{t(`profile.${section.title}`)}</h2>{section.rows.map((row) => {
      const action = row === 'changeNickname' ? () => openSheet('nickname') : row === 'changePassword' ? () => openSheet('password') : row === 'changeTitle' ? () => navigate('/profile/titles') : null;
      const content = <><span>{t(`profile.${row}`)}</span>{row === 'changeNickname' && <small>{user.nickname}</small>}<img src={chevron} alt="" /></>;
      return action ? <button className="profile-static-row profile-link-row" key={row} onClick={action}>{content}</button> : <div className="profile-static-row" key={row}>{content}</div>;
    })}</section>)}
    <button className="profile-logout" onClick={logout}>{t('auth.logout')}</button>
    <button className="profile-reset" onClick={resetAll} disabled={resetBusy}>{resetBusy ? t('profile.resetting') : resetPending ? t('profile.resetAgain') : t('profile.resetAll')}</button>
    {resetError && <p className="form-error" role="alert">{resetError}</p>}
    {sheet && <div className="modal-backdrop profile-sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeSheet(); }}>
      <section className="profile-edit-sheet" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
        <div className="sheet-handle" />
        {sheet === 'nickname' ? <>
          <h2 id="profile-edit-title">{t('profile.changeNickname')}</h2>
          <p>{t('profile.nicknameHelp')}</p>
          <form onSubmit={submitSheet}>
            <label htmlFor="new-nickname">{t('profile.newNickname')}</label>
            <input id="new-nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} autoComplete="nickname" maxLength={12} />
            {sheetError && <p className="form-error" role="alert">{sheetError}</p>}
            <button className="primary-action" type="submit" disabled={sheetBusy}>{t('profile.changeButton')}</button>
            <button className="cancel-action" type="button" onClick={closeSheet} disabled={sheetBusy}>{t('common.cancel')}</button>
          </form>
        </> : <>
          <h2 id="profile-edit-title">{t('profile.changePassword')}</h2>
          <p>{t('profile.passwordHelp')}</p>
          <form onSubmit={submitSheet}>
            <label htmlFor="current-password">{t('profile.currentPassword')}</label>
            <input id="current-password" type="password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} autoComplete="current-password" />
            <label htmlFor="new-password">{t('profile.newPassword')}</label>
            <input id="new-password" type="password" value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} autoComplete="new-password" />
            <label htmlFor="confirm-password">{t('profile.confirmPassword')}</label>
            <input id="confirm-password" type="password" value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} autoComplete="new-password" />
            {sheetError && <p className="form-error" role="alert">{sheetError}</p>}
            <button className="primary-action" type="submit" disabled={sheetBusy}>{t('profile.changeButton')}</button>
            <button className="cancel-action" type="button" onClick={closeSheet} disabled={sheetBusy}>{t('common.cancel')}</button>
          </form>
        </>}
      </section>
    </div>}
  </div></div>;
}
