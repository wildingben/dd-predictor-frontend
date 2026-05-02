import React from 'react';

const VERSIONS = [
  { v: 'v1', acc: '52.2%', note: 'Basic Poisson model. 0 draw predictions.' },
  { v: 'v2', acc: '50.7%', note: 'Dixon-Coles correction added. Home bias got worse.' },
  { v: 'v3', acc: '50.9%', note: 'Probability-first result selection. Still no draws.' },
  { v: 'v4', acc: '53.3%', note: 'Full MLE fitting. Home bias fixed. Still 0 draws.' },
  { v: 'v5', acc: '53.3%', note: 'Draw threshold added. 5 draws predicted, 2 correct. ✓ Current model.' },
];

export default function About() {
  return (
    <div>
      <div className="fade-up">
        <h1 className="page-title">THE MODEL</h1>
        <p className="page-sub">How the DD Predictor works</p>
      </div>

      <div className="card fade-up fade-up-1" style={{ marginBottom: '12px' }}>
        <div className="section-title">What is this?</div>
        <p style={S.p}>
          The DD Predictor is a statistical football prediction engine built for the Don Dons — Ben and Luke.
          It uses a Dixon-Coles Maximum Likelihood model trained on 4 seasons of Premier League data to predict
          match results, scorelines, goals, and cards.
        </p>
      </div>

      <div className="card fade-up fade-up-2" style={{ marginBottom: '12px' }}>
        <div className="section-title">How it works</div>
        <div className="stat-row">
          <span className="stat-label">Data source</span>
          <span className="stat-value" style={{ fontSize: '13px' }}>Football-Data.co.uk</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Seasons</span>
          <span className="stat-value">2021-22 → 2024-25</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Training fixtures</span>
          <span className="stat-value">1,520</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Model type</span>
          <span className="stat-value" style={{ fontSize: '12px' }}>Dixon-Coles MLE</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Form window</span>
          <span className="stat-value">Last 6 games</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Time decay</span>
          <span className="stat-value">~3 year half-life</span>
        </div>
      </div>

      <div className="card fade-up fade-up-3" style={{ marginBottom: '12px' }}>
        <div className="section-title">Current accuracy (v5 backtest)</div>
        <div className="stat-row">
          <span className="stat-label">Overall result (H/D/A)</span>
          <span className="stat-value" style={{ color: 'var(--accent)' }}>53.3%</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Home win predictions</span>
          <span className="stat-value">53.9%</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Away win predictions</span>
          <span className="stat-value">52.7%</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Over/Under 2.5 goals</span>
          <span className="stat-value">58.0%</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Exact scoreline</span>
          <span className="stat-value">9.2%</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Yellow cards (mean error)</span>
          <span className="stat-value">±1.76 per game</span>
        </div>
      </div>

      <div className="section-title fade-up">Version History</div>
      {VERSIONS.map((v, i) => (
        <div key={v.v} className="card fade-up" style={{ marginBottom: '8px', padding: '12px 16px', borderLeft: v.v === 'v5' ? '3px solid var(--accent)' : '3px solid var(--border)' }}>
          <div style={S.verRow}>
            <span style={S.verName}>{v.v}</span>
            <span style={{ ...S.verAcc, color: v.v === 'v5' ? 'var(--accent)' : 'var(--text2)' }}>{v.acc}</span>
          </div>
          <p style={S.verNote}>{v.note}</p>
        </div>
      ))}

      <div className="card" style={{ marginTop: '12px', marginBottom: '20px', background: 'rgba(0,229,160,0.05)', borderColor: 'rgba(0,229,160,0.2)' }}>
        <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--accent)' }}>Why 53% matters:</strong> Random chance gives you 33% (3 outcomes).
          Professional betting models typically reach 55–58%. At 53.3% we're beating casual prediction
          significantly and are competitive with entry-level professional models — with room to improve.
        </p>
      </div>
    </div>
  );
}

const S = {
  p:       { fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7 },
  verRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  verName: { fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)', fontSize: '15px' },
  verAcc:  { fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 600 },
  verNote: { fontSize: '13px', color: 'var(--text2)' },
};
