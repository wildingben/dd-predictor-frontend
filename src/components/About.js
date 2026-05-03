import React, { useState } from 'react';

const Section = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card" style={{ marginBottom: '12px', padding: 0, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={S.sectionHeader}
      >
        <span style={S.sectionTitle}>{title}</span>
        <span style={S.chevron}>{open ? '▲' : '▼'}</span>
      </div>
      {open && <div style={S.sectionBody}>{children}</div>}
    </div>
  );
};

const Stat = ({ label, value, highlight }) => (
  <div className="stat-row">
    <span className="stat-label">{label}</span>
    <span className="stat-value" style={highlight ? { color: 'var(--accent)' } : {}}>{value}</span>
  </div>
);

const Step = ({ number, title, desc }) => (
  <div style={S.step}>
    <div style={S.stepNum}>{number}</div>
    <div style={S.stepContent}>
      <div style={S.stepTitle}>{title}</div>
      <div style={S.stepDesc}>{desc}</div>
    </div>
  </div>
);

const Variable = ({ icon, name, impact, desc }) => (
  <div style={S.variable}>
    <div style={S.variableHeader}>
      <span style={S.variableIcon}>{icon}</span>
      <div>
        <div style={S.variableName}>{name}</div>
        <div style={{
          ...S.variableImpact,
          color: impact === 'High' ? 'var(--win)' : impact === 'Medium' ? 'var(--draw)' : 'var(--text3)'
        }}>● {impact} impact</div>
      </div>
    </div>
    <div style={S.variableDesc}>{desc}</div>
  </div>
);

const VERSIONS = [
  { v: 'v1', acc: '52.2%', note: 'Basic Poisson model. Zero draw predictions.' },
  { v: 'v2', acc: '50.7%', note: 'Dixon-Coles correction added. Home bias got worse.' },
  { v: 'v3', acc: '50.9%', note: 'Probability-first result selection. Still no draws.' },
  { v: 'v4', acc: '53.3%', note: 'Full MLE parameter fitting. Home bias fixed.' },
  { v: 'v5', acc: '53.3%', note: 'Draw threshold added. 5 draws predicted, 2 correct.' },
  { v: 'v6', acc: '53.3%+', note: 'Referee adjustment, league position, derby flag, home/away form split. Current model.' },
];

