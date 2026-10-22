import React from 'react';

const SIZES = {
  xs: 'input-xs text-xs',
  sm: 'input-sm text-sm',
  md: 'input-md text-sm',
  lg: 'input-lg text-base',
};

const VARIANTS = {
  bordered: 'input-bordered border-base-300 focus:border-primary focus:outline-none',
  ghost: 'input-ghost focus:bg-base-200 focus:outline-none',
  primary: 'input-primary focus:outline-none',
  error: 'input-error focus:outline-none',
};

export const Input = ({
  label,
  error,
  helperText,
  variant = 'bordered',
  size = 'md',
  leftIcon = null,
  rightIcon = null,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const sizeClass = SIZES[size] || SIZES.md;
  const variantClass = error ? VARIANTS.error : (VARIANTS[variant] || VARIANTS.bordered);

  return (
    <div className={`form-control w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-[11px] font-bold uppercase tracking-wider text-base-content/80">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3.5 text-base-content/50 pointer-events-none flex items-center z-10">
            {leftIcon}
          </span>
        )}
        <input
          className={`input w-full rounded-xl bg-base-200/60 text-base-content placeholder:text-base-content/40 transition-all ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${sizeClass} ${variantClass} ${className}`}
          {...props}
        />
        {rightIcon && <span className="absolute right-3.5 flex items-center z-10">{rightIcon}</span>}
      </div>
      {error && <span className="text-xs text-error font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-base-content/60">{helperText}</span>}
    </div>
  );
};

export default Input;
