const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// ✅ Patient apni appointments dekh sake — isliye "patient" bhi add kiya
router.get("/", authorize("admin", "doctor", "patient"), async (req, res) => {
  try {
    const { date, status, doctorId, patientId } = req.query;
    const query = {};

    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    if (status)   query.status = status;
    if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;

    // ✅ Agar patient hai toh sirf apni appointments
    if (req.user.role === "patient") {
      const Patient = require("../models/Patient");
      const patientRecord = await Patient.findOne({ email: req.user.email });
      if (!patientRecord) return res.json([]);
      query.patient = patientRecord._id;
    }

    const appointments = await Appointment.find(query)
      .populate("patient", "name patientId phone")
      .populate("doctor", "name specialization")
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/today", authorize("admin", "doctor"), async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);
    const appointments = await Appointment.find({ date: { $gte: start, $lte: end } })
      .populate("patient", "name patientId")
      .populate("doctor", "name specialization")
      .sort({ time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", authorize("admin", "doctor", "patient"), async (req, res) => {
  try {
    const appointment = await Appointment.create({ ...req.body, createdBy: req.user._id });
    await appointment.populate("patient", "name patientId");
    await appointment.populate("doctor", "name specialization");
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", authorize("admin", "doctor"), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    })
      .populate("patient", "name patientId")
      .populate("doctor", "name specialization");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", authorize("admin"), async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
