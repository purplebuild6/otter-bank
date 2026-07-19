const BASE_URL = process.env.ALLOY_BASE_URL || 'https://sandbox.alloy.co';

/**
 * Mock mode lets the whole app run end-to-end before credentials arrive
 * (or for anyone cloning the repo without Alloy access).
 */
export function isMockMode() {
  const token = process.env.ALLOY_WORKFLOW_TOKEN;
  const secret = process.env.ALLOY_WORKFLOW_SECRET;
  return !(token && secret && !token.startsWith('your_'));
}

/**
 * Submit an application payload to Alloy's evaluations endpoint.
 * Returns a slim result: { outcome, evaluationToken, mock }.
 */
export async function submitEvaluation(payload) {
  if (isMockMode()) {
    return mockEvaluation(payload);
  }

  const auth = Buffer.from(
    `${process.env.ALLOY_WORKFLOW_TOKEN}:${process.env.ALLOY_WORKFLOW_SECRET}`
  ).toString('base64');

  const res = await fetch(`${BASE_URL}/v1/evaluations/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    // Alloy's error responses are informative, so surface them to the caller.
    const detail = body?.error ?? body?.message ?? `HTTP ${res.status}`;
    const err = new Error(`Alloy evaluation failed: ${detail}`);
    err.status = res.status;
    throw err;
  }

  return {
    outcome: body?.summary?.outcome ?? 'Unknown',
    evaluationToken: body?.evaluation_token ?? null,
    mock: false,
  };
}

/**
 * Mirrors Alloy's sandbox personas: last name "Review" -> Manual Review,
 * "Deny" -> Denied, anything else -> Approved.
 */
function mockEvaluation(payload) {
  const last = (payload.name_last ?? '').trim().toLowerCase();
  const outcome =
    last === 'review' ? 'Manual Review' : last === 'deny' ? 'Denied' : 'Approved';
  return {
    outcome,
    evaluationToken: `mock-${Date.now().toString(36)}`,
    mock: true,
  };
}
