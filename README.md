# 🦦 Otter Bank: Alloy Sandbox Integration

A demo bank-account application flow integrated with [Alloy](https://alloy.co)'s
identity decisioning API. An applicant fills out a form, the backend submits
their details to Alloy's sandbox `POST /v1/evaluations/` endpoint, and the app
displays an outcome screen based on Alloy's decision: **Approved**,
**Manual Review**, or **Denied**.

## Architecture

```
Browser (React + Vite)          Express API              Alloy Sandbox
┌─────────────────────┐   ┌──────────────────────┐   ┌──────────────────┐
│ Application form    │──▶│ POST /api/applications│──▶│ POST /v1/        │
│ + inline validation │   │ re-validate, map to  │   │   evaluations/   │
│ Outcome screens     │◀──│ Alloy field names,   │◀──│ (Basic auth)     │
└─────────────────────┘   │ Basic auth from .env │   └──────────────────┘
                          └──────────────────────┘
```

Key design decision: **the browser never talks to Alloy directly.** All Alloy
traffic goes through the Express backend, so the workflow token and secret
stay server-side and are never exposed to the client.

## Quick start

Requires Node.js ≥ 18.11.

```bash
npm install                              # installs both workspaces
cp server/.env.example server/.env       # then add your Alloy credentials
npm run dev                              # starts API (:3001) + frontend (:5173)
```

Open http://localhost:5173.

**No credentials?** The app still works: the server detects missing
credentials and runs in **mock mode**, simulating Alloy's sandbox responses
(including the personas below) and labeling every result as simulated.

## Environment variables (`server/.env`)

| Variable | Description |
|---|---|
| `ALLOY_WORKFLOW_TOKEN` | Workflow token (Basic auth username) |
| `ALLOY_WORKFLOW_SECRET` | Workflow secret (Basic auth password) |
| `ALLOY_BASE_URL` | Defaults to `https://sandbox.alloy.co` |
| `PORT` | API port, defaults to `3001` |

The real `.env` is gitignored; only `.env.example` with placeholders is
committed.

## Testing the three outcomes (sandbox personas)

Alloy's sandbox coerces outcomes based on the applicant's last name:

| Last name | Outcome | Screen shown |
|---|---|---|
| anything else | `Approved` | 🎉 Welcome aboard! |
| `Review` | `Manual Review` | 🔎 We're taking a closer look |
| `Deny` | `Denied` | 🚫 Application not successful |

Try `Jessica Rabbit`, `Jessica Review`, and `Jessica Deny`.

## Validation

Validation runs twice: inline in the form for instant feedback, and again on
the server (the API never trusts the client):

- **State**: two-letter US state code (dropdown)
- **Country**: `US` only
- **SSN**: exactly 9 digits, no dashes (input strips non-digits as you type)
- **Date of birth**: ISO-8601 `YYYY-MM-DD`, in the past, 18+
- **ZIP**: 5 digits (optional +4)
- **Email / phone**: format checks; phone is required by the Alloy workflow
  (discovered via `GET /v1/parameters/`) even though it's easy to overlook

## Error handling

- Client-side: inline field errors on blur and on submit; focus jumps to the
  first invalid field.
- Server-side: returns `400` with per-field errors, `422` when Alloy rejects
  the payload (Alloy's informative error message is surfaced), and `502` for
  network/upstream failures. Each is rendered as a friendly message in the UI.
- Unrecognized outcomes get a safe fallback screen rather than a crash.

## Security notes

- Credentials live in `server/.env` (gitignored); `.env.example` documents the
  shape without the secrets.
- The SSN and other PII are never logged; the server logs only the outcome
  and Alloy's evaluation token.
- Alloy credentials never reach the browser; the frontend only calls the
  local API.

## Project structure

```
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # ApplicationForm, OutcomeScreen
│       └── lib/             # validation rules, US states list
├── server/                  # Express backend
│   └── src/
│       ├── index.js         # routes
│       ├── alloy.js         # Alloy API client + mock mode
│       └── validate.js      # server-side validation + payload mapping
└── package.json             # npm workspaces + dev script
```
