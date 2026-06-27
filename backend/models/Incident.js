const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  patientDetails: { type: String, required: true },
  severity: { type: String, enum: ['Critical', 'Severe', 'Moderate', 'Low'], required: true },
  origin: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  destinationHospital: { type: String },
  generatedReport: { type: String },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
