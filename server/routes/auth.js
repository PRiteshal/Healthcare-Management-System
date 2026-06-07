const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Patient = require("../models/Patient");
const { protect } = require("../middleware/auth");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @route  POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, age, gender, bloodGroup, address, condition } = req.body;

    // ✅ Admin account publicly register nahi ho sakta
    if (role === "admin") {
      return res.status(403).json({ message: "Admin account cannot be created from registration." });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, role, phone });

    // ✅ Auto create Patient record
    if (role === "patient" || !role) {
      await Patient.create({
        name,
        email,
        phone:      phone      || "Not provided",
        age:        age        || 0,
        gender:     gender     || "Other",
        bloodGroup: bloodGroup || undefined,
        address:    address    || "",
        condition:  condition  || "General",
        status:     "Active",
        createdBy:  user._id,
      });
    }

    const token = generateToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });
    if (!user.isActive) return res.status(403).json({ message: "Account deactivated" });
    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

// @route  GET /api/auth/my-patient-profile
router.get("/my-patient-profile", protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ email: req.user.email });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/auth/change-password
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
