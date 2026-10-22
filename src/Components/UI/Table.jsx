import React from 'react';

const SIZES = {
  xs: 'table-xs',
  sm: 'table-sm',
  md: 'table-md',
  lg: 'table-lg',
};

const VARIANTS = {
  default: '',
  zebra: 'table-zebra',
  pinRows: 'table-pin-rows',
};

export const Table = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  containerClassName = '',
  ...props
}) => {
  const sizeClass = SIZES[size] || SIZES.md;
  const variantClass = VARIANTS[variant] || '';

  return (
    <div className={`overflow-x-auto w-full rounded-xl border border-base-300 bg-base-100 ${containerClassName}`}>
      <table
        className={`table rounded-xl w-full text-base-content ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export default Table;
