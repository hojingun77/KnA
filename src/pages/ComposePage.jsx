import { useEffect, useRef, useState } from 'react';
import useHeaderStore from '@/store/headerStore';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CATEGORIES, CATEGORY_ICONS, categoryLabel } from '@/constants/categories';
import { createQuestion, getQuestion, listAttachments, updateQuestion } from '@/data/questionRepository';
import useAuthStore from '@/store/authStore';
import composePhotoBg from '@/assets/figma/compose-photo-bg.svg';
import composePhotoIcon from '@/assets/figma/compose-photo-icon.svg';
import composeUrgentIcon from '@/assets/figma/compose-urgent-icon.svg';
import { classifyReward, getCapabilities } from '@/api/llm';

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
  const [savedFiles, setSavedFiles] = useState([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // 질문 보상 분류 (kna-reward-v1): null | 'analyzing' | 'failed'
  const [rewardPhase, setRewardPhase] = useState(null);
  const [rewardFailure, setRewardFailure] = useState(null);
  const mounted = useRef(true);
  // 개발 모드(StrictMode)는 마운트→정리→재마운트를 한 번 더 하므로 재마운트 때 true로 되돌린다.
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const { setHeader, clearHeader } = useHeaderStore();
  useEffect(() => { setHeader({ title: t('question.write'), onMore: null, showIcons: false }); return () => clearHeader(); }, [t]);
  useEffect(() => { if (questionId) Promise.all([getQuestion(questionId), listAttachments(questionId)]).then(([question, attachments]) => {
    if (!question || question.ownerId !== user.id) { navigate('/qna', { replace: true }); return; }
    setExisting(question); setCategory(question.category); setTitle(question.title); setBody(question.body); setUrgent(question.urgent); setSavedFiles(attachments);
  }); }, [questionId, user.id, navigate]);
  function onFiles(event) {
    const next = [...files, ...event.target.files];
    const combined = [...savedFiles.filter((file) => !removedAttachmentIds.includes(file.id)), ...next];
    if (combined.length > 20 || combined.some((file) => !ALLOWED.has(file.type) || file.size > 10 * 1024 * 1024) || combined.reduce((sum, file) => sum + file.size, 0) > 50 * 1024 * 1024) {
      setError(t('ui.uploadError')); return;
    }
    setFiles(next); setError(''); event.target.value = '';
  }
  async function register(reward) {
    try {
      const question = await createQuestion({ ownerId: user.id, title: title.trim(), body: body.trim(), category, urgent, authorLanguage: i18n.language, files, reward });
      if (mounted.current) navigate(`/qna/${question.id}/complete`, { replace: true });
    } catch {
      if (!mounted.current) return;
      setRewardPhase(null); setError(t('common.error')); setBusy(false);
    }
  }
  async function classifyAndRegister() {
    setBusy(true); setError(''); setRewardPhase('analyzing'); setRewardFailure(null);
    try {
      const result = await classifyReward({ title: title.trim(), body: body.trim(), outputLocale: i18n.language });
      if (!mounted.current) return; // 화면을 떠난 뒤 도착한 응답은 버린다.
      if (result.status === 'classified') { await register({ source: 'llm', ...result }); return; }
      setRewardFailure('insufficient_context');
    } catch {
      if (!mounted.current) return;
      setRewardFailure('unavailable');
    }
    setRewardPhase('failed'); setBusy(false);
  }
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    if (!title.trim() || !body.trim()) { setError(t('ui.required')); return; }
    if (existing) {
      setBusy(true); setError('');
      try {
        const question = await updateQuestion(existing, { title: title.trim(), body: body.trim(), category, urgent }, { files, removedAttachmentIds });
        navigate(`/qna/${question.id}`, { replace: true });
      } catch { setError(t('common.error')); setBusy(false); }
      return;
    }
    setBusy(true); setError('');
    const caps = await getCapabilities();
    if (!caps.reward) { await register({ source: 'default', defaultReason: 'llm_disabled' }); return; }
    await classifyAndRegister();
  }
  function registerWithDefault() {
    setBusy(true); setRewardPhase('analyzing');
    register({ source: 'default', defaultReason: rewardFailure ?? 'unavailable' });
  }
  return <div className={`screen compose-screen${i18n.language === 'vi' ? ' compose-vi' : ''}`}><form className="compose-form" onSubmit={submit}>
    <label>{t('question.category')}</label><div className="compose-categories">{CATEGORIES.map(([id]) => <button key={id} type="button" className={category === id ? 'selected' : ''} onClick={() => setCategory(id)}><img src={CATEGORY_ICONS[id]} alt="" />{categoryLabel(id, i18n.language)}</button>)}</div>
    <label htmlFor="question-title">{t('question.title')}</label><input id="question-title" maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('ui.titlePlaceholder')} />
    <label htmlFor="question-body">{t('question.content')}</label><textarea id="question-body" maxLength={2000} value={body} onChange={(event) => setBody(event.target.value)} placeholder={t('ui.bodyPlaceholder')} />
    <div className="compose-options"><label className="compose-photo-btn"><img className="compose-photo-bg" src={composePhotoBg} alt="" /><img className="compose-photo-icon" src={composePhotoIcon} alt="" /><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onFiles} hidden /></label><button className={urgent ? 'compose-urgent-btn selected' : 'compose-urgent-btn'} type="button" onClick={() => setUrgent(!urgent)}><img className="compose-urgent-bg" src={composePhotoBg} alt="" /><img className="compose-urgent-icon" src={composeUrgentIcon} alt="" /><span>{t('question.urgent')}</span></button></div>
    {savedFiles.length > 0 && <div className="file-list">{savedFiles.filter((file) => !removedAttachmentIds.includes(file.id)).map((file) => <button key={file.id} type="button" onClick={() => setRemovedAttachmentIds([...removedAttachmentIds, file.id])}>{file.name} ×</button>)}</div>}
    {files.length > 0 && <div className="file-list">{files.map((file, index) => <button key={`${file.name}-${index}`} type="button" onClick={() => setFiles(files.filter((_, i) => i !== index))}>{file.name} ×</button>)}</div>}
    <p className="reward-hint">{t(existing ? 'ui.editRewardHint' : 'ui.rewardHint')}</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="primary-action" disabled={busy} type="submit">{busy ? t('common.loading') : existing ? t('common.save') : t('ui.post')}</button>
  </form>
  {rewardPhase && <div className="modal-backdrop reward-backdrop">
    <section className="delete-dialog reward-dialog" role={rewardPhase === 'failed' ? 'alertdialog' : 'status'} aria-modal="true" aria-live="polite">
      {rewardPhase === 'analyzing' ? <>
        <span className="reward-spinner" aria-hidden="true" />
        <h2>{t('ui.llm.rewardAnalyzingTitle')}</h2>
        <p>{t('ui.llm.rewardAnalyzingSteps')}</p>
      </> : <>
        <h2>{rewardFailure === 'insufficient_context' ? t('ui.llm.rewardInsufficient') : t('ui.llm.rewardFailed')}</h2>
        <button className="primary-action" onClick={registerWithDefault}>{t('ui.llm.rewardUseDefault')}</button>
        <div className="delete-actions">
          <button className="cancel-action" onClick={() => setRewardPhase(null)}>{t('common.cancel')}</button>
          <button className="cancel-action" onClick={classifyAndRegister}>{t('ui.llm.rewardRetry')}</button>
        </div>
      </>}
    </section>
  </div>}
  </div>;
}
