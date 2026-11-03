/**
 * TransitionManager — iOS 스타일 좌우 슬라이드 전환
 *
 * 핵심 설계:
 * - 각 레이어는 자신이 마운트될 때의 location을 freeze해서 렌더링
 *   → 나가는 레이어가 새 페이지를 그리는 문제 해결
 * - direction을 렌더 중 동기적으로 읽어 stale 문제 해결
 * - custom prop으로 exit 시점에도 올바른 direction 전달
 * - 아래 레이어를 별도 motion.div로 동시 구동
 */
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation, Routes } from 'react-router-dom';
import { useNavigationHistory } from '../../contexts/NavigationHistoryContext';

const BOTTOM_TAB_ROUTES = ['/home', '/reward'];  // /qna 제거: +메뉴→게시판은 push여야 함

function slowFactor() {
  if (typeof window === 'undefined') return 1;
  const p = new URLSearchParams(window.location.search);
  return p.get('motion') === 'slow' ? 10 : 1;
}

const SPRING = (slow = 1) => ({
  type: 'spring',
  stiffness: 400,
  damping: 40,
  mass: 1,
  duration: 0.4 * slow,
});
const EASE = (slow = 1) => ({
  duration: 0.4 * slow,
  ease: [0.33, 1, 0.68, 1],
});
const FADE = (slow = 1) => ({ duration: 0.15 * slow, ease: 'linear' });

// custom = 'push' | 'pop'
const slideVariants = {
  // 들어오는 레이어 initial
  initial: (dir) => ({
    x: dir === 'pop' ? '0%' : '100%',
  }),
  // 들어오는 레이어 animate (목적지)
  animate: {
    x: '0%',
    transition: SPRING(slowFactor()),
  },
  // 나가는 레이어 exit — custom이 'pop'이면 오른쪽으로, 'push'면 왼쪽 -30%
  exit: (dir) => ({
    x: dir === 'pop' ? '100%' : '-30%',
    transition: SPRING(slowFactor()),
  }),
};

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: FADE(slowFactor()) },
  exit:    { opacity: 0, transition: FADE(slowFactor()) },
};

// 아래 레이어(underlay)의 initial/animate
function underlayProps(dir, slow) {
  const sp = SPRING(slow);
  if (dir === 'pop') {
    // pop: 돌아오는 페이지가 -30% → 0, 어두움 0.12 → 0
    return {
      initial: { x: '-30%', filter: 'brightness(0.88)' },
      animate: { x: '0%',   filter: 'brightness(1)',    transition: sp },
    };
  }
  // push: 이전 페이지가 0 → -30%, 어두워짐 0 → 0.12
  return {
    initial: { x: '0%',   filter: 'brightness(1)' },
    animate: { x: '-30%', filter: 'brightness(0.88)', transition: sp },
  };
}

// 레이어 컴포넌트 — 마운트 시 location/routeContent를 freeze
function FrozenLayer({ routeContent }) {
  const [frozen] = useState(() => routeContent);
  return frozen;
}

export default function TransitionManager({ routeElements }) {
  const location = useLocation();
  const { direction } = useNavigationHistory();
  const prefersReducedMotion = useReducedMotion();
  const slow = slowFactor();

  const prevLocationRef = useRef(location);
  const prevRouteElementsRef = useRef(routeElements);
  const isFirstRender = useRef(true);

  const currentLocation = location;
  const prevLocation = prevLocationRef.current;

  // 탭 전환 여부
  const isBothTab =
    BOTTOM_TAB_ROUTES.includes(currentLocation.pathname) &&
    BOTTOM_TAB_ROUTES.includes(prevLocation.pathname);

  // pathname이 같으면 search/hash만 바뀐 것 (필터, 정렬 등) → 전환 없음
  const isSamePathname = currentLocation.pathname === prevLocation.pathname;

  const skip =
    isFirstRender.current ||
    window.history.length <= 1 ||
    !!currentLocation.state?.modal ||
    isBothTab ||
    isSamePathname;

  // 렌더 후 ref 업데이트
  if (currentLocation.key !== prevLocation.key) {
    prevLocationRef.current = prevLocation; // 이전을 기억
    isFirstRender.current = false;
  }

  // skip이면 그냥 렌더 (애니메이션 없음)
  if (skip) {
    isFirstRender.current = false;
    prevLocationRef.current = currentLocation;
    prevRouteElementsRef.current = routeElements;
    return (
      <div className="transition-container">
        <div className="transition-page">
          <Routes location={currentLocation}>{routeElements}</Routes>
        </div>
      </div>
    );
  }

  // 이전 routeElements 스냅샷
  const prevRouteElements = prevRouteElementsRef.current;
  // 다음 렌더를 위해 업데이트
  prevRouteElementsRef.current = routeElements;
  prevLocationRef.current = currentLocation;

  const isPop = direction === 'pop';
  const dir = isPop ? 'pop' : 'push';

  // push: 위=새페이지(오른쪽→0), 아래=이전페이지(0→-30% 어두워짐)
  // pop:  위=이전페이지(0→오른쪽 빠져나감), 아래=새(돌아오는)페이지(-30%→0 밝아짐)
  const overLocation  = isPop ? prevLocation    : currentLocation;
  const overRoutes    = isPop ? prevRouteElements : routeElements;
  const underLocation = isPop ? currentLocation : prevLocation;
  const underRoutes   = isPop ? routeElements   : prevRouteElements;
  const underlayP     = underlayProps(dir, slow);

  return (
    <div className="transition-container">
      {/* 아래 레이어 */}
      {!prefersReducedMotion && (
        <motion.div
          className="transition-page"
          style={{ zIndex: 0, willChange: 'transform, filter' }}
          initial={underlayP.initial}
          animate={underlayP.animate}
        >
          <Routes location={underLocation}>{underRoutes}</Routes>
        </motion.div>
      )}

      {/* 위 레이어 — push: 새 페이지가 오른쪽에서 진입 / pop: 이전 페이지가 오른쪽으로 퇴장 */}
      <AnimatePresence
        custom={dir}
        mode="sync"
        initial={false}
      >
        <motion.div
          key={overLocation.key}
          className="transition-page"
          style={{ zIndex: 1, willChange: 'transform' }}
          custom={dir}
          variants={prefersReducedMotion ? fadeVariants : slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onAnimationStart={() => {
            document.querySelector('.transition-container')
              ?.style.setProperty('pointer-events', 'none');
          }}
          onAnimationComplete={() => {
            document.querySelector('.transition-container')
              ?.style.removeProperty('pointer-events');
          }}
        >
          <Routes location={overLocation}>{overRoutes}</Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
