import React, { useState } from 'react';
import { API } from '../App';

// ── HELPERS ──

const STRATEGY_EXPLANATION = [
  { icon: '🎯', label: 'Market', value: 'Away Win only' },
  { icon: '📊', label: 'Edge required', value: '5–8% above bookmaker implied probability' },
  { icon: '📈', label: 'Backtested ROI', value: '+6.1% over 3 seasons (147 bets)' },
  { icon: '✅', label: 'Profitable seasons', value: '2 out of 3 (improving trend)' },
  { icon: '📅', label: 'Bets per season', value: '~49 value bets identified' },
];

const SEASON_HISTORY = [
  { season: '2022-23', bets: 38, profit: -4.63, roi: -12.2, wins: 13, note: 'Less training data' },
  { season: '2023-24', bets: 50, profit: 8.66,  roi: 17.3,  wins: 18, note: 'Best season' },
  { season: '2024-25', bets: 59, profit: 4.88,  roi: 8.3,   wins: 22, note: 'Profitable' },
];

function ValueBetCard({ bet, stake }) {
  const potentialProfit = ((bet.odds - 1) * stake).toFixed(2);
  const potentialLoss   = stake.toFixed(2);
  const edgePct         = (bet.edge * 100).toFixed(1);
  const modelPct        = (bet.model_prob * 100).toFixed(1);
  const impliedPct      = (bet.implied_prob * 100).toFixed(1);

  return (
    <div className="card" style={{
      marginBottom: '12px',
      borderLeft: '3px solid var(--accent)',
      background: 'rgba(0,229,160,0.03)',
    }}>
      <div style={S.betHeader}>
        <div>
          <div style={S.betTeams}>{bet.home_team} vs {bet.away_team}</div>
          <div style={S.betDate}>{bet.match_date} {bet.match_time ? `· ${bet.match_time} UTC` : ''}</div>
        </div>
        <div style={S.betBadge}>⚡ VALUE BET</div>
      </div>

      <div style={S.betMarket}>🏃 Away Win — {bet.away_team}</div>

      {/* Probability comparison */}
      <div style={S.probRow}>
        <div style={S.probBox}>
          <span style={S.probLabel}>Our Model</span>
          <span style={{ ...S.probValue, color: 'var(--accent)' }}>{modelPct}%</span>
        </div>
        <div style={S.probArrow}>vs</div>
        <div style={S.probBox}>
          <span style={S.probLabel}>Bookmaker implied</span>
          <span style={S.probValue}>{impliedPct}%</span>
        </div>
        <div style={S.probBox}>
          <span style={S.probLabel}>Our edge</span>
          <span style={{ ...S.probValue, color: 'var(--win)' }}>+{edgePct}%</span>
        </div>
      </div>

      {/* Odds */}
      <div style={S.oddsRow}>
        <div style={S.oddsBox}>
          <span style={S.oddsLabel}>Bet365 odds</span>
          <span style={S.oddsValue}>{bet.b365_odds ? bet.b365_odds.toFixed(2) : '—'}</span>
        </div>
        <div style={S.oddsBox}>
          <span style={S.oddsLabel}>Market avg</span>
          <span style={S.oddsValue}>{bet.avg_odds ? bet.avg_odds.toFixed(2) : '—'}</span>
        </div>
        <div style={S.oddsBox}>
          <span style={S.oddsLabel}>At £{stake.toFixed(0)} stake</span>
          <span style={{ ...S.oddsValue, color: 'var(--win)' }}>£+{potentialProfit} / -£{potentialLoss}</span>
        </div>
      </div>

      <div style={S.betFooter}>
        <span style={S.confidenceBar}>
          {'█'.repeat(Math.round(bet.edge * 100 / 8 * 10))}{'░'.repeat(10 - Math.round(bet.edge * 100 / 8 * 10))}
        </span>
        <span style={S.confidenceLabel}>Edge confidence</span>
      </div>
    </div>
  );
}

