export const pushVariants = {
  initial: {
    x: '100%',
    opacity: 1,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      mass: 1,
      duration: 0.4,
    },
  },
  exit: {
    x: '-30%',
    opacity: 0.7,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      mass: 1,
      duration: 0.4,
    },
  },
};

export const popVariants = {
  initial: {
    x: '-30%',
    opacity: 0.7,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      mass: 1,
      duration: 0.4,
    },
  },
  exit: {
    x: '100%',
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      mass: 1,
      duration: 0.4,
    },
  },
};

export const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.15, ease: 'linear' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15, ease: 'linear' }
  },
};
