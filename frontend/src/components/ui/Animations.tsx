import React from 'react';
import { motion, Variants, HTMLMotionProps } from 'framer-motion';

// Animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInUp: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
};

export const slideInDown: Variants = {
  hidden: { y: '-100%' },
  visible: { y: 0 },
};

export const slideInLeft: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
};

export const slideInRight: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
};

// Stagger container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Stagger item
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Default transition
export const defaultTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

// Animated components
interface AnimatedProps extends HTMLMotionProps<'div'> {
  variant?: Variants;
  delay?: number;
  duration?: number;
}

export const FadeIn: React.FC<AnimatedProps> = ({
  children,
  variant = fadeIn,
  delay = 0,
  duration = 0.3,
  ...props
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={variant}
    transition={{ ...defaultTransition, delay, duration }}
    {...props}
  >
    {children}
  </motion.div>
);

export const FadeInUp: React.FC<AnimatedProps> = ({
  children,
  delay = 0,
  duration = 0.3,
  ...props
}) => (
  <FadeIn variant={fadeInUp} delay={delay} duration={duration} {...props}>
    {children}
  </FadeIn>
);

export const FadeInDown: React.FC<AnimatedProps> = ({
  children,
  delay = 0,
  duration = 0.3,
  ...props
}) => (
  <FadeIn variant={fadeInDown} delay={delay} duration={duration} {...props}>
    {children}
  </FadeIn>
);

export const FadeInLeft: React.FC<AnimatedProps> = ({
  children,
  delay = 0,
  duration = 0.3,
  ...props
}) => (
  <FadeIn variant={fadeInLeft} delay={delay} duration={duration} {...props}>
    {children}
  </FadeIn>
);

export const FadeInRight: React.FC<AnimatedProps> = ({
  children,
  delay = 0,
  duration = 0.3,
  ...props
}) => (
  <FadeIn variant={fadeInRight} delay={delay} duration={duration} {...props}>
    {children}
  </FadeIn>
);

export const ScaleIn: React.FC<AnimatedProps> = ({
  children,
  delay = 0,
  duration = 0.3,
  ...props
}) => (
  <FadeIn variant={scaleIn} delay={delay} duration={duration} {...props}>
    {children}
  </FadeIn>
);

// Stagger list
interface StaggerListProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
}

export const StaggerList: React.FC<StaggerListProps> = ({
  children,
  staggerDelay = 0.1,
  ...props
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerItem: React.FC<AnimatedProps> = ({ children, ...props }) => (
  <motion.div variants={staggerItem} transition={defaultTransition} {...props}>
    {children}
  </motion.div>
);

// Page transition
export const PageTransition: React.FC<AnimatedProps> = ({ children, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={defaultTransition}
    {...props}
  >
    {children}
  </motion.div>
);

// Hover scale
interface HoverScaleProps extends HTMLMotionProps<'div'> {
  scale?: number;
}

export const HoverScale: React.FC<HoverScaleProps> = ({
  children,
  scale = 1.05,
  ...props
}) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: scale - 0.02 }}
    transition={defaultTransition}
    {...props}
  >
    {children}
  </motion.div>
);

// Hover lift (shadow effect)
export const HoverLift: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
    transition={defaultTransition}
    {...props}
  >
    {children}
  </motion.div>
);

// Pulse animation
export const Pulse: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => (
  <motion.div
    animate={{
      scale: [1, 1.05, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Bounce animation
export const Bounce: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => (
  <motion.div
    animate={{
      y: [0, -10, 0],
    }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Spin animation (for loaders)
export const Spin: React.FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => (
  <motion.div
    animate={{
      rotate: 360,
    }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    }}
    {...props}
  >
    {children}
  </motion.div>
);

// Slide drawer
interface SlideDrawerProps extends HTMLMotionProps<'div'> {
  direction?: 'left' | 'right' | 'top' | 'bottom';
  isOpen: boolean;
}

export const SlideDrawer: React.FC<SlideDrawerProps> = ({
  children,
  direction = 'right',
  isOpen,
  ...props
}) => {
  const variants: Record<string, Variants> = {
    left: slideInLeft,
    right: slideInRight,
    top: slideInDown,
    bottom: slideInUp,
  };

  return (
    <motion.div
      initial="hidden"
      animate={isOpen ? 'visible' : 'hidden'}
      variants={variants[direction]}
      transition={defaultTransition}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Modal backdrop
interface ModalBackdropProps extends HTMLMotionProps<'div'> {
  isOpen: boolean;
}

export const ModalBackdrop: React.FC<ModalBackdropProps> = ({
  children,
  isOpen,
  ...props
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: isOpen ? 1 : 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    {children}
  </motion.div>
);

// Collapse/Expand
interface CollapseProps extends HTMLMotionProps<'div'> {
  isOpen: boolean;
}

export const Collapse: React.FC<CollapseProps> = ({ children, isOpen, ...props }) => (
  <motion.div
    initial={false}
    animate={{
      height: isOpen ? 'auto' : 0,
      opacity: isOpen ? 1 : 0,
    }}
    transition={defaultTransition}
    style={{ overflow: 'hidden' }}
    {...props}
  >
    {children}
  </motion.div>
);
