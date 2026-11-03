import { createContext, useContext, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationHistoryContext = createContext(null);

// 동기적으로 direction을 계산 — useEffect 지연 없음
function computeDirection() {
  const idx = window.history.state?.idx ?? 0;
  return idx;
}

export function NavigationHistoryProvider({ children }) {
  const location = useLocation();
  const prevIdxRef = useRef(computeDirection());
  // direction을 ref로 유지해 렌더 중 동기적으로 읽을 수 있게 함
  const directionRef = useRef('none');
  const [, forceUpdate] = useState(0);

  // 매 렌더마다 동기적으로 계산
  const currentIdx = window.history.state?.idx ?? 0;
  const prevIdx = prevIdxRef.current;

  let dir = 'none';
  if (currentIdx > prevIdx) dir = 'push';
  else if (currentIdx < prevIdx) dir = 'pop';

  // prevIdx를 업데이트 — 렌더 중 직접 ref 변경 (layout effect보다 빠름)
  if (prevIdxRef.current !== currentIdx) {
    prevIdxRef.current = currentIdx;
  }
  directionRef.current = dir;

  // 디버그 로그
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.has('motion') || import.meta.env.DEV) {
      if (dir !== 'none') {
        console.log(`[nav] direction=${dir}, to=${location.pathname}, depth=${currentIdx}`);
      }
    }
  }

  return (
    <NavigationHistoryContext.Provider value={{ direction: dir, directionRef }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function useNavigationHistory() {
  const context = useContext(NavigationHistoryContext);
  if (!context) throw new Error('useNavigationHistory must be used within NavigationHistoryProvider');
  return context;
}
