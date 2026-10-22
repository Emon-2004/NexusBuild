import React, { useEffect } from 'react';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const Modal = ({
  isOpen = false,
  onClose,
  title = null,
  children,
  actions = null,
  size = 'md',
  className = '',
  ...props
}) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle z-50">
      <div
        className={`modal-box rounded-xl bg-base-100 border border-base-300 shadow-2xl p-6 text-base-content relative ${SIZES[size] || SIZES.md} ${className}`}
        {...props}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-base-content/70 hover:text-base-content"
            aria-label="Close"
          >
            ✕
          </button>
        )}
        {title && <h3 className="font-bold text-lg mb-4 text-base-content">{title}</h3>}
        <div className="py-2 text-sm text-base-content/80">{children}</div>
        {actions && <div className="modal-action mt-6 flex justify-end gap-2">{actions}</div>}
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose} />
    </div>
  );
};

export default Modal;
