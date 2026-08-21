const Spinner = ({ size = 32, className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <span
      style={{ width: size, height: size }}
      className="animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
      aria-label="Loading"
      role="status"
    />
  </div>
);

export default Spinner;
