import React from 'react';

const VARIANTS = {
  bordered: 'border border-base-300 shadow-sm bg-base-100',
  flat: 'bg-base-200 border border-transparent',
  ghost: 'bg-transparent border border-base-300',
  elevated: 'bg-base-100 shadow-xl border border-base-300',
};

const SIZES = {
  sm: 'p-4 gap-2',
  md: 'p-6 gap-4',
  lg: 'p-8 gap-6',
};

export const Card = ({
  children,
  title = null,
  subtitle = null,
  actions = null,
  variant = 'bordered',
  size = 'md',
  className = '',
  ...props
}) => {
  const variantClass = VARIANTS[variant] || VARIANTS.bordered;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <div
      className={`card rounded-xl text-base-content transition-all ${variantClass} ${className}`}
      {...props}
    >
      <div className={`card-body ${sizeClass}`}>
        {(title || subtitle) && (
          <div className="flex flex-col gap-1">
            {title && <h3 className="card-title text-lg font-bold text-base-content">{title}</h3>}
            {subtitle && <p className="text-xs text-base-content/70">{subtitle}</p>}
          </div>
        )}
        {children}
        {actions && <div className="card-actions justify-end mt-2">{actions}</div>}
      </div>
    </div>
  );
};

export default Card;
