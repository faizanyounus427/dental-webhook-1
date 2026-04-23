const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook/:clinicName', async (req, res) => {
  try {
    const { event, call } = req.body;
    const clinicName = req.params.clinicName;

    if (event === 'call_analyzed') {
      const d = call?.call_analysis?.custom_analysis_data || {};

      const message = `
<h2>New Appointment Request - ${clinicName}</h2>
<table style="font-family:Arial;font-size:15px;border-collapse:collapse">
  <tr><td style="padding:8px;font-weight:bold;background:#f0f4f8">Patient Name</td><td style="padding:8px">${d['Patient Name'] || 'Not provided'}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f0f4f8">Phone Number</td><td style="padding:8px">${d['Phone Number'] || 'Not provided'}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f0f4f8">Reason for Visit</td><td style="padding:8px">${d['Reason For Visit'] || 'Not provided'}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f0f4f8">Preferred Date</td><td style="padding:8px">${d['Appointment Date'] || 'Not provided'}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f0f4f8">Preferred Time</td><td style="padding:8px">${d['Appointment Time'] || 'Not provided'}</td></tr>
</table>
<p style="color:#666;font-size:13px">Please confirm availability and contact the patient.</p>
      `.trim();

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'AI Receptionist <onboarding@resend.dev>',
          to: process.env.CLINIC_EMAIL,
          subject: `New Appointment Request - ${clinicName}`,
          html: message
        })
      });

      console.log(`Email sent for ${clinicName}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.sendStatus(500);
  }
});

app.get('/', (req, res) => res.send('Dental AI Webhook is running!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
