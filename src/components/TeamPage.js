import React, { useState, useEffect } from 'react';
import { API } from '../App';

export default function TeamPage({ team, onBack, onTeamClick }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!team) return;
    setLoading(true);
    fetch(`${API}/api/team/${encodeURIComponent(team)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [team]);

  if (loading) return <div className="spinner" />;
  if (error)   return <div className="error-msg">⚠ {error}</div>;
  if (!data)   return null;

  const s = data.summary;
  const resultColor = { W: 'var(--win)', D: 'var(--draw)', L: 'var(--loss)' };

  return (
    <div>
      {/* Back button */}
      <button onClick={onBack} style={S.back}>← Back</button>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: '20px' }}>
        <h1 className="page-title">{team.toUpperCase()}</h1>
        <p className="page-sub">{s.games} matches across all tracked seasons</p>
      </div>

      {/* Summary stats */}
      <div className="card fade-up fade-up-1" style={{ marginBottom: '12px' }}>
        <div className="section-title">Overall Record</div>
        <div style={S.statGrid}>
          <div style={S.statBox}>
            <span style={S.statBig}>{s.wins}</span>
            <span style={S.statLbl}>Won</span>
          </div>
          <div style={S.statBox}>
            <span style={{ ...S.statBig, color: 'var(--draw)' }}>{s.draws}</span>
            <span style={S.statLbl}>Drawn</span>
          </div>
          <div style={S.statBox}>
            <span style={{ ...S.statBig, color: 'var(--loss)' }}>{s.losses}</span>
            <span style={S.statLbl}>Lost</span>
          </div>
          <div style={S.statBox}>
            <span style={{ ...S.statBig, color: 'var(--accent)' }}>{s.win_rate}%</span>
            <span style={S.statLbl}>Win Rate</span>
          </div>
        </div>
      </div>

      <div className="card fade-up fade-up-2" style={{ marginBottom: '12px' }}>
        <div className="section-title">Goals & Cards</div>
        <div className="stat-row">
          <span className="stat-label">Goals scored</span>
          <span className="stat-value">{s.goals_for} ({s.avg_goals_scored}/game)</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Goals conceded</span>
          <span className="stat-value">{s.goals_against} ({s.avg_goals_conceded}/game)</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Goal difference</span>
          <span className="stat-value" style={{ color: s.goal_diff >= 0 ? 'var(--win)' : 'var(--loss)' }}>
            {s.goal_diff >= 0 ? '+' : ''}{s.goal_diff}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Avg yellows (home)</span>
          <span className="stat-value">🟨 {s.avg_home_yellows}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Avg yellows (away)</span>
          <span className="stat-value">🟨 {s.avg_away_yellows}</span>
        </div>
      </div>

      {/* Last 10 */}
      <div className="section-title fade-up fade-up-3">Last 10 Results</div>
      {data.last_10?.map((g, i) => (
        <div key={i} className="card fade-up" style={{ marginBottom: '8px', padding: '12px 16px' }}>
          <div style={S.resultRow}>
            <span style={S.resultDate}>{g.date}</span>
            <span style={S.resultVenue}>{g.venue}</span>
            <span
              style={S.resultOpp}
              onClick={() => onTeamClick(g.opponent)}
            >
              vs {g.opponent}
            </span>
            <span style={S.resultScore}>{g.score}</span>
            <span style={{ ...S.resultBadge, color: resultColor[g.result] }}>
              {g.result}
            </span>
          </div>
        </div>
      ))}

      {/* Season breakdown */}
      <div className="section-title" style={{ marginTop: '20px' }}>Season by Season</div>
      <div className="card" style={{ marginBottom: '20px', overflowX: 'auto' }}>
        <table style={S.table}>
          <thead>
            <tr style={S.thead}>
              {['Season','P','W','D','L','GF','GA','GD','Pts'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.seasons?.map((s, i) => (
              <tr key={i} style={S.tr}>
                <td style={S.tdSeason}>{s.season}</td>
                <td style={S.td}>{s.played}</td>
                <td style={{ ...S.td, color: 'var(--win)' }}>{s.won}</td>
                <td style={{ ...S.td, color: 'var(--draw)' }}>{s.drawn}</td>
                <td style={{ ...S.td, color: 'var(--loss)' }}>{s.lost}</td>
                <td style={S.td}>{s.gf}</td>
                <td style={S.td}>{s.ga}</td>
                <td style={{ ...S.td, color: s.gd >= 0 ? 'var(--win)' : 'var(--loss)' }}>
                  {s.gd >= 0 ? '+' : ''}{s.gd}
                </td>
                <td style={{ ...S.td, fontWeight: 700, color: 'var(--accent)' }}>{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const S = {
  back:       { fontSize: '14px', color: 'var(--text2)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' },
  statGrid:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px' },
  statBox:    { textAlign: 'center', background: 'var(--bg3)', borderRadius: '8px', padding: '12px 8px' },
  statBig:    { display: 'block', fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--text)', lineHeight: 1, marginBottom: '4px' },
  statLbl:    { display: 'block', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  resultRow:  { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' },
  resultDate: { color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '11px', minWidth: '80px' },
  resultVenue:{ background: 'var(--bg3)', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', color: 'var(--text2)' },
  resultOpp:  { flex: 1, color: 'var(--text2)', cursor: 'pointer' },
  resultScore:{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text)' },
  resultBadge:{ fontWeight: 700, fontFamily: 'var(--font-mono)', minWidth: '16px', textAlign: 'center' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: 'var(--font-mono)' },
  thead:      { borderBottom: '1px solid var(--border)' },
  th:         { padding: '8px 6px', color: 'var(--text3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', fontFamily: 'var(--font-body)' },
  tr:         { borderBottom: '1px solid var(--border)' },
  td:         { padding: '10px 6px', textAlign: 'center', color: 'var(--text2)' },
  tdSeason:   { padding: '10px 6px', textAlign: 'left', color: 'var(--text)', fontWeight: 500 },
};
