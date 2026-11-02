import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPointOverview } from '@/data/demoRepository';

const CONFETTI_COLORS = ['#e46f99', '#6f82d1', '#f6c762', '#72c9a6', '#f08080', '#90caf9'];

export default function AdoptDonePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { answer, question, answererNick } = location.state ?? {};
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (answer?.ownerId) getPointOverview(answer.ownerId).then((ov) => setBalance(ov.balance));
  }, [answer]);

  if (!answer || !question) {
    return <div className="screen center-message"><button onClick={() => navigate('/qna')}>{t('qna.noResults')}</button></div>;
  }

  const base = question.urgent ? Math.round(question.rewardPoints / 1.5) : question.rewardPoints;
  const urgentBonus = question.urgent ? question.rewardPoints - base : 0;

  return (
    <div className="screen adopt-done-screen">
      <div className="adopt-done-body">
        <div className="adopt-done-confetti" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} style={{ left: `${8 + (i * 27) % 84}%`, backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length], animationDelay: `${(i % 5) * 0.07}s` }} />
          ))}
        </div>

        <div className="adopt-done-check" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M8 18l7 7 13-13" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <small className="adopt-done-label">{t('ui.adoptDone.label')}</small>
        <h1 className="adopt-done-title">{t('ui.adoptDone.title')}</h1>
        <p className="adopt-done-desc">{t('ui.adoptDone.desc')}</p>

        <div className="adopt-done-reward">
          <span className="adopt-done-reward-label">{t('ui.adoptDone.earnedPoints')}</span>
          <strong className="adopt-done-reward-pts">+{question.rewardPoints}P</strong>
          <div className="adopt-done-reward-row">
            <span><small>{t('ui.adoptDone.adoptBonus')}</small><b>+{base}P</b></span>
            <span><small>{t('ui.adoptDone.urgentBonus')}</small><b>{urgentBonus > 0 ? `+${urgentBonus}P` : '—'}</b></span>
            <span><small>{t('ui.adoptDone.totalPoints')}</small><b>{balance !== null ? `${balance.toLocaleString()}P` : '—'}</b></span>
          </div>
        </div>

        <article className="adopt-done-answer-card">
          <div className="adopt-done-answer-header">
            <span className="qdetail-answer-avatar" aria-hidden="true" />
            <strong>{answererNick}</strong>
            <time className="adopt-done-answer-time">{new Date(answer.createdAt).toLocaleString(i18n.language, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
          </div>
          <p className="adopt-done-answer-body">{answer.body}</p>
        </article>

        <button className="primary-action" onClick={() => navigate('/qna', { replace: true })}>{t('ui.adoptDone.viewAll')}</button>
        <button className="cancel-action" onClick={() => navigate('/qna', { replace: true })}>{t('ui.adoptDone.answerOther')}</button>
      </div>
    </div>
  );
}
