import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useNavigationHistory } from '../../contexts/NavigationHistoryContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { pushVariants, popVariants, reducedMotionVariants } from '../../config/transitionVariants';

const BOTTOM_TAB_ROUTES = ['/home', '/qna', '/reward'];

export default function TransitionManager({ children }) {
  const location = useLocation();
  const { direction } = useNavigationHistory();
  const prefersReducedMotion = useReducedMotion();

  // Track previous pathname with a ref that updates BEFORE render (via useState side-tracking)
  const previousPathnameRef = useRef(location.pathname);
  const prevPathAtRenderRef = useRef(location.pathname);

  // Compute skip BEFORE updating the ref
  const prevPathname = prevPathAtRenderRef.current;
  const currentPathname = location.pathname;

  const shouldSkipTransition =
    // Skip on initial load
    window.history.length <= 1 ||
    // Skip if location state indicates modal
    !!location.state?.modal ||
    // Skip for bottom tab navigation between two tab routes
    (BOTTOM_TAB_ROUTES.includes(currentPathname) && BOTTOM_TAB_ROUTES.includes(prevPathname));

  // Update the ref after computing skip
  prevPathAtRenderRef.current = currentPathname;

  const variants = useMemo(() => {
    if (prefersReducedMotion) return reducedMotionVariants;
    return direction === 'pop' ? popVariants : pushVariants;
  }, [direction, prefersReducedMotion]);

  if (shouldSkipTransition) {
    return <>{children}</>;
  }

  return (
    // This wrapper is position:relative with fixed dimensions so that popLayout
    // can absolute-position the exiting page without disrupting the flex layout.
    <div className="transition-container">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={location.pathname}
          className="transition-page"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ willChange: 'transform, opacity' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
