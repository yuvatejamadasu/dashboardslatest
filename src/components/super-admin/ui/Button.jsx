import React from 'react';

/**
 * Reusable Button component — matches Transaction page's button style.
 *
 * variants:
 *   'primary'  — #1d5ba0 blue fill (default)
 *   'ghost'    — outline / transparent fill
 *   'danger'   — rose outline / fill on hover
 *
 * sizes:
 *   'sm'  — compact table row action
 *   'md'  — standard (default)
 *   'lg'  — wider call-to-action
 */
const BASE =
  'inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none';

const VARIANTS = {
  primary:
    'bg-[#1d5ba0] hover:bg-blue-800 text-white shadow-sm focus:ring-[#1d5ba0]/40',
  ghost:
    'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm focus:ring-slate-300/40',
  danger:
    'border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 focus:ring-rose-300/40',
};

const SIZES = {
  sm:  'px-4 py-2 text-[11px] uppercase tracking-wider',
  md:  'px-5 py-2.5 text-sm uppercase tracking-wider',
  lg:  'px-7 py-3 text-sm uppercase tracking-wider',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`${BASE} ${VARIANTS[variant] ?? VARIANTS.primary} ${SIZES[size] ?? SIZES.md} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
