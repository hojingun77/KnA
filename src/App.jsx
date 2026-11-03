import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NavigationHistoryProvider } from '@/contexts/NavigationHistoryContext';
import TransitionManager from '@/components/transitions/TransitionManager';
import DeviceFrame from '@/components/layout/DeviceFrame';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import BoardPage from '@/pages/BoardPage';
import ComposePage from '@/pages/ComposePage';
import QuestionPage from '@/pages/QuestionPage';
import PointsPage from '@/pages/PointsPage';
import QuestionCompletePage from '@/pages/QuestionCompletePage';
import AdoptDonePage from '@/pages/AdoptDonePage';
import NotificationPage from '@/pages/NotificationPage';
import ProfilePage from '@/pages/ProfilePage';
import TitlePage from '@/pages/TitlePage';
import LoadingPage from '@/pages/LoadingPage';
import SearchPage from '@/pages/SearchPage';
import { deviceLanguage } from '@/i18n';
import { ensureDemoData, getDemoUser } from '@/data/demoRepository';
import useAuthStore from '@/store/authStore';
import AppHeader from '@/components/layout/AppHeader';
import homeBottomBar from '@/assets/figma/home-bottom-bar.svg';
import neutralBottomBar from '@/assets/figma/neutral-bottom-bar.svg';
import rewardBottomBar from '@/assets/figma/reward-bottom-bar.svg';
import choiceQuestion from '@/assets/figma/choice-question-bg.svg';
import choiceQuestionIcon from '@/assets/figma/choice-question-icon.svg';
import choiceQuestionTail from '@/assets/figma/choice-question-tail.svg';
import choiceBoardBg from '@/assets/figma/choice-board-bg.svg';
import choiceBoardIcon from '@/assets/figma/choice-board-icon.svg';
import choiceBoardTail from '@/assets/figma/choice-board-tail.svg';

/**
 * 라우터 구조 (유저플로우 기반 - 기획 산출물 참조)
 *
 * 인증/온보딩:  /onboarding, /signup, /login
 * 홈:           /home
 * Q&A 게시판:   /qna
 * 질문 상세:    /qna/:questionId
 * 질문 작성:    /qna/new
 * 답변 작성:    /qna/:questionId/answer
 * 리워드:       /reward
 * 프로필:       /profile
 * 알림:         /notifications
 * 운영자:       /admin (운영자 권한)
 */
function AppRoutes() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, user, setUser, showLoading, setShowLoading } = useAuthStore();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [choose, setChoose] = useState(false);

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        await ensureDemoData();
        const restored = userId ? await getDemoUser(userId) : null;
        if (!active) return;
        setUser(restored);
        await i18n.changeLanguage(restored?.uiLanguage ?? deviceLanguage);
        setReady(true);
      } catch {
        if (active) { setError(true); setReady(true); }
      }
    }
    initialize();
    return () => { active = false; };
    // Bootstrap exactly once per mount; subsequent login/logout change language directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return <DeviceFrame><p className="center-message">{t('common.loading')}</p></DeviceFrame>;
  if (error) return <DeviceFrame><p className="center-message">{t('common.error')}</p></DeviceFrame>;
  if (showLoading) return <DeviceFrame><LoadingPage onDone={() => { setShowLoading(false); }} /></DeviceFrame>;
  if (!user) return <DeviceFrame login><LoginPage /></DeviceFrame>;

  const showNavigation = location.pathname !== '/search' && (location.pathname === '/qna/new' || location.pathname.endsWith('/edit') || !/^\/qna\/[^/]+(?:\/complete|\/adopt-done)?$/.test(location.pathname));
  const bottomBar = location.pathname === '/home' ? homeBottomBar : location.pathname === '/reward' ? rewardBottomBar : neutralBottomBar;
  
  return <DeviceFrame>
    <NavigationHistoryProvider>
      <div className="app-shell">
        <AppHeader />
        <TransitionManager routeElements={<>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/qna" element={<BoardPage />} />
            <Route path="/qna/new" element={<ComposePage />} />
            <Route path="/qna/:questionId/edit" element={<ComposePage />} />
            <Route path="/qna/:questionId/complete" element={<QuestionCompletePage />} />
            <Route path="/qna/:questionId/adopt-done" element={<AdoptDonePage />} />
            <Route path="/qna/:questionId" element={<QuestionPage />} />
            <Route path="/reward" element={<PointsPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/titles" element={<TitlePage />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </>} />
        {showNavigation && <><nav className="bottom-nav" aria-label="Main"><img src={bottomBar} alt="" /><button className="bottom-home" onClick={() => navigate('/home')} aria-label={t('nav.home')} aria-current={location.pathname === '/home' ? 'page' : undefined} /><button className={`bottom-add${choose ? ' open' : ''}`} onClick={() => setChoose(!choose)} aria-label={t('nav.write')} /><button className="bottom-points" onClick={() => navigate('/reward')} aria-label={t('nav.points')} aria-current={location.pathname === '/reward' ? 'page' : undefined} /></nav>{choose && <div className="choose-overlay" onClick={() => setChoose(false)}><button className="choose-question" onClick={(event) => { event.stopPropagation(); setChoose(false); navigate('/qna/new'); }}><img className="choice-bg" src={choiceQuestion} alt="" /><img className="choice-tail choose-question-tail" src={choiceQuestionTail} alt="" /><img className="choice-icon" src={choiceQuestionIcon} alt="" /><span>{t('nav.write')}</span></button><button className="choose-board" onClick={(event) => { event.stopPropagation(); setChoose(false); navigate('/qna'); }}><img className="choice-bg" src={choiceBoardBg} alt="" /><img className="choice-tail choose-board-tail" src={choiceBoardTail} alt="" /><img className="choice-icon" src={choiceBoardIcon} alt="" /><span>{t('nav.board')}</span></button></div>}</>}
      </div>
    </NavigationHistoryProvider>
  </DeviceFrame>;
}

export default function App() { return <BrowserRouter><AppRoutes /></BrowserRouter>; }
