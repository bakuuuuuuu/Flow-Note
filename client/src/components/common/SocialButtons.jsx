// SocialButtons.jsx
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="white"/>
  </svg>
)

const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FEE500" d="M12 3.375C6.6152 3.375 2.25 6.8168 2.25 11.0625c0 2.7449 1.8249 5.1535 4.5701 6.5135-.1494.515-.9598 3.3135-.992 3.5333 0 0-.0194.1652.0876.2282s.2328.0141.2328.0141c.3068-.0428 3.5572-2.326 4.1198-2.7225.562.0796 1.1407.1209 1.7317.1209 5.3848 0 9.75-3.4418 9.75-7.6875C21.75 6.8168 17.3848 3.375 12 3.375z"/>
  </svg>
)

const NaverIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="#03C75A">
    <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z"/>
  </svg>
)

const SOCIAL = [
  { key: 'google', Icon: GoogleIcon, label: 'Google', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', hoverBg: 'rgba(255,255,255,0.1)' },
  { key: 'kakao',  Icon: KakaoIcon,  label: 'Kakao',  bg: 'rgba(254,229,0,0.07)',   border: 'rgba(254,229,0,0.18)',   hoverBg: 'rgba(254,229,0,0.13)' },
  { key: 'naver',  Icon: NaverIcon,  label: 'Naver',  bg: 'rgba(3,199,90,0.07)',    border: 'rgba(3,199,90,0.18)',    hoverBg: 'rgba(3,199,90,0.13)' },
]

const SocialButtons = () => (
  <div style={{ display: 'flex', gap: '8px' }}>
    {SOCIAL.map(({ key, Icon, label, bg, border, hoverBg }) => (
      <button
        key={key}
        type="button"
        aria-label={label}
        style={{
          flex: 1, height: '42px', borderRadius: '10px',
          background: bg, border: `1px solid ${border}`,
          color: 'rgba(232,234,240,0.65)', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.15s',
          fontFamily: 'Pretendard, Noto Sans KR, sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = 'rgba(232,234,240,0.9)' }}
        onMouseLeave={e => { e.currentTarget.style.background = bg; e.currentTarget.style.color = 'rgba(232,234,240,0.65)' }}
      >
        <Icon />
        {label}
      </button>
    ))}
  </div>
)

export default SocialButtons