import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import TermsModal from '../components/common/TermsModal'

const LandingPage = () => {
  const navigate = useNavigate()
  const [termsModal, setTermsModal] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f14', color: '#e8eaf0', fontFamily: 'Pretendard, Noto Sans KR, sans-serif', overflowX: 'hidden' }}>

      {/* 약관 모달 */}
      {termsModal && (
        <TermsModal
          initialTab={termsModal}
          onClose={() => setTermsModal(null)}
        />
      )}

      {/* ── 헤더 ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '64px',
        background: 'rgba(13,15,20,0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Flow-Note" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '16px', color: '#e8eaf0' }}>Flow-Note</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              height: '36px', padding: '0 18px', borderRadius: '8px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(232,234,240,0.7)', fontSize: '14px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#e8eaf0' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(232,234,240,0.7)' }}
          >
            로그인
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              height: '36px', padding: '0 18px', borderRadius: '8px',
              background: '#2d408e', border: '1px solid #3d52a8',
              color: 'white', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#243370'}
            onMouseLeave={e => e.currentTarget.style.background = '#2d408e'}
          >
            시작하기
          </button>
        </div>
      </header>

      {/* ── 히어로 섹션 ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 40px 80px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(45,64,142,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(45,64,142,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '15%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '999px', marginBottom: '28px', background: 'rgba(45,64,142,0.15)', border: '1px solid rgba(45,64,142,0.4)', fontSize: '12px', fontWeight: 600, color: '#7b9cff', letterSpacing: '0.04em' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4f70ff', display: 'inline-block' }} />
          칸반보드 기반 업무 관리 서비스
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '24px', maxWidth: '800px' }}>
          <span style={{ color: '#e8eaf0' }}>업무의 흐름을</span>
          <br />
          <span style={{ background: 'linear-gradient(135deg, #4f70ff 0%, #7b9cff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>한 곳에서</span>
          <span style={{ color: '#e8eaf0' }}> 관리하세요</span>
        </h1>

        <p style={{ fontSize: '18px', color: 'rgba(232,234,240,0.55)', lineHeight: 1.7, maxWidth: '520px', marginBottom: '40px' }}>
          칸반 보드와 캘린더로 할 일을 정리하고,<br />
          드래그 앤 드롭으로 업무 흐름을 직관적으로 파악하세요.
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              height: '48px', padding: '0 28px', borderRadius: '10px',
              background: '#2d408e', border: '1px solid #3d52a8',
              color: 'white', fontSize: '15px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: '0 0 32px rgba(45,64,142,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#243370'; e.currentTarget.style.boxShadow = '0 0 48px rgba(45,64,142,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2d408e'; e.currentTarget.style.boxShadow = '0 0 32px rgba(45,64,142,0.4)' }}
          >
            무료로 시작하기 →
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              height: '48px', padding: '0 24px', borderRadius: '10px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(232,234,240,0.65)', fontSize: '15px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#e8eaf0' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(232,234,240,0.65)' }}
          >
            로그인
          </button>
        </div>

        {/* 앱 목업 */}
        <div style={{ marginTop: '72px', width: '100%', maxWidth: '960px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 60px rgba(45,64,142,0.15)' }}>
          <div style={{ background: '#1c1f26', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['#ef4444','#f59e0b','#10b981'].map(c => (
                <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.7 }} />
              ))}
            </div>
            <div style={{ flex: 1, height: '22px', borderRadius: '6px', marginLeft: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', paddingLeft: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
              flow-note.com/board
            </div>
          </div>
          <div style={{ background: '#13151a', padding: '24px', display: 'flex', gap: '16px', minHeight: '340px' }}>
            {[
              { title: '할 일', color: '#94a3b8', cards: [{ title: 'UI 디자인 시안 작성', label: 'Design', lc: '#8b5cf6', dday: 'D-5' }, { title: '회의록 정리', label: 'Docs', lc: '#6366f1', dday: 'D-2' }, { title: 'API 명세서 작성', label: 'Backend', lc: '#f59e0b', dday: 'D-7' }] },
              { title: '진행 중', color: '#f59e0b', cards: [{ title: '칸반 보드 드래그 구현', label: 'Frontend', lc: '#3b82f6', dday: 'D-1' }, { title: '알림 시스템 연동', label: 'Backend', lc: '#f59e0b', dday: 'D-3' }] },
              { title: '완료', color: '#10b981', cards: [{ title: '로그인/회원가입 구현', label: 'Frontend', lc: '#3b82f6', dday: null }, { title: 'JWT 인증 구조 설계', label: 'Backend', lc: '#f59e0b', dday: null }] },
              { title: '보류', color: '#ef4444', cards: [{ title: '소셜 로그인 연동', label: 'Auth', lc: '#ec4899', dday: null }] },
            ].map(col => (
              <div key={col.title} style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(232,234,240,0.7)' }}>{col.title}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(232,234,240,0.3)', marginLeft: '2px' }}>{col.cards.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {col.cards.map((card, i) => (
                    <div key={i} style={{ background: '#1c1f26', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ fontSize: '12px', color: '#e8eaf0', fontWeight: 500, marginBottom: '8px', lineHeight: 1.4 }}>{card.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '999px', background: `${card.lc}20`, color: card.lc }}>{card.label}</span>
                        {card.dday && <span style={{ fontSize: '10px', fontWeight: 700, color: card.dday === 'D-1' ? '#ef4444' : 'rgba(232,234,240,0.35)' }}>{card.dday}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 기능 섹션 ── */}
      <section style={{ padding: '80px 40px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: '#4f70ff', marginBottom: '12px', textTransform: 'uppercase' }}>Features</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#e8eaf0', marginBottom: '16px' }}>필요한 모든 것이 한 곳에</h2>
          <p style={{ fontSize: '16px', color: 'rgba(232,234,240,0.45)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>복잡한 설정 없이 바로 시작하는 업무 관리</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
          {[
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, color: '#4f70ff', title: '칸반 보드', desc: '할 일, 진행 중, 완료로 업무를 시각화하세요. 드래그 앤 드롭으로 상태를 직관적으로 변경할 수 있어요.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>, color: '#7b5cf6', title: '캘린더 뷰', desc: '마감일 기준으로 전체 업무 일정을 달력에서 한눈에 파악하고 놓치는 일정 없이 관리하세요.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, color: '#10b981', title: '마감 임박 알림', desc: '24시간 이내 마감 카드를 자동으로 감지해 알림을 생성합니다. 중요한 업무를 절대 놓치지 마세요.' },
          ].map((feat, i) => (
            <div key={i}
              style={{ background: '#1c1f26', borderRadius: '16px', padding: '32px 28px', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${feat.color}40`; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', marginBottom: '20px', background: `${feat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feat.color }}>{feat.icon}</div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#e8eaf0', marginBottom: '10px' }}>{feat.title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(232,234,240,0.45)', lineHeight: 1.7 }}>{feat.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {[
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>, color: '#f59e0b', title: '통합 검색', desc: '보드 이름부터 카드 내용까지 키워드 하나로 빠르게 찾아보세요. 검색어 하이라이트로 원하는 결과를 바로 확인할 수 있어요.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, color: '#ec4899', title: '마이페이지', desc: '프로필 이미지, 닉네임, 상태 메시지를 자유롭게 설정하세요. 다크모드도 지원해 원하는 환경에서 작업할 수 있어요.' },
          ].map((feat, i) => (
            <div key={i}
              style={{ background: '#1c1f26', borderRadius: '16px', padding: '32px 28px', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s', display: 'flex', gap: '20px', alignItems: 'flex-start' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${feat.color}40`; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0, background: `${feat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feat.color }}>{feat.icon}</div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#e8eaf0', marginBottom: '10px' }}>{feat.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(232,234,240,0.45)', lineHeight: 1.7 }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA 섹션 ── */}
      <section style={{
        margin: '0 40px 80px', borderRadius: '24px', padding: '100px 40px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #111827 0%, #0d0f14 60%, #111827 100%)',
        border: '1px solid rgba(79,112,255,0.25)',
        boxShadow: '0 0 0 1px rgba(79,112,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(45,64,142,0.4) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '55%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(79,112,255,0.7), transparent)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '999px', marginBottom: '24px', background: 'rgba(45,64,142,0.2)', border: '1px solid rgba(79,112,255,0.35)', fontSize: '12px', fontWeight: 600, color: '#7b9cff' }}>
            ✦ 지금 무료로 사용 가능해요
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#e8eaf0', marginBottom: '16px', lineHeight: 1.2 }}>
            업무 관리, 지금 바로<br />
            <span style={{ background: 'linear-gradient(135deg, #4f70ff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              시작해보세요
            </span>
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(232,234,240,0.4)', marginBottom: '40px', lineHeight: 1.7 }}>
            회원가입 후 즉시 사용 가능해요.<br />복잡한 설정은 필요 없어요.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              height: '50px', padding: '0 36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #2d408e 0%, #3d52c8 100%)',
              border: '1px solid rgba(79,112,255,0.4)',
              color: 'white', fontSize: '16px', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 24px rgba(45,64,142,0.45), inset 0 1px 0 rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(45,64,142,0.65), inset 0 1px 0 rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(45,64,142,0.45), inset 0 1px 0 rgba(255,255,255,0.1)' }}
          >
            무료로 시작하기 →
          </button>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <img src="/logo.png" alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#e8eaf0' }}>Flow-Note</span>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(232,234,240,0.25)', margin: 0 }}>© 2026 Flow-Note. All rights reserved.</p>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['이용약관', '개인정보처리방침'].map(t => (
            <span key={t}
              onClick={() => setTermsModal(t === '이용약관' ? 'service' : 'privacy')}
              style={{ fontSize: '12px', color: 'rgba(232,234,240,0.3)', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(232,234,240,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,234,240,0.3)'}
            >{t}</span>
          ))}
        </div>
      </footer>

    </div>
  )
}

export default LandingPage