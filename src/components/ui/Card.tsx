import clsx from 'clsx';
import { HTMLAttributes } from 'react';
import styles from './Card.module.css';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'muted';
  elevated?: boolean;
};

export function Card({
  variant = 'default',
  elevated = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        styles.card,
        variant === 'muted' && styles.muted,
        elevated && styles.elevated,
        className
      )}
      {...props}
    />
  );
}
