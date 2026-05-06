const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  callId: {
    type: String,
    required: true,
    unique: true
  },
  clinicName: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  reasonForVisit: {
    type: String,
    default: 'Not specified'
  },
  appointmentDate: {
    type: String,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  callDuration: {
    type: Number,
    default: 0
  },
  callRecording: String,
  transcription: String,
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);