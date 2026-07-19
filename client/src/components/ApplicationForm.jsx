import { useState } from 'react';
import { US_STATES } from '../lib/usStates.js';
import { validateField, validateAll } from '../lib/validation.js';

const INITIAL_VALUES = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dob: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  ssn: '',
};

function Field({ label, name, error, hint, optional, children }) {
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={name}>
        {label}
        {optional && <span className="optional"> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p className="field-note field-note--error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field-note">{hint}</p>
      ) : null}
    </div>
  );
}

export default function ApplicationForm({ onResult }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function setValue(name, raw) {
    // Keep the SSN digits-only as the user types (Alloy wants 9 digits, no dashes).
    const value = name === 'ssn' ? raw.replace(/\D/g, '').slice(0, 9) : raw;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  }

  function handleBlur(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, values[name]) }));
  }

  const inputProps = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: (e) => setValue(name, e.target.value),
    onBlur: () => handleBlur(name),
    'aria-invalid': Boolean(errors[name]),
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    const allErrors = validateAll(values);
    setErrors(allErrors);
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])));
    if (Object.keys(allErrors).length > 0) {
      const firstInvalid = document.querySelector(
        '.field--error input, .field--error select'
      );
      firstInvalid?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 400 && body?.errors) {
          // The server re-validates; show its field errors inline.
          setErrors(body.errors);
        } else {
          setSubmitError(
            body?.error ??
              'Something went wrong on our end. Please try again in a moment.'
          );
        }
        return;
      }

      onResult({ ...body, firstName: values.firstName });
    } catch {
      setSubmitError(
        'We couldn’t reach the server. Check your connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h1>Open your account</h1>
      <p className="form-intro">
        It takes about two minutes. We’ll verify your identity instantly. No
        branch visits, no paperwork, no otter nonsense.
      </p>

      <fieldset>
        <legend>About you</legend>
        <div className="grid grid--2">
          <Field label="First name" name="firstName" error={errors.firstName}>
            <input type="text" autoComplete="given-name" {...inputProps('firstName')} />
          </Field>
          <Field label="Last name" name="lastName" error={errors.lastName}>
            <input type="text" autoComplete="family-name" {...inputProps('lastName')} />
          </Field>
        </div>
        <div className="grid grid--2">
          <Field label="Email address" name="email" error={errors.email}>
            <input type="email" autoComplete="email" placeholder="you@example.com" {...inputProps('email')} />
          </Field>
          <Field label="Phone number" name="phone" error={errors.phone}>
            <input type="tel" autoComplete="tel" placeholder="555-555-0100" {...inputProps('phone')} />
          </Field>
        </div>
        <div className="grid grid--2">
          <Field
            label="Date of birth"
            name="dob"
            error={errors.dob}
            hint="You must be 18 or older."
          >
            <input type="date" autoComplete="bday" max={new Date().toISOString().slice(0, 10)} {...inputProps('dob')} />
          </Field>
          <Field
            label="Social Security number"
            name="ssn"
            error={errors.ssn}
            hint="9 digits, no dashes. Sent securely and never stored."
          >
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="123456789"
              maxLength={9}
              {...inputProps('ssn')}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset>
        <legend>Home address</legend>
        <Field label="Address line 1" name="addressLine1" error={errors.addressLine1}>
          <input type="text" autoComplete="address-line1" placeholder="123 River St" {...inputProps('addressLine1')} />
        </Field>
        <Field label="Address line 2" name="addressLine2" error={errors.addressLine2} optional>
          <input type="text" autoComplete="address-line2" placeholder="Apt, suite, unit…" {...inputProps('addressLine2')} />
        </Field>
        <div className="grid grid--3">
          <Field label="City" name="city" error={errors.city}>
            <input type="text" autoComplete="address-level2" {...inputProps('city')} />
          </Field>
          <Field label="State" name="state" error={errors.state}>
            <select {...inputProps('state')}>
              <option value="">Select…</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} ({s.name})
                </option>
              ))}
            </select>
          </Field>
          <Field label="ZIP code" name="zip" error={errors.zip}>
            <input type="text" inputMode="numeric" autoComplete="postal-code" placeholder="10001" {...inputProps('zip')} />
          </Field>
        </div>
        <Field
          label="Country"
          name="country"
          error={errors.country}
          hint="Otter Bank is currently available in the US only."
        >
          <select {...inputProps('country')}>
            <option value="US">United States (US)</option>
          </select>
        </Field>
      </fieldset>

      {submitError && (
        <div className="submit-error" role="alert">
          <strong>We hit a snag.</strong> {submitError}
        </div>
      )}

      <button type="submit" className="button button--primary" disabled={submitting}>
        {submitting ? 'Checking your details…' : 'Open my account'}
      </button>
    </form>
  );
}
