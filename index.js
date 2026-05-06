require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectMongoDB } = require('./config/database');
const Appointment = require('./models/Appointment');
const Clinic = require('./models/Clinic');
const appointmentRoutes = require('./routes/appointments');
const clinicRoutes = require('./routes/clinics');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
connectMongoDB();

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinics', clinicRoutes);

// Webhook endpoint for Retell AI
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
      const transcription = call.transcription || '';
      const sentiment = analyzeSentiment(transcription);
      const duration = call.end_timestamp && call.start_timestamp 
        ? Math.round((call.end_timestamp - call.start_timestamp) / 60)
        : 0;

      console.log('Booking:', name, phone, reason, date, time);

      // Save to database
      const appointment = new Appointment({
        callId: call.call_id,
        clinicName,
        patientName: name,
        phoneNumber: phone,
        reasonForVisit: reason,
        appointmentDate: date,
        appointmentTime: time,
        status: 'scheduled',
        callDuration: duration,
        callRecording: call.recording_url || '',
        transcription: transcription,
        sentiment: sentiment
      });

      await appointment.save();

      // Update clinic stats
      await Clinic.findOneAndUpdate(
        { clinicName },
        {
          $inc: { totalAppointments: 1, completedCalls: 1 }
        }
      );

      // Send email notification
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
          html: `
            <h2>New Appointment - ${clinicName}</h2>
            <p><b>Patient Name:</b> ${name}</p>
            <p><b>Phone Number:</b> ${phone}</p>
            <p><b>Reason for Visit:</b> ${reason}</p>
            <p><b>Preferred Date:</b> ${date}</p>
            <p><b>Preferred Time:</b> ${time}</p>
            <p><b>Sentiment:</b> ${sentiment}</p>
            <p><a href="${process.env.DASHBOARD_URL || 'http://localhost:3000'}">View in Dashboard</a></p>
          `
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

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dental AI Webhook is running!' });
});

// Sentiment analysis helper
function analyzeSentiment(text) {
  if (!text) return 'neutral';
  
  const positiveWords = ['happy', 'great', 'excellent', 'good', 'love', 'amazing', 'perfect', 'wonderful'];
  const negativeWords = ['angry', 'frustrated', 'sad', 'disappointed', 'terrible', 'horrible', 'awful', 'bad'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🦷 Dental AI Server running on port ${PORT}`));