import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPointOverview } from '@/data/demoRepository';
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import BrandHeader from '@/components/layout/BrandHeader';

export default function PointsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [convert, setConvert] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { getPointOverview(user.id).then(setOverview); }, [user.id]);
  function submit() {
    const numeric = Number(amount);
    if (!Number.isSafeInteger(numeric) || numeric < 1000 || numeric % 1000 !== 0 || numeric > overview.balance) { setError(t('demo.invalidAmount')); return; }
    setConvert(false); setError(''); setToast(t('demo.notice')); setTimeout(() => setToast(''), 2500);
  }
  return <div className="screen points-screen"><BrandHeader /><div className="points-toolbar"><button onClick={() => navigate('/home')} aria-label={t('common.back')}>❮</button><span>⋮</span></div><div className="screen-scroll points-scroll">
    <button className="points-banner" onClick={() => setConvert(true)}><span>{t('demo.myPoints')}<strong>{(overview?.balance ?? 1000).toLocaleString()}P</strong><small>{overview?.snapshot ? t('ui.monthly') : ''}</small></span><span className="banner-link">{t('reward.transfer')} ❯</span></button>
    <div className="information-banner">ⓘ &nbsp; {t('ui.pointNotice')}</div>
    <h2>{t('demo.history')}</h2>
    {overview?.snapshot?.entries.map((entry) => <div className="history-row" key={entry.id}><span><strong>{t(`ui.history.${entry.id}`)}</strong><small>{entry.dateLabel ? t(`ui.historyDate.${entry.id}`) : ''}</small></span><b className={entry.amount > 0 ? 'positive' : ''}>{entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}</b></div>)}
    {!overview?.snapshot && <div className="empty-card">{t('demo.history')} 0</div>}
  </div>
  {convert && <div className="modal-backdrop"><div className="conversion-sheet"><div className="sheet-handle" /><h2>{t('ui.conversionTitle')}</h2><p>{t('ui.conversionHelp')}</p><label htmlFor="conversion-amount">{t('demo.amount')}</label><div className="amount-field"><input id="conversion-amount" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, ''))} /><span>{t('ui.currency')}</span></div><div className="connection-row">{t('ui.linkedLabel')} <strong>{t('ui.notLinked')}</strong></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-action" onClick={submit}>{t('ui.conversionButton', { amount: Number(amount || 0).toLocaleString() })}</button><button className="cancel-action" onClick={() => { setConvert(false); setError(''); }}>{t('common.cancel')}</button></div></div>}
  {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}
