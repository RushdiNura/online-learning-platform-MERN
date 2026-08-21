const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    verificationCode: { type: String, unique: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

certificateSchema.pre('save', function (next) {
  if (!this.verificationCode) {
    this.verificationCode = crypto.randomBytes(8).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
