const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    doctorId:     { type: String, unique: true },
    user:         { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name:         { type: String, required: true },
    specialization: { type: String, required: true },
    qualification: { type: String },
    phone:        { type: String },
    email:        { type: String },
    experience:   { type: Number }, // years
    availability: { type: Boolean, default: true },
    schedule: [
      {
        day:   { type: String }, // "Monday"
        start: { type: String }, // "09:00"
        end:   { type: String }, // "17:00"
      },
    ],
    department:   { type: String },
    roomNumber:   { type: String },
  },
  { timestamps: true }
);

doctorSchema.pre("save", async function (next) {
  if (!this.doctorId) {
    const count = await mongoose.model("Doctor").countDocuments();
    this.doctorId = `D${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Doctor", doctorSchema);
