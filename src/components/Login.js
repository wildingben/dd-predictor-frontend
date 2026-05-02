import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [shaking, setShaking] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (onLogin(u, p)) return;
    setErr('Wrong credentials, Don.');
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.bg} />
      <div style={{ ...styles.card, animation: 'fadeUp 0.4s ease both' }}>
        <div style={styles.logo}>
          <span style={styles.dd}>DD</span>
          <span style={styles.pred}>PREDICTOR</span>
        </div>
        <p style={styles.sub}>Don Don Private Access</p>

        <form onSubmit={submit} style={{ ...styles.form, animation: shaking ? 'shake 0.4s ease' : 'none' }}>
          <input
            style={styles.input}
            type="text"
            placeholder="Username"
            value={u}
            onChange={e => setU(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={p}
            onChange={e => setP(e.target.value)}
          />
          {err && <p style={styles.err}>{err}</p>}
          <button style={styles.btn} type="submit">Enter</button>
        </form>
        <p style={styles.footer}>v5 Model · 53.3% accuracy</p>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
      `}</style>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,229,160,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '360px',
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '36px 28px',
    position: 'relative',
    zIndex: 1,
  },
  logo: { display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' },
  dd:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '40px', color: 'var(--accent)', letterSpacing: '3px', lineHeight: 1 },
  pred: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: 'var(--text2)', letterSpacing: '4px' },
  sub:  { fontSize: '13px', color: 'var(--text3)', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: {
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '13px 16px',
    color: 'var(--text)',
    fontSize: '15px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  err: { fontSize: '13px', color: 'var(--danger)', textAlign: 'center' },
  btn: {
    background: 'var(--accent)',
    color: '#0a0a0f',
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '20px',
    letterSpacing: '2px',
    padding: '14px',
    borderRadius: '10px',
    marginTop: '4px',
    transition: 'opacity 0.2s, transform 0.15s',
  },
  footer: { fontSize: '11px', color: 'var(--text3)', textAlign: 'center', marginTop: '20px', fontFamily: "'DM Mono', monospace" },
};
