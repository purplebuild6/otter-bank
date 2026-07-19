import { useState } from 'react';
import ApplicationForm from './components/ApplicationForm.jsx';
import OutcomeScreen from './components/OutcomeScreen.jsx';
import OtterSprite, { OTTER } from './components/OtterSprite.jsx';

export default function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <OtterSprite frames={OTTER.idle} fps={4} size={84} />
            </span>
            <span className="brand-name">Otter Bank</span>
          </div>
          <p className="tagline">Banking, otterly simplified.</p>
        </div>
        <svg
          className="wave"
          viewBox="0 0 1440 70"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="wave-back"
            d="M0,45 C240,75 480,5 720,30 C960,55 1200,65 1440,35 L1440,70 L0,70 Z"
          />
          <path
            className="wave-front"
            d="M0,55 C260,80 520,20 780,42 C1040,64 1260,68 1440,48 L1440,70 L0,70 Z"
          />
        </svg>
      </header>

      <main className="content">
        {result ? (
          <OutcomeScreen result={result} onReset={() => setResult(null)} />
        ) : (
          <ApplicationForm onResult={setResult} />
        )}
      </main>

      <footer className="footer">
        Demo app with identity decisioning by Alloy (sandbox). No real data is
        processed or stored.
      </footer>
    </div>
  );
}
