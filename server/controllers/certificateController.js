const Certificate = require('../models/Certificate');
const { asyncHandler } = require('../middleware/errorHandler');

// @route GET /api/certificates/verify/:code  (public — anyone with the code can verify)
exports.verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ verificationCode: req.params.code.toUpperCase() })
    .populate('userId', 'name avatar')
    .populate('courseId', 'title category');

  if (!certificate) {
    return res.status(404).json({ success: false, message: 'Certificate not found or invalid code' });
  }

  res.status(200).json({ success: true, certificate });
});

// @route GET /api/certificates/user/:userId
exports.getUserCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ userId: req.params.userId }).populate('courseId', 'title category thumbnail');
  res.status(200).json({ success: true, count: certificates.length, certificates });
});
