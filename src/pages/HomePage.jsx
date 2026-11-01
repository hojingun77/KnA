import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getPointOverview } from '@/data/demoRepository';
import { listQuestions } from '@/data/questionRepository';
import useAuthStore from '@/store/authStore';
import { DEMO_USERS } from '@/data/demoAccounts';
import { CATEGORIES, CATEGORY_ICONS, categoryLabel } from '@/constants/demoCategories';

/**
 * 홈 화면
 * 기획: 8개 주요 카테고리 + 지금 뜨는 질문 목록
 * 현재: 셋팅 확인용 더미 UI (피그마 와이어프레임 확정 후 실제 구현)
 */
export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [questions, setQuestions] = useState([]);
  const [points, setPoints] = useState(null);
  useEffect(() => {
    Promise.all([listQuestions(user.id), getPointOverview(user.id)]).then(([items, overview]) => { setQuestions(items); setPoints(overview); });
  }, [user.id]);
  return <div className="screen home-screen">
    <header className="brand-header"><strong>K&A</strong><div><button onClick={() => navigate('/profile')} aria-label={t('nav.profile')}>♙</button><button aria-label={t('notification.title')}>♧</button></div></header>
    <div className="screen-scroll home-scroll">
      <button className="search-bar" onClick={() => navigate('/qna')}>⌕ &nbsp; {t('demo.search')}</button>
      <button className="points-banner" onClick={() => navigate('/reward')}><span>{t('demo.myPoints')}<strong>{(points?.balance ?? 1000).toLocaleString()}P</strong><small>{points?.snapshot ? t('ui.monthly') : ''}</small></span><span className="banner-link">{t('reward.transfer')} ❯</span></button>
      <div className="category-grid">{CATEGORIES.map(([id]) => <button key={id} onClick={() => navigate(`/qna?category=${id}`)}><img className="category-symbol" src={CATEGORY_ICONS[id]} alt="" />{categoryLabel(id, i18n.language)}</button>)}</div>
      <div className="section-heading"><h2>🔥 {t('home.liveQuestions')}</h2><button onClick={() => navigate('/qna')}>{t('ui.more')}</button></div>
      {questions.length ? questions.slice(0, 3).map((question) => <button className="question-card" key={question.id} onClick={() => navigate(`/qna/${question.id}`)}><span className="card-badges"><em>{categoryLabel(question.category, i18n.language)}</em><em className="points-tag">{question.rewardPoints}P</em></span><strong>{question.title}</strong><small>{DEMO_USERS.find((entry) => entry.id === question.ownerId)?.nickname ?? 'K&A'} · {t('ui.answers', { count: 0 })}</small></button>) : <div className="empty-card"><p>{t('home.noLiveQuestions')}</p><button onClick={() => navigate('/qna/new')}>{t('demo.start')}</button></div>}
    </div>
  </div>;
}
