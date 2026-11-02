import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categoryLabel } from '@/constants/categories';
import { TITLE_COLORS, TITLE_ICONS } from '@/constants/titles';
import { blockQuestion, deleteQuestion, getQuestion, isBlocked, listAttachments } from '@/data/questionRepository';
import { adoptAnswer, createAnswer, deleteAnswer, listAnswers, updateAnswer } from '@/data/answerRepository';
import { getDemoUserSettings } from '@/data/demoRepository';
import { DEMO_USERS } from '@/data/demoAccounts';
import useAuthStore from '@/store/authStore';
import composeUrgentIcon from '@/assets/figma/compose-urgent-icon.svg';
import commentInputBg from '@/assets/figma/comment-input-bg.svg';
import commentSend from '@/assets/figma/comment-send.svg';
import BackButton from '@/components/ui/BackButton';

export default function QuestionPage() {
  const { questionId } = useParams();
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [question, setQuestion] = useState(undefined);
  const [attachments, setAttachments] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answerDraft, setAnswerDraft] = useState('');
  const [sendingAnswer, setSendingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState('');
  const [menu, setMenu] = useState(false);
  const [report, setReport] = useState(false);
  const [reportedReason, setReportedReason] = useState('');
  const [toast, setToast] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  // adopt flow
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [adoptOpen, setAdoptOpen] = useState(false);
  const [adopting, setAdopting] = useState(false);
  const [answerTitles, setAnswerTitles] = useState({}); // answerId -> selectedTitle
  const [answerMenuId, setAnswerMenuId] = useState(null);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingAnswerDraft, setEditingAnswerDraft] = useState('');
  const [replyTargetId, setReplyTargetId] = useState(null);
  const cancelDeleteRef = useRef(null);
  const cancelAdoptRef = useRef(null);
  const questionScrollRef = useRef(null);

  const isOwner = question && question.ownerId === user.id;
  const isAdopted = question && question.status === 'adopted';
  const canAdopt = isOwner && !isAdopted && answers.length > 0;
  const selectedAnswer = answers.find((a) => a.id === selectedAnswerId) ?? null;
  const selectedAnswererNick = selectedAnswer
    ? (DEMO_USERS.find((u) => u.id === selectedAnswer.ownerId)?.nickname ?? user.nickname)
    : '';

  useEffect(() => {
    Promise.all([getQuestion(questionId), listAttachments(questionId), listAnswers(questionId), isBlocked(user.id, questionId)])
      .then(async ([item, files, savedAnswers, blocked]) => {
        if (blocked) { navigate('/qna', { replace: true }); return; }
        setQuestion(item);
        setAttachments(files);
        setAnswers(savedAnswers);
        // 답변자별 칭호 로드
        const ownerIds = [...new Set(savedAnswers.map((a) => a.ownerId))];
        const settingsArr = await Promise.all(ownerIds.map((id) => getDemoUserSettings(id)));
        const titles = {};
        ownerIds.forEach((id, i) => { if (settingsArr[i]?.selectedTitle) titles[id] = settingsArr[i].selectedTitle; });
        setAnswerTitles(titles);
      });
  }, [questionId, user.id, navigate]);

  useEffect(() => {
    if (!deleteOpen) return;
    cancelDeleteRef.current?.focus();
    function onKeyDown(e) { if (e.key === 'Escape' && !deleting) setDeleteOpen(false); }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [deleteOpen, deleting]);

  useEffect(() => {
    if (!adoptOpen) return;
    cancelAdoptRef.current?.focus();
    function onKeyDown(e) { if (e.key === 'Escape' && !adopting) setAdoptOpen(false); }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [adoptOpen, adopting]);

  function share() { setMenu(false); setToast(t('ui.shared')); setTimeout(() => setToast(''), 2000); }

  async function submitAnswer(event) {
    event.preventDefault();
    if (sendingAnswer || !answerDraft.trim()) return;
    setSendingAnswer(true); setAnswerError('');
    try {
      const saved = await createAnswer({ questionId: question.id, ownerId: user.id, body: answerDraft, parentAnswerId: replyTargetId });
      setAnswers((cur) => [...cur, saved]);
      const mySettings = await getDemoUserSettings(user.id);
      if (mySettings?.selectedTitle) setAnswerTitles((cur) => ({ ...cur, [user.id]: mySettings.selectedTitle }));
      setAnswerDraft('');
      setReplyTargetId(null);
      requestAnimationFrame(() => { if (questionScrollRef.current) questionScrollRef.current.scrollTop = questionScrollRef.current.scrollHeight; });
    } catch { setAnswerError(t('ui.answerError')); }
    finally { setSendingAnswer(false); }
  }

  function startAnswerEdit(answer) {
    setAnswerMenuId(null);
    setEditingAnswerId(answer.id);
    setEditingAnswerDraft(answer.body);
  }

  async function saveAnswerEdit(answer) {
    try {
      const updated = await updateAnswer({ answerId: answer.id, ownerId: user.id, body: editingAnswerDraft });
      setAnswers((current) => current.map((item) => item.id === updated.id ? updated : item));
      setEditingAnswerId(null);
      setEditingAnswerDraft('');
    } catch { setAnswerError(t('ui.answerError')); }
  }

  async function removeAnswer(answer) {
    setAnswerMenuId(null);
    if (!window.confirm(t('ui.deleteAnswerConfirm'))) return;
    try {
      const deleted = await deleteAnswer({ answerId: answer.id, ownerId: user.id });
      setAnswers((current) => current.filter((item) => item.id !== deleted.id));
    } catch { setAnswerError(t('ui.answerError')); }
  }

  async function removeOwnQuestion() {
    if (deleting || !isOwner) return;
    setDeleting(true); setDeleteError('');
    try { await deleteQuestion(question); navigate('/qna', { replace: true }); }
    catch { setDeleteError(t('common.error')); setDeleting(false); }
  }

  async function confirmAdopt() {
    if (adopting || !selectedAnswer) return;
    setAdopting(true);
    try {
      const { answer: adopted, question: updatedQ } = await adoptAnswer({ answer: selectedAnswer, question, rewarderId: user.id });
      setQuestion(updatedQ);
      setAnswers((cur) => cur.map((a) => a.id === adopted.id ? adopted : a));
      setAdoptOpen(false);
      setSelectedAnswerId(null);
      setToast(t('ui.adoptToast'));
      setTimeout(() => setToast(''), 3000);
    } catch { setAdopting(false); }
  }

  if (question === undefined) return <div className="screen center-message">{t('common.loading')}</div>;
  if (question === null) return <div className="screen center-message"><button onClick={() => navigate('/qna')}>{t('qna.noResults')}</button></div>;

  function renderAnswer(answer, depth = 0) {
    const nick = DEMO_USERS.find((item) => item.id === answer.ownerId)?.nickname ?? user.nickname;
    const isSelected = selectedAnswerId === answer.id;
    const isThisAdopted = answer.adopted;
    const isEditing = editingAnswerId === answer.id;
    const replies = answers.filter((item) => item.parentAnswerId === answer.id);
    return <div className="qdetail-answer-thread" key={answer.id} style={{ marginLeft: depth ? `${Math.min(depth, 3) * 12}px` : 0 }}>
      <article
        className={`qdetail-answer-card${isSelected ? ' selected' : ''}${isThisAdopted ? ' adopted' : ''}${replyTargetId === answer.id ? ' reply-target' : ''}`}
        onClick={() => { if (canAdopt) setSelectedAnswerId(isSelected ? null : answer.id); }}
        role={canAdopt ? 'button' : undefined}
        tabIndex={canAdopt ? 0 : undefined}
        onKeyDown={(e) => { if (canAdopt && (e.key === 'Enter' || e.key === ' ')) setSelectedAnswerId(isSelected ? null : answer.id); }}
      >
        <div className="qdetail-answer-header">
          {answerTitles[answer.ownerId]
            ? <span className="qdetail-answer-avatar-title" aria-hidden="true" style={{ background: TITLE_COLORS[answerTitles[answer.ownerId]]?.bg }}><img src={TITLE_ICONS[answerTitles[answer.ownerId]]} alt="" /></span>
            : <span className="qdetail-answer-avatar" aria-hidden="true" />}
          <strong className="qdetail-answer-nick">{nick}</strong>
          {answerTitles[answer.ownerId] && <span className="qdetail-title-badge" style={{ background: TITLE_COLORS[answerTitles[answer.ownerId]]?.bg, color: TITLE_COLORS[answerTitles[answer.ownerId]]?.text }}>{t('titles.names.' + answerTitles[answer.ownerId])}</span>}
          {isThisAdopted && <span className="qdetail-adopted-tag">{t('answer.adopted')}</span>}
          <button className="answer-reply-button" aria-label={t('ui.reply')} onClick={(event) => { event.stopPropagation(); setReplyTargetId(answer.id); setAnswerError(''); }}>{t('ui.reply')}</button>
          {answer.ownerId === user.id && !isThisAdopted && <button className="answer-more-button" aria-label={t('ui.more')} onClick={(event) => { event.stopPropagation(); setAnswerMenuId(answerMenuId === answer.id ? null : answer.id); }}>⋮</button>}
        </div>
        {isEditing ? <div className="answer-edit-box" onClick={(event) => event.stopPropagation()}><textarea value={editingAnswerDraft} onChange={(event) => setEditingAnswerDraft(event.target.value)} /><div><button onClick={() => saveAnswerEdit(answer)} disabled={!editingAnswerDraft.trim()}>{t('common.save')}</button><button onClick={() => setEditingAnswerId(null)}>{t('common.cancel')}</button></div></div> : <p className="qdetail-answer-body">{answer.body}</p>}
        {answerMenuId === answer.id && <div className="answer-menu" onClick={(event) => event.stopPropagation()}><button onClick={() => startAnswerEdit(answer)}>{t('ui.edit')}</button><button onClick={() => removeAnswer(answer)}>{t('ui.delete')}</button></div>}
      </article>
      {replies.map((reply) => renderAnswer(reply, depth + 1))}
    </div>;
  }

  return (
    <div className="screen question-screen">
      <header className="plain-header">
        <BackButton onClick={() => navigate(-1)} />
        <button className="more-button" onClick={() => setMenu(!menu)}>⋮</button>
      </header>

      <div ref={questionScrollRef} className="screen-scroll question-scroll">
        {/* 배지 */}
        <div className="qdetail-badges">
          <em className="qdetail-cat">{categoryLabel(question.category, i18n.language)}</em>
          <em className="qdetail-pts">{question.rewardPoints}P</em>
          {question.authorLanguage && <em className="qdetail-lang">{question.authorLanguage.toUpperCase().slice(0,2)}</em>}
          {question.urgent && <img className="qdetail-urgent-icon qdetail-urgent-end" src={composeUrgentIcon} alt={t('qna.filter.urgent')} />}
        </div>

        {/* 제목 / 본문 */}
        <h2 className="qdetail-title">{question.title}</h2>
        <p className="qdetail-body">{question.body}</p>
        {attachments.map((a) => <AttachmentImage key={a.id} attachment={a} />)}

        {/* 메타 행 */}
        <div className="qdetail-meta-row">
          <span className="qdetail-answer-count">{t('ui.answers', { count: answers.length })}</span>
          {!isAdopted && <span className="qdetail-adopt-hint">{t('qna.adoptHint', { points: question.rewardPoints })}</span>}
          {isAdopted && <span className="qdetail-adopted-badge">{t('qna.filter.adopted')}</span>}
        </div>
        <hr className="qdetail-divider" />

        {/* 채택 안내 (질문자 & 미채택) */}
        {canAdopt && (
          <p className="qdetail-adopt-guide">{t('ui.adoptGuide')}</p>
        )}

        {/* 답변 목록 */}
        <section className="qdetail-answers">
          {answers.length ? answers.filter((answer) => !answer.parentAnswerId).map((answer) => renderAnswer(answer)) : <p className="qdetail-empty">{t('ui.emptyAnswers')}</p>}
        </section>
      </div>

      {/* 하단 — 질문자: 답변 채택하기 버튼 / 답변자: 답변 입력창 */}
      {isOwner && !isAdopted && !replyTargetId ? (
        <div className="qdetail-adopt-bar">
          <button
            className="qdetail-adopt-btn"
            disabled={!selectedAnswerId}
            onClick={() => { if (selectedAnswerId) setAdoptOpen(true); }}
          >
            {t('ui.adoptBtn')}
          </button>
        </div>
      ) : isAdopted && isOwner ? (
        <div className="qdetail-adopted-bar">
          <span className="qdetail-adopted-bar-icon">✓</span>
          <span>{t('ui.adoptedComplete')}</span>
        </div>
      ) : !isOwner || replyTargetId ? (
        <form className="answer-composer" onSubmit={submitAnswer}>
          <div className="answer-input-wrap">
            <img className="answer-input-bg" src={commentInputBg} alt="" />
            <textarea
              aria-label={t('ui.answerPlaceholder')}
              placeholder={replyTargetId ? t('ui.replyPlaceholder') : t('ui.answerPlaceholder')}
              rows={1}
              value={answerDraft}
              onChange={(e) => setAnswerDraft(e.target.value)}
            />
            <button type="submit" aria-label={t('ui.sendAnswer')} disabled={sendingAnswer || !answerDraft.trim()}>
              <img src={commentSend} alt="" />
            </button>
          </div>
          {replyTargetId && <button type="button" className="reply-cancel-button" onClick={() => setReplyTargetId(null)}>{t('common.cancel')}</button>}
          {answerError && <p className="answer-input-error" role="alert">{answerError}</p>}
        </form>
      ) : null}

      {/* ⋮ 메뉴 */}
      {menu && (
        <div className="question-menu">
          {isOwner
            ? <><button onClick={() => { setMenu(false); navigate(`/qna/${question.id}/edit`); }}>{t('ui.edit')}</button><button onClick={() => { setMenu(false); setDeleteError(''); setDeleteOpen(true); }}>{t('ui.delete')}</button></>
            : <><button onClick={() => { setMenu(false); setReport(true); }}>{t('ui.report')}</button><button onClick={async () => { await blockQuestion(user.id, question.id); navigate('/qna', { replace: true }); }}>{t('ui.block')}</button></>
          }
          <button onClick={share}>{t('ui.share')}</button>
        </div>
      )}

      {/* 채택 확인 모달 */}
      {adoptOpen && selectedAnswer && (
        <div className="modal-backdrop adopt-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !adopting) setAdoptOpen(false); }}>
          <section className="adopt-modal" role="dialog" aria-modal="true" aria-labelledby="adopt-modal-title">
            <h2 id="adopt-modal-title">{t('ui.adoptConfirmTitle')}</h2>
            <p className="adopt-modal-desc">{t('ui.adoptConfirmDesc', { nick: selectedAnswererNick, points: question.rewardPoints })}</p>
            <div className="adopt-modal-preview">
              <p>{selectedAnswer.body}</p>
            </div>
            <button className="primary-action adopt-confirm-btn" onClick={confirmAdopt} disabled={adopting}>
              {adopting ? t('common.loading') : t('ui.adoptConfirmBtn')}
            </button>
            <button ref={cancelAdoptRef} className="cancel-action" onClick={() => setAdoptOpen(false)} disabled={adopting}>
              {t('common.cancel')}
            </button>
          </section>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteOpen && (
        <div className="modal-backdrop delete-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !deleting) setDeleteOpen(false); }}>
          <section className="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-question-title">
            <h2 id="delete-question-title">{t('ui.deleteConfirm')}</h2>
            {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
            <div className="delete-actions">
              <button ref={cancelDeleteRef} className="cancel-action" onClick={() => setDeleteOpen(false)} disabled={deleting}>{t('common.cancel')}</button>
              <button className="delete-confirm-button" onClick={removeOwnQuestion} disabled={deleting}>{deleting ? t('common.loading') : t('ui.delete')}</button>
            </div>
          </section>
        </div>
      )}

      {/* 신고 시트 */}
      {report && (
        <div className="modal-backdrop">
          <div className="conversion-sheet">
            <div className="sheet-handle" />
            <h2>{t('ui.report')}</h2>
            <div className="report-options">
              {['abuse', 'ads', 'fraud', 'spam', 'illegal'].map((reason) => (
                <button className={reportedReason === reason ? 'selected' : ''} key={reason} onClick={() => { setReportedReason(reason); setReport(false); }}>
                  {t(`ui.reportReasons.${reason}`)}
                </button>
              ))}
            </div>
            <button className="cancel-action" onClick={() => setReport(false)}>{t('common.cancel')}</button>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-with-icon" role="status"><span className="toast-icon" aria-hidden="true">ⓘ</span>{toast}</div>}
    </div>
  );
}

function AttachmentImage({ attachment }) {
  const imageRef = useRef(null);
  useEffect(() => {
    const url = URL.createObjectURL(attachment.blob);
    if (imageRef.current) imageRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [attachment.blob]);
  return <img ref={imageRef} className="attachment-image" alt={attachment.name} />;
}
