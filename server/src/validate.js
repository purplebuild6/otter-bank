const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO',
  'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA',
  'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Server-side validation is the backstop: the frontend validates too, but the
 * API must never trust the client. Returns either { errors } keyed by field
 * name, or { payload } shaped exactly as Alloy's /v1/parameters/ expects.
 */
export function validateApplication(body) {
  const get = (key) => String(body[key] ?? '').trim();

  const values = {
    firstName: get('firstName'),
    lastName: get('lastName'),
    addressLine1: get('addressLine1'),
    addressLine2: get('addressLine2'),
    city: get('city'),
    state: get('state').toUpperCase(),
    zip: get('zip'),
    country: get('country').toUpperCase(),
    ssn: get('ssn'),
    email: get('email'),
    phone: get('phone'),
    dob: get('dob'),
  };

  const errors = {};
  if (!values.firstName) errors.firstName = 'First name is required.';
  if (!values.lastName) errors.lastName = 'Last name is required.';
  if (!values.addressLine1) errors.addressLine1 = 'Address line 1 is required.';
  if (!values.city) errors.city = 'City is required.';
  if (!US_STATES.has(values.state)) {
    errors.state = 'State must be a two-letter US state code (e.g. NY).';
  }
  if (!/^\d{5}(-\d{4})?$/.test(values.zip)) {
    errors.zip = 'Enter a valid ZIP code (e.g. 10001 or 10001-1234).';
  }
  if (values.country !== 'US') {
    errors.country = 'Country must be US for this application.';
  }
  if (!/^\d{9}$/.test(values.ssn)) {
    errors.ssn = 'SSN must be exactly 9 digits with no dashes.';
  }
  if (!EMAIL_RE.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!/^\+?[\d\s().-]{10,20}$/.test(values.phone)) {
    errors.phone = 'Enter a valid phone number (at least 10 digits).';
  }
  if (!isIsoDateInPast(values.dob)) {
    errors.dob = 'Date of birth must be a past date in YYYY-MM-DD format.';
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    payload: {
      name_first: values.firstName,
      name_last: values.lastName,
      address_line_1: values.addressLine1,
      ...(values.addressLine2 ? { address_line_2: values.addressLine2 } : {}),
      address_city: values.city,
      address_state: values.state,
      address_postal_code: values.zip,
      address_country_code: values.country,
      document_ssn: values.ssn,
      email_address: values.email,
      phone_number: values.phone,
      birth_date: values.dob,
    },
  };
}

function isIsoDateInPast(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  // Round-trip check catches impossible dates like 2000-02-31.
  if (date.toISOString().slice(0, 10) !== value) return false;
  return date.getTime() < Date.now();
}
