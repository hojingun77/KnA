import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DeviceFrame from '@/components/layout/DeviceFrame';

// 페이지 (차례대로 구현 예정)
import HomePage from '@/pages/HomePage';

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
export default function App() {
  return (
    <BrowserRouter>
      <DeviceFrame>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          {/* TODO: 나머지 페이지 추가 */}
        </Routes>
      </DeviceFrame>
    </BrowserRouter>
  );
}
