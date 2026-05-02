import React, { useState, useEffect } from 'react';
import { API } from '../App';

const RESULT_LABELS = { H: 'Home Win', D: 'Draw', A: 'Away Win' };

// Team name mapping from football-data.co.uk to our model names
const TEAM_MAP = {
  "Man United": "Man United", "Manchester Utd": "Man United",
  "Man City": "Man City", "Manchester City": "Man City",
  "Nott'm Forest": "Nott'm Forest", "Nottingham Forest": "Nott'm Forest",
  "Wolves": "Wolves", "Wolverhampton": "Wolves",
  "West Ham": "West Ham", "Brighton": "Brighton",
  "Newcastle": "Newcastle", "Tottenham": "Tottenham",
  "Arsenal": "Arsenal", "Chelsea": "Chelsea",
  "Liverpool": "Liverpool", "Everton": "Everton",
  "Fulham": "Fulham", "Brentford": "Brentford",
  "Aston Villa": "Aston Villa", "Crystal Palace": "Crystal Palace",
  "Bournemouth": "Bournemouth", "Leicester": "Leicester",
  "Ipswich": "Ipswich", "Southampton": "Southampton",
  "Burnley": "Burnley", "Luton": "Luton",
  "Sheffield United": "Sheffield United", "Leeds": "Leeds",
  "Sunderland": "Sunderland", "Coventry": "Coventry",
  "Middlesbrough": "Middlesbrough", "Norwich": "Norwich",
  "Watford": "Watford",
};

function normTeam(name) {
  if (!name) return name;
  const clean = name.trim();
  return TEAM_MAP[clean] || clean;
}

function FormDots({ str }) {
  if (!str) return null;
  return (
    <div className="form-string">
      {str.split('').map((r, i) => <div key={i} className={`form-dot ${r}`}>{r}</div>)}
    </div>
  );
}

function ProbBar({ home, draw, away }) {
  return (
    <div className="prob-bar">
      <div className="prob-bar-h" style={{ width: `${home}%` }} />
      <div className="prob-bar-d" style={{ width: `${draw}%` }} />
      <div className="prob-bar-a" style={{ width: `${away}%` }} />
    </div>
  );
}

