import { useEffect, useState } from 'react';
import useHeaderStore from '@/store/headerStore';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getQuestion } from '@/data/questionRepository';
import { categoryLabel } from '@/constants/categories';
import checkIcon from '@/assets/figma/question-complete.svg';

const CONFETTI_COLORS = ['#e46f99', '#6f82d1', '#f6c762', '#72c9a6'];

export default function QuestionCompletePage() {
  const { questionId } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(undefined);
  const { setHeader, clearHeader } = useHeaderStore();
  useEffect(() => { setHeader({ title: null, onMore: null, showIcons: false }); return () => clearHeader(); }, []);
  useEffect(() => { getQuestion(questionId).then(setQuestion); }, [questionId]);
  if (question === undefined) return <p className="center-message">{t('common.loading')}</p>;
  if (question === null) return <div className="center-message"><button onClick={() => navigate('/qna')}>{t('qna.noResults')}</button></div>;
  // 등록 시 확정한 스냅샷을 우선 사용한다. (이전 데이터는 긴급 여부로 역산)
  const urgentAtRegistration = question.isUrgentAtRegistration ?? question.urgent;
  const base = question.basePoints ?? (urgentAtRegistration ? Math.round(question.rewardPoints / 1.5) : question.rewardPoints);
  const aiReward = question.rewardSource === 'llm';
  return <div className="screen complete-screen"><div className="complete-body">
    <div className="complete-confetti" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ left: `${12 + (index * 29) % 76}%`, backgroundColor: CONFETTI_COLORS[index % 4], animationDelay: `${(index % 4) * 0.08}s` }} />)}</div>
    <img src={checkIcon} alt="" /><small>{t('ui.registered')}</small><h1>{t('ui.questionPosted')}</h1><p>{aiReward ? t('ui.llm.aiRewardNotice') : t('ui.defaultRewardNotice')}</p>
    <div className="complete-reward"><span>{t('ui.fixedReward')}</span><strong>{question.rewardPoints}P</strong><div><span>{t('question.urgent')}<b>{urgentAtRegistration ? `+${question.rewardPoints - base}P` : '—'}</b></span><span>{t('question.category')}<b>{categoryLabel(question.category, i18n.language)}</b></span><span>{t('ui.basicReward')}<b>+{base}P</b></span></div>{aiReward ? <><p>{question.rewardReason}</p><span className="reward-ai-tag">{t('ui.llm.tierLabel')} · {t(`ui.llm.tier_${question.rewardTier}`)}</span></> : <><p>{t('ui.defaultRewardReason')}</p><span className="reward-default-tag">{t('ui.llm.defaultBadge')}</span></>}</div>
    <p className="complete-note">{t('ui.autoAdoptionNotice')}</p><button className="primary-action" onClick={() => navigate(`/qna/${question.id}`, { replace: true })}>{t('ui.viewQuestion')}</button><button className="cancel-action" onClick={() => navigate('/home', { replace: true })}>{t('nav.home')}</button>
  </div></div>;
}