export default function About() {
  return (
    <div>
      <div className="fade-up">
        <h1 className="page-title">ABOUT</h1>
        <p className="page-sub">How the DD Predictor works — built for the Don Dons</p>
      </div>

      {/* Hero accuracy card */}
      <div className="card fade-up fade-up-1" style={{ marginBottom: '16px', background: 'linear-gradient(135deg, rgba(0,229,160,0.08), rgba(0,119,255,0.05))', borderColor: 'rgba(0,229,160,0.2)' }}>
        <div style={S.heroRow}>
          <div style={S.heroStat}>
            <span style={S.heroBig}>53.3%</span>
            <span style={S.heroLabel}>Result accuracy</span>
          </div>
          <div style={S.heroStat}>
            <span style={S.heroBig}>379</span>
            <span style={S.heroLabel}>Fixtures tested</span>
          </div>
          <div style={S.heroStat}>
            <span style={S.heroBig}>5</span>
            <span style={S.heroLabel}>Seasons of data</span>
          </div>
          <div style={S.heroStat}>
            <span style={S.heroBig}>v6</span>
            <span style={S.heroLabel}>Model version</span>
          </div>
        </div>
        <p style={S.heroNote}>
          Random chance gives 33% across 3 outcomes. Professional betting models reach 55–58%.
          At 53.3% the DD Predictor beats casual prediction significantly and is competitive with entry-level professional models.
        </p>
      </div>

      {/* Data sources */}
      <Section title="📦  Data Sources" defaultOpen={true}>
        <p style={S.para}>
          The model is trained on Premier League match data from two sources:
        </p>
        <Stat label="Historical results" value="Football-Data.co.uk" />
        <Stat label="Live fixtures & results" value="Football-Data.org API" />
        <Stat label="Seasons covered" value="2021-22 → 2025-26" />
        <Stat label="Total training fixtures" value="1,900+" />
        <Stat label="Data points per match" value="Goals, cards, shots, referee" />
        <p style={{ ...S.para, marginTop: '12px' }}>
          The historical CSV data is used to train the model's understanding of each team's strength.
          The API provides live fixture schedules and results for current and upcoming gameweeks.
        </p>
      </Section>

      {/* How a prediction is made */}
      <Section title="⚙️  How a Prediction is Made" defaultOpen={true}>
        <p style={S.para}>Every prediction goes through these steps in order:</p>
        <Step number="1" title="Load team strengths"
          desc="The model calculates an attack strength and defence weakness for every team in the league, fitted mathematically from all historical data." />
        <Step number="2" title="Calculate expected goals"
          desc="Using the Dixon-Coles formula: Expected Home Goals = Home Advantage × Home Attack × Away Defence Weakness. Same formula for away goals." />
        <Step number="3" title="Apply adjustments"
          desc="Form, league position, derby flag and referee tendency are applied as multipliers on top of the base expected goals." />
        <Step number="4" title="Build probability matrix"
          desc="A grid of all possible scorelines (0-0 through 8-8) is calculated. Each cell contains the probability of that exact score occurring." />
        <Step number="5" title="Dixon-Coles correction"
          desc="Low-scoring draws (0-0, 1-0, 0-1, 1-1) are mathematically corrected upward — standard Poisson underestimates these scores." />
        <Step number="6" title="Select predicted result"
          desc="Home win, draw and away win probabilities are summed from the matrix. The highest probability wins, unless draw probability exceeds 27% — in which case draw is called." />
        <Step number="7" title="Output predictions"
          desc="Predicted result, most likely scoreline, top 5 likely scores, expected goals, over/under 2.5, and card predictions are all returned." />
      </Section>

      {/* Variables */}
      <Section title="📊  Variables Used in Predictions">
        <p style={{ ...S.para, marginBottom: '16px' }}>
          Every prediction combines multiple variables. Here's what each one does:
        </p>

        <Variable
          icon="⚔️" name="Attack & Defence Strength" impact="High"
          desc="The core of the model. Each team has an attack strength (how many goals they score relative to average) and a defence weakness (how many they concede). These are fitted using Maximum Likelihood Estimation across all historical data — not just simple averages. Recent seasons are weighted more than older ones via time decay."
        />
        <Variable
          icon="🏠" name="Home Advantage" impact="High"
          desc="Playing at home gives a statistically significant boost. The model fits a single home advantage parameter from all historical data — typically around 1.2x, meaning home teams score roughly 20% more than they would on a neutral ground. This is applied to every home team automatically."
        />
        <Variable
          icon="📈" name="Recent Form (Home/Away Split)" impact="Medium"
          desc="A team's last 6 results are used to calculate a form multiplier (0.90 to 1.10). In v6 this is split — a team's home form only influences their home predictions, and away form only influences away predictions. Recent games are weighted more heavily than older ones using exponential decay."
        />
        <Variable
          icon="🏆" name="League Position Differential" impact="Medium"
          desc="The gap between the two teams' league positions adjusts expected goals by up to 8%. A top-4 team hosting a bottom-4 team gets a meaningful boost. Evenly matched teams get no adjustment. This captures the reality that league position reflects accumulated quality across a season."
        />
        <Variable
          icon="🔥" name="Derby / Rivalry Flag" impact="Medium"
          desc="Identified derbies (North London, Manchester, Merseyside, West London, Tyne-Wear, M23 and others) get a 6% attack boost for both teams — these games are historically more open — and a 25% card boost, reflecting the increased intensity and needle in rivalry fixtures."
        />
        <Variable
          icon="🟨" name="Referee Tendency" impact="Medium"
          desc="Each referee's historical yellow and red card rate is calculated relative to the league average. A card-happy referee inflates card predictions; a lenient one reduces them. Referees with fewer than 5 games in the data are shrunk toward the league average to avoid small sample noise."
        />
        <Variable
          icon="📅" name="Time Decay" impact="Low"
          desc="Older matches count less than recent ones. The model uses exponential decay with a roughly 3-year half-life — so last season counts more than three seasons ago, but nothing is completely ignored. This means the model adapts to changes in team quality over time."
        />
      </Section>

      {/* Accuracy breakdown */}
      <Section title="🎯  Accuracy Breakdown">
        <Stat label="Overall result (H/D/A)" value="53.3%" highlight />
        <Stat label="When predicting Home Win" value="53.9%" />
        <Stat label="When predicting Away Win" value="52.7%" />
        <Stat label="When predicting Draw" value="40.0% (small sample)" />
        <Stat label="Over/Under 2.5 goals" value="57.8%" highlight />
        <Stat label="Exact scoreline" value="~10%" />
        <Stat label="Yellow cards (mean error)" value="±1.75 per game" />
        <Stat label="Derby matches" value="55.6% (18 games)" highlight />
        <p style={{ ...S.para, marginTop: '12px' }}>
          The exact scoreline and over/under predictions are best used as directional guides rather than precise forecasts.
          The result prediction is the most reliable output from the model.
        </p>
      </Section>

      {/* What the model doesn't know */}
      <Section title="⚠️  What the Model Doesn't Know">
        <p style={S.para}>
          No prediction model is perfect. The DD Predictor does not currently account for:
        </p>
        <div style={S.limitItem}><span style={S.limitIcon}>❌</span><span>Team news and injuries — a missing striker or goalkeeper significantly affects outcomes</span></div>
        <div style={S.limitItem}><span style={S.limitIcon}>❌</span><span>Managerial changes — a new manager often produces a short-term bounce or dip</span></div>
        <div style={S.limitItem}><span style={S.limitIcon}>❌</span><span>Mid-week fixture congestion — teams playing Thursday Europa League and Sunday PL perform worse</span></div>
        <div style={S.limitItem}><span style={S.limitIcon}>❌</span><span>Weather — has minimal measurable effect at PL level but not accounted for</span></div>
        <div style={S.limitItem}><span style={S.limitIcon}>❌</span><span>Expected Goals (xG) — shot quality data from Understat could improve the model significantly and is planned for v7</span></div>
        <p style={{ ...S.para, marginTop: '12px' }}>
          These are known limitations. The model tells you what the data says — your job as a Don Don is to layer in the context it can't see.
        </p>
      </Section>

      {/* Version history */}
      <Section title="🔧  Version History">
        {VERSIONS.map((v, i) => (
          <div key={v.v} style={{
            ...S.verRow,
            borderLeft: v.v === 'v6' ? '3px solid var(--accent)' : '3px solid var(--border)',
            background: v.v === 'v6' ? 'rgba(0,229,160,0.04)' : 'transparent',
          }}>
            <div style={S.verTop}>
              <span style={S.verName}>{v.v}</span>
              <span style={{ ...S.verAcc, color: v.v === 'v6' ? 'var(--accent)' : 'var(--text2)' }}>{v.acc}</span>
            </div>
            <p style={S.verNote}>{v.note}</p>
          </div>
        ))}
      </Section>

      {/* The Don Don origin */}
      <div className="card" style={{ marginBottom: '20px', borderColor: 'rgba(0,119,255,0.2)', background: 'rgba(0,119,255,0.04)' }}>
        <div style={{ fontSize: '20px', marginBottom: '8px' }}>👑</div>
        <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text)' }}>The DD Predictor</strong> was built by Ben and Luke — the Don Dons.
          What started as a conversation about whether a statistical model could beat casual football prediction
          turned into a full Dixon-Coles Maximum Likelihood model, a backtesting framework,
          a REST API, and this website — all built in a single session.
          The model will keep improving. The Don Dons will keep predicting.
        </p>
      </div>
    </div>
  );
}

