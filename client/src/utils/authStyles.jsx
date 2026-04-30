export const inputStyle = {
  width: '100%', height: '46px', borderRadius: '10px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#e8eaf0', fontSize: '14px', padding: '0 14px',
  outline: 'none', transition: 'border-color 0.15s',
  boxSizing: 'border-box', fontFamily: 'inherit',
}

export const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: 600,
  color: 'rgba(232,234,240,0.4)', letterSpacing: '0.06em',
  textTransform: 'uppercase', marginBottom: '8px',
}

export const onFocus = (e) => e.target.style.borderColor = 'rgba(79,112,255,0.6)'
export const onBlur  = (e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'

export const EyeBtn = ({ show, onToggle }) => (
  <button
    type="button" onClick={onToggle}
    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, display: 'flex', alignItems: 'center' }}
  >
    {show
      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    }
  </button>
)