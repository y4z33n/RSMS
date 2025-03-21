'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { LucideIcon } from 'lucide-react';

interface FeatureItemProps {
  title: string;
  description: string;
  icon: LucideIcon;
  index?: number;
}

export function FeatureItem({ title, description, icon: Icon, index = 0 }: FeatureItemProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.2,
        duration: 0.5,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: index * 0.2 + 0.2,
        duration: 0.3,
        type: 'spring',
        stiffness: 200,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className="flex gap-4 items-start p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300"
      variants={containerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      <motion.div
        className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"
        variants={iconVariants}
      >
        <Icon size={24} />
      </motion.div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}

interface FeatureListProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  columns?: 1 | 2 | 3;
}

export function FeatureList({ title, subtitle, children, columns = 1 }: FeatureListProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {(title || subtitle) && (
          <motion.div
            ref={ref}
            className="text-center mb-12"
            variants={headerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            {title && <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>}
            {subtitle && <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>}
          </motion.div>
        )}

        <div
          className={`grid gap-8 ${
            columns === 1
              ? 'grid-cols-1'
              : columns === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {children}
        </div>
      </div>
    </section>
  );
} 