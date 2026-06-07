const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, unique: true },
    patient:  { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor:   { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date:     { type: Date, required: true },
    time:     { type: String, required: true }, // "09:00 AM"
    type:     { type: String, enum: ["Consultation", "Follow-up", "Surgery", "Lab Review", "Emergency"], default: "Consultation" },
    status:   { type: String, enum: ["Scheduled", "Completed", "Cancelled", "No-show"], default: "Scheduled" },
    room:     { type: String },
    notes:    { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

appointmentSchema.pre("save", async function (next) {
  if (!this.appointmentId) {
    const count = await mongoose.model("Appointment").countDocuments();
    this.appointmentId = `APT${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);
