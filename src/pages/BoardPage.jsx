import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { categoryLabel } from '@/constants/categories';
import { listQuestions } from '@/data/questionRepository';
import useAuthStore from '@/store/authStore';
import BrandHeader from '@/components/layout/BrandHeader';

export default function BoardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [params, setParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  useEffect(() => { listQuestions(user.id).then(setQuestions); }, [user.id]);
  const category = params.get('category') ?? 'all';
  const status = params.get('status') ?? 'all';
  const filtered = questions.filter((item) => (category === 'all' || item.category === category) && (status === 'all' || (status === 'urgent' ? item.urgent : status === 'adopted' ? item.status === 'adopted' : item.status !== 'adopted')));
  return <div className="screen board-screen"><BrandHeader /><div className="board-title"><button onClick={() => navigate('/home')} aria-label={t('common.back')}>❮</button><h1>{t('qna.board')}</h1></div><div className="screen-scroll board-scroll">
    <div className="status-pills">{['all', 'open', 'adopted', 'urgent'].map((id) => <button key={id} className={status === id ? 'selected' : ''} onClick={() => setParams(id === 'all' ? category === 'all' ? {} : { category } : { ...(category === 'all' ? {} : { category }), status: id })}>{t(`qna.filter.${id}`)}</button>)}</div>
    {filtered.length ? filtered.map((item) => <button className="question-card" key={item.id} onClick={() => navigate(`/qna/${item.id}`)}><span className="card-badges"><em>{categoryLabel(item.category, i18n.language)}</em>{item.status === 'adopted' ? <em className="adopted-tag">✓ {t('qna.filter.adopted')}</em> : <em className="points-tag">{item.rewardPoints}P</em>}</span><strong>{item.title}</strong><small>{t('ui.answers', { count: 0 })}<span>{new Date(item.createdAt).toLocaleDateString(i18n.language)} {item.urgent ? ' 🚨' : ''}</span></small></button>) : <div className="empty-card">{t('qna.noResults')}</div>}
  </div></div>;
}
