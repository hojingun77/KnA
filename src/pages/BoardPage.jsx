import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { categoryLabel } from '@/constants/categories';
import { listQuestions } from '@/data/questionRepository';
import { getAnswerCounts } from '@/data/answerRepository';
import useAuthStore from '@/store/authStore';
import BrandHeader from '@/components/layout/BrandHeader';
import urgentIcon from '@/assets/figma/compose-urgent-icon.svg';
import BackButton from '@/components/ui/BackButton';

export default function BoardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [params, setParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [answerCounts, setAnswerCounts] = useState({});
  useEffect(() => { Promise.all([listQuestions(user.id), getAnswerCounts()]).then(([items, counts]) => { setQuestions(items); setAnswerCounts(counts); }); }, [user.id]);
  const category = params.get('category') ?? 'all';
  const status = params.get('status') ?? 'all';
  const filtered = questions.filter((item) =>
    (category === 'all' || item.category === category) &&
    (status === 'all' || (status === 'urgent' ? item.urgent : status === 'adopted' ? item.status === 'adopted' : item.status !== 'adopted'))
  );
  return (
    <div className="screen board-screen">
      <BrandHeader />
      <div className="board-title">
        <BackButton onClick={() => navigate('/home')} />
        <h1>{t('qna.board')}</h1>
      </div>
      <div className="screen-scroll board-scroll">
        <div className="status-pills">
          {['all', 'open', 'adopted', 'urgent'].map((id) => (
            <button key={id} className={status === id ? 'selected' : ''} onClick={() => setParams(id === 'all' ? category === 'all' ? {} : { category } : { ...(category === 'all' ? {} : { category }), status: id })}>
              {t(`qna.filter.${id}`)}
            </button>
          ))}
        </div>
        {filtered.length ? filtered.map((item) => (
          <button className="question-card" key={item.id} onClick={() => navigate(`/qna/${item.id}`)}>
            <span className="card-badges">
              <em>{categoryLabel(item.category, i18n.language)}</em>
              {item.status === 'adopted'
                ? <em className="adopted-tag">✓ {t('qna.filter.adopted')}</em>
                : <em className="points-tag">{item.rewardPoints}P</em>}
              {item.authorLanguage && <em className="card-lang">{item.authorLanguage.toUpperCase().slice(0, 2)}</em>}
            </span>
            <strong>{item.title}</strong>
            <small>
              {t('ui.answers', { count: answerCounts[item.id] ?? 0 })}
              <span className="card-meta-right">{new Date(item.createdAt).toLocaleDateString(i18n.language)}{item.urgent && <img className="card-urgent-icon-bottom" src={urgentIcon} alt={t('qna.filter.urgent')} />}</span>
            </small>
          </button>
        )) : <div className="empty-card">{t('qna.noResults')}</div>}
      </div>
    </div>
  );
}
