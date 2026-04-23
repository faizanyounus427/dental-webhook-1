const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

app.post('/webhook/:clinicName', async (req, res) => {
  try {
    const { event, call } = req.body;
    const clinicName = req.params.clinicName;

    if (event === 'call_analyzed') {
      const d = call?.call_analysis?.custom_analysis_data || {};

      const message = `
New Appointment Request - ${clinicName}

Patient Name  : ${d['Patient Name'] || 'Not provided'}
Phone Number  : ${d['Phone Number'] || 'Not provided'}
Reason        : ${d['Reason For Visit'] || 'Not provided'}
Date          : ${d['Appointment Date'] || 'Not provided'}
Time          : ${d['Appointment Time'] || 'Not provided'}

Please confirm availability and contact the patient.
      `.trim();

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.CLINIC_EMAIL,
        subject: `New Appointment - ${clinicName}`,
        text: message
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
