import React, { useState } from 'react';
import { API } from '../App';

export default function Results({ onTeamClick }) {
  const [gw,      setGw]      = useState('');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const load = async (e) => {
    e.preventDefault();
    const n = parseInt(gw);
    if (!n || n < 1 || n > 38) return;
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetch(`${API}/api/predictions/${n}`);
      if (!res.ok) throw new Error('Gameweek not found');
      const json = await res.json();
      // Only show finished matches
      const finished = json.fixtures?.filter(f => f.status === 'FINISHED' || f.actual);
      setData({ ...json, fixtures: finished });
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const correct   = data?.fixtures?.filter(f => f.actual && f.prediction?.predicted_result === f.actual?.result).length || 0;
  const total     = data?.fixtures?.filter(f => f.actual).length || 0;
  const accuracy  = total > 0 ? Math.round(correct / total * 100) : null;

  return (
    <div>
      <div className="fade-up">
        <h1 className="page-title">RESULTS</h1>
        <p className="page-sub">Compare predictions vs actual results</p>
      </div>

      <div className="card fade-up fade-up-1" style={{ marginBottom: '20px' }}>
        <form onSubmit={load} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>GAMEWEEK</label>
            <input
              style={S.input}
              type="number" min="1" max="38"
              placeholder="1 – 38"
              value={gw}
              onChange={e => setGw(e.target.value)}
            />
          </div>
          <button style={S.btn} type="submit">Load</button>
        </form>

        {accuracy !== null && (
          <div style={S.scoreSummary}>
            <div style={S.scoreAccuracy}>
              <span style={S.scoreBig}>{accuracy}%</span>
              <span style={S.scoreSub}>GW{data?.gameweek} Accuracy</span>
            </div>
            <div style={S.scoreBreakdown}>
              <span style={{ color: 'var(--win)' }}>✓ {correct} correct</span>
              <span style={{ color: 'var(--loss)' }}>✗ {total - correct} wrong</span>
              <span style={{ color: 'var(--text3)' }}>{total} played</span>
            </div>
          </div>
        )}
      </div>

      {loading && <div className="spinner" />}
      {error   && <div className="error-msg">⚠ {error}</div>}

      {data && !loading && (
        <div>
          {data.fixtures?.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '40px' }}>
              No finished matches in this gameweek yet.
            </div>
          )}
          {data.fixtures?.map((f, i) => {
            const p = f.prediction;
            const a = f.actual;
            if (!a) return null;
            const correct = p?.predicted_result === a.result;
            return (
              <div key={f.fixture_id} className="card" style={{ marginBottom: '10px', borderLeft: `3px solid ${correct ? 'var(--win)' : 'var(--loss)'}` }}>
                <div style={S.resRow}>
                  <div style={S.resTeams}>
                    <span style={S.resTeam} onClick={() => onTeamClick(f.home_team)}>{f.home_team}</span>
                    <span style={S.resTeamAway} onClick={() => onTeamClick(f.away_team)}>{f.away_team}</span>
                  </div>
                  <div style={S.resPredicted}>
                    <span style={S.resLabel}>Predicted</span>
                    <span style={S.resScore}>{p?.predicted_score}</span>
                    <span className={`pill ${p?.predicted_result === 'H' ? 'home' : p?.predicted_result === 'D' ? 'draw' : 'away'}`} style={{ fontSize: '10px' }}>
                      {p?.predicted_result}
                    </span>
                  </div>
                  <div style={S.resActual}>
                    <span style={S.resLabel}>Actual</span>
                    <span style={{ ...S.resScore, color: correct ? 'var(--win)' : 'var(--loss)' }}>
                      {a.home_goals}–{a.away_goals}
                    </span>
                    <span style={{ fontSize: '20px' }}>{correct ? '✓' : '✗'}</span>
                  </div>
                </div>
                <div style={S.resProbRow}>
                  <span style={{ color: 'var(--text3)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                    H {p?.prob_home_win}% · D {p?.prob_draw}% · A {p?.prob_away_win}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!data && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
          <p style={{ fontSize: '15px' }}>Enter a completed gameweek to see how we did</p>
        </div>
      )}
    </div>
  );
}

const S = {
  label:  { display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', color: 'var(--text3)', marginBottom: '6px' },
  input:  { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text)', fontSize: '16px', fontFamily: 'var(--font-mono)', outline: 'none' },
  btn:    { background: 'var(--accent)', color: '#0a0a0f', fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '1px', padding: '12px 20px', borderRadius: '10px' },
  scoreSummary:   { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  scoreAccuracy:  { display: 'flex', flexDirection: 'column' },
  scoreBig:       { fontFamily: 'var(--font-display)', fontSize: '40px', color: 'var(--accent)', lineHeight: 1 },
  scoreSub:       { fontSize: '12px', color: 'var(--text3)', marginTop: '2px' },
  scoreBreakdown: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', textAlign: 'right' },
  resRow:     { display: 'flex', gap: '12px', alignItems: 'center' },
  resTeams:   { flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' },
  resTeam:    { fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: 'var(--text)' },
  resTeamAway:{ fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: 'var(--text2)' },
  resPredicted: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  resActual:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  resLabel:   { fontSize: '10px', color: 'var(--text3)', letterSpacing: '1px', textTransform: 'uppercase' },
  resScore:   { fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text)', lineHeight: 1 },
  resProbRow: { marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' },
};
