const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white" width="24" height="24">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
  </svg>
)

const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="31" height="31">
    <path
      fill="white"
      d="M12 3.375C6.6152 3.375 2.25 6.8168 2.25 11.0625c0 2.7449 1.8249 5.1535 4.5701 6.5135-.1494.515-.9598 3.3135-.992 3.5333 0 0-.0194.1652.0876.2282s.2328.0141.2328.0141c.3068-.0428 3.5572-2.326 4.1198-2.7225.562.0796 1.1407.1209 1.7317.1209 5.3848 0 9.75-3.4418 9.75-7.6875C21.75 6.8168 17.3848 3.375 12 3.375z"
    />
    <text x="12" y="13" textAnchor="middle" fill="#3a3a3a" fontSize="5" fontWeight="bold" fontFamily="Arial, sans-serif">
      TALK
    </text>
  </svg>
)

const NaverIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white" width="20" height="20">
    <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z"/>
  </svg>
)

const SOCIAL = [
  { key: 'google', Icon: GoogleIcon, alt: 'Google' },
  { key: 'kakao',  Icon: KakaoIcon,  alt: 'Kakao'  },
  { key: 'naver',  Icon: NaverIcon,  alt: 'Naver'  },
]

const SocialButtons = () => (
  <div className="flex justify-center" style={{ gap: 'clamp(14px, 1.4vw, 20px)' }}>
    {SOCIAL.map(({ key, Icon, alt }) => (
      <button
        key={key}
        aria-label={alt}
        className="social-btn"
      >
        <Icon />
      </button>
    ))}
  </div>
)

export default SocialButtons