const S = {
  para:         { fontSize: '13px', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '8px' },
  heroRow:      { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '12px' },
  heroStat:     { textAlign: 'center' },
  heroBig:      { display: 'block', fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--accent)', lineHeight: 1 },
  heroLabel:    { display: 'block', fontSize: '10px', color: 'var(--text3)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  heroNote:     { fontSize: '12px', color: 'var(--text3)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' },
  sectionHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', cursor: 'pointer' },
  sectionTitle: { fontSize: '14px', fontWeight: 600, color: 'var(--text)' },
  chevron:      { fontSize: '10px', color: 'var(--text3)' },
  sectionBody:  { padding: '0 16px 16px' },
  step:         { display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'flex-start' },
  stepNum:      { width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, marginTop: '1px' },
  stepContent:  { flex: 1 },
  stepTitle:    { fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' },
  stepDesc:     { fontSize: '12px', color: 'var(--text2)', lineHeight: 1.6 },
  variable:     { background: 'var(--bg3)', borderRadius: '10px', padding: '12px', marginBottom: '10px' },
  variableHeader:{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' },
  variableIcon: { fontSize: '20px', lineHeight: 1, flexShrink: 0 },
  variableName: { fontSize: '13px', fontWeight: 600, color: 'var(--text)' },
  variableImpact:{ fontSize: '11px', marginTop: '2px', fontWeight: 500 },
  variableDesc: { fontSize: '12px', color: 'var(--text2)', lineHeight: 1.6 },
  limitItem:    { display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px', fontSize: '12px', color: 'var(--text2)', lineHeight: 1.5 },
  limitIcon:    { flexShrink: 0, marginTop: '1px' },
  verRow:       { padding: '10px 12px', borderRadius: '8px', marginBottom: '8px' },
  verTop:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  verName:      { fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)', fontSize: '14px' },
  verAcc:       { fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600 },
  verNote:      { fontSize: '12px', color: 'var(--text2)', margin: 0 },
};
