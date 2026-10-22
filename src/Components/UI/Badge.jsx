import React from 'react';

const VARIANTS = {
  primary: 'badge-primary text-primary-content',
  secondary: 'badge-secondary text-secondary-content',
  accent: 'badge-accent text-accent-content',
  neutral: 'badge-neutral text-neutral-content',
  ghost: 'badge-ghost',
  outline: 'badge-outline',
  success: 'badge-success text-success-content',
  warning: 'badge-warning text-warning-content',
  error: 'badge-error text-error-content',
  info: 'badge-info text-info-content',
};

const SIZES = {
  xs: 'badge-xs text-[10px]',
  sm: 'badge-sm text-xs',
  md: 'badge-md text-xs font-semibold',
  lg: 'badge-lg text-sm font-bold',
};

export const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <span
      className={`badge rounded-xl font-medium inline-flex items-center gap-1.5 ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
