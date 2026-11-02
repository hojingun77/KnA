import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { categoryLabel } from '@/constants/categories';
import { listQuestions } from '@/data/questionRepository';
import { addRecentSearch, clearRecentSearches, getRecentSearches, removeRecentSearch } from '@/data/searchRepository';
import useAuthStore from '@/store/authStore';
import BackButton from '@/components/ui/BackButton';
import searchField from '@/assets/figma/search-field.svg';
import qaHeaderBg from '@/assets/figma/qa-header-bg.svg';
import searchIcon from '@/assets/figma/search-icon.svg';
import searchRemove from '@/assets/figma/search-remove.svg';
import urgentIcon from '@/assets/figma/compose-urgent-icon.svg';

export default function SearchPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([getRecentSearches(user.id), listQuestions(user.id)]).then(([terms, items]) => {
      if (active) { setRecent(terms); setQuestions(items); }
    });
    return () => { active = false; };
  }, [user.id]);

  const term = query.trim().toLocaleLowerCase(i18n.language);
  const results = term ? questions.filter((question) =>
    [question.title, question.body, categoryLabel(question.category, i18n.language)]
      .some((value) => value?.toLocaleLowerCase(i18n.language).includes(term))
  ) : [];

  async function submit(event) {
    event.preventDefault();
    if (query.trim()) setRecent(await addRecentSearch(user.id, query));
  }

  async function selectRecentTerm(value) {
    setQuery(value);
    setRecent(await addRecentSearch(user.id, value));
  }

  return (
    <div className="screen search-screen">
      <div className="search-toolbar search-toolbar-qa">
        <img className="search-toolbar-bg" src={qaHeaderBg} alt="" aria-hidden="true" />
        <BackButton className="search-back" onClick={() => navigate(-1)} />
        <form className="search-form" onSubmit={submit}>
          <img className="search-field-bg" src={searchField} alt="" />
          <button className="search-submit" type="submit" aria-label={t('ui.search')}>
            <img src={searchIcon} alt="" />
          </button>
          <input autoFocus aria-label={t('ui.search')} placeholder={t('ui.searchKeywordPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
        </form>
      </div>
      <div className="search-content">
        {!term ? (
          <>
            <div className="search-section-heading">
              <h1>{t('ui.recentSearches')}</h1>
              <button type="button" onClick={async () => setRecent(await clearRecentSearches(user.id))} disabled={!recent.length}>{t('ui.clearAll')}</button>
            </div>
            {recent.length > 0 && (
              <div className="search-recent-list">
                {recent.map((value) => (
                  <div className="search-recent-chip" key={value}>
                    <button type="button" className="search-recent-term" onClick={() => selectRecentTerm(value)}>{value}</button>
                    <button type="button" className="search-recent-remove" onClick={async () => setRecent(await removeRecentSearch(user.id, value))} aria-label={t('ui.removeSearch', { term: value })}>
                      <img src={searchRemove} alt="" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className="search-results-title">{t('ui.searchResults', { count: results.length })}</h1>
            {results.length ? results.map((question) => (
              <button className={`question-card${question.status === 'adopted' ? ' adopted' : ''}`} type="button" key={question.id} onClick={() => navigate(`/qna/${question.id}`)}>
                {question.urgent && <img className="card-urgent-icon-bottom" src={urgentIcon} alt={t('qna.filter.urgent')} />}
                <span className="card-badges">
                  <em>{categoryLabel(question.category, i18n.language)}</em>
                  <em className="points-tag">{question.rewardPoints}P</em>
                  {question.authorLanguage && <em className="card-lang">{question.authorLanguage.toUpperCase().slice(0, 2)}</em>}
                </span>
                <strong>{question.title}</strong>
                <small>
                  <span className="card-meta-right">{new Date(question.createdAt).toLocaleDateString(i18n.language)}</span>
                </small>
              </button>
            )) : <p className="search-empty">{t('ui.noSearchResults')}</p>}
          </>
        )}
      </div>
    </div>
  );
}
