import { useNavigate } from 'react-router-dom'

const LogoButton = () => {
  const navigate = useNavigate()

  return (
    <div
      className="flex items-center gap-0 cursor-pointer"
      onClick={() => navigate('/')}
    >
      <img
        src="/logo.png"
        alt="Flow-Note"
        className="w-[60px] h-[60px] object-contain -mr-1"
      />
      <span
        className="text-white font-bold leading-none"
        style={{ fontSize: '24px', textShadow: '0px 4px 4px rgba(0,0,0,0.3)', transform: 'translateY(-2px)' }}
      >
        Flow-Note
      </span>
    </div>
  )
}

export default LogoButton