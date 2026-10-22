import React from 'react';

const VARIANTS = {
  primary: 'btn-primary text-primary-content',
  secondary: 'btn-secondary text-secondary-content',
  accent: 'btn-accent text-accent-content',
  neutral: 'btn-neutral text-neutral-content',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  error: 'btn-error text-error-content',
  success: 'btn-success text-success-content',
};

const SIZES = {
  xs: 'btn-xs text-xs',
  sm: 'btn-sm text-sm',
  md: 'btn-md text-base',
  lg: 'btn-lg text-lg',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  type = 'button',
  ...props
}) => {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn rounded-xl transition-all duration-200 cursor-pointer ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
};

export default Button;
