const SOCIAL_LIST = [
  {
    key: 'google',
    name: 'Google',
    desc: 'Google 계정으로 간편 로그인',
    color: '#4285F4',
    bg: 'rgba(66,133,244,0.1)',
    border: 'rgba(66,133,244,0.3)',
  },
  {
    key: 'kakao',
    name: 'Kakao',
    desc: 'Kakao 계정으로 간편 로그인',
    color: '#FEE500',
    bg: 'rgba(254,229,0,0.1)',
    border: 'rgba(254,229,0,0.3)',
  },
  {
    key: 'naver',
    name: 'Naver',
    desc: 'Naver 계정으로 간편 로그인',
    color: '#03C75A',
    bg: 'rgba(3,199,90,0.1)',
    border: 'rgba(3,199,90,0.3)',
  },
]

const ConnectTab = ({ profile }) => {
  return (
    <>
      <h2 className="text-[22px] font-bold mb-2" style={{ letterSpacing: '-0.4px' }}>연동</h2>
      <p className="text-[13px] mb-8" style={{ color: 'var(--color-text-muted)' }}>
        소셜 계정 연동 현황을 확인할 수 있어요.
      </p>
      {SOCIAL_LIST.map(({ key, name, desc, color, bg, border }) => {
        const isConnected = profile?.provider === key
        return (
          <div
            key={key}
            className="flex items-center justify-between px-5 py-4 rounded-xl mb-3 transition-all"
            style={{
              background: isConnected ? bg : 'var(--color-surface-2)',
              border: `1px solid ${isConnected ? border : 'var(--color-border)'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: isConnected ? color : 'var(--color-border)' }}
              />
              <div>
                <p className="text-[14px] font-medium" style={{ color: isConnected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                  {name}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
              </div>
            </div>
            <div
              className="text-[12px] px-3 py-1.5 rounded-lg font-medium"
              style={{
                background: isConnected ? bg : 'var(--color-surface)',
                border: `1px solid ${isConnected ? border : 'var(--color-border)'}`,
                color: isConnected ? color : 'var(--color-text-muted)',
              }}
            >
              {isConnected ? '연동됨' : '미연동'}
            </div>
          </div>
        )
      })}
    </>
  )
}

export default ConnectTab