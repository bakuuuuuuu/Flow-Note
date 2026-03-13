import useThemeStore from '../../store/themeStore'

const Toggle = () => {
  const { isDark, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer
        ${isDark ? 'bg-brand' : 'bg-gray-300'}
      `}
    >
      <span className={`
        absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300
        ${isDark ? 'translate-x-5' : 'translate-x-0'}
      `} />
    </button>
  )
}

export default Toggle