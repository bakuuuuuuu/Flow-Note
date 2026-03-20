import { useNavigate } from 'react-router-dom'
import useThemeStore from '../../store/themeStore'

const MainLogoButton = () => {
  const navigate = useNavigate()
  const { isDark } = useThemeStore()

  return (
    <div
      className="flex items-center gap-0 cursor-pointer"
      onClick={() => navigate('/home')}
    >
      <img
        src="/logo.png"
        alt="Flow-Note"
        className="w-[60px] h-[60px] object-contain -mr-1"
      />
      <span
        className="font-bold leading-none"
        style={{
          fontSize: '24px',
          transform: 'translateY(-2px)',
          color: 'var(--color-brand)',
          letterSpacing: '-0.5px',
        }}
      >
        Flow-Note
      </span>
    </div>
  )
}

export default MainLogoButton