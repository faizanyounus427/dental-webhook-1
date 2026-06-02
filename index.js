const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static dashboard files from /public
app.use(express.static(path.join(__dirname, 'public')));

/**
 * In-memory storage for appointments, grouped by clinic name.
 * NOTE: On Vercel (serverless), this state lives only inside a single warm
 * function instance and will be lost when the instance is recycled. For real
 * persistence use Vercel KV, Upstash Redis, Postgres, MongoDB, etc.
 *
 * Shape:
 *   appointmentsByClinic = {
 *     'SmileCare-Dental-Clinic': [ { id, patientName, phoneNumber, ... }, ... ]
 *   }
 */
const appointmentsByClinic = {};

function pushAppointment(clinicName, appointment) {
  if (!appointmentsByClinic[clinicName]) {
    appointmentsByClinic[clinicName] = [];
  }
  appointmentsByClinic[clinicName].unshift(appointment); // newest first
  // keep the list bounded to avoid unbounded memory growth
  if (appointmentsByClinic[clinicName].length > 500) {
    appointmentsByClinic[clinicName].length = 500;
  }
}

function getAppointments(clinicName) {
  return appointmentsByClinic[clinicName] || [];
}

// ---------------------------------------------------------------------------
// Webhook endpoint (Retell AI)
// ---------------------------------------------------------------------------
app.all('/webhook/:clinicName', async (req, res) => {
  try {
    if (req.method === 'GET') {
      return res.sendStatus(200);
    }

    const event = req.body.event;
    const call = req.body.call || {};
    const clinicName = req.params.clinicName;

    console.log('Webhook received:', req.method, event, 'for', clinicName);

    if (event === 'call_analyzed') {
      const analysis = call.call_analysis || {};
      const d = analysis.custom_analysis_data || {};

      const patientName   = d['Patient Name']      || 'Not provided';
      const phoneNumber   = d['Phone Number']      || 'Not provided';
      const reason        = d['Reason For Visit']  || 'Not provided';
      const date          = d['Appointment Date']  || 'Not provided';
      const time          = d['Appointment Time']  || 'Not provided';
      const sentiment     = (analysis.user_sentiment || 'neutral').toLowerCase();
      const successful    = analysis.call_successful !== false; // default true

      const appointment = {
        id: call.call_id || ('apt_' + Date.now()),
        clinicName,
        patientName,
        phoneNumber,
        reasonForVisit: reason,
        appointmentDate: date,
        appointmentTime: time,
        sentiment,
        status: successful ? 'scheduled' : 'cancelled',
        createdAt: new Date().toISOString(),
      };

      pushAppointment(clinicName, appointment);
      console.log('Stored appointment:', appointment.id, patientName);

      // Send email via Resend (only if configured)
      if (process.env.RESEND_API_KEY && process.env.CLINIC_EMAIL) {
        try {
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'AI Receptionist <onboarding@resend.dev>',
              to: process.env.CLINIC_EMAIL,
              subject: 'New Appointment Request - ' + clinicName,
              html:
                '<h2>New Appointment - ' + clinicName + '</h2>' +
                '<p><b>Patient Name:</b> ' + patientName + '</p>' +
                '<p><b>Phone Number:</b> ' + phoneNumber + '</p>' +
                '<p><b>Reason for Visit:</b> ' + reason + '</p>' +
                '<p><b>Preferred Date:</b> ' + date + '</p>' +
                '<p><b>Preferred Time:</b> ' + time + '</p>'
            })
          });

          const result = await emailRes.json();
          console.log('Resend response:', JSON.stringify(result));
        } catch (mailErr) {
          console.error('Email send failed:', mailErr.message);
        }
      } else {
        console.log('Skipping email: RESEND_API_KEY or CLINIC_EMAIL not set.');
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.sendStatus(500);
  }
});

// ---------------------------------------------------------------------------
// Dashboard API endpoints (consumed by public/index.html)
// ---------------------------------------------------------------------------
app.get('/api/appointments/clinic/:clinicName', (req, res) => {
  const list = getAppointments(req.params.clinicName);
  res.json(list);
});

app.get('/api/appointments/stats/:clinicName', (req, res) => {
  const list = getAppointments(req.params.clinicName);
  const stats = {
    totalAppointments: list.length,
    completedCalls: list.filter(a => a.status === 'completed' || a.status === 'scheduled').length,
    scheduled: list.filter(a => a.status === 'scheduled').length,
    cancelled: list.filter(a => a.status === 'cancelled').length,
  };
  res.json(stats);
});

// Test helper: lets you manually inject a fake appointment from a browser
// or curl, useful when verifying that the dashboard is wired up correctly.
//   curl -X POST http://localhost:3000/api/test/seed/SmileCare-Dental-Clinic
app.post('/api/test/seed/:clinicName', (req, res) => {
  const clinicName = req.params.clinicName;
  const appointment = {
    id: 'test_' + Date.now(),
    clinicName,
    patientName: req.body.patientName || 'Test Patient',
    phoneNumber: req.body.phoneNumber || '+1 555-0100',
    reasonForVisit: req.body.reasonForVisit || 'Routine cleaning',
    appointmentDate: req.body.appointmentDate || new Date().toISOString(),
    appointmentTime: req.body.appointmentTime || '10:00 AM',
    sentiment: req.body.sentiment || 'positive',
    status: req.body.status || 'scheduled',
    createdAt: new Date().toISOString(),
  };
  pushAppointment(clinicName, appointment);
  res.json({ ok: true, appointment });
});

// Health / root: serve the dashboard if it exists, otherwise plain text.
app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) res.send('Dental AI Webhook is running!');
  });
});

// Only listen when run directly (not when imported by Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log('Server running on port ' + PORT));
}

module.exports = app;
