# Dental AI Webhook Server

Backend webhook server for the AI Dental Receptionist built with Retell AI + Twilio.

## Environment Variables Required

| Variable | Description |
|---|---|
| GMAIL_USER | Your Gmail address |
| GMAIL_PASS | Your Gmail App Password (16 digits) |
| CLINIC_EMAIL | The clinic staff email to receive notifications |

## Webhook URL Format
POST /webhook/:clinicName
