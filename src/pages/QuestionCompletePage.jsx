import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getQuestion } from '@/data/questionRepository';
import { categoryLabel } from '@/constants/categories';
import checkIcon from '@/assets/figma/question-complete.svg';

export default function QuestionCompletePage() {
  const { questionId } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(undefined);
  useEffect(() => { getQuestion(questionId).then(setQuestion); }, [questionId]);
  if (question === undefined) return <p className="center-message">{t('common.loading')}</p>;
  if (question === null) return <div className="center-message"><button onClick={() => navigate('/qna')}>{t('qna.noResults')}</button></div>;
  const base = question.urgent ? question.rewardPoints / 1.5 : question.rewardPoints;
  return <div className="screen complete-screen"><header className="brand-header"><strong>K&A</strong></header><div className="complete-body">
    <img src={checkIcon} alt="" /><small>{t('ui.registered')}</small><h1>{t('ui.questionPosted')}</h1><p>{t('ui.defaultRewardNotice')}</p>
    <div className="complete-reward"><span>{t('ui.fixedReward')}</span><strong>{question.rewardPoints}P</strong><div><span>{t('question.urgent')}<b>{question.urgent ? `+${question.rewardPoints - base}P` : '—'}</b></span><span>{t('question.category')}<b>{categoryLabel(question.category, i18n.language)}</b></span><span>{t('ui.basicReward')}<b>+{base}P</b></span></div><p>{t('ui.defaultRewardReason')}</p></div>
    <p className="complete-note">{t('ui.autoAdoptionNotice')}</p><button className="primary-action" onClick={() => navigate(`/qna/${question.id}`, { replace: true })}>{t('ui.viewQuestion')}</button><button className="cancel-action" onClick={() => navigate('/home', { replace: true })}>{t('nav.home')}</button>
  </div></div>;
}
