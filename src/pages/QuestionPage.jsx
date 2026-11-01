import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categoryLabel } from '@/constants/demoCategories';
import { blockQuestion, deleteQuestion, getQuestion, isBlocked, listAttachments } from '@/data/questionRepository';
import useAuthStore from '@/store/authStore';

export default function QuestionPage() {
  const { questionId } = useParams();
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [menu, setMenu] = useState(false);
  const [report, setReport] = useState(false);
  const [reportedReason, setReportedReason] = useState('');
  const [toast, setToast] = useState('');
  useEffect(() => { Promise.all([getQuestion(questionId), listAttachments(questionId), isBlocked(user.id, questionId)]).then(([item, files, blocked]) => { if (blocked) { navigate('/qna', { replace: true }); return; } setQuestion(item); setAttachments(files); }); }, [questionId, user.id, navigate]);
  function share() { setMenu(false); setToast(t('ui.shared')); setTimeout(() => setToast(''), 2000); }
  if (!question) return <div className="screen center-message">{t('common.loading')}</div>;
  return <div className="screen question-screen"><header className="plain-header"><button onClick={() => navigate(-1)} aria-label={t('common.back')}>❮</button><h1>{t('qna.board')}</h1><button className="more-button" onClick={() => setMenu(!menu)}>⋮</button></header>
    <div className="screen-scroll question-scroll"><div className="card-badges"><em>{categoryLabel(question.category, i18n.language)}</em><em className="points-tag">{question.rewardPoints}P</em>{question.urgent && <em>긴급</em>}</div><h2>{question.title}</h2><p className="question-meta">{question.ownerId === user.id ? user.nickname : 'K&A'} · {new Date(question.createdAt).toLocaleDateString(i18n.language)}</p><p className="question-body">{question.body}</p>
      {attachments.map((attachment) => <AttachmentImage key={attachment.id} attachment={attachment} />)}
      {question.ownerId === user.id && <div className="owner-actions"><button onClick={() => navigate(`/qna/${question.id}/edit`)}>{t('ui.edit')}</button><button onClick={async () => { if (window.confirm(t('ui.deleteConfirm'))) { await deleteQuestion(question); navigate('/qna', { replace: true }); } }}>{t('ui.delete')}</button></div>}
      <section className="answer-placeholder"><h3>{t('ui.answers', { count: 0 })}</h3><p>{t('ui.emptyAnswers')}</p></section>
    </div>
    {menu && <div className="question-menu"><button onClick={() => { setMenu(false); setReport(true); }}>{t('ui.report')}</button><button onClick={async () => { await blockQuestion(user.id, question.id); navigate('/qna', { replace: true }); }}>{t('ui.block')}</button><button onClick={share}>{t('ui.share')}</button></div>}
    {report && <div className="modal-backdrop"><div className="conversion-sheet"><div className="sheet-handle" /><h2>{t('ui.report')}</h2><div className="report-options">{['abuse', 'ads', 'fraud', 'spam', 'illegal'].map((reason) => <button className={reportedReason === reason ? 'selected' : ''} key={reason} onClick={() => { setReportedReason(reason); setReport(false); }}>{t(`ui.reportReasons.${reason}`)}</button>)}</div><button className="cancel-action" onClick={() => setReport(false)}>{t('common.cancel')}</button></div></div>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
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
