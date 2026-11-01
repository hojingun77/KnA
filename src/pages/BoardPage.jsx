import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { categoryLabel, CATEGORIES } from '@/constants/demoCategories';
import { listQuestions } from '@/data/questionRepository';
import useAuthStore from '@/store/authStore';

export default function BoardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [params, setParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [query, setQuery] = useState('');
  useEffect(() => { listQuestions(user.id).then(setQuestions); }, [user.id]);
  const category = params.get('category') ?? 'all';
  const filtered = questions.filter((item) => (category === 'all' || item.category === category) && `${item.title} ${item.body}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="screen"><header className="plain-header"><h1>{t('qna.board')}</h1></header><div className="screen-scroll board-scroll">
    <input className="search-bar search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('qna.searchPlaceholder')} />
    <div className="category-pills"><button className={category === 'all' ? 'selected' : ''} onClick={() => setParams({})}>{t('qna.filter.all')}</button>{CATEGORIES.map(([id]) => <button key={id} className={category === id ? 'selected' : ''} onClick={() => setParams({ category: id })}>{categoryLabel(id, i18n.language)}</button>)}</div>
    {filtered.length ? filtered.map((item) => <button className="question-card" key={item.id} onClick={() => navigate(`/qna/${item.id}`)}><span className="card-badges"><em>{categoryLabel(item.category, i18n.language)}</em><em className="points-tag">{item.rewardPoints}P</em>{item.urgent && <em>긴급</em>}</span><strong>{item.title}</strong><small>{new Date(item.createdAt).toLocaleDateString(i18n.language)}</small></button>) : <div className="empty-card">{t('qna.noResults')}</div>}
    <button className="floating-action" onClick={() => navigate('/qna/new')}>＋ {t('nav.write')}</button>
  </div></div>;
}
