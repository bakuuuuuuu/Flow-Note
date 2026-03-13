const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',  // primary | secondary | danger | ghost
  size = 'md',          // sm | md | lg
  disabled = false,
  className = '',
  fullWidth = false,
}) => {

  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-brand text-white hover:bg-brand-hover',
    secondary: 'bg-transparent border border-[#E5E5EA] text-[#2d3436] hover:bg-[#F5F5F7] dark:border-[#3A3A3C] dark:text-[#f5f5f5] dark:hover:bg-[#2C2C2E]',
    danger:    'bg-red-500 text-white hover:bg-red-600',
    ghost:     'bg-transparent text-[#2d3436] hover:bg-[#F5F5F7] dark:text-[#f5f5f5] dark:hover:bg-[#2C2C2E]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button