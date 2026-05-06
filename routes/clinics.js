const express = require('express');
const router = express.Router();
const Clinic = require('../models/Clinic');
const crypto = require('crypto');

// Get all clinics
router.get('/', async (req, res) => {
  try {
    const clinics = await Clinic.find();
    res.json(clinics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create clinic
router.post('/', async (req, res) => {
  try {
    const { clinicName, clinicEmail, phoneNumber, address, city, state, zipCode } = req.body;
    
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    const clinic = new Clinic({
      clinicName,
      clinicEmail,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      apiKey
    });
    
    await clinic.save();
    res.status(201).json(clinic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get clinic by name
router.get('/:clinicName', async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ clinicName: req.params.clinicName });
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }
    res.json(clinic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;