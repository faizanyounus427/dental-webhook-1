const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Get all appointments for a clinic
router.get('/clinic/:clinicName', async (req, res) => {
  try {
    const { clinicName } = req.params;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;

    let query = { clinicName };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single appointment
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes, updatedAt: new Date() },
      { new: true }
    );
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get statistics for clinic
router.get('/stats/:clinicName', async (req, res) => {
  try {
    const { clinicName } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const appointments = await Appointment.find({
      clinicName,
      createdAt: { $gte: startDate }
    });

    const stats = {
      total: appointments.length,
      completed: appointments.filter(a => a.status === 'completed').length,
      scheduled: appointments.filter(a => a.status === 'scheduled').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      noShow: appointments.filter(a => a.status === 'no-show').length,
      averageDuration: Math.round(
        appointments.reduce((sum, a) => sum + (a.callDuration || 0), 0) / appointments.length
      ),
      sentiment: {
        positive: appointments.filter(a => a.sentiment === 'positive').length,
        neutral: appointments.filter(a => a.sentiment === 'neutral').length,
        negative: appointments.filter(a => a.sentiment === 'negative').length
      }
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;