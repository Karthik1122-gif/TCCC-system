const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['driver', 'police', 'admin'], default: 'driver' },
  vehicleNumber: { type: String }, // For drivers
  junctionLocation: { type: String }, // For police
  phoneNumber: {
    type: String,
    validate: {
      validator: function validatePolicePhone(value) {
        if (this.role !== 'police') return true;
        return typeof value === 'string' && /^\d{10}$/.test(value.trim());
      },
      message: 'Police officer phone number must be a 10-digit mobile number'
    }
  },
  fcmToken: { type: String } // Optional: For future notifications
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
