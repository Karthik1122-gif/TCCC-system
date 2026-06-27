const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  zone: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Signal', signalSchema);