function FixtureCard({ fixture, onClick }) {
  const [expanded, setExpanded] = useState(false);
  const p = fixture.prediction;
  const resultClass = { H: 'home', D: 'draw', A: 'away' }[p.predicted_result];
  return (
    <div className="card" style={{ marginBottom: '12px' }}>
      <div onClick={() => setExpanded(e => !e)} style={{ cursor: 'pointer' }}>
        <div style={S.matchDate}>{formatDate(fixture.match_date)}</div>
        <div style={S.teamsRow}>
          <span style={S.team} onClick={e => { e.stopPropagation(); onClick(fixture.home_team); }}>{fixture.home_team}</span>
          <div style={S.scoreBox}>
            <span style={S.scorePred}>{p.predicted_score}</span>
            <span className={`pill ${resultClass}`}>{RESULT_LABELS[p.predicted_result]}</span>
          </div>
          <span style={{ ...S.team, textAlign: 'right' }} onClick={e => { e.stopPropagation(); onClick(fixture.away_team); }}>{fixture.away_team}</span>
        </div>
        <ProbBar home={p.prob_home_win} draw={p.prob_draw} away={p.prob_away_win} />
        <div style={S.probLabels}>
          <span style={S.probVal}>{p.prob_home_win}%</span>
          <span style={{ ...S.probVal, color: 'var(--draw)' }}>{p.prob_draw}%</span>
          <span style={S.probVal}>{p.prob_away_win}%</span>
        </div>
        <div style={S.quickStats}>
          <span className={`pill ${p.over_25 ? 'over' : 'under'}`}>{p.over_25 ? 'Over' : 'Under'} 2.5</span>
          <span style={S.goalExp}>⚽ {p.expected_home_goals} – {p.expected_away_goals}</span>
          <span style={S.goalExp}>🟨 {fixture.cards?.pred_total_yellows}</span>
          <span style={S.expand}>{expanded ? '▲ Less' : '▼ More'}</span>
        </div>
      </div>
      {expanded && (
        <div style={S.detail}>
          <div style={S.divider} />
          <div style={S.detailSection}>
            <div style={S.detailTitle}>Form (last 6)</div>
            <div style={S.formRow}><span style={S.formTeam}>{fixture.home_team}</span><FormDots str={fixture.home_form?.form_string} /></div>
            <div style={S.formRow}><span style={S.formTeam}>{fixture.away_team}</span><FormDots str={fixture.away_form?.form_string} /></div>
          </div>
          <div style={S.detailSection}>
            <div style={S.detailTitle}>Most Likely Scores</div>
            <div style={S.scoresGrid}>
              {p.likely_scores?.map((s, i) => (
                <div key={i} style={S.likelyScore}>
                  <span style={S.likelyScoreVal}>{s.score}</span>
                  <span style={S.likelyScoreProb}>{s.probability}%</span>
                </div>
              ))}
            </div>
          </div>
          {fixture.head_to_head?.length > 0 && (
            <div style={S.detailSection}>
              <div style={S.detailTitle}>Head to Head</div>
              {fixture.head_to_head.map((h, i) => (
                <div key={i} style={S.h2hRow}>
                  <span style={S.h2hDate}>{h.date}</span>
                  <span style={S.h2hMatch}>{h.home_team} <strong>{h.score}</strong> {h.away_team}</span>
                  <span className={`pill ${h.result === 'H' ? 'home' : h.result === 'D' ? 'draw' : 'away'}`} style={{ fontSize: '10px' }}>{h.result}</span>
                </div>
              ))}
            </div>
          )}
          <div style={S.detailSection}>
            <div style={S.detailTitle}>Yellow Card Prediction</div>
            <div style={S.cardsRow}>
              <div style={S.cardStat}><span style={S.cardTeam}>{fixture.home_team}</span><span style={S.cardVal}>🟨 {fixture.cards?.pred_home_yellows}</span></div>
              <div style={S.cardStat}><span style={S.cardTeam}>{fixture.away_team}</span><span style={S.cardVal}>🟨 {fixture.cards?.pred_away_yellows}</span></div>
            </div>
          </div>
          {fixture.actual && (
            <div style={{ ...S.detailSection, background: 'var(--bg3)', borderRadius: '8px', padding: '10px' }}>
              <div style={S.detailTitle}>Actual Result</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 600 }}>
                {fixture.actual.home_goals} – {fixture.actual.away_goals}
                <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                  {fixture.actual.result === p.predicted_result
                    ? <span style={{ color: 'var(--win)' }}>✓ Correct</span>
                    : <span style={{ color: 'var(--loss)' }}>✗ Wrong</span>}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Predictions({ onTeamClick }) {
  const [gwInput,  setGwInput]  = useState('');
  const [season,   setSeason]   = useState('2025-26');
  const [seasons,  setSeasons]  = useState([]);
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    fetch(`${API}/api/seasons`)
      .then(r => r.json())
      .then(d => {
        if (d.seasons) {
          setSeasons(d.seasons);
          const latest = d.seasons[d.seasons.length - 1];
          if (latest) setSeason(latest.season);
        }
      })
      .catch(() => {});
  }, []);

  const parseFixturesCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
      return obj;
    }).filter(r => r.Div === 'E0' && r.HomeTeam && r.AwayTeam);
  };

  const gwToFixtures = (allFixtures, targetGW, maxPlayedGW) => {
    // Sort by date, group into sets of 10, offset by maxPlayedGW
    const sorted = [...allFixtures].sort((a, b) => {
      const da = new Date(a.Date.split('/').reverse().join('-'));
      const db = new Date(b.Date.split('/').reverse().join('-'));
      return da - db;
    });
    const gw = targetGW - maxPlayedGW - 1;
    const start = gw * 10;
    return sorted.slice(start, start + 10);
  };

  const load = async (e) => {
    e.preventDefault();
    const n = parseInt(gwInput);
    if (!n || n < 1 || n > 38) return;
    setLoading(true); setError(''); setData(null);

    try {
      // Step 1: try historical CSV data first
      const histRes = await fetch(`${API}/api/predictions/${n}?season=${encodeURIComponent(season)}`);
      if (histRes.ok) {
        const histData = await histRes.json();
        if (histData.fixtures && histData.fixtures.length > 0) {
          setData(histData);
          return;
        }
      }

      // Step 2: fetch upcoming fixtures from football-data.co.uk (from browser — no IP restriction)
      const csvRes = await fetch('https://www.football-data.co.uk/fixtures.csv');
      if (!csvRes.ok) throw new Error('Could not fetch upcoming fixtures');
      const csvText = await csvRes.text();
      const allUpcoming = parseFixturesCSV(csvText);

      if (allUpcoming.length === 0) throw new Error('No upcoming PL fixtures found');

      // Get max played GW from seasons data
      const seasonData = seasons.find(s => s.season === season);
      const maxPlayedGW = seasonData ? seasonData.max_gw : 34;

      const gwFixtures = gwToFixtures(allUpcoming, n, maxPlayedGW);
      if (gwFixtures.length === 0) {
        throw new Error(`No fixtures found for GW${n}. Try GW${maxPlayedGW + 1} or GW${maxPlayedGW + 2}.`);
      }

      // Step 3: send fixtures to backend for predictions
      const fixtures = gwFixtures.map(f => {
        const parts = f.Date.split('/');
        const date = parts.length === 3
          ? `20${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
          : f.Date;
        return {
          home: normTeam(f.HomeTeam),
          away: normTeam(f.AwayTeam),
          date,
          time: f.Time || '',
        };
      });

      const predRes = await fetch(`${API}/api/predict_fixtures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameweek: n, season, fixtures }),
      });

      if (!predRes.ok) {
        const err = await predRes.json();
        throw new Error(err.error || 'Prediction failed');
      }

      setData(await predRes.json());

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="fade-up">
        <h1 className="page-title">PREDICTIONS</h1>
        <p className="page-sub">Select a season and gameweek</p>
      </div>
      <div className="card fade-up fade-up-1" style={{ marginBottom: '20px' }}>
        <form onSubmit={load} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={S.gwLabel}>SEASON</label>
            <select style={{ ...S.gwInput, appearance: 'none' }} value={season} onChange={e => setSeason(e.target.value)}>
              {seasons.map(s => <option key={s.season} value={s.season}>{s.season} ({s.fixtures} fixtures)</option>)}
              {seasons.length === 0 && <option value="2025-26">2025-26</option>}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={S.gwLabel}>GAMEWEEK</label>
              <input style={S.gwInput} type="number" min="1" max="38" placeholder="1 – 38" value={gwInput} onChange={e => setGwInput(e.target.value)} />
            </div>
            <button style={S.gwBtn} type="submit">Load ⚡</button>
          </div>
        </form>
        {data && (
          <div style={S.gwMeta}>
            <span style={{ color: 'var(--text2)', fontSize: '13px' }}>
              {data.season} · GW{data.gameweek} · {data.fixtures?.length} fixtures
              {data.source === 'upcoming' && <span style={{ color: 'var(--accent2)', marginLeft: '6px' }}>● Live fixtures</span>}
            </span>
            <span className="accuracy-badge">⚡ {data.model_accuracy?.overall}% accurate</span>
          </div>
        )}
      </div>
      {loading && (
        <div>
          <div className="spinner" />
          <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: '14px', marginTop: '8px' }}>Running model… ~30 seconds</p>
        </div>
      )}
      {error && <div className="error-msg">⚠ {error}</div>}
      {data && !loading && (
        <div>
          <div className="section-title">{data.fixtures?.length} Fixtures</div>
          {data.fixtures?.map((f, i) => (
            <div key={f.fixture_id} className={`fade-up fade-up-${Math.min(i+1,4)}`}>
              <FixtureCard fixture={f} onClick={onTeamClick} />
            </div>
          ))}
        </div>
      )}
      {!data && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚽</div>
          <p style={{ fontSize: '15px' }}>Select a season and gameweek above</p>
        </div>
      )}
    </div>
  );
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

