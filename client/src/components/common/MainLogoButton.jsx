import { useNavigate } from 'react-router-dom'

const MainLogoButton = ({ showText = true }) => {
  const navigate = useNavigate()

  return (
    <div
      className="flex items-center gap-0 cursor-pointer flex-shrink-0"
      onClick={() => navigate('/home')}
    >
      <img
        src="/logo.png"
        alt="Flow-Note"
        className="object-contain flex-shrink-0"
        style={{
          width: showText ? '52px' : '36px',
          height: showText ? '52px' : '36px',
          marginRight: showText ? '-4px' : '0',
          transition: 'width 0.2s ease, height 0.2s ease',
        }}
      />
      {showText && (
        <span
          className="font-bold leading-none flex-shrink-0"
          style={{
            fontSize: '20px',
            transform: 'translateY(-1px)',
            color: 'var(--color-brand)',
            letterSpacing: '-0.5px',
            whiteSpace: 'nowrap',
          }}
        >
          Flow-Note
        </span>
      )}
    </div>
  )
}

export default MainLogoButton