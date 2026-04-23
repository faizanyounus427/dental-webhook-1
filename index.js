const express = require('express');
const app = express();
app.use(express.json());

// Handles Retell webhook test (GET) and real calls (POST)
app.all('/webhook/:clinicName', async (req, res) => {
  try {
    if (req.method === 'GET') {
      return res.sendStatus(200);
    }

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
  <tr><td style="padding:8px;font-weight:bold;background:#f0f4f8">Preferred Date</td><td style="padding:8px
