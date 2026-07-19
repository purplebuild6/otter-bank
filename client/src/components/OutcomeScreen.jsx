import OtterSprite, { OTTER } from './OtterSprite.jsx';

const SCREENS = {
  approved: {
    tone: 'success',
    icon: '🎉',
    otter: { frames: OTTER.jump, fps: 8 },
    title: (name) => `Welcome aboard${name ? `, ${name}` : ''}!`,
    message:
      'Success! Your Otter Bank account is open and ready to make a splash. ' +
      'Check your email for next steps. Your debit card is already on its way.',
    cta: 'Open another account',
  },
  review: {
    tone: 'info',
    icon: '🔎',
    otter: { frames: OTTER.run, fps: 7 },
    title: () => 'Thanks for applying! We’re taking a closer look.',
    message:
      'Your application has been received and is being reviewed by our team. ' +
      'We’ll be in touch shortly. No action is needed from you right now.',
    cta: 'Submit another application',
  },
  denied: {
    tone: 'error',
    icon: '🚫',
    otter: { frames: OTTER.sleep, fps: 3 },
    title: () => 'We couldn’t open your account.',
    message:
      'Sorry, your application was not successful this time. ' +
      'You’ll receive an email with more details about this decision.',
    cta: 'Back to the application',
  },
  unknown: {
    tone: 'info',
    icon: '📄',
    otter: { frames: OTTER.spin, fps: 5 },
    title: () => 'Application received.',
    message:
      'Your application was submitted, but we received an outcome we didn’t ' +
      'recognize. Our team will follow up with you.',
    cta: 'Back to the application',
  },
};

function normalizeOutcome(outcome = '') {
  const value = outcome.toLowerCase();
  if (value.includes('approve')) return 'approved';
  if (value.includes('review')) return 'review';
  if (value.includes('den')) return 'denied';
  return 'unknown';
}

export default function OutcomeScreen({ result, onReset }) {
  const screen = SCREENS[normalizeOutcome(result.outcome)];

  return (
    <div className={`card outcome outcome--${screen.tone}`}>
      <div className="outcome-icon" aria-hidden="true">
        {screen.otter ? (
          <span className="outcome-duo">
            <OtterSprite frames={screen.otter.frames} fps={screen.otter.fps} size={128} />
            <span className="outcome-emoji">{screen.icon}</span>
          </span>
        ) : (
          screen.icon
        )}
      </div>
      <h1 className="outcome-title">{screen.title(result.firstName)}</h1>
      <p className="outcome-message">{screen.message}</p>

      {result.evaluationToken && (
        <p className="outcome-reference">
          Reference: <code>{result.evaluationToken}</code>
        </p>
      )}

      {result.mock && (
        <p className="mock-badge">
          Simulated response: the server is running in mock mode without Alloy
          credentials.
        </p>
      )}

      <button type="button" className="button" onClick={onReset}>
        {screen.cta}
      </button>
    </div>
  );
}
