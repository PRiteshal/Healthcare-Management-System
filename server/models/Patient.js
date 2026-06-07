const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
    patientId:   { type: String, unique: true },
    name:        { type: String, required: true, trim: true },
    age:         { type: Number, default: 0 },
    gender:      { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
    phone:       { type: String, default: "" },
    email:       { type: String },
    address:     { type: String },
    bloodGroup:  { type: String, enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-",""] , default: ""},
    condition:   { type: String, default: "General" },
    status:      { type: String, enum: ["Active", "Discharged", "Critical"], default: "Active" },
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    admittedDate: { type: Date, default: Date.now },
    dischargeDate: { type: Date },
    ward:        { type: String },
    bedNumber:   { type: String },
    medicalHistory: [{ type: String }],
    allergies:   [{ type: String }],
    notes:       { type: String },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

patientSchema.pre("save", async function (next) {
  if (!this.patientId) {
    const count = await mongoose.model("Patient").countDocuments();
    this.patientId = `P${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Patient", patientSchema);