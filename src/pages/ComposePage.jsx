import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CATEGORIES, CATEGORY_ICONS, categoryLabel } from '@/constants/demoCategories';
import { createQuestion, getQuestion, updateQuestion } from '@/data/questionRepository';
import useAuthStore from '@/store/authStore';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export default function ComposePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { questionId } = useParams();
  const user = useAuthStore((state) => state.user);
  const [existing, setExisting] = useState(null);
  const [category, setCategory] = useState('visa');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (questionId) getQuestion(questionId).then((question) => {
    if (!question || question.ownerId !== user.id) { navigate('/qna', { replace: true }); return; }
    setExisting(question); setCategory(question.category); setTitle(question.title); setBody(question.body); setUrgent(question.urgent);
  }); }, [questionId, user.id, navigate]);
  function onFiles(event) {
    const next = [...files, ...event.target.files];
    if (next.length > 20 || next.some((file) => !ALLOWED.has(file.type) || file.size > 10 * 1024 * 1024) || next.reduce((sum, file) => sum + file.size, 0) > 50 * 1024 * 1024) {
      setError(t('ui.uploadError')); return;
    }
    setFiles(next); setError('');
  }
  async function submit(event) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) { setError(t('ui.required')); return; }
    setBusy(true); setError('');
    try {
      const question = existing ? await updateQuestion(existing, { title: title.trim(), body: body.trim(), category, urgent }) : await createQuestion({ ownerId: user.id, title: title.trim(), body: body.trim(), category, urgent, files });
      navigate(`/qna/${question.id}`, { replace: true });
    } catch { setError(t('common.error')); }
    finally { setBusy(false); }
  }
  return <div className="screen compose-screen"><header className="plain-header"><button onClick={() => navigate(-1)} aria-label={t('common.back')}>❮</button><h1>{t('question.write')}</h1></header><form className="compose-form" onSubmit={submit}>
    <label>{t('question.category')}</label><div className="compose-categories">{CATEGORIES.map(([id]) => <button key={id} type="button" className={category === id ? 'selected' : ''} onClick={() => setCategory(id)}><img src={CATEGORY_ICONS[id]} alt="" />{categoryLabel(id, i18n.language)}</button>)}</div>
    <label htmlFor="question-title">{t('question.title')}</label><input id="question-title" maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('ui.titlePlaceholder')} />
    <label htmlFor="question-body">{t('question.content')}</label><textarea id="question-body" maxLength={2000} value={body} onChange={(event) => setBody(event.target.value)} placeholder={t('ui.bodyPlaceholder')} />
    <div className="compose-options">{!existing && <label className="photo-button">▧ {t('question.attachPhoto')}<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onFiles} hidden /></label>}<button className={urgent ? 'urgent selected' : 'urgent'} type="button" disabled={Boolean(existing)} onClick={() => setUrgent(!urgent)}>☼ {t('question.urgent')}</button></div>
    {files.length > 0 && <div className="file-list">{files.map((file, index) => <button key={`${file.name}-${index}`} type="button" onClick={() => setFiles(files.filter((_, i) => i !== index))}>{file.name} ×</button>)}</div>}
    <p className="reward-hint">{t('ui.rewardHint')}</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="primary-action" disabled={busy} type="submit">{busy ? t('common.loading') : existing ? t('common.save') : t('ui.post')}</button>
  </form></div>;
}
