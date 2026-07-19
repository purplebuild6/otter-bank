const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validators = {
  firstName: (v) => (v.trim() ? null : 'First name is required.'),
  lastName: (v) => (v.trim() ? null : 'Last name is required.'),
  addressLine1: (v) => (v.trim() ? null : 'Address line 1 is required.'),
  addressLine2: () => null, // optional
  city: (v) => (v.trim() ? null : 'City is required.'),
  state: (v) => (/^[A-Z]{2}$/.test(v) ? null : 'Select your state.'),
  zip: (v) =>
    /^\d{5}(-\d{4})?$/.test(v.trim())
      ? null
      : 'Enter a valid ZIP code (e.g. 10001).',
  country: (v) =>
    v === 'US' ? null : 'Only US applications are accepted right now.',
  ssn: (v) =>
    /^\d{9}$/.test(v) ? null : 'SSN must be exactly 9 digits, no dashes.',
  email: (v) =>
    EMAIL_RE.test(v.trim()) ? null : 'Enter a valid email address.',
  phone: (v) =>
    /^\+?[\d\s().-]{10,20}$/.test(v.trim())
      ? null
      : 'Enter a valid phone number (at least 10 digits).',
  dob: (v) => validateDob(v),
};

function validateDob(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return 'Date of birth must be in YYYY-MM-DD format.';
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return 'Enter a real calendar date.';
  }
  const now = new Date();
  if (date.getTime() >= now.getTime()) {
    return 'Date of birth must be in the past.';
  }
  const eighteen = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  if (date > eighteen) {
    return 'You must be at least 18 years old to open an account.';
  }
  return null;
}

export function validateField(name, value) {
  const fn = validators[name];
  return fn ? fn(value ?? '') : null;
}

export function validateAll(values) {
  const errors = {};
  for (const name of Object.keys(validators)) {
    const error = validateField(name, values[name]);
    if (error) errors[name] = error;
  }
  return errors;
}
