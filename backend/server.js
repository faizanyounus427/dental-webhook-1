const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Fake database (temporary)
let appointments = [];

// Health check
app.get("/", (req, res) => {
    res.send("🧠 AI Voice Agent Backend Running");
});

// Webhook endpoint (Retell AI will call this)
app.post("/webhook", (req, res) => {
    const data = req.body;

    const appointment = {
        id: Date.now(),
        name: data?.patient_name || "Unknown",
        phone: data?.phone || "N/A",
        reason: data?.reason || "General",
        time: data?.time || "Not set"
    };

    appointments.push(appointment);

    console.log("📞 New Appointment:", appointment);

    res.json({
        success: true,
        message: "Received",
        appointment
    });
});

// Get all appointments (frontend will use this)
app.get("/appointments", (req, res) => {
    res.json(appointments);
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});