const S = {
  matchDate: { fontSize: '11px', color: 'var(--text3)', marginBottom: '10px', fontFamily: 'var(--font-mono)' },
  teamsRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' },
  team: { fontSize: '14px', fontWeight: 600, flex: 1, cursor: 'pointer', color: 'var(--text)' },
  scoreBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '90px' },
  scorePred: { fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '2px', color: 'var(--text)', lineHeight: 1 },
  probLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-mono)' },
  probVal: { color: 'var(--text2)' },
  quickStats: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' },
  goalExp: { fontSize: '12px', color: 'var(--text2)', fontFamily: 'var(--font-mono)' },
  expand: { marginLeft: 'auto', fontSize: '11px', color: 'var(--text3)' },
  detail: { marginTop: '4px' },
  divider: { height: '1px', background: 'var(--border)', margin: '12px 0' },
  detailSection: { marginBottom: '14px' },
  detailTitle: { fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '8px' },
  formRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' },
  formTeam: { fontSize: '13px', color: 'var(--text2)', flex: 1 },
  scoresGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  likelyScore: { background: 'var(--bg3)', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', minWidth: '70px' },
  likelyScoreVal: { display: 'block', fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 600, color: 'var(--text)' },
  likelyScoreProb: { display: 'block', fontSize: '11px', color: 'var(--text2)', marginTop: '2px' },
  h2hRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' },
  h2hDate: { color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '11px', minWidth: '80px' },
  h2hMatch: { flex: 1, color: 'var(--text2)' },
  cardsRow: { display: 'flex', gap: '12px' },
  cardStat: { flex: 1, background: 'var(--bg3)', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTeam: { fontSize: '12px', color: 'var(--text2)' },
  cardVal: { fontFamily: 'var(--font-mono)', fontWeight: 600 },
  gwLabel: { display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', color: 'var(--text3)', marginBottom: '6px' },
  gwInput: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text)', fontSize: '16px', fontFamily: 'var(--font-mono)', outline: 'none' },
  gwBtn: { background: 'var(--accent)', color: '#0a0a0f', fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '1px', padding: '12px 20px', borderRadius: '10px', whiteSpace: 'nowrap' },
  gwMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' },
};
