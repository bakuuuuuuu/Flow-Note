import { Outlet, useNavigate } from 'react-router-dom'

const AuthLayout = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      height: '100vh', background: '#0d0f14',
      fontFamily: 'Pretendard, Noto Sans KR, sans-serif',
      display: 'flex', overflow: 'hidden', position: 'relative',
    }}>
      {/* 배경 글로우 */}
      <div style={{ position: 'absolute', top: '15%', left: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(45,64,142,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '25%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* ── 왼쪽 브랜드 패널 ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        position: 'relative', minWidth: 0,
        padding: '40px 56px',
      }}>
        {/* 로고 */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer', width: 'fit-content', marginBottom: 'auto' }}
          onClick={() => navigate('/')}
        >
          <img src="/logo.png" alt="Flow-Note" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '17px', color: '#e8eaf0' }}>Flow-Note</span>
        </div>

        {/* 중앙 카피 — 수직 중앙 */}
        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '56px', right: '56px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '999px', marginBottom: '20px',
            background: 'rgba(45,64,142,0.2)', border: '1px solid rgba(79,112,255,0.3)',
            fontSize: '11px', fontWeight: 600, color: '#7b9cff',
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4f70ff', display: 'inline-block' }} />
            칸반보드 기반 업무 관리
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 2.8vw, 42px)', fontWeight: 800,
            color: '#e8eaf0', letterSpacing: '-0.04em', lineHeight: 1.15,
            marginBottom: '16px',
          }}>
            업무의 흐름을<br />
            <span style={{ background: 'linear-gradient(135deg, #4f70ff 0%, #7b9cff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              한 곳에서
            </span>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(232,234,240,0.4)', lineHeight: 1.7, maxWidth: '320px', marginBottom: '36px' }}>
            칸반 보드와 캘린더로 할 일을 정리하고,<br />드래그 앤 드롭으로 업무를 관리하세요.
          </p>

          {/* 미니 칸반 목업 — 크기 키움 */}
          <div style={{
            borderRadius: '14px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 40px rgba(45,64,142,0.1)',
            maxWidth: '500px',
          }}>
            {/* 브라우저 바 */}
            <div style={{ background: '#1c1f26', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['#ef4444','#f59e0b','#10b981'].map(c => (
                <div key={c} style={{ width: '9px', height: '9px', borderRadius: '50%', background: c, opacity: 0.7 }} />
              ))}
              <div style={{ flex: 1, height: '18px', borderRadius: '5px', marginLeft: '8px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', paddingLeft: '10px', fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>
                flow-note.com/board
              </div>
            </div>
            {/* 앱 헤더 */}
            <div style={{ background: '#1a1d24', padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width: '64px', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ flex: 1 }} />
              <div style={{ width: '44px', height: '8px', borderRadius: '4px', background: 'rgba(45,64,142,0.45)' }} />
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(45,64,142,0.55)' }} />
            </div>
            {/* 칸반 */}
            <div style={{ background: '#13151a', padding: '16px', display: 'flex', gap: '12px' }}>
              {[
                { title: '할 일', color: '#94a3b8', items: [{ text: 'UI 디자인 시안 작성', lc: '#8b5cf6', label: 'Design' }, { text: 'API 명세서 작성', lc: '#f59e0b', label: 'Backend' }] },
                { title: '진행 중', color: '#f59e0b', items: [{ text: 'DnD 드래그 앤 드롭 구현', lc: '#3b82f6', label: 'Frontend' }] },
                { title: '완료', color: '#10b981', items: [{ text: '로그인/회원가입 구현', lc: '#3b82f6', label: 'Frontend' }, { text: 'JWT 인증 설계', lc: '#f59e0b', label: 'Backend' }] },
              ].map(col => (
                <div key={col.title} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: col.color }} />
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(232,234,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{col.title}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {col.items.map((item, i) => (
                      <div key={i} style={{ background: '#1c1f26', borderRadius: '8px', padding: '10px 11px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '11px', color: 'rgba(232,234,240,0.7)', marginBottom: '7px', lineHeight: 1.35 }}>{item.text}</p>
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '999px', background: `${item.lc}20`, color: item.lc }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 카피라이트 */}
        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontSize: '11px', color: 'rgba(232,234,240,0.18)' }}>© 2026 Flow-Note</p>
        </div>
      </div>

      {/* ── 오른쪽 폼 패널 ── */}
      <div style={{
        width: 'clamp(400px, 42vw, 520px)', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto', position: 'relative',
      }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '60px clamp(40px, 6%, 68px)',
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout