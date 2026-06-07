const express = require("express");
const router = express.Router();
const Patient     = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Doctor      = require("../models/Doctor");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// @route  GET /api/dashboard/stats
router.get("/stats", authorize("admin", "doctor"), async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(today); start.setHours(0, 0, 0, 0);
    const end   = new Date(today); end.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      activePatients,
      criticalPatients,
      todayAppointments,
      pendingAppointments,
      totalDoctors,
      availableDoctors,
    ] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ status: "Active" }),
      Patient.countDocuments({ status: "Critical" }),
      Appointment.countDocuments({ date: { $gte: start, $lte: end } }),
      Appointment.countDocuments({ date: { $gte: start, $lte: end }, status: "Scheduled" }),
      Doctor.countDocuments(),
      Doctor.countDocuments({ availability: true }),
    ]);

    res.json({
      totalPatients,
      activePatients,
      criticalPatients,
      todayAppointments,
      pendingAppointments,
      totalDoctors,
      availableDoctors,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
