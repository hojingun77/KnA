import { useEffect, useState } from 'react';
import useHeaderStore from '@/store/headerStore';
import { useTranslation } from 'react-i18next';
import { getPointOverview } from '@/data/demoRepository';
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import adoptedIcon from '@/assets/figma/reward-history-adopted.svg';
import convertedIcon from '@/assets/figma/reward-history-converted.svg';

function formatDate(isoString, language) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString(language, { month: 'numeric', day: 'numeric' });
}

export default function PointsPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const { setHeader, clearHeader } = useHeaderStore();
  useEffect(() => { const owner = setHeader({ title: null, onMore: null, showIcons: true }); return () => clearHeader(owner); }, []);
  const [convert, setConvert] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { getPointOverview(user.id).then(setOverview); }, [user.id]);

  function submit() {
    const numeric = Number(amount);
    if (!Number.isSafeInteger(numeric) || numeric < 1000 || numeric % 1000 !== 0 || numeric > overview.balance) {
      setError(t('demo.invalidAmount')); return;
    }
    setConvert(false); setError(''); setToast(t('demo.notice')); setTimeout(() => setToast(''), 2500);
  }

  // 표시할 이력: 스냅샷(한국어 계정) + 실제 원장 항목(kind: adoption)
  function buildHistory() {
    if (!overview) return [];
    const rows = [];
    // 스냅샷 표시용 내역 (한국어 계정 전용)
    if (overview.snapshot?.entries) {
      for (const entry of overview.snapshot.entries) {
        rows.push({ key: entry.id, icon: entry.id === 'voucher' ? convertedIcon : adoptedIcon, label: t(`ui.history.${entry.id}`), date: entry.dateLabel ? t(`ui.historyDate.${entry.id}`) : '', amount: entry.amount });
      }
    }
    // 실제 원장에서 채택 보상 항목 (opening 제외, snapshot ID와 중복 제거)
    for (const entry of overview.ledger) {
      if (entry.kind === 'adoption') {
        rows.push({ key: entry.id, icon: adoptedIcon, label: t('answer.adopted'), date: formatDate(entry.createdAt, i18n.language), amount: entry.amount });
      }
    }
    return rows;
  }

  const history = buildHistory();

  return (
    <div className="screen points-screen">
      <div className="screen-scroll points-scroll">
        <button className="points-banner" onClick={() => setConvert(true)}>
          <span>{t('demo.myPoints')}<strong>{overview ? overview.balance.toLocaleString() : '…'}P</strong><small>{overview?.snapshot ? t('ui.monthly') : ''}</small></span>
          <span className="banner-link">{t('reward.transfer')} ❯</span>
        </button>
        <div className="information-banner">ⓘ &nbsp; {t('ui.pointNotice')}</div>
        <h2>{history.length ? t('ui.allHistory') : t('demo.history')}</h2>
        {history.length ? history.map((row) => (
          <div className="history-row" key={row.key}>
            <img className="history-icon" src={row.icon} alt="" />
            <span className="history-details"><strong>{row.label}</strong>{row.date && <small>{row.date}</small>}</span>
            <b className={row.amount > 0 ? 'positive' : 'negative'}>{row.amount > 0 ? '+' : ''}{row.amount.toLocaleString()}</b>
          </div>
        )) : <div className="empty-card"><p>{t('ui.pointsHistoryEmpty')}</p></div>}
      </div>
      {convert && (
        <div className="modal-backdrop">
          <div className="conversion-sheet">
            <div className="sheet-handle" />
            <h2>{t('ui.conversionTitle')}</h2>
            <p>{t('ui.conversionHelp')}</p>
            <label htmlFor="conversion-amount">{t('demo.amount')}</label>
            <div className="amount-field">
              <input id="conversion-amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} />
              <span>{t('ui.currency')}</span>
            </div>
            <div className="connection-row">{t('ui.linkedLabel')} <strong>{t('ui.notLinked')}</strong></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-action" onClick={submit}>{t('ui.conversionButton', { amount: Number(amount || 0).toLocaleString() })}</button>
            <button className="cancel-action" onClick={() => { setConvert(false); setError(''); }}>{t('common.cancel')}</button>
          </div>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
