const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('/webhook/:clinicName', async (req, res) => {
  try {
    if (req.method === 'GET') {
      return res.sendStatus(200);
    }

    const event = req.body.event;
    const call = req.body.call;
    const clinicName = req.params.clinicName;

    console.log('Webhook received:', req.method, event);

    if (event === 'call_analyzed') {
      const d = (call && call.call_analysis && call.call_analysis.custom_analysis_data) || {};

      const name = d['Patient Name'] || 'Not provided';
      const phone = d['Phone Number'] || 'Not provided';
      const reason = d['Reason For Visit'] || 'Not provided';
      const date = d['Appointment Date'] || 'Not provided';
      const time = d['Appointment Time'] || 'Not provided';

      console.log('Booking:', name, phone, reason, date, time);

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
          html: '<h2>New Appointment - ' + clinicName + '</h2>' +
            '<p><b>Patient Name:</b> ' + name + '</p>' +
            '<p><b>Phone Number:</b> ' + phone + '</p>' +
            '<p><b>Reason for Visit:</b> ' + reason + '</p>' +
            '<p><b>Preferred Date:</b> ' + date + '</p>' +
            '<p><b>Preferred Time:</b> ' + time + '</p>'
        })
      });

      const result = await emailRes.json();
      console.log('Resend response:', JSON.stringify(result));
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.sendStatus(500);
  }
});

app.get('/', (req, res) => res.send('Dental AI Webhook is running!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
