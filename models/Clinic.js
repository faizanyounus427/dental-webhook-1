const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  clinicName: {
    type: String,
    required: true,
    unique: true
  },
  clinicEmail: {
    type: String,
    required: true
  },
  phoneNumber: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  totalAppointments: {
    type: Number,
    default: 0
  },
  completedCalls: {
    type: Number,
    default: 0
  },
  averageCallDuration: {
    type: Number,
    default: 0
  },
  apiKey: {
    type: String,
    unique: true
  },
  agentId: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'trial'],
    default: 'trial'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Clinic', clinicSchema);