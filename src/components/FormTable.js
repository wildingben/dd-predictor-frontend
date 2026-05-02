import React, { useState, useEffect } from 'react';
import { API } from '../App';

export default function FormTable({ onTeamClick }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch(`${API}/api/table`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div className="spinner" />;
  if (error)   return <div className="error-msg">⚠ {error}</div>;
  if (!data)   return null;

  return (
    <div>
      <div className="fade-up">
        <h1 className="page-title">FORM TABLE</h1>
        <p className="page-sub">{data.season} season · tap a team for full stats</p>
      </div>

      <div className="card fade-up fade-up-1" style={{ padding: '0', overflow: 'hidden' }}>
        {data.table?.map((row, i) => (
          <div
            key={row.team}
            onClick={() => onTeamClick(row.team)}
            style={{
              ...S.row,
              background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg)',
              borderBottom: i < data.table.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            {/* Position */}
            <span style={{
              ...S.pos,
              color: i < 4 ? 'var(--accent)' : i < 6 ? 'var(--accent2)' : i > 16 ? 'var(--loss)' : 'var(--text3)',
            }}>
              {row.position}
            </span>

            {/* Team */}
            <span style={S.teamName}>{row.team}</span>

            {/* Stats */}
            <div style={S.stats}>
              <span style={S.stat}>{row.played}</span>
              <span style={{ ...S.stat, color: 'var(--win)' }}>{row.won}</span>
              <span style={{ ...S.stat, color: 'var(--draw)' }}>{row.drawn}</span>
              <span style={{ ...S.stat, color: 'var(--loss)' }}>{row.lost}</span>
              <span style={{ ...S.stat, color: row.gd >= 0 ? 'var(--win)' : 'var(--loss)' }}>
                {row.gd >= 0 ? '+' : ''}{row.gd}
              </span>
              <span style={{ ...S.stat, fontWeight: 700, color: 'var(--accent)', minWidth: '28px' }}>{row.points}</span>
            </div>

            {/* Form */}
            <div style={S.formWrap}>
              {row.form?.split('').map((r, j) => (
                <div key={j} style={{
                  ...S.formDot,
                  background: r === 'W' ? 'rgba(0,229,160,0.25)' : r === 'D' ? 'rgba(255,170,0,0.25)' : 'rgba(255,68,102,0.25)',
                  color: r === 'W' ? 'var(--win)' : r === 'D' ? 'var(--draw)' : 'var(--loss)',
                }}>{r}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={S.legend}>
        <span style={{ color: 'var(--accent)' }}>● Champions League</span>
        <span style={{ color: 'var(--accent2)' }}>● Europa League</span>
        <span style={{ color: 'var(--loss)' }}>● Relegation</span>
      </div>

      {/* Column headers */}
      <div style={S.colHeaders}>
        <span style={{ flex: 1, paddingLeft: '36px' }}>Team</span>
        <div style={S.colStats}>
          {['P','W','D','L','GD','Pts'].map(h => <span key={h} style={S.colH}>{h}</span>)}
        </div>
        <span style={{ minWidth: '78px', textAlign: 'right', fontSize: '10px', color: 'var(--text3)' }}>Form</span>
      </div>
    </div>
  );
}

const S = {
  row:      { display: 'flex', alignItems: 'center', padding: '11px 14px', gap: '10px', cursor: 'pointer', transition: 'background 0.15s' },
  pos:      { fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, minWidth: '22px', textAlign: 'center' },
  teamName: { flex: 1, fontSize: '14px', fontWeight: 500, color: 'var(--text)' },
  stats:    { display: 'flex', gap: '6px', alignItems: 'center' },
  stat:     { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text2)', minWidth: '22px', textAlign: 'center' },
  formWrap: { display: 'flex', gap: '2px', minWidth: '78px', justifyContent: 'flex-end' },
  formDot:  { width: '14px', height: '14px', borderRadius: '3px', fontSize: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' },
  legend:   { display: 'flex', gap: '12px', fontSize: '11px', marginTop: '12px', color: 'var(--text3)', flexWrap: 'wrap' },
  colHeaders: { display: 'none' },
  colStats:   { display: 'flex', gap: '6px' },
  colH:       { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', minWidth: '22px', textAlign: 'center' },
};
