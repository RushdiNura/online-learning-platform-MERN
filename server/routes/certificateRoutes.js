const express = require('express');
const router = express.Router();
const certificate = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

router.get('/verify/:code', certificate.verifyCertificate);
router.get('/user/:userId', protect, certificate.getUserCertificates);

module.exports = router;
