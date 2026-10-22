import React from 'react';

const POSITIONS = {
  bottom: '',
  top: 'dropdown-top',
  left: 'dropdown-left',
  right: 'dropdown-right',
  end: 'dropdown-end',
};

export const Dropdown = ({
  trigger,
  children,
  position = 'bottom',
  size = 'md',
  className = '',
  menuClassName = '',
  ...props
}) => {
  const posClass = POSITIONS[position] || '';

  return (
    <div className={`dropdown ${posClass} ${className}`} {...props}>
      <div tabIndex={0} role="button" className="cursor-pointer">
        {trigger}
      </div>
      <ul
        tabIndex={0}
        className={`dropdown-content menu z-30 p-2 shadow-xl bg-base-100 rounded-xl border border-base-300 w-52 text-base-content ${menuClassName}`}
      >
        {children}
      </ul>
    </div>
  );
};

export default Dropdown;
