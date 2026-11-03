import { create } from 'zustand';

/**
 * 앱 전역 헤더 상태
 * - title: 상단바 중앙 텍스트 (null이면 빈칸)
 * - onMore: ⋮ 버튼 핸들러 (null이면 버튼 숨김)
 * - showIcons: 우측 프로필/알림 아이콘 표시 여부
 *
 * 페이지 전환 애니메이션 중에는 나가는 페이지가 들어오는 페이지보다 늦게 정리(unmount)된다.
 * 그래서 setHeader가 돌려주는 소유자 번호를 clearHeader에 넘기면, 지금 헤더의 주인일 때만 초기화한다.
 * (예: 수정 화면 → 뒤로가기 시 수정 화면의 정리가 질문 상세의 ⋮ 헤더를 지우지 않도록)
 */
let lastOwner = 0;
const DEFAULT_HEADER = { title: null, onMore: null, showIcons: true, owner: null };

const useHeaderStore = create((set) => ({
  ...DEFAULT_HEADER,
  setHeader: (opts) => {
    const owner = ++lastOwner;
    set({ ...opts, owner });
    return owner;
  },
  clearHeader: (owner) => set((state) => (owner === undefined || state.owner === owner ? DEFAULT_HEADER : state)),
}));

export default useHeaderStore;