function StakeInput({ stake, setStake }) {
  const presets = [1, 5, 10, 25, 50];
  return (
    <div style={S.stakeWrap}>
      <div style={S.stakeLabel}>STAKE PER BET</div>
      <div style={S.stakeRow}>
        <div style={S.stakeInputWrap}>
          <span style={S.stakePound}>£</span>
          <input
            style={S.stakeInput}
            type="number"
            min="1"
            value={stake}
            onChange={e => setStake(Math.max(1, Number(e.target.value)))}
          />
        </div>
        <div style={S.presets}>
          {presets.map(p => (
            <button
              key={p}
              style={{ ...S.presetBtn, background: stake === p ? 'var(--accent)' : 'var(--bg3)', color: stake === p ? '#0a0a0f' : 'var(--text2)' }}
              onClick={() => setStake(p)}
            >£{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Betting({ onTeamClick }) {
  const [gwInput,   setGwInput]   = useState('');
  const [stake,     setStake]     = useState(10);
  const [valueBets, setValueBets] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [tab,       setTab]       = useState('bets'); // bets | history | strategy

  const findValueBets = async (e) => {
    e.preventDefault();
    const n = parseInt(gwInput);
    if (!n || n < 1 || n > 38) return;
    setLoading(true); setError(''); setValueBets(null);

    try {
      const res = await fetch(`${API}/api/value_bets/${n}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `GW${n} not found`);
      }
      setValueBets(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalStaked   = valueBets?.value_bets?.length * stake || 0;
  const expectedProfit = valueBets?.value_bets?.reduce((sum, b) => sum + b.expected_value * stake, 0) || 0;

  return (
    <div>
      <div className="fade-up">
        <h1 className="page-title">BETTING</h1>
        <p className="page-sub">Value bet finder — Away Win strategy</p>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {[['bets','⚡ Value Bets'],['history','📊 Track Record'],['strategy','🎯 Strategy']].map(([id,label]) => (
          <button
            key={id}
            style={{ ...S.tab, borderBottom: tab===id ? '2px solid var(--accent)' : '2px solid transparent', color: tab===id ? 'var(--accent)' : 'var(--text2)' }}
            onClick={() => setTab(id)}
          >{label}</button>
        ))}
      </div>

      {/* VALUE BETS TAB */}
      {tab === 'bets' && (
        <div>
          <div className="card fade-up fade-up-1" style={{ marginBottom: '16px' }}>
            <StakeInput stake={stake} setStake={setStake} />
            <div style={{ height: '12px' }} />
            <form onSubmit={findValueBets} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={S.gwLabel}>GAMEWEEK</label>
                <input
                  style={S.gwInput}
                  type="number" min="1" max="38"
                  placeholder="1 – 38"
                  value={gwInput}
                  onChange={e => setGwInput(e.target.value)}
                />
              </div>
              <button style={S.gwBtn} type="submit">Find Bets ⚡</button>
            </form>
          </div>

          {loading && (
            <div>
              <div className="spinner" />
              <p style={{ textAlign:'center', color:'var(--text2)', fontSize:'14px', marginTop:'8px' }}>
                Running model & scanning for value…
              </p>
            </div>
          )}

          {error && <div className="error-msg">⚠ {error}</div>}

          {valueBets && !loading && (
            <div>
              {/* Summary */}
              <div className="card" style={{ marginBottom: '16px', background: valueBets.value_bets?.length > 0 ? 'rgba(0,229,160,0.04)' : 'var(--bg2)', borderColor: valueBets.value_bets?.length > 0 ? 'rgba(0,229,160,0.2)' : 'var(--border)' }}>
                <div style={S.summaryRow}>
                  <div style={S.summaryStat}>
                    <span style={S.summaryBig}>{valueBets.value_bets?.length || 0}</span>
                    <span style={S.summaryLabel}>Value bets found</span>
                  </div>
                  <div style={S.summaryStat}>
                    <span style={S.summaryBig}>£{totalStaked.toFixed(0)}</span>
                    <span style={S.summaryLabel}>Total to stake</span>
                  </div>
                  <div style={S.summaryStat}>
                    <span style={{ ...S.summaryBig, color: expectedProfit >= 0 ? 'var(--win)' : 'var(--loss)' }}>
                      {expectedProfit >= 0 ? '+' : ''}£{Math.abs(expectedProfit).toFixed(2)}
                    </span>
                    <span style={S.summaryLabel}>Expected return</span>
                  </div>
                </div>
                {valueBets.value_bets?.length === 0 && (
                  <p style={{ fontSize:'13px', color:'var(--text3)', textAlign:'center', marginTop:'8px' }}>
                    No value bets this gameweek — the model doesn't see enough edge. Skip this week.
                  </p>
                )}
              </div>

              {/* Bet cards */}
              {valueBets.value_bets?.map((bet, i) => (
                <div key={i} className={`fade-up fade-up-${Math.min(i+1,4)}`}>
                  <ValueBetCard bet={bet} stake={stake} />
                </div>
              ))}

              {/* All fixtures for context */}
              {valueBets.all_fixtures?.length > 0 && (
                <div>
                  <div className="section-title" style={{ marginTop:'20px' }}>All GW{valueBets.gameweek} fixtures — context</div>
                  {valueBets.all_fixtures?.map((f, i) => {
                    const isValue = valueBets.value_bets?.some(b => b.home_team === f.home_team && b.away_team === f.away_team);
                    return (
                      <div key={i} className="card" style={{ marginBottom:'8px', padding:'12px 16px', opacity: isValue ? 1 : 0.6 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'13px' }}>
                          <span style={{ fontWeight:600, cursor:'pointer' }} onClick={() => onTeamClick(f.home_team)}>{f.home_team}</span>
                          <div style={{ textAlign:'center' }}>
                            <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text3)' }}>{f.match_date}</div>
                            <div style={{ fontSize:'11px', color:'var(--text2)', marginTop:'2px' }}>
                              H:{f.prob_home}% D:{f.prob_draw}% A:{f.prob_away}%
                            </div>
                            {f.away_edge > 0 && <div style={{ fontSize:'10px', color:'var(--accent)', marginTop:'2px' }}>Edge: +{(f.away_edge*100).toFixed(1)}%</div>}
                          </div>
                          <span style={{ fontWeight:600, cursor:'pointer', textAlign:'right' }} onClick={() => onTeamClick(f.away_team)}>{f.away_team}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!valueBets && !loading && !error && (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)' }}>
              <div style={{ fontSize:'48px', marginBottom:'12px' }}>💰</div>
              <p style={{ fontSize:'15px' }}>Enter a gameweek to scan for value bets</p>
              <p style={{ fontSize:'12px', marginTop:'8px', color:'var(--text3)' }}>
                Finds Away Win bets where our model has 5–8% edge over the bookmaker
              </p>
            </div>
          )}
        </div>
      )}

      {/* TRACK RECORD TAB */}
      {tab === 'history' && (
        <div>
          <div className="card fade-up" style={{ marginBottom:'12px' }}>
            <div className="section-title">Overall Performance — Away Win Strategy</div>
            <div style={S.overallStats}>
              <div style={S.overallStat}><span style={{ ...S.overallBig, color:'var(--accent)' }}>+6.1%</span><span style={S.overallLabel}>ROI (2022–25)</span></div>
              <div style={S.overallStat}><span style={S.overallBig}>147</span><span style={S.overallLabel}>Total bets</span></div>
              <div style={S.overallStat}><span style={{ ...S.overallBig, color:'var(--win)' }}>+£8.91</span><span style={S.overallLabel}>Profit @ £1/bet</span></div>
              <div style={S.overallStat}><span style={S.overallBig}>2/3</span><span style={S.overallLabel}>Profitable seasons</span></div>
            </div>
          </div>

          <div className="section-title">Season by Season</div>
          {SEASON_HISTORY.map((s, i) => (
            <div key={s.season} className="card fade-up" style={{ marginBottom:'10px', borderLeft: `3px solid ${s.profit >= 0 ? 'var(--win)' : 'var(--loss)'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'15px', color:'var(--text)' }}>{s.season}</div>
                  <div style={{ fontSize:'12px', color:'var(--text3)', marginTop:'2px' }}>{s.note}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'24px', color: s.profit >= 0 ? 'var(--win)' : 'var(--loss)', lineHeight:1 }}>
                    {s.profit >= 0 ? '+' : ''}£{Math.abs(s.profit).toFixed(2)}
                  </div>
                  <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'2px' }}>per £1 stake</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'16px', marginTop:'10px', fontSize:'12px', fontFamily:'var(--font-mono)' }}>
                <span style={{ color:'var(--text2)' }}>{s.bets} bets</span>
                <span style={{ color: s.roi >= 0 ? 'var(--win)' : 'var(--loss)' }}>ROI: {s.roi >= 0 ? '+' : ''}{s.roi}%</span>
                <span style={{ color:'var(--text2)' }}>{s.wins} winners ({(s.wins/s.bets*100).toFixed(0)}%)</span>
              </div>
              <StakeInput stake={stake} setStake={setStake} />
              <div style={{ marginTop:'8px', padding:'8px', background:'var(--bg3)', borderRadius:'8px', fontSize:'13px', display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'var(--text2)' }}>At £{stake}/bet this season would have been:</span>
                <span style={{ fontWeight:700, color: s.profit >= 0 ? 'var(--win)' : 'var(--loss)', fontFamily:'var(--font-mono)' }}>
                  {s.profit*stake >= 0 ? '+' : ''}£{(s.profit * stake).toFixed(2)}
                </span>
              </div>
            </div>
          ))}

          <div className="card" style={{ marginTop:'4px', background:'rgba(0,229,160,0.04)', borderColor:'rgba(0,229,160,0.2)' }}>
            <p style={{ fontSize:'12px', color:'var(--text2)', lineHeight:1.7 }}>
              <strong style={{ color:'var(--accent)' }}>Important:</strong> Past performance doesn't guarantee future results.
              This strategy has shown a genuine mathematical edge over 3 seasons but individual seasons vary.
              Only bet what you can afford to lose. The model is a tool to inform decisions, not a guaranteed profit machine.
            </p>
          </div>
        </div>
      )}

      {/* STRATEGY TAB */}
      {tab === 'strategy' && (
        <div>
          <div className="card fade-up" style={{ marginBottom:'12px' }}>
            <div className="section-title">The Away Win Value Strategy</div>
            <p style={{ fontSize:'13px', color:'var(--text2)', lineHeight:1.7, marginBottom:'12px' }}>
              After backtesting 5 different betting markets across 3 seasons, the only consistently
              profitable signal is Away Win bets where our model identifies a 5–8% edge over
              the bookmaker's implied probability.
            </p>
            {STRATEGY_EXPLANATION.map((s, i) => (
              <div key={i} className="stat-row">
                <span className="stat-label">{s.icon} {s.label}</span>
                <span className="stat-value" style={{ fontSize:'12px', textAlign:'right', maxWidth:'60%' }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div className="card fade-up fade-up-1" style={{ marginBottom:'12px' }}>
            <div className="section-title">What is a Value Bet?</div>
            <p style={{ fontSize:'13px', color:'var(--text2)', lineHeight:1.7 }}>
              A value bet is where <strong style={{ color:'var(--text)' }}>our model's probability is higher than the bookmaker's implied probability</strong>.
            </p>
            <div style={{ background:'var(--bg3)', borderRadius:'8px', padding:'12px', margin:'10px 0', fontFamily:'var(--font-mono)', fontSize:'12px' }}>
              <div style={{ color:'var(--text2)', marginBottom:'6px' }}>Example:</div>
              <div>Model says Away Win probability = <span style={{ color:'var(--accent)' }}>42%</span></div>
              <div>Bookmaker odds 3.00 implies = <span style={{ color:'var(--text2)' }}>33%</span></div>
              <div style={{ marginTop:'6px', color:'var(--win)' }}>Edge = 42% - 33% = +9% ← Value bet</div>
            </div>
            <p style={{ fontSize:'13px', color:'var(--text2)', lineHeight:1.7 }}>
              Over enough bets, finding consistent edges leads to long-term profit even with a low win rate.
              Away wins at 5-8% edge hit at ~36% — but the odds are typically 3.5-4.5x, making it profitable.
            </p>
          </div>

          <div className="card fade-up fade-up-2" style={{ marginBottom:'12px' }}>
            <div className="section-title">Why Away Win specifically?</div>
            <p style={{ fontSize:'13px', color:'var(--text2)', lineHeight:1.7 }}>
              Bookmakers are most efficient at pricing clear favourites. Away teams — especially underdogs —
              are harder to price accurately. Our model's historical data and form analysis identifies cases
              where the bookmaker has underestimated an away team's chances, particularly when:
            </p>
            <div style={{ marginTop:'10px', fontSize:'13px', color:'var(--text2)' }}>
              <div style={{ marginBottom:'6px' }}>✓ Away team is in strong recent form</div>
              <div style={{ marginBottom:'6px' }}>✓ Home team is weaker than their position suggests</div>
              <div style={{ marginBottom:'6px' }}>✓ Historical H2H favours the away side</div>
              <div>✓ League position gap is smaller than odds imply</div>
            </div>
          </div>

          <div className="card fade-up fade-up-3" style={{ marginBottom:'12px' }}>
            <div className="section-title">🚧 Coming Next</div>
            <div style={{ fontSize:'13px', color:'var(--text2)', lineHeight:1.8 }}>
              <div>⏳ BTTS (Both Teams to Score) market analysis</div>
              <div>⏳ Over 2.5 goals with xG data</div>
              <div>⏳ Asian Handicap market</div>
              <div>⏳ Live odds integration (The Odds API)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  tabs:        { display:'flex', borderBottom:'1px solid var(--border)', marginBottom:'16px', gap:'4px' },
  tab:         { flex:1, padding:'10px 8px', fontSize:'12px', fontWeight:600, letterSpacing:'0.5px', background:'none', cursor:'pointer', transition:'color 0.2s, border-color 0.2s' },
  betHeader:   { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' },
  betTeams:    { fontSize:'14px', fontWeight:700, color:'var(--text)' },
  betDate:     { fontSize:'11px', color:'var(--text3)', fontFamily:'var(--font-mono)', marginTop:'2px' },
  betBadge:    { fontSize:'10px', fontWeight:700, color:'var(--accent)', background:'rgba(0,229,160,0.15)', padding:'3px 8px', borderRadius:'99px', letterSpacing:'1px', whiteSpace:'nowrap' },
  betMarket:   { fontSize:'13px', fontWeight:600, color:'var(--text2)', marginBottom:'12px' },
  probRow:     { display:'flex', gap:'8px', marginBottom:'10px' },
  probBox:     { flex:1, background:'var(--bg3)', borderRadius:'8px', padding:'8px', textAlign:'center' },
  probLabel:   { display:'block', fontSize:'10px', color:'var(--text3)', marginBottom:'4px', letterSpacing:'0.5px' },
  probValue:   { display:'block', fontFamily:'var(--font-display)', fontSize:'22px', color:'var(--text)', lineHeight:1 },
  probArrow:   { display:'flex', alignItems:'center', fontSize:'12px', color:'var(--text3)' },
  oddsRow:     { display:'flex', gap:'8px', marginBottom:'10px' },
  oddsBox:     { flex:1, background:'var(--bg3)', borderRadius:'8px', padding:'8px', textAlign:'center' },
  oddsLabel:   { display:'block', fontSize:'10px', color:'var(--text3)', marginBottom:'4px' },
  oddsValue:   { display:'block', fontFamily:'var(--font-mono)', fontSize:'14px', fontWeight:600, color:'var(--text)' },
  betFooter:   { display:'flex', alignItems:'center', gap:'8px', paddingTop:'8px', borderTop:'1px solid var(--border)' },
  confidenceBar:{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--accent)', letterSpacing:'1px' },
  confidenceLabel:{ fontSize:'10px', color:'var(--text3)' },
  stakeWrap:   { marginBottom:'4px' },
  stakeLabel:  { fontSize:'10px', fontWeight:600, letterSpacing:'2px', color:'var(--text3)', marginBottom:'6px', display:'block' },
  stakeRow:    { display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' },
  stakeInputWrap:{ display:'flex', alignItems:'center', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'10px', padding:'0 12px', height:'44px', minWidth:'100px' },
  stakePound:  { color:'var(--text2)', fontSize:'16px', marginRight:'4px', fontFamily:'var(--font-mono)' },
  stakeInput:  { background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:'16px', fontFamily:'var(--font-mono)', width:'60px' },
  presets:     { display:'flex', gap:'6px', flexWrap:'wrap' },
  presetBtn:   { padding:'6px 10px', borderRadius:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer', transition:'all 0.15s', fontFamily:'var(--font-mono)' },
  gwLabel:     { display:'block', fontSize:'10px', fontWeight:600, letterSpacing:'2px', color:'var(--text3)', marginBottom:'6px' },
  gwInput:     { width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'10px', padding:'12px 14px', color:'var(--text)', fontSize:'16px', fontFamily:'var(--font-mono)', outline:'none' },
  gwBtn:       { background:'var(--accent)', color:'#0a0a0f', fontFamily:'var(--font-display)', fontSize:'18px', letterSpacing:'1px', padding:'12px 20px', borderRadius:'10px', whiteSpace:'nowrap' },
  summaryRow:  { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' },
  summaryStat: { textAlign:'center', padding:'8px' },
  summaryBig:  { display:'block', fontFamily:'var(--font-display)', fontSize:'28px', color:'var(--text)', lineHeight:1, marginBottom:'4px' },
  summaryLabel:{ display:'block', fontSize:'10px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px' },
  overallStats:{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px', marginTop:'8px' },
  overallStat: { background:'var(--bg3)', borderRadius:'8px', padding:'12px', textAlign:'center' },
  overallBig:  { display:'block', fontFamily:'var(--font-display)', fontSize:'24px', color:'var(--text)', lineHeight:1, marginBottom:'4px' },
  overallLabel:{ display:'block', fontSize:'10px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px' },
};

