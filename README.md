# Dental AI Webhook Server

Backend webhook server + live dashboard for the AI Dental Receptionist
built with **Retell AI** (voice) and **Resend** (email notifications).

The Express server does three things:

1. Receives `call_analyzed` webhooks from Retell AI at
   `POST /webhook/:clinicName` and extracts the appointment details from
   `call_analysis.custom_analysis_data`.
2. Stores each appointment in memory (per clinic) so the dashboard can
   display them.
3. Sends an email to the clinic's staff inbox via the Resend API.

It also serves a Tailwind-based dashboard at `/` (from `public/index.html`)
that polls the server every 5 seconds and renders patients, stats,
sentiment, and status.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | Yes (for email) | API key from <https://resend.com>. If unset, the webhook still stores appointments but skips email. |
| `CLINIC_EMAIL`   | Yes (for email) | Inbox that receives appointment notifications. |
| `PORT`           | No | Local port. Defaults to `3000`. Ignored on Vercel. |

Create a local `.env` (this file is git-ignored) and load it however you
prefer (e.g. `node --env-file=.env index.js` on Node 20+, or `dotenv`).

Example `.env`:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
[email protected]
```

---

## Run Locally

```bash
npm install
node --env-file=.env index.js
# or simply:  npm start
```

Then open:

- Dashboard:        <http://localhost:3000/>
- Health / root:    <http://localhost:3000/>  (same — serves the dashboard)
- Retell webhook:   `POST http://localhost:3000/webhook/SmileCare-Dental-Clinic`

### Seed a fake appointment (for testing the dashboard)

```bash
curl -X POST http://localhost:3000/api/test/seed/SmileCare-Dental-Clinic \
  -H "Content-Type: application/json" \
  -d '{"patientName":"Jane Doe","phoneNumber":"+15550123","reasonForVisit":"Toothache"}'
```

Refresh the dashboard; the row should appear.

### Simulate a real Retell webhook

```bash
curl -X POST http://localhost:3000/webhook/SmileCare-Dental-Clinic \
  -H "Content-Type: application/json" \
  -d '{
    "event":"call_analyzed",
    "call":{
      "call_id":"call_test_001",
      "call_analysis":{
        "user_sentiment":"Positive",
        "call_successful":true,
        "custom_analysis_data":{
          "Patient Name":"John Smith",
          "Phone Number":"+1 555-0188",
          "Reason For Visit":"Cleaning",
          "Appointment Date":"2026-06-10",
          "Appointment Time":"3:00 PM"
        }
      }
    }
  }'
```

---

## API Reference

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/` | Serves the dashboard (`public/index.html`). |
| `POST` | `/webhook/:clinicName` | Retell AI webhook receiver. |
| `GET`  | `/webhook/:clinicName` | Returns 200 (for Retell URL verification). |
| `GET`  | `/api/appointments/clinic/:clinicName` | Returns the list of appointments for a clinic (newest first). |
| `GET`  | `/api/appointments/stats/:clinicName` | Returns counts: `totalAppointments`, `completedCalls`, `scheduled`, `cancelled`. |
| `POST` | `/api/test/seed/:clinicName` | Inserts a fake appointment for UI testing. |

---

## Deploy to Vercel

This repo already includes `vercel.json` which routes every request
through `index.js` (Express handles routing internally).

```bash
# one-time
npm i -g vercel
vercel login

# from this folder
vercel            # preview deploy
vercel --prod     # production deploy
```

Then in the Vercel dashboard → your project → **Settings → Environment
Variables**, add:

- `RESEND_API_KEY`
- `CLINIC_EMAIL`

Redeploy after adding env vars.

### ⚠️ Important: Vercel is serverless

The in-memory appointment store **does not persist** across function
invocations on Vercel. It's fine for demos and short tests, but for
production you should swap it for a real datastore:

- **Vercel KV / Upstash Redis** — easiest drop-in (`@vercel/kv`)
- **Vercel Postgres / Supabase / Neon** — for relational queries
- **MongoDB Atlas** — document-style storage

The code is intentionally structured so only `pushAppointment` and
`getAppointments` need to change to migrate to a real database.

---

## Configure Retell AI

In your Retell agent settings, set the post-call webhook URL to:

```
https://<your-vercel-domain>/webhook/<Clinic-Name>
```

Make sure your Retell post-call analysis fields include exactly:

- `Patient Name`
- `Phone Number`
- `Reason For Visit`
- `Appointment Date`
- `Appointment Time`
