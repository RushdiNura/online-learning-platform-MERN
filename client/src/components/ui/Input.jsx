import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <label className="block">
    {label && <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>}
    <input
      ref={ref}
      className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
        error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
      } ${className}`}
      {...props}
    />
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
));

Input.displayName = 'Input';
export default Input;
