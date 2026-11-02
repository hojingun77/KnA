import { create } from 'zustand';

/**
 * 앱 전역 헤더 상태
 * - title: 상단바 중앙 텍스트 (null이면 빈칸)
 * - onMore: ⋮ 버튼 핸들러 (null이면 버튼 숨김)
 * - showIcons: 우측 프로필/알림 아이콘 표시 여부
 */
const useHeaderStore = create((set) => ({
  title: null,
  onMore: null,
  showIcons: true,
  setHeader: (opts) => set(opts),
  clearHeader: () => set({ title: null, onMore: null, showIcons: true }),
}));

export default useHeaderStore;
