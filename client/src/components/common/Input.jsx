const Input = ({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  disabled = false,
  rightElement,  // 오른쪽에 버튼 같은 요소 넣을 때
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-[#2d3436] dark:text-[#f5f5f5]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors
            bg-white border border-border-light text-[#2d3436] placeholder-gray-400
            focus:border-brand
            dark:bg-dark-surface-2 dark:border-dark-border dark:text-[#f5f5f5] dark:placeholder-gray-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 dark:border-red-500' : ''}
            ${rightElement ? 'pr-24' : ''}
          `}
        />
        {rightElement && (
          <div className="absolute right-2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  )
}

export default Input