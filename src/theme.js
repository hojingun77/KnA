/**
 * KnA 디자인 토큰 (단일 소스)
 * Tailwind config와 컴포넌트 모두 여기서 참조한다.
 * 피그마 디자인 확정 후 실제 값으로 교체 예정.
 */
const theme = {
  colors: {
    // 브랜드 컬러 (피그마 확정 후 업데이트)
    primary: {
      DEFAULT: '#3B82F6',
      50:  '#EFF6FF',
      100: '#DBEAFE',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
    },
    // 텍스트
    ink: {
      DEFAULT: '#111827',
      secondary: '#6B7280',
      disabled: '#D1D5DB',
    },
    // 배경
    surface: {
      DEFAULT: '#FFFFFF',
      muted: '#F9FAFB',
      card: '#F3F4F6',
    },
    // 상태
    status: {
      urgent: '#EF4444',
      adopted: '#10B981',
      open: '#6B7280',
    },
    // 구분선
    border: '#E5E7EB',
  },
  fonts: {
    sans: ['Noto Sans KR', 'sans-serif'],
  },
  // 모바일 프레임 (iPhone 14 기준)
  frame: {
    width: 390,
    height: 844,
  },
};

export default theme